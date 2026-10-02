import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types/crm';
import {
  LayoutDashboard,
  Send,
  Kanban,
  MessageSquare,
  CheckSquare,
  Users,
  Sliders,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  Menu,
  Shield,
  Check,
  GraduationCap,
  Share2
} from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTutorial?: () => void;
}

export const AppShell: React.FC<ShellProps> = ({ children, activeTab, setActiveTab, onOpenTutorial }) => {
  const { currentUser, setCurrentUserRole, logout, notifications, markNotificationRead, tasks } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const headerActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerActionsRef.current && !headerActionsRef.current.contains(event.target as Node)) {
        setShowRoleSelector(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);
  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING').length;

  // STRICT ROLE-BASED NAVIGATION WITH ALL FEATURES
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'] },
    { id: 'outreach', label: 'Outreach Pipeline', icon: Send, roles: ['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'] },
    { id: 'deals', label: 'AI Deals & Offers', icon: Building2, roles: ['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'], badge: '4' },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'], badge: '3' },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'AGENT'], badge: pendingTasksCount > 0 ? String(pendingTasksCount) : undefined },
    { id: 'contacts', label: 'Contacts Directory', icon: Users, roles: ['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'] },
    { id: 'marketing', label: 'Marketing', icon: Share2, roles: ['ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'] },
    { id: 'templates', label: 'Templates & Automations', icon: Sliders, roles: ['ADMIN', 'MANAGER', 'AGENT'] },
    { id: 'reports', label: 'Reports & Audit', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'READ_ONLY'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['ADMIN', 'MANAGER'] },
  ];

  const visibleNavItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FBFF] text-[#0F172A] flex flex-col font-sans antialiased">

      {/* TOP HEADER - FIXED */}
      <header className="h-16 shrink-0 border-b border-[#E2EAF5] bg-white z-30 flex items-center justify-between px-4 lg:px-6 shadow-xs">

        {/* Left Branding & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 text-[#475569] hover:text-[#0B1F3A] rounded-lg border border-[#E2EAF5] bg-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-[#155EEF]" />
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold tracking-tight text-[#0B1F3A] text-base leading-none">
                APEX<span className="text-[#155EEF] font-semibold">ACQUIRE</span>
              </div>
              <div className="text-[9px] text-[#64748B] uppercase tracking-widest font-bold mt-0.5">
                Executive Acquisition Desk
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5" />
          <input
            type="text"
            placeholder="Search realtors, properties, or phone numbers..."
            className="w-full pl-10 pr-4 py-2 bg-[#F1F6FC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#155EEF] focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* Right Header Actions */}
        <div ref={headerActionsRef} className="flex items-center gap-2.5 relative">

          {/* Quick System Tutorial Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BFDBFE] bg-[#EAF2FF] hover:bg-[#DBEAFE] text-[#155EEF] text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Open Guided System Tour"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">System Tour</span>
            </button>
          )}



          {/* Notifications Bell */}
          <div className="relative z-50">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleSelector(false);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-xl border border-[#E2EAF5] bg-[#F1F6FC] hover:bg-[#EAF2FF] text-[#475569] transition-all relative cursor-pointer shadow-xs"
            >
              <Bell className="w-4 h-4 text-[#475569]" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#155EEF] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2EAF5] rounded-xl shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EAF5] mb-2">
                  <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Notifications</h4>
                  <span className="text-[10px] text-[#155EEF] font-mono font-bold">{unreadNotifications.length} unread</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.targetPath) setActiveTab(n.targetPath);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${n.read ? 'bg-[#F8FBFF] border-[#E2EAF5] text-[#64748B]' : 'bg-[#EAF2FF] border-[#BFDBFE] text-[#0F172A]'
                        }`}
                    >
                      <div className="font-semibold text-[#155EEF] text-[11px] mb-0.5">{n.title}</div>
                      <div className="text-[11px] leading-tight mb-1">{n.message}</div>
                      <div className="text-[9px] text-[#64748B] text-right">{n.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative z-50">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowRoleSelector(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-[#E2EAF5] bg-[#F1F6FC] hover:bg-[#EAF2FF] transition-all cursor-pointer shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#EAF2FF] text-[#155EEF] font-bold text-xs flex items-center justify-center border border-[#BFDBFE]">
                {currentUser.avatar}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-semibold text-[#0F172A] leading-tight">{currentUser.name}</div>
                <div className="text-[9px] text-[#64748B]">{currentUser.title}</div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2EAF5] rounded-xl shadow-xl p-2 z-50">
                <div className="p-2 border-b border-[#E2EAF5] mb-1">
                  <div className="text-xs font-bold text-[#0B1F3A]">{currentUser.name}</div>
                  <div className="text-[11px] text-[#64748B]">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#E11D48] hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (ULTRA LUXURY OBSIDIAN & SAPPHIRE THEME - FIXED NO SCROLL) */}
        <aside
          className={`hidden lg:flex flex-col justify-between sidebar-luxury-container text-white transition-all duration-300 relative z-20 h-full overflow-visible shrink-0 select-none ${
            collapsed ? 'w-20' : 'w-60'
          }`}
        >
          {/* Subtle Ambient Glow at top of sidebar */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#1E40AF]/25 to-transparent pointer-events-none rounded-t-none" />

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[#070D1E] border border-[#2563EB]/40 text-[#94A3B8] hover:text-white flex items-center justify-center z-40 shadow-xl cursor-pointer transition-all hover:scale-110 hover:border-[#60A5FA] hover:bg-[#155EEF]"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          <div className="py-2.5 px-2.5 space-y-1 relative z-10 flex-1 flex flex-col justify-start overflow-y-auto overflow-x-hidden">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2'
                  } rounded-xl text-xs font-semibold transition-all group cursor-pointer relative ${
                    isActive
                      ? 'sidebar-item-active font-bold shadow-xs'
                      : 'text-[#94A3B8] sidebar-item-hover'
                  }`}
                >
                  {/* Subtle Active Left Glowing Pillar */}
                  {isActive && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 ${collapsed ? 'w-1 h-4' : 'w-1.5 h-5'} bg-[#93C5FD] rounded-r-full shadow-[0_0_10px_rgba(147,197,253,0.9)]`} />
                  )}

                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-[#64748B] group-hover:text-white'}`} />
                  {!collapsed && <span className="flex-1 text-left tracking-wide truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      isActive ? 'bg-white/25 text-white backdrop-blur-md border border-white/30' : 'bg-white/10 text-[#94A3B8] border border-white/10'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B82F6] ring-2 ring-[#070D1E]" />
                  )}
                </button>
              );
            })}
          </div>

