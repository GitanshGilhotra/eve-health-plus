import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Server,
  Shield,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { soundFx } from '../shared/soundFx';

const mockUsers = [
  { id: 'usr_1', email: 'patient@evehealth.com', name: 'Sarah Jenkins', role: 'PATIENT', isLocked: false, failedAttempts: 0 },
  { id: 'usr_2', email: 'centeradmin@evehealth.com', name: 'Dr. Marcus Vance', role: 'CENTER_ADMIN', isLocked: false, failedAttempts: 0 },
  { id: 'usr_3', email: 'admin@evehealth.com', name: 'Elena Rostova', role: 'PLATFORM_ADMIN', isLocked: false, failedAttempts: 0 },
  { id: 'usr_4', email: 'locked_user@evehealth.com', name: 'James Thorne', role: 'PATIENT', isLocked: true, failedAttempts: 5 },
];

export const PlatformAdminPage = () => {
  const { webhooks } = useAppStore();
  const [users, setUsers] = useState(mockUsers);
  const [activeTab, setActiveTab] = useState('WEBHOOKS');

  const toggleUserLock = (id) => {
    soundFx.playClick();
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isLocked: !u.isLocked, failedAttempts: 0 } : u))
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-purple-950/80 px-3 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
              DEVOPS & TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Server className="h-7 w-7 text-indigo-400" />
            <span>Platform DevOps & System Audit</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Monitor idempotent webhook processing, Redis concurrency locks, RBAC user privileges, and brute-force defenses.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 rounded-2xl bg-slate-900/90 p-1.5 border border-white/10 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('WEBHOOKS');
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'WEBHOOKS'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Webhooks & Idempotency</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('USERS');
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'USERS'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Users & Account Locks</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Webhooks */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-4">
          <div className="bento-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-cyan-400" />
                  <span>Idempotent Webhook Event Logs</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Distributed Redis lock deduplication prevents double processing</p>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full font-bold font-mono self-start sm:self-auto">
                100% IDEMPOTENCY ACTIVE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-white/10 text-[10px] uppercase text-slate-400 font-mono">
                  <tr>
                    <th className="pb-3.5">Event ID</th>
                    <th className="pb-3.5">Provider</th>
                    <th className="pb-3.5">Event Type</th>
                    <th className="pb-3.5">Payload Hash</th>
                    <th className="pb-3.5">Processing State</th>
                    <th className="pb-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {webhooks.map((wh) => (
                    <tr key={wh.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 text-white font-bold">{wh.eventId}</td>
                      <td className="py-4 uppercase text-slate-400 text-[10px] font-bold">{wh.provider}</td>
                      <td className="py-4 text-cyan-300 font-sans font-medium">{wh.eventType}</td>
                      <td className="py-4 text-slate-500 text-[10px]">{wh.payloadHash.substring(0, 18)}...</td>
                      <td className="py-4">
                        <span className="rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                          {wh.processingState || 'PROCESSED'}
                        </span>
                      </td>
                      <td className="py-4 text-right font-sans">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            alert(`Simulated replay of event ${wh.eventId}`);
                          }}
                          className="px-3 py-1 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
                        >
                          Replay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Security */}
      {activeTab === 'USERS' && (
        <div className="bento-card p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                <span>RBAC User Directory & Rate-Limit Locks</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated account lockout after 5 consecutive failed login attempts</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {users.length} Registered Accounts
            </span>
          </div>

          <div className="space-y-3.5">
            {users.map((usr) => (
              <div
                key={usr.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-white">{usr.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({usr.email})</span>
                    <span className="rounded-full bg-slate-900 border border-white/10 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase text-cyan-300">
                      {usr.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 font-mono">
                    Failed Logins: <span className="font-bold text-white">{usr.failedAttempts}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-mono font-black uppercase border ${
                      usr.isLocked
                        ? 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {usr.isLocked ? 'Account Locked' : 'Active'}
                  </span>

                  <button
                    onClick={() => toggleUserLock(usr.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      usr.isLocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {usr.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    <span>{usr.isLocked ? 'Unlock' : 'Force Lock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
