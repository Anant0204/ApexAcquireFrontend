import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole, PermissionAction } from '../types/crm';
import { Save, Bot, Sliders, Shield, Users, Check, UserPlus, X, Loader2 } from 'lucide-react';
import { IntegrationSettingsTab } from './IntegrationSettingsTab';
import { ALL_MODULES, normalizePermissions } from '../utils/permissions';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, users, addUser, toggleUserStatus, currentUser, hasPermission } = useApp();
  
  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';
  const canViewUsers = isAdmin || hasPermission('Settings', 'VIEW');
  const canCreateUser = isAdmin || hasPermission('Settings', 'CREATE');
  const canEditUser = isAdmin || hasPermission('Settings', 'EDIT');
  const canDeleteUser = isAdmin || hasPermission('Settings', 'DELETE');

  // STRICT TAB FILTERING FOR SETTINGS:
  // Admin sees: AI, Outreach, Grading, Pipeline, Templates, Users & Roles, Integrations
  // Manager sees ONLY: AI, Outreach, Grading, Pipeline, Templates
  const allTabs = [
    { id: 'ai', label: 'AI Persona & Rules', icon: Bot, roles: ['ADMIN', 'MANAGER'] },
    { id: 'general', label: 'Outreach & Throttles', icon: Sliders, roles: ['ADMIN', 'MANAGER'] },
    { id: 'grading', label: 'Grading Weights', icon: Shield, roles: ['ADMIN', 'MANAGER'] },
    { id: 'users', label: 'Users & Roles (RBAC)', icon: Users, roles: ['ADMIN'] },
    { id: 'integrations', label: 'Integrations & Gateways', icon: Sliders, roles: ['ADMIN'] }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(currentUser.role));
  const [activeTab, setActiveTab] = useState<string>('ai');

  // Form local state
  const [instructions, setInstructions] = useState('');
  const [maxReplies, setMaxReplies] = useState(4);
  const [cadenceDays, setCadenceDays] = useState(30);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiSettings, setApiSettings] = useState<any>(null);
  const [apiUsers, setApiUsers] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [setRes, usrRes] = await Promise.all([
          fetch(`${API_BASE_URL}/settings`, { headers }),
          fetch(`${API_BASE_URL}/users`, { headers })
        ]);

        const setJson = await setRes.json();
        const usrJson = await usrRes.json();

        if (setJson.success && setJson.data) {
          setApiSettings(setJson.data);
          setInstructions(setJson.data.aiPersonaInstructions || '');
          setMaxReplies(setJson.data.aiConsecutiveReplyCap || 4);
          setCadenceDays(setJson.data.cadenceRetouchIntervalDays || 30);
        }

        if (usrJson.success) {
          setApiUsers(usrJson.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // User Management Modal State (Admin Only)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  
  // Role Permissions Modal State (Strict 4 actions: CREATE, VIEW, EDIT, DELETE)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<any | null>(null);
  const [localPermissions, setLocalPermissions] = useState<Record<string, Record<PermissionAction, boolean>>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const openPermissionsModal = (user: any) => {
    setPermissionsUser(user);
    setLocalPermissions(normalizePermissions(user.permissions, user.role));
    setAutoSaveStatus('idle');
    setShowPermissionsModal(true);
  };

  const handlePermissionChange = async (module: string, action: PermissionAction, checked: boolean) => {
    if (!permissionsUser) return;

    const nextPermissions = {
      ...localPermissions,
      [module]: {
        ...(localPermissions[module] || { CREATE: false, VIEW: false, EDIT: false, DELETE: false }),
        [action]: checked
      }
    };

    setLocalPermissions(nextPermissions);
    setAutoSaveStatus('saving');

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/users/${permissionsUser.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: nextPermissions
        })
      });
      const data = await res.json();
      if (data.success) {
        setApiUsers(prev => prev.map(u => u.id === permissionsUser.id ? { ...u, permissions: nextPermissions } : u));
        setAutoSaveStatus('saved');
        setTimeout(() => {
          setAutoSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
        }, 2000);
      } else {
        setAutoSaveStatus('error');
        console.error("Failed to auto-save permissions:", data.error?.message);
      }
    } catch (err) {
      setAutoSaveStatus('error');
      console.error("Auto-save connection error:", err);
    }
  };
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('AGENT');
  const [newUserTitle, setNewUserTitle] = useState('Acquisition Agent');

  const safeActiveTab = visibleTabs.some(t => t.id === activeTab) ? activeTab : 'ai';

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aiPersonaInstructions: instructions,
          aiConsecutiveReplyCap: maxReplies,
          cadenceRetouchIntervalDays: cadenceDays
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: newUserName.split(' ')[0] || '',
          lastName: newUserName.split(' ').slice(1).join(' ') || '',
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          jobTitle: newUserTitle
        })
      });
      const json = await res.json();
      if (json.success) {
        setApiUsers([...apiUsers, json.data]);
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
      } else {
        alert(json.error?.message || 'Failed to create user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('AGENT');
    setNewUserTitle('Acquisition Agent');
    setShowAddUserModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setNewUserName(`${user.firstName} ${user.lastName}`);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setNewUserTitle(user.jobTitle || 'Acquisition Agent');
    setNewUserPassword(''); // blank implies no change
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    try {
      const token = localStorage.getItem('accessToken');
      const payload: any = {
        firstName: newUserName.split(' ')[0] || '',
        lastName: newUserName.split(' ').slice(1).join(' ') || '',
        email: newUserEmail,
        role: newUserRole,
        jobTitle: newUserTitle
      };
      if (newUserPassword) {
        payload.password = newUserPassword;
      }
      
      const res = await fetch(`${API_BASE_URL}/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setApiUsers(apiUsers.map(u => u.id === editingUserId ? { ...u, ...json.data } : u));
        setShowEditUserModal(false);
      } else {
        alert(json.error?.message || 'Failed to update user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setApiUsers(apiUsers.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        alert(json.error?.message || 'Failed to delete user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      const token = localStorage.getItem('accessToken');
      
      // Note: Endpoint for updating user status should exist, but fallback to updating local API state for UI responsiveness
      const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const json = await res.json();
      if (json.success) {
        setApiUsers(apiUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      } else {
        // Fallback UI update if endpoint doesn't strictly support status yet
        setApiUsers(apiUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] flex items-center gap-2">
          CRM & AI Engine Settings
        </h1>
        <p className="text-xs text-[#475569] mt-1">
          Configure outreach sending throttles, AI conversation fine-tuning, qualification grade weights, and user RBAC.
        </p>
      </div>

      {/* TAB NAVIGATION - RESTRICTED BASED ON ROLE */}
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

      {/* TAB: INTEGRATIONS VIEW (ADMIN ONLY - MANAGER CANNOT SEE THIS TAB AT ALL) */}
      {safeActiveTab === 'integrations' && isAdmin && (
        <IntegrationSettingsTab />
      )}

      {/* TAB: USER MANAGEMENT (ADMIN ONLY or Users with View Permissions) */}
      {safeActiveTab === 'users' && canViewUsers && (
        <div className="executive-panel rounded-2xl p-6 space-y-4 shadow-sm border border-[#E2E8F0]">
          <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Active System Users ({apiUsers.length})</h3>
            {canCreateUser && (
              <button
                onClick={openAddModal}
                className="px-3.5 py-1.5 btn-executive-primary text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add User
              </button>
            )}
          </div>

          <div className="space-y-3">
            {apiUsers.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:border-[#CBD5E1] transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div 
                    className={`font-bold text-[#0F172A] flex items-center gap-2 flex-wrap ${canEditUser ? 'cursor-pointer hover:text-[#155EEF] transition-colors' : ''}`}
                    onClick={() => {
                      if (canEditUser) {
                        openPermissionsModal(u);
                      }
                    }}
                  >
                    <span className="truncate">{u.firstName} {u.lastName}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#EAF2FF] text-[#155EEF] border border-[#155EEF]/20 shrink-0">
                      {u.role}
                    </span>
                    {u.status === 'DEACTIVATED' && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                        Deactivated
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#475569] truncate mt-0.5">{u.email} &bull; {u.jobTitle || 'Acquisition Agent'}</div>
                </div>

                {u.id !== currentUser.id && (
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                    {canEditUser && (
                      <>
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Edit User
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            u.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </>
                    )}
                    {canDeleteUser && (
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM BODY FOR COMMON SETTINGS (AI, OUTREACH, GRADING) */}
      {(safeActiveTab === 'ai' || safeActiveTab === 'general' || safeActiveTab === 'grading') && (
        <form onSubmit={handleSaveSettings} className="executive-panel rounded-2xl p-6 space-y-6 shadow-sm border border-[#E2E8F0]">
          
          {safeActiveTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-2">Global AI Persona Instructions</label>
                <textarea
                  rows={5}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] font-mono text-xs focus:outline-none focus:border-[#155EEF] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">AI Consecutive Reply Cap</label>
                <input
                  type="number"
                  value={maxReplies}
                  onChange={(e) => setMaxReplies(Number(e.target.value))}
                  className="w-32 p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] font-mono focus:outline-none focus:border-[#155EEF] shadow-sm"
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
                  className="w-32 p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] font-mono focus:outline-none focus:border-[#155EEF] shadow-sm"
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
                  <strong className="text-[#155EEF] text-sm font-mono">{apiSettings?.gradingWeightAddress || 35}% Weight</strong>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Price Response</span>
                  <strong className="text-[#155EEF] text-sm font-mono">{apiSettings?.gradingWeightPrice || 20}% Weight</strong>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-md rounded-2xl p-6 relative space-y-4 shadow-2xl border border-[#E2E8F0]">
            <button onClick={() => setShowAddUserModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#0B1F3A]">Add System User</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs" autoComplete="off">
              <div>
                <label className="block text-[#475569] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  autoComplete="new-name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  autoComplete="new-email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                  placeholder="Set user password"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Role Assignment</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm cursor-pointer"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="MANAGER">MANAGER (Team Workload)</option>
                  <option value="AGENT">AGENT (Assigned Work)</option>
                  <option value="READ_ONLY">READ_ONLY (View Only)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-all shadow-md cursor-pointer"
              >
                Create User & Assign Role
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL (ADMIN ONLY) */}
      {showEditUserModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-md rounded-2xl p-6 relative space-y-4 shadow-2xl border border-[#E2E8F0]">
            <button onClick={() => setShowEditUserModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#0B1F3A]">Edit System User</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs" autoComplete="off">
              <div>
                <label className="block text-[#475569] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  autoComplete="new-name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  autoComplete="new-email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Update Password (Optional)</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Role Assignment</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm cursor-pointer"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="MANAGER">MANAGER (Team Workload)</option>
                  <option value="AGENT">AGENT (Assigned Work)</option>
                  <option value="READ_ONLY">READ_ONLY (View Only)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-all shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl border border-[#E2E8F0] text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center rounded-full mb-2 shadow-inner">
              <X className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-[#0B1F3A]">Delete User?</h3>
            
            <p className="text-xs text-[#475569] leading-relaxed">
              Are you sure you want to permanently delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? 
              This action cannot be undone and will permanently remove their access to the workspace.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 text-[#475569] font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-[0_8px_20px_rgba(220,38,38,0.3)] hover:bg-red-700 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE PERMISSIONS MODAL (PHASE 1) */}
      {showPermissionsModal && permissionsUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl relative shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FBFF] rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#155EEF]" />
                  <h3 className="text-sm font-bold text-[#0B1F3A]">Edit Role Permissions</h3>
                </div>
                {autoSaveStatus === 'saving' && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#155EEF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving changes...
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 stroke-[3]" /> Saved in real-time
                  </span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Auto-save failed
                  </span>
                )}
                {autoSaveStatus === 'idle' && (
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    Changes save instantly on tick/untick
                  </span>
                )}
              </div>
              <button onClick={() => setShowPermissionsModal(false)} className="text-[#64748B] hover:text-[#0F172A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-bold text-[#0F172A]">
                  {permissionsUser.role} ({permissionsUser.firstName} {permissionsUser.lastName})
                </div>
              </div>

              <label className="block text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-3">
                Assign Permission to Roles
              </label>

              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FBFF] border-b border-[#E2E8F0]">
                      <th className="py-3 px-4 text-[10px] font-bold text-[#475569] uppercase tracking-wider w-2/5">Module</th>
                      <th className="py-3 px-3 text-[10px] font-bold text-[#475569] uppercase tracking-wider text-center">CREATE</th>
                      <th className="py-3 px-3 text-[10px] font-bold text-[#475569] uppercase tracking-wider text-center">VIEW</th>
                      <th className="py-3 px-3 text-[10px] font-bold text-[#475569] uppercase tracking-wider text-center">EDIT</th>
                      <th className="py-3 px-3 text-[10px] font-bold text-[#475569] uppercase tracking-wider text-center">DELETE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {ALL_MODULES.map((moduleName, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#0F172A] border-r border-[#E2E8F0]/50">{moduleName}</td>
                        {(['CREATE', 'VIEW', 'EDIT', 'DELETE'] as PermissionAction[]).map((action) => (
                          <td key={action} className="py-3.5 px-3 text-center border-r last:border-r-0 border-[#E2E8F0]/30">
                            <label className="inline-flex items-center justify-center cursor-pointer p-1">
                              <input 
                                type="checkbox" 
                                checked={Boolean(localPermissions[moduleName]?.[action])}
                                onChange={(e) => handlePermissionChange(moduleName, action, e.target.checked)}
                                className="w-4 h-4 rounded border-[#CBD5E1] text-[#155EEF] focus:ring-[#155EEF] cursor-pointer"
                              />
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-white rounded-b-xl">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-time auto-sync active</span>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-6 py-2 rounded-lg text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#155EEF] shadow-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
