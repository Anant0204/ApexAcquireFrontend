import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types/crm';
import { Building2, Lock, ArrowRight, UserCheck } from 'lucide-react';
import bgImage from '../assets/real_estate_luxury_bg.png';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('alex.vance@apexacquire.com');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, selectedRole);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Crisp High Visibility Luxury Real Estate Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xs scale-102 opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Light Translucent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F8FC]/60 via-[#F5F8FC]/80 to-[#F5F8FC]/95 pointer-events-none" />

      {/* Radiant Darker Royal Blue Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#155EEF]/30 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#0B1F3A]/25 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#155EEF]/25 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-md border border-[#155EEF]/50 mb-4 shadow-[0_12px_30px_rgba(11,31,58,0.25),0_8px_20px_rgba(21,94,239,0.45)]">
            <Building2 className="w-7 h-7 text-[#155EEF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">
            APEX<span className="text-[#155EEF] font-light">ACQUIRE</span>
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-[#475569] mt-1 font-semibold">
            Executive Real Estate Acquisition Desk
          </p>
        </div>

        {/* Demo Role Quick Switcher */}
        <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#155EEF]/40 shadow-[0_15px_35px_rgba(11,31,58,0.18),0_10px_25px_rgba(21,94,239,0.4)] space-y-2">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#155EEF] flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Select Demo Login Role
          </label>
          <div className="grid grid-cols-4 gap-1 bg-[#F8FBFF] p-1 rounded-xl border border-[#E2EAF5]">
            {(['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRole(r);
                  if (r === 'ADMIN') setEmail('alex.vance@apexacquire.com');
                  if (r === 'MANAGER') setEmail('elena.r@apexacquire.com');
                  if (r === 'AGENT') setEmail('marcus.s@apexacquire.com');
                  if (r === 'READ_ONLY') setEmail('david.m@apexacquire.com');
                }}
                className={`py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider ${selectedRole === r
                    ? 'sidebar-item-active text-white shadow-md font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
              >
                {r.replace('_', '-')}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-[#155EEF]/40 rounded-2xl p-8 space-y-5 shadow-[0_25px_60px_rgba(11,31,58,0.22),0_15px_45px_rgba(21,94,239,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Executive Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E2EAF5] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF] text-xs shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2EAF5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] text-xs shadow-xs font-medium"
                />
                <Lock className="w-4 h-4 text-[#64748B] absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-executive-primary w-full py-3.5 px-4 text-white font-bold text-xs rounded-xl shadow-[0_12px_28px_rgba(21,94,239,0.55)] transition-all flex items-center justify-center gap-2 group cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In To Workspace'} 
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
