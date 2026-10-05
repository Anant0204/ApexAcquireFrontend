import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './components/DashboardPage';
import { OutreachPipelinePage } from './components/OutreachPipelinePage';
import { DealsPage } from './components/DealsPage';
import { TasksPage } from './components/TasksPage';
import { ContactsPage } from './components/ContactsPage';
import { ContactDetailPage } from './components/ContactDetailPage';
import { ConversationsPage } from './components/ConversationsPage';
import { TemplatesAutomationsPage } from './components/TemplatesAutomationsPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { MarketingPage } from './components/MarketingPage';
import { DealDetailPage } from './components/DealDetailPage';
import { ClickToCallModal } from './components/ClickToCallModal';
import { SystemTutorialModal } from './components/SystemTutorialModal';
import { API_BASE_URL } from './config/api';
import type { RealtorContact, PropertyDeal } from './types/crm';
import './App.css';

// Route Wrapper for Contact Detail
const ContactDetailRouteWrapper: React.FC<{
  onOpenCallModal: (c: RealtorContact) => void;
  onNavigateToConversation: (convId: string) => void;
}> = ({ onOpenCallModal, onNavigateToConversation }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts, currentUser } = useApp();
  const rolePath = (currentUser?.role || 'admin').toLowerCase().replace('_', '-');

  const [apiContact, setApiContact] = useState<RealtorContact | null>(null);
  const [loading, setLoading] = useState(false);

  const matchedContact = contacts.find(c => c.id === id) || apiContact;

  useEffect(() => {
    if (!matchedContact && id) {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      fetch(`${API_BASE_URL}/contacts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setApiContact(json.data);
          }
        })
        .catch(err => console.error('Failed to fetch contact details:', err))
        .finally(() => setLoading(false));
    }
  }, [id, matchedContact]);

  if (loading && !matchedContact) {
    return (
      <div className="p-12 text-center text-[#64748B] font-medium flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#155EEF] border-t-transparent rounded-full animate-spin" />
        <span>Loading contact details...</span>
      </div>
    );
  }

  if (!matchedContact) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto bg-white rounded-2xl border border-slate-200 mt-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#0B1F3A]">Contact Not Found</h3>
        <p className="text-sm text-[#64748B]">This contact record does not exist or may have been deleted.</p>
        <button
          onClick={() => navigate(`/${rolePath}/contacts`)}
          className="px-4 py-2 bg-[#155EEF] hover:bg-[#1249B8] text-white font-bold rounded-xl text-xs transition-colors"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  return (
    <ContactDetailPage
      contact={matchedContact}
      onBack={() => navigate(`/${rolePath}/contacts`)}
      onOpenCallModal={onOpenCallModal}
      onNavigateToConversation={onNavigateToConversation}
      onSelectDeal={(deal) => navigate(`/${rolePath}/deals/${deal.id}`)}
    />
  );
};

// Route Wrapper for Deal Detail
const DealDetailRouteWrapper: React.FC<{
  onOpenCallModal: (c: RealtorContact) => void;
  onOpenConversation: (convId: string) => void;
}> = ({ onOpenCallModal, onOpenConversation }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deals, currentUser } = useApp();
  const rolePath = (currentUser?.role || 'admin').toLowerCase().replace('_', '-');

  const [apiDeal, setApiDeal] = useState<PropertyDeal | null>(null);
  const [loading, setLoading] = useState(false);

  const matchedDeal = deals.find(d => d.id === id) || apiDeal;

  useEffect(() => {
    if (!matchedDeal && id) {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      fetch(`${API_BASE_URL}/deals/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setApiDeal(json.data);
          }
        })
        .catch(err => console.error('Failed to fetch deal details:', err))
        .finally(() => setLoading(false));
    }
  }, [id, matchedDeal]);

  if (loading && !matchedDeal) {
    return (
      <div className="p-12 text-center text-[#64748B] font-medium flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#155EEF] border-t-transparent rounded-full animate-spin" />
        <span>Loading deal workspace...</span>
      </div>
    );
  }

  if (!matchedDeal) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto bg-white rounded-2xl border border-slate-200 mt-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#0B1F3A]">Deal Not Found</h3>
        <p className="text-sm text-[#64748B]">This deal workspace does not exist or may have been deleted.</p>
        <button
          onClick={() => navigate(`/${rolePath}/deals`)}
          className="px-4 py-2 bg-[#155EEF] hover:bg-[#1249B8] text-white font-bold rounded-xl text-xs transition-colors"
        >
          Back to AI Deals
        </button>
      </div>
    );
  }

  return (
    <DealDetailPage
      deal={matchedDeal}
      onBack={() => navigate(`/${rolePath}/deals`)}
      onOpenConversation={onOpenConversation}
      onSelectContact={(contact) => navigate(`/${rolePath}/contacts/${contact.id}`)}
      onOpenCallModal={onOpenCallModal}
    />
  );
};

