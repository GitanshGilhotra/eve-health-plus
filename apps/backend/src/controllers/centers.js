const { prisma, redis } = require('../index');
const { logger } = require('../utils/logger');

const getCenters = async (req, res) => {
  try {
    const cached = await redis.get('centers_list');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const centers = await prisma.diagnosticCenter.findMany({
      where: { isActive: true },
      include: { tests: true },
      orderBy: { name: 'asc' },
    });

    await redis.set('centers_list', JSON.stringify(centers), 'EX', 300);
    res.json(centers);
  } catch (error) {
    logger.error('Failed to fetch centers', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await prisma.diagnosticCenter.findUnique({
      where: { id },
      include: { tests: true },
    });

    if (!center) {
      return res.status(404).json({ error: 'Diagnostic center not found' });
    }

    res.json(center);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCenter = async (req, res) => {
  try {
    const { name, location, contactEmail, contactPhone } = req.body;
    
    if (!name || !location || !contactEmail) {
      return res.status(400).json({ error: 'Name, location, and contact email are required' });
    }

    const center = await prisma.diagnosticCenter.create({
      data: { name, location, contactEmail, contactPhone, isActive: true },
    });

    await redis.del('centers_list');
    logger.info(`Diagnostic Center Created: ${center.name}`);

    res.status(201).json(center);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create diagnostic center' });
  }
};

const createTest = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { name, description, category, prepInstructions, price, durationMin } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Test name and price are required' });
    }

    const test = await prisma.diagnosticTest.create({
      data: {
        centerId,
        name,
        description,
        category: category || 'General Wellness',
        prepInstructions,
        price: parseFloat(price),
        durationMin: durationMin ? parseInt(durationMin, 10) : 30,
      },
    });

    await redis.del('centers_list');
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add diagnostic test' });
  }
};

module.exports = { getCenters, getCenterById, createCenter, createTest };
