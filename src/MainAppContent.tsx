import React, { useState, useEffect } from 'react';
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
import { DealDetailDrawer } from './components/DealDetailDrawer';
import { ClickToCallModal } from './components/ClickToCallModal';
import { SystemTutorialModal } from './components/SystemTutorialModal';
import type { RealtorContact, PropertyDeal } from './types/crm';

export const MainAppContent: React.FC = () => {
  const { isAuthenticated, setActiveConversationId, currentUser, deals } = useApp();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Selected objects
  const [selectedContact, setSelectedContact] = useState<RealtorContact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<PropertyDeal | null>(null);
  const [callingContact, setCallingContact] = useState<RealtorContact | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Always reset active view tab to 'dashboard' when logging in
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Navigation Access Matrix across roles
  const allowedTabs: Record<string, string[]> = {
    ADMIN: ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'templates', 'reports', 'settings'],
    MANAGER: ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'templates', 'reports', 'settings'],
    AGENT: ['dashboard', 'outreach', 'deals', 'conversations', 'tasks', 'contacts', 'templates'],
    READ_ONLY: ['dashboard', 'outreach', 'deals', 'conversations', 'contacts', 'reports']
  };

  const userRole = currentUser.role;
  const userAllowedTabs = allowedTabs[userRole] || ['dashboard'];

  // Guard against unauthorized route tab selection
  const safeActiveTab = userAllowedTabs.includes(activeTab) ? activeTab : 'dashboard';

  const handleNavigateWithTarget = (tab: string, convId?: string) => {
    setSelectedContact(null); // Return from contact detail page when changing tabs
    if (userAllowedTabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
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
          onBack={() => setSelectedContact(null)}
          onOpenCallModal={(c) => setCallingContact(c)}
          onNavigateToConversation={(convId) => {
            setSelectedContact(null);
            handleNavigateWithTarget('conversations', convId);
          }}
          onSelectDeal={(d) => {
            setSelectedContact(null);
            setSelectedDeal(d);
            handleNavigateWithTarget('deals');
          }}
        />
      ) : (
        <>
          {safeActiveTab === 'dashboard' && <DashboardPage onNavigate={handleNavigateWithTarget} />}
          
          {safeActiveTab === 'outreach' && (
            <OutreachPipelinePage 
              onSelectContact={(c) => setSelectedContact(c)} 
              onOpenCallModal={(c) => setCallingContact(c)}
            />
          )}

          {safeActiveTab === 'deals' && (
            <DealsPage onSelectDeal={(d) => setSelectedDeal(d)} />
          )}

          {safeActiveTab === 'conversations' && (
            <ConversationsPage onOpenCallModal={(c) => setCallingContact(c)} />
          )}

          {safeActiveTab === 'tasks' && (
            <TasksPage onNavigate={handleNavigateWithTarget} />
          )}

          {safeActiveTab === 'contacts' && (
            <ContactsPage 
              onSelectContact={(c) => setSelectedContact(c)} 
              onOpenCallModal={(c) => setCallingContact(c)}
            />
          )}

          {safeActiveTab === 'templates' && <TemplatesAutomationsPage />}
          {safeActiveTab === 'reports' && <ReportsPage />}
          {safeActiveTab === 'settings' && <SettingsPage />}
        </>
      )}

      {/* MODALS */}
      <DealDetailDrawer
        deal={activeDealObj}
        onClose={() => setSelectedDeal(null)}
        onOpenConversation={(convId) => {
          setSelectedDeal(null);
          handleNavigateWithTarget('conversations', convId);
        }}
      />

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