const App: React.FC = () => {
  const { isAuthenticated, setActiveConversationId, currentUser, hasPermission } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [callingContact, setCallingContact] = useState<RealtorContact | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Redirect to dashboard upon login
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Navigation Access Matrix across roles
  const userRole = currentUser?.role || 'READ_ONLY';
  const rolePath = userRole.toLowerCase().replace('_', '-');
  const baseAllowedTabs = ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'marketing', 'templates', 'reports', 'settings'];
  const userAllowedTabs = baseAllowedTabs.filter(tab => {
    if (tab === 'dashboard') return hasPermission('Dashboard', 'Show');
    if (tab === 'outreach') return hasPermission('Outreach Pipeline', 'Show');
    if (tab === 'contacts') return hasPermission('Contacts Directory', 'View') || hasPermission('Contacts Directory', 'Show');
    if (tab === 'deals') return hasPermission('AI Deals & Offers', 'View') || hasPermission('AI Deals & Offers', 'Show');
    if (tab === 'conversations') return hasPermission('Conversations', 'View') || hasPermission('Conversations', 'Show');
    if (tab === 'tasks') return hasPermission('Task Manager', 'View') || hasPermission('Task Manager', 'Show');
    if (tab === 'marketing') return hasPermission('Marketing', 'View') || hasPermission('Marketing', 'Show');
    if (tab === 'templates') return hasPermission('Templates & Automations', 'View') || hasPermission('Templates & Automations', 'Show');
    if (tab === 'reports') return hasPermission('Reports & Audit', 'Show') || hasPermission('Reports & Audit', 'View');
    if (tab === 'settings') return hasPermission('Settings', 'View') || hasPermission('Settings', 'Show') || hasPermission('Settings', 'Manage');
    
    return true;
  });

  // Map path to active tab (e.g., /admin/dashboard -> dashboard, /admin/contacts/cnt-123 -> contacts)
  const pathParts = location.pathname.split('/');
  const routeRole = pathParts[1];
  const activeTabFromPath = pathParts[2] || 'dashboard';
  const safeActiveTab = userAllowedTabs.includes(activeTabFromPath) ? activeTabFromPath : 'dashboard';

  // Fallback redirect if unauthorized route is accessed, or wrong role path
  useEffect(() => {
    if (isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
      const isWrongRole = routeRole !== rolePath;
      const isWrongTab = !userAllowedTabs.includes(activeTabFromPath);
      
      if (isWrongRole || isWrongTab) {
        navigate(`/${rolePath}/dashboard`, { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, activeTabFromPath, userAllowedTabs, navigate, rolePath, routeRole]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const handleNavigateWithTarget = (tab: string, convId?: string) => {
    if (userAllowedTabs.includes(tab)) {
      navigate(`/${rolePath}/${tab}`);
    } else {
      navigate(`/${rolePath}/dashboard`);
    }
    if (convId) {
      setActiveConversationId(convId);
    }
  };

  return (
    <AppShell 
      activeTab={safeActiveTab} 
      setActiveTab={handleNavigateWithTarget}
      onOpenTutorial={() => setShowTutorial(true)}
    >
      <Routes>
        <Route path="/" element={<Navigate to={`/${rolePath}/dashboard`} replace />} />
        <Route path={`/${rolePath}/dashboard`} element={<DashboardPage onNavigate={handleNavigateWithTarget} />} />
        <Route path={`/${rolePath}/outreach`} element={<OutreachPipelinePage onSelectContact={(c) => navigate(`/${rolePath}/contacts/${c.id}`)} onOpenCallModal={setCallingContact} />} />
        
        {/* DEALS ROUTES */}
        <Route path={`/${rolePath}/deals`} element={<DealsPage onSelectDeal={(d) => navigate(`/${rolePath}/deals/${d.id}`)} />} />
        <Route path={`/${rolePath}/deals/:id`} element={<DealDetailRouteWrapper onOpenCallModal={setCallingContact} onOpenConversation={(convId) => handleNavigateWithTarget('conversations', convId)} />} />
        
        {/* CONVERSATIONS ROUTE */}
        <Route path={`/${rolePath}/conversations`} element={<ConversationsPage onOpenCallModal={setCallingContact} onSelectContact={(c) => navigate(`/${rolePath}/contacts/${c.id}`)} />} />
        
        {/* TASKS ROUTE */}
        <Route path={`/${rolePath}/tasks`} element={<TasksPage onNavigate={handleNavigateWithTarget} onSelectContact={(c) => navigate(`/${rolePath}/contacts/${c.id}`)} />} />
        
        {/* CONTACTS ROUTES */}
        <Route path={`/${rolePath}/contacts`} element={<ContactsPage onSelectContact={(c) => navigate(`/${rolePath}/contacts/${c.id}`)} onOpenCallModal={setCallingContact} />} />
        <Route path={`/${rolePath}/contacts/:id`} element={<ContactDetailRouteWrapper onOpenCallModal={setCallingContact} onNavigateToConversation={(convId) => handleNavigateWithTarget('conversations', convId)} />} />
        
        {/* OTHER MODULES */}
        <Route path={`/${rolePath}/marketing`} element={<MarketingPage />} />
        <Route path={`/${rolePath}/templates`} element={<TemplatesAutomationsPage />} />
        <Route path={`/${rolePath}/reports`} element={<ReportsPage />} />
        <Route path={`/${rolePath}/settings`} element={<SettingsPage />} />
        
        <Route path="*" element={<Navigate to={`/${rolePath}/dashboard`} replace />} />
      </Routes>

      <ClickToCallModal
        contact={callingContact}
        onClose={() => setCallingContact(null)}
      />

      <SystemTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </AppShell>
  );
};

export default App;
