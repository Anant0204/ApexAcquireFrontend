import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types/crm';
import { 
  Save, 
  Bot, 
  Sliders, 
  Shield, 
  Users, 
  Check, 
  UserPlus, 
  X,
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    users, 
    addUser, 
    toggleUserStatus, 
    currentUser 
  } = useApp();
  
  const isAdmin = currentUser.role === 'ADMIN';

  // STRICT TAB FILTERING FOR SETTINGS:
  const allTabs = [
    { id: 'ai', label: 'AI Persona & Rules', icon: Bot, roles: ['ADMIN', 'MANAGER'] },
    { id: 'general', label: 'Outreach & Throttles', icon: Sliders, roles: ['ADMIN', 'MANAGER'] },
    { id: 'grading', label: 'Grading Weights', icon: Shield, roles: ['ADMIN', 'MANAGER'] },
    { id: 'users', label: 'Users & Roles (RBAC)', icon: Users, roles: ['ADMIN'] }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(currentUser.role));
  const [activeTab, setActiveTab] = useState<string>('ai');

  // Form local state
  const [instructions, setInstructions] = useState(settings.aiInstructions);
  const [maxReplies, setMaxReplies] = useState(settings.aiMaxConsecutiveReplies);
  const [cadenceDays, setCadenceDays] = useState(settings.cadenceIntervalDays);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User Management Modal State (Admin Only)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('AGENT');
  const [newUserTitle, setNewUserTitle] = useState('Acquisition Agent');

  const safeActiveTab = visibleTabs.some(t => t.id === activeTab) ? activeTab : 'ai';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      aiInstructions: instructions,
      aiMaxConsecutiveReplies: maxReplies,
      cadenceIntervalDays: cadenceDays
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      title: newUserTitle,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserTitle('Acquisition Agent');
    setNewUserRole('AGENT');
    setShowAddUserModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A] flex items-center gap-2">
          CRM & AI Engine Settings
        </h1>
        <p className="text-xs text-[#475569] mt-1">
          Configure outreach sending throttles, AI conversation fine-tuning, qualification grade weights, and user RBAC.
        </p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-[#E2E8F0] space-x-6 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              safeActiveTab === t.id ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: USER MANAGEMENT (ADMIN ONLY) */}
      {safeActiveTab === 'users' && isAdmin && (
        <div className="executive-panel rounded-2xl p-6 space-y-4 shadow-sm border border-[#E2E8F0] bg-white">
          <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Active System Users ({users.length})</h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-1.5 btn-executive-primary text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add User
            </button>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs shadow-sm">
                <div>
                  <div className="font-bold text-[#0F172A] flex items-center gap-2">
                    {u.name}
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#EAF2FF] text-[#155EEF] border border-[#155EEF]/20">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#475569]">{u.email} &bull; {u.title}</div>
                </div>

                {u.id !== currentUser.id && (
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      u.status === 'Active' ? 'bg-slate-100 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {u.status === 'Active' ? 'Deactivate User' : 'Reactivate User'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM BODY FOR COMMON SETTINGS (AI, OUTREACH, GRADING) */}
      {(safeActiveTab === 'ai' || safeActiveTab === 'general' || safeActiveTab === 'grading') && (
        <form onSubmit={handleSaveSettings} className="executive-panel rounded-2xl p-6 space-y-6 shadow-sm border border-[#E2E8F0] bg-white">
          
          {safeActiveTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-2">Global AI Persona Instructions</label>
                <textarea
                  rows={5}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] font-mono text-xs focus:outline-none focus:border-[#155EEF] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">AI Consecutive Reply Cap</label>
                <input
                  type="number"
                  value={maxReplies}
                  onChange={(e) => setMaxReplies(Number(e.target.value))}
                  className="w-32 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] font-mono focus:outline-none focus:border-[#155EEF] shadow-xs"
                />
              </div>
            </div>
          )}

          {safeActiveTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Cadence Re-Touch Interval (Days)</label>
                <input
                  type="number"
                  value={cadenceDays}
                  onChange={(e) => setCadenceDays(Number(e.target.value))}
                  className="w-32 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] font-mono focus:outline-none focus:border-[#155EEF] shadow-xs"
                />
              </div>
            </div>
          )}

          {safeActiveTab === 'grading' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">Qualification Scoring Weights</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Address Captured</span>
                  <strong className="text-[#155EEF] text-sm font-mono">{settings.gradeWeights.address}% Weight</strong>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Price Response</span>
                  <strong className="text-[#155EEF] text-sm font-mono">{settings.gradeWeights.price}% Weight</strong>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-3 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save System Settings
            </button>

            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Configuration Saved!
              </span>
            )}
          </div>

        </form>
      )}

      {/* ADD USER MODAL (ADMIN ONLY) */}
      {showAddUserModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1533]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#E2E8F0]">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#0B1F3A]">Add New CRM Team Member</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#475569] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#475569] mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="rachel@apexacquire.com"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#475569] mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                  >
                    <option value="AGENT">AGENT</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="READ_ONLY">READ_ONLY</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#475569] mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newUserTitle}
                    onChange={(e) => setNewUserTitle(e.target.value)}
                    placeholder="Acquisitions Agent"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 btn-executive-primary text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
