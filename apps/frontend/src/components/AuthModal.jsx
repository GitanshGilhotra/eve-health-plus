import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { authApi } from '../services/api';
import {
  X,
  Shield,
  Lock,
  Mail,
  Activity,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Building2,
  Server,
  Zap,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../shared/soundFx';

export const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'PATIENT',
  defaultTab = 'LOGIN',
}) => {
  const { setAuth } = useAuthStore();
  const { setActiveTab } = useAppStore();

  const [tab, setTab] = useState(defaultTab); // 'LOGIN' | 'REGISTER'
  const [role, setRole] = useState(defaultRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setRole(defaultRole);
      setError(null);
      setIsSuccess(false);
      setFirstName('');
      setLastName('');
      // For clean registration, start empty. For login, leave clean with placeholder or easy 1-click
      if (defaultTab === 'REGISTER') {
        setEmail('');
        setPassword('');
      } else {
        // Sign-in defaults (clean)
        setEmail('');
        setPassword('');
      }
    }
  }, [isOpen, defaultRole, defaultTab]);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      role: 'PATIENT',
      label: 'Patient',
      email: 'patient@evehealth.com',
      icon: User,
      color: 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/60',
    },
    {
      role: 'CENTER_ADMIN',
      label: 'Lab Admin',
      email: 'centeradmin@evehealth.com',
      icon: Building2,
      color: 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/60',
    },
    {
      role: 'PLATFORM_ADMIN',
      label: 'DevOps Admin',
      email: 'admin@evehealth.com',
      icon: Server,
      color: 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/60',
    },
  ];

  const handleInstantLogin = async (acc) => {
    soundFx.playClick();
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(acc.email, 'Password123!');
      setAuth(res.accessToken, res.user);
      setIsSuccess(true);
      soundFx.playSuccess?.() || soundFx.playBeep?.();

      setTimeout(() => {
        if (acc.role === 'CENTER_ADMIN') setActiveTab('center-admin');
        else if (acc.role === 'PLATFORM_ADMIN') setActiveTab('platform-admin');
        else setActiveTab('dashboard');

        if (onSuccess) onSuccess(res.user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundFx.playClick();
    setIsLoading(true);
    setError(null);

    try {
      let loggedUser = null;

      if (tab === 'LOGIN') {
        const res = await authApi.login(email.trim(), password);
        setAuth(res.accessToken, res.user);
        loggedUser = res.user;
      } else {
        // Register flow
        const fName = firstName.trim() || 'New';
        const lName = lastName.trim() || 'User';
        await authApi.register({
          email: email.trim(),
          password,
          firstName: fName,
          lastName: lName,
          role,
        });

        // Automatically log in after successful registration
        const loginRes = await authApi.login(email.trim(), password);
        setAuth(loginRes.accessToken, loginRes.user);
        loggedUser = loginRes.user;
      }

      setIsSuccess(true);
      soundFx.playSuccess?.() || soundFx.playBeep?.();

      setTimeout(() => {
        if (loggedUser) {
          if (loggedUser.role === 'CENTER_ADMIN') setActiveTab('center-admin');
          else if (loggedUser.role === 'PLATFORM_ADMIN') setActiveTab('platform-admin');
          else setActiveTab('dashboard');
        }

        if (onSuccess) onSuccess(loggedUser);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-950 border border-white/15 shadow-2xl rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        {/* Glowing Top Laser Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 rounded-full p-2 border border-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white">EVE</span>
              <span className="text-lg font-light text-cyan-400">Health</span>
              <span className="text-xs font-black text-indigo-400">+</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Enterprise Diagnostic Authentication Gateway</p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setTab('LOGIN');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
              tab === 'LOGIN'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setTab('REGISTER');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
              tab === 'REGISTER'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'REGISTER' && (
            <>
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-premium text-xs !py-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-premium text-xs !py-2.5"
                  />
                </div>
              </div>

              {/* Clean Role Selector (No hardcoded in-built person names) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PATIENT', label: 'Patient', desc: 'Personal assays' },
                    { id: 'CENTER_ADMIN', label: 'Lab Admin', desc: 'Center operations' },
                    { id: 'PLATFORM_ADMIN', label: 'DevOps', desc: 'System telemetry' },
                  ].map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setRole(r.id);
                        }}
                        className={`py-2 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-sm ring-1 ring-cyan-500/40'
                            : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <p className="text-[11px] font-bold">{r.label}</p>
                        <p className="text-[9px] text-slate-400 opacity-80 truncate">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                placeholder={tab === 'LOGIN' ? 'name@hospital.com' : 'yourname@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                className="input-premium with-icon-left text-xs !py-2.5"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">Password</label>
              {tab === 'LOGIN' && (
                <span
                  onClick={() => {
                    setEmail('patient@evehealth.com');
                    setPassword('Password123!');
                  }}
                  className="text-[10px] text-cyan-400 cursor-pointer hover:underline"
                >
                  Fill demo credentials
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={tab === 'LOGIN' ? 'Enter password' : 'Create secure password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                className="input-premium with-icon-left with-icon-right text-xs !py-2.5 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-950/80 p-2.5 text-xs text-rose-300 border border-rose-500/40 text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="rounded-xl bg-emerald-950/80 p-2.5 text-xs text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Authentication Successful! Redirecting...</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="btn-primary w-full text-xs !py-3 font-black mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            <span>
              {isLoading
                ? 'Verifying Security Tokens...'
                : isSuccess
                ? 'Welcome Back!'
                : tab === 'LOGIN'
                ? 'Sign In to Workspace'
                : 'Create Verified Account'}
            </span>
          </button>
        </form>

        {/* Clean, Non-intrusive 1-Click Demo Profiles (Only on Sign In) */}
        {tab === 'LOGIN' && (
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-cyan-400" />
                1-Click Quick Demo Login
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleInstantLogin(acc)}
                    disabled={isLoading}
                    className={`py-2 px-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 bg-slate-900/60 ${acc.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-[11px] font-bold">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
