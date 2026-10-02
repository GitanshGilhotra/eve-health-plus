const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { prisma } = require('../index');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_for_development_only';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'supersecretrefreshkey_for_development_only';

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, password, firstName, lastName' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await argon2.hash(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'PATIENT',
      },
    });

    logger.info(`User registered: ${user.email} (${user.role})`);

    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        details: { email: user.email, role: user.role },
      },
    });

    res.status(201).json({
      message: 'Account registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Registration failed', { error });
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isLocked) {
      return res.status(423).json({ error: 'Account is locked due to multiple failed login attempts. Contact support.' });
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      const failedCount = user.failedLogins + 1;
      const isLocked = failedCount >= 5;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: failedCount, isLocked },
      });

      if (isLocked) {
        logger.warn(`Account locked for user ${user.email} after 5 failed attempts`);
      }

      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0 },
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.userSession.create({
      data: {
        userId: user.id,
        deviceInfo: deviceInfo || req.headers['user-agent'] || 'Unknown Device',
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        details: { ip: req.ip },
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login failed', { error });
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or revoked refresh token' });
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const newAccessToken = jwt.sign(
      { id: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { id: storedToken.user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Token refresh failed', { error });
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

module.exports = { register, login, refreshToken, logout, getMe };
