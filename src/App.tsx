import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { DealDetailDrawer } from './components/DealDetailDrawer';
import { DealDetailPage } from './components/DealDetailPage';
import { ClickToCallModal } from './components/ClickToCallModal';
import { SystemTutorialModal } from './components/SystemTutorialModal';
import type { RealtorContact, PropertyDeal } from './types/crm';
import './App.css';

const App: React.FC = () => {
  const { isAuthenticated, setActiveConversationId, currentUser, deals } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected objects
  const [selectedContact, setSelectedContact] = useState<RealtorContact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<PropertyDeal | null>(null);
  const [callingContact, setCallingContact] = useState<RealtorContact | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Redirect to dashboard upon login
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Navigation Access Matrix across roles
  const allowedTabs: Record<string, string[]> = {
    ADMIN: ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'marketing', 'templates', 'reports', 'settings'],
    MANAGER: ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'marketing', 'templates', 'reports', 'settings'],
    AGENT: ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'marketing', 'templates'],
    READ_ONLY: ['dashboard', 'outreach', 'deals', 'conversations', 'contacts', 'marketing', 'reports']
  };

  const userRole = currentUser?.role || 'READ_ONLY';
  const rolePath = userRole.toLowerCase().replace('_', '-');
  const userAllowedTabs = allowedTabs[userRole] || ['dashboard'];

  // Map path to active tab (e.g., /admin/dashboard -> dashboard)
  const pathParts = location.pathname.split('/');
  const routeRole = pathParts[1];
  const activeTabFromPath = pathParts[2] || 'dashboard';
  const safeActiveTab = userAllowedTabs.includes(activeTabFromPath) ? activeTabFromPath : 'dashboard';

  // Fallback redirect if unauthorized route is accessed, or wrong role path
  useEffect(() => {
    if (isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
      const isWrongRole = routeRole !== rolePath;
      const isWrongTab = !userAllowedTabs.includes(activeTabFromPath) && !selectedContact;
      
      if (isWrongRole || isWrongTab) {
        navigate(`/${rolePath}/dashboard`, { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, activeTabFromPath, userAllowedTabs, navigate, selectedContact, rolePath, routeRole]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const handleNavigateWithTarget = (tab: string, convId?: string) => {
    setSelectedContact(null);
    if (userAllowedTabs.includes(tab)) {
      navigate(`/${rolePath}/${tab}`);
    } else {
      navigate(`/${rolePath}/dashboard`);
    }
    if (convId) {
      setActiveConversationId(convId);
    }
  };

  const activeDealObj = deals.find(d => d.id === selectedDeal?.id) || selectedDeal;

  return (
    <AppShell 
      activeTab={safeActiveTab} 
      setActiveTab={handleNavigateWithTarget}
      onOpenTutorial={() => setShowTutorial(true)}
    >
      {/* If a contact is selected, show the Dedicated Full Screen Contact Detail Page */}
      {selectedContact ? (
        <ContactDetailPage
          contact={selectedContact}
          onBack={() => {
            setSelectedContact(null);
          }}
          onOpenCallModal={(c) => setCallingContact(c)}
          onNavigateToConversation={(convId) => {
            setSelectedContact(null);
            handleNavigateWithTarget('conversations', convId);
          }}
          onSelectDeal={(d) => {
            setSelectedContact(null);
            setSelectedDeal(d);
          }}
        />
      ) : activeDealObj ? (
        /* If a deal is selected, show Dedicated Full Screen Deal Detail Workspace */
        <DealDetailPage
          deal={activeDealObj}
          onBack={() => setSelectedDeal(null)}
          onOpenConversation={(convId) => {
            setSelectedDeal(null);
            handleNavigateWithTarget('conversations', convId);
          }}
          onSelectContact={(c) => {
            setSelectedDeal(null);
            setSelectedContact(c);
          }}
          onOpenCallModal={(c) => setCallingContact(c)}
        />
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to={`/${rolePath}/dashboard`} replace />} />
          <Route path={`/${rolePath}/dashboard`} element={<DashboardPage onNavigate={handleNavigateWithTarget} />} />
          <Route path={`/${rolePath}/outreach`} element={<OutreachPipelinePage onSelectContact={setSelectedContact} onOpenCallModal={setCallingContact} />} />
          <Route path={`/${rolePath}/deals`} element={<DealsPage onSelectDeal={setSelectedDeal} />} />
          <Route path={`/${rolePath}/conversations`} element={<ConversationsPage onOpenCallModal={setCallingContact} />} />
          <Route path={`/${rolePath}/tasks`} element={<TasksPage onNavigate={handleNavigateWithTarget} />} />
          <Route path={`/${rolePath}/contacts`} element={<ContactsPage onSelectContact={setSelectedContact} onOpenCallModal={setCallingContact} />} />
          <Route path={`/${rolePath}/marketing`} element={<MarketingPage />} />
          <Route path={`/${rolePath}/templates`} element={<TemplatesAutomationsPage />} />
          <Route path={`/${rolePath}/reports`} element={<ReportsPage />} />
          <Route path={`/${rolePath}/settings`} element={<SettingsPage />} />
          <Route path="*" element={<Navigate to={`/${rolePath}/dashboard`} replace />} />
        </Routes>
      )}

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