<<<<<<< HEAD
          {/* Luxury Sidebar Bottom Sign Out Button */}
          <div className={`p-2 ${collapsed ? 'mx-1' : 'mx-2'} mb-2.5 border-t border-white/10 pt-2.5 relative z-10 shrink-0`}>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-2' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-400/40 transition-all cursor-pointer group shadow-sm`}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 group-hover:text-rose-200 transition-transform" />
                {!collapsed && <span>Sign Out</span>}
              </div>
              {!collapsed && (
                <span className="text-[10px] text-rose-300/80 font-normal font-mono uppercase tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </span>
              )}
=======
          {/* Logout Button */}
          <div className="px-3 pb-4 pt-2 mt-auto relative z-10">
            <button
              onClick={() => logout()}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#1E294B] text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/30 ${collapsed ? 'px-0' : 'px-3'}`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Sign Out</span>}
>>>>>>> 0e3e48f4dc5342782bada49215313d357902b115
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 lg:hidden flex">
            <div className="w-72 sidebar-luxury-container text-white p-4 flex flex-col h-full shadow-2xl justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="font-extrabold text-white">APEX <span className="text-[#60A5FA]">ACQUIRE</span></div>
                  <button onClick={() => setMobileDrawerOpen(false)} className="text-[#94A3B8] hover:text-white">✕</button>
                </div>
                <div className="py-4 space-y-1.5">
                  {visibleNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === item.id ? 'sidebar-item-active font-bold' : 'text-[#94A3B8] sidebar-item-hover'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
<<<<<<< HEAD

              {/* Mobile Drawer Logout */}
              <div className="border-t border-white/10 pt-3">
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out ({currentUser.name})</span>
                </button>
=======
              <div className="flex-1 py-4 space-y-2 overflow-y-auto">
                {visibleNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold ${
                      activeTab === item.id ? 'sidebar-item-active font-bold' : 'text-[#94A3B8] sidebar-item-hover'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
>>>>>>> 0e3e48f4dc5342782bada49215313d357902b115
              </div>
              <div className="mt-auto pt-4 border-t border-white/10">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border border-[#1E294B] text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
};
