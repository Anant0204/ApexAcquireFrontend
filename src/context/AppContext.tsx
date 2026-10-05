import { API_BASE_URL } from '../config/api';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  UserProfile, 
  UserRole, 
  RealtorContact, 
  Conversation, 
  PropertyDeal, 
  AppNotification, 
  AuditLogItem, 
  Grade, 
  DealStage, 
  OutreachStage, 
  ContactTemperature,
  CRMTask,
  DealActivity,
  EmailTemplate,
  WorkflowRule,
  AIPersonalityConfig,
  GatewayIntegrationsConfig
} from '../types/crm';
import { 
  MOCK_USERS, 
  INITIAL_CONTACTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_DEALS, 
  INITIAL_TASKS,
  INITIAL_TEMPLATES,
  INITIAL_WORKFLOWS,
  INITIAL_AI_CONFIG,
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;

  // User Management
  users: UserProfile[];
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  toggleUserStatus: (id: string) => void;

  // Contacts State & Actions
  contacts: RealtorContact[];
  addContact: (contact: Omit<RealtorContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<RealtorContact>) => void;
  updateContactStage: (id: string, newStage: OutreachStage) => void;
  updateContactTemperature: (id: string, temp: ContactTemperature) => void;
  recycleContactToQueued: (id: string) => void;
  advanceContactSequence: (id: string) => void;
  archiveContact: (id: string) => void;
  bulkDeleteContacts: (ids: string[]) => void;
  bulkUpdateContacts: (ids: string[], updates: Partial<RealtorContact>) => void;
  importContacts: (newContacts: Omit<RealtorContact, 'id'>[]) => void;

  // Conversations State & Actions
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => void;
  toggleAiTakeover: (conversationId: string, aiStatus: 'Active' | 'Human Takeover' | 'AI Off') => void;
  overrideGrade: (conversationId: string, newGrade: Grade, newScore: number, reason: string) => void;
  updateConversationTemperature: (conversationId: string, temp: ContactTemperature) => void;
  cloneLeadToDeals: (conversationId: string, directConvData?: any) => void;

  // Deals State & Actions (Multi-deal support)
  deals: PropertyDeal[];
  activeDealId: string | null;
  setActiveDealId: (id: string | null) => void;
  addDeal: (deal: Omit<PropertyDeal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDealStage: (dealId: string, newStage: DealStage) => void;
  updateDeal: (dealId: string, updates: Partial<PropertyDeal>) => void;
  assignDeal: (dealId: string, userId: string, userName: string, userAvatar?: string) => void;
  addDealActivity: (dealId: string, activity: { type: string; title: string; description: string; actor?: string }) => void;
  archiveDeal: (dealId: string) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  bulkDeleteDeals: (dealIds: string[]) => Promise<void>;
  addGeneratedContract: (dealId: string, contract: { templateName: string; fileName: string; fileType: 'pdf' | 'docx'; generatedBy: string; purchasePrice?: number; status?: 'Draft' | 'Sent for Signature' | 'Executed' | 'Archived' }) => void;
  claimLead: (conversationId: string, assignedUserId?: string, assignedUserName?: string) => void;

  // Tasks State & Actions
  tasks: CRMTask[];
  addTask: (task: Omit<CRMTask, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<CRMTask>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Phone Call AI-Stop Safeguard Action
  handlePhoneCallInitiated: (contactId: string, contactName: string) => void;

  // Templates & Workflows State & Actions
  templates: EmailTemplate[];
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'lastUpdated'>) => void;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: string) => void;
  workflows: WorkflowRule[];
  toggleWorkflow: (id: string) => void;
  simulateWorkflow: (id: string) => void;
  aiConfig: AIPersonalityConfig;
  updateAIConfig: (updates: Partial<AIPersonalityConfig>) => void;

  // Notifications & Audit Logs
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLogItem[];
  logAuditAction: (action: string, affectedRecord: string) => void;

  // Settings
  settings: {
    cadenceIntervalDays: number;
    sendingHoursStart: string;
    sendingHoursEnd: string;
    aiInstructions: string;
    aiMaxConsecutiveReplies: number;
    globalAiEnabled: boolean;
    gradeWeights: { response: number; address: number; price: number; timeline: number };
  };
  updateSettings: (newSettings: Partial<AppContextType['settings']>) => void;

  // Integrations & Gateway Credentials
  integrations: GatewayIntegrationsConfig;
  updateIntegrations: (updates: Partial<GatewayIntegrationsConfig>) => void;
}

const INITIAL_INTEGRATIONS: GatewayIntegrationsConfig = {
  sms: {
    provider: 'Twilio',
    accountSid: '',
    authToken: '',
    fromPhone: '',
    webhookUrl: '',
    isConnected: false,
    lastTested: 'Never'
  },
  email: {
    provider: 'Microsoft 365 / Outlook OAuth',
    host: '',
    port: '' as unknown as number,
    username: '',
    passwordOrKey: '',
    fromEmail: '',
    fromName: '',
    useTls: true,
    isConnected: false,
    lastTested: 'Never'
  },
  ai: {
    provider: 'OpenAI (GPT-4o)',
    apiKey: '',
    model: '',
    baseUrl: '',
    temperature: 0.3,
    maxTokens: 500,
    isConnected: false,
    lastTested: 'Never'
  },
  webhooks: {
    inboundLeadUrl: '',
    outboundDealUrl: '',
    secretToken: '',
    events: {
      onLeadCreated: true,
      onHumanTakeover: true,
      onOfferAccepted: true,
      onOutreachEnrolled: false
    },
    isConnected: false
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : MOCK_USERS[0];
  }); // Admin default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('accessToken'));
  
  const [contacts, setContacts] = useState<RealtorContact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [deals, setDeals] = useState<PropertyDeal[]>([]);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(INITIAL_WORKFLOWS);
  const [aiConfig, setAiConfig] = useState<AIPersonalityConfig>(INITIAL_AI_CONFIG);

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const [integrations, setIntegrations] = useState<GatewayIntegrationsConfig>(INITIAL_INTEGRATIONS);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mappedUsers: UserProfile[] = json.data.map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim(),
            email: u.email,
            role: u.role as UserRole,
            avatar: (u.firstName?.[0] || 'U').toUpperCase() + (u.lastName?.[0] || 'N').toUpperCase(),
            title: u.role === 'ADMIN' ? 'Managing Director & Partner' : u.role === 'MANAGER' ? 'Head of Acquisitions' : 'Acquisition Specialist',
            status: (u.status === 'ACTIVE' ? 'Active' : 'Deactivated') as 'Active' | 'Deactivated'
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to fetch real users from backend:', err);
      }
    };
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const [settings, setSettings] = useState({
    cadenceIntervalDays: 3,
    sendingHoursStart: '08:00',
    sendingHoursEnd: '18:00',
    aiInstructions: INITIAL_AI_CONFIG.systemInstructions,
    aiMaxConsecutiveReplies: 4,
    globalAiEnabled: true,
    gradeWeights: { response: 25, address: 35, price: 20, timeline: 20 }
  });

  const updateIntegrations = (updates: Partial<GatewayIntegrationsConfig>) => {
    setIntegrations(prev => ({
      ...prev,
      ...updates
    }));
    logAuditAction('Updated Gateway Integrations Credentials', 'Settings / Integrations');
  };


  const setCurrentUserRole = (role: UserRole) => {
    const userForRole = users.find(u => u.role === role) || {
      ...currentUser,
      role
    };
    setCurrentUser(userForRole);
    logAuditAction(`Switched active view role to ${role}`, 'User Session');
  };

  const login = async (email: string, passwordStr?: string, role: UserRole = 'ADMIN') => {
    try {
      const pwd = passwordStr && passwordStr !== '••••••••••••' ? passwordStr : 'Password123!';
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const apiUser = data.data.user;
        const mappedUser: UserProfile = {
          id: apiUser.id,
          name: `${apiUser.firstName} ${apiUser.lastName}`,
          email: apiUser.email,
          role: apiUser.role as UserRole,
          avatar: apiUser.firstName.substring(0, 2).toUpperCase(),
          title: 'Real Estate Executive',
          status: apiUser.status as 'Active' | 'Deactivated'
        };
        setCurrentUser(mappedUser);
        setIsAuthenticated(true);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        logAuditAction(`User logged in as ${mappedUser.role} via API`, `User Profile (${mappedUser.email})`);
      } else {
        throw new Error(data.error?.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error("Login API Error:", err);
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        throw new Error("Failed to connect to server. Please check your network or if the backend is running.");
      }
      throw err;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  };

  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser = { ...userData, id: `usr-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
    logAuditAction(`Added user ${newUser.name} (${newUser.role})`, `User #${newUser.id}`);
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    logAuditAction(`Updated user profile`, `User #${id}`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Deactivated' : 'Active';
        return { ...u, status: nextStatus as 'Active' | 'Deactivated' };
      }
      return u;
    }));
    logAuditAction(`Toggled user activation status`, `User #${id}`);
  };

  // Contacts Handlers
  const addContact = (contactData: Omit<RealtorContact, 'id'>) => {
    const newId = `cnt-${Date.now()}`;
    const newContact: RealtorContact = { ...contactData, id: newId };
    setContacts(prev => [newContact, ...prev]);
    logAuditAction(`Created new contact ${newContact.name}`, `Contact #${newId}`);
  };

  const updateContact = (id: string, updates: Partial<RealtorContact>) => {
    setContacts(prev => {
      const exists = prev.some(c => c.id === id);
      if (!exists) {
        return [...prev, { id, ...updates } as RealtorContact];
      }
      return prev.map(c => c.id === id ? { ...c, ...updates } : c);
    });

    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      }).catch(err => console.error('Failed to sync contact update to backend', err));
    }

    logAuditAction(`Updated contact details`, `Contact #${id}`);
  };

  const updateContactStage = (id: string, newStage: OutreachStage) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStage,
          outreachStage: newStage
        };
      }
      return c;
    }));

    // Auto Task Trigger 1: Needs Human Touch
    if (newStage === 'Needs Human Touch') {
      const task: CRMTask = {
        id: `tsk-${Date.now()}`,
        title: `Needs Human Touch: Follow up with ${contact.name}`,
        description: `Bot paused. Realtor requires personal takeover regarding off-market inquiry.`,
        type: 'human_touch',
        priority: 'HIGH',
        status: 'PENDING',
        assignedToId: contact.ownerId || currentUser.id,
        assignedToName: contact.ownerName || currentUser.name,
        dueDate: 'Today',
        relatedContactId: contact.id,
        relatedContactName: contact.name,
        createdAt: 'Just now'
      };
      setTasks(prev => [task, ...prev]);

      // Switch matching conversation to Human Takeover
      setConversations(prev => prev.map(conv => conv.contactId === id ? { ...conv, aiStatus: 'Human Takeover', status: 'Needs Human', outreachStage: 'Needs Human Touch' } : conv));
    }

    // Auto Task Trigger 2: Lead Created
    if (newStage === 'Lead Created') {
      const task: CRMTask = {
        id: `tsk-${Date.now()}`,
        title: `Lead Created: Underwrite & Send LOI for ${contact.name}`,
        description: `Property opportunity captured. Underwriting and acquisition review required.`,
        type: 'lead_created',
        priority: 'HIGH',
        status: 'PENDING',
        assignedToId: contact.ownerId || currentUser.id,
        assignedToName: contact.ownerName || currentUser.name,
        dueDate: 'Today',
        relatedContactId: contact.id,
        relatedContactName: contact.name,
        createdAt: 'Just now'
      };
      setTasks(prev => [task, ...prev]);
    }

    logAuditAction(`Moved contact outreach stage to "${newStage}"`, `Contact #${id}`);
  };

  const updateContactTemperature = (id: string, temp: ContactTemperature) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, temperature: temp } : c));
    setConversations(prev => prev.map(conv => conv.contactId === id ? { ...conv, temperature: temp } : conv));
    logAuditAction(`Updated contact temperature to "${temp}"`, `Contact #${id}`);
  };

  // 30-Day Nurture Recycle Mechanism
  const recycleContactToQueued = (id: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const nextRecycleCount = (c.sequenceInfo.recycleCount || 0) + 1;
        return {
          ...c,
          status: 'Queued for Outreach' as OutreachStage,
          outreachStage: 'Queued for Outreach' as OutreachStage,
          temperature: 'Cold' as ContactTemperature,
          sequenceInfo: {
            ...c.sequenceInfo,
            currentTouch: 0,
            nurtureDay: 0,
            recycleCount: nextRecycleCount,
            lastTouchDate: 'Recycled Today',
            nextScheduledTouch: 'Touch 1 Ready'
          }
        };
      }
      return c;
    }));

    logAuditAction(`Recycled contact from 30-Day Nurture back to Queued for Outreach`, `Contact #${id}`);
  };

  const advanceContactSequence = (id: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const current = c.sequenceInfo.currentTouch;
        const next = current < 5 ? current + 1 : 5;
        const nextStage: OutreachStage = next === 5 ? 'No Response, In 30-Day Nurture' : 'Outreach Sent';
        return {
          ...c,
          status: nextStage,
          outreachStage: nextStage,
          sequenceInfo: {
            ...c.sequenceInfo,
            currentTouch: next,
            lastTouchDate: 'Just now',
            nextScheduledTouch: next === 5 ? 'In 30-Day Nurture Loop' : `Touch ${next + 1} in 2 days`
          }
        };
      }
      return c;
    }));

    logAuditAction(`Advanced 5-Touch sequence for contact`, `Contact #${id}`);
  };

  const archiveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    logAuditAction(`Deleted contact from database`, `Contact #${id}`);
  };

  const bulkDeleteContacts = (ids: string[]) => {
    setContacts(prev => prev.filter(c => !ids.includes(c.id)));
    logAuditAction(`Bulk deleted ${ids.length} contacts from database`, `Batch (${ids.length} items)`);
  };

  const bulkUpdateContacts = (ids: string[], updates: Partial<RealtorContact>) => {
    setContacts(prev => prev.map(c => ids.includes(c.id) ? { ...c, ...updates } : c));
    logAuditAction(`Bulk updated ${ids.length} contacts`, `Contacts Batch (${ids.join(', ')})`);
  };

  const importContacts = (newContactsData: Omit<RealtorContact, 'id'>[]) => {
    const created = newContactsData.map((c, i) => ({
      ...c,
      id: `cnt-imp-${Date.now()}-${i}`
    }));
    setContacts(prev => [...created, ...prev]);
    logAuditAction(`Imported ${created.length} contacts via CSV`, 'CSV Import Wizard');
  };

  // Conversations Handlers
  const sendMessage = (conversationId: string, text: string) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'human' as const,
      text,
      timestamp: 'Just now',
      channel: 'sms' as const
    };

    setConversations(prev => {
      const exists = prev.some(c => c.id === conversationId);
      if (!exists) {
        const matchingContact = contacts.find(c => `conv-${c.id}` === conversationId || c.id === conversationId);
        const newConv: Conversation = {
          id: conversationId,
          contactId: matchingContact?.id || conversationId,
          realtorName: matchingContact?.name || 'Realtor',
          realtorPhone: matchingContact?.phone || 'N/A',
          realtorEmail: matchingContact?.email || 'N/A',
          brokerage: matchingContact?.brokerage || 'Independent',
          latestMessage: text,
          timestamp: 'Just now',
          grade: 'A',
          score: 92,
          temperature: 'Hot',
          gradeReason: 'Active Inbound Lead with verified property criteria',
          status: 'Interested',
          outreachStage: 'Lead Created',
          aiStatus: 'Active',
          unread: false,
          classification: 'Interested',
          messages: [userMsg],
          propertyCaptured: {
            address: '4812 Bordeaux Ave',
            city: matchingContact?.market || 'Dallas',
            state: 'TX',
            zip: '75201',
            askingPrice: 420000,
            beds: 4,
            baths: 2.5,
            sqft: 2350,
            condition: 'Needs cosmetic rehab (kitchen & flooring)',
            timeline: '14-Day Fast Cash Close',
            intent: 'High Motivation - Relocating Seller'
          }
        };
        return [newConv, ...prev];
      }

      return prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            latestMessage: text,
            timestamp: 'Just now',
            messages: [...conv.messages, userMsg]
          };
        }
        return conv;
      });
    });

    logAuditAction(`Sent outbound message: "${text.substring(0, 30)}..."`, `Conversation #${conversationId}`);

    // 🤖 Smart Automated Realtor Response Simulator for Testing
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = '';
      let shouldExtract = false;
      let askingPrice = 420000;
      let address = '4812 Bordeaux Ave, Dallas, TX 75201';

      if (lower.includes('property') || lower.includes('deal') || lower.includes('criteria') || lower.includes('looking for') || lower.includes('have') || lower.includes('hi') || lower.includes('hello')) {
        replyText = "Hi! Yes, I represent a motivated seller with an off-market 4-bed, 2.5-bath property at 4812 Bordeaux Ave, Dallas, TX 75201 (2,350 sqft). Asking $420,000. Needs light cosmetic updates (~$40k). Seller wants a 14-day cash close.";
        shouldExtract = true;
      } else if (lower.includes('price') || lower.includes('offer') || lower.includes('cash') || lower.includes('$') || lower.includes('loi')) {
        replyText = "Thanks for the numbers! The seller reviewed your cash terms with zero contingencies. They are ready to execute the purchase agreement if we can close by next Friday.";
        shouldExtract = true;
      } else if (lower.includes('photo') || lower.includes('walk') || lower.includes('access') || lower.includes('inspect')) {
        replyText = "Lockbox code on site is 4829. Feel free to have your acquisitions inspector walk the property tomorrow between 10 AM and 4 PM.";
      } else {
        replyText = "Understood! I am sending over the title info and seller disclosure documents for your underwriting review.";
      }

      const simMsg = {
        id: `msg-sim-${Date.now()}`,
        sender: 'realtor' as const,
        text: replyText,
        timestamp: 'Just now',
        channel: 'sms' as const
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          const currentCaptured = conv.propertyCaptured || {
            address,
            city: 'Dallas',
            state: 'TX',
            zip: '75201',
            askingPrice,
            beds: 4,
            baths: 2.5,
            sqft: 2350,
            condition: 'Needs cosmetic rehab (kitchen & flooring)',
            timeline: '14-Day Fast Cash Close',
            intent: 'High Motivation - Relocating Seller'
          };

          const updatedCaptured = shouldExtract ? {
            ...currentCaptured,
            address,
            askingPrice,
            condition: 'Needs cosmetic rehab (kitchen & flooring)',
            timeline: '14-Day Fast Cash Close',
            intent: 'High Motivation - Relocating Seller'
          } : currentCaptured;

          return {
            ...conv,
            latestMessage: replyText,
            timestamp: 'Just now',
            status: shouldExtract ? 'Leads With Address' : conv.status,
            outreachStage: shouldExtract ? 'Lead Created' : conv.outreachStage,
            temperature: 'Hot',
            grade: 'A',
            score: 95,
            gradeReason: 'AI Simulator: Motivated seller verified with extracted asking price and fast timeline.',
            propertyCaptured: updatedCaptured,
            messages: [...conv.messages, simMsg]
          };
        }
        return conv;
      }));
    }, 1200);
  };

  const toggleAiTakeover = (conversationId: string, aiStatus: 'Active' | 'Human Takeover' | 'AI Off') => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const nextStage: OutreachStage = aiStatus === 'Human Takeover' ? 'Needs Human Touch' : conv.outreachStage;
        return {
          ...conv,
          aiStatus,
          outreachStage: nextStage
        };
      }
      return conv;
    }));

    logAuditAction(`Changed AI status to ${aiStatus}`, `Conversation #${conversationId}`);
  };

  const overrideGrade = (conversationId: string, newGrade: Grade, newScore: number, reason: string) => {
    setConversations(prev => prev.map(conv => conv.id === conversationId ? {
      ...conv,
      grade: newGrade,
      score: newScore,
      gradeReason: `[Manual Override by ${currentUser.name}]: ${reason}`
    } : conv));
    logAuditAction(`Manually overridden grade to ${newGrade} (${newScore})`, `Conversation #${conversationId}`);
  };

  const updateConversationTemperature = (conversationId: string, temp: ContactTemperature) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, temperature: temp } : c));
    if (conv.contactId) {
      setContacts(prev => prev.map(cnt => cnt.id === conv.contactId ? { ...cnt, temperature: temp } : cnt));
    }
    logAuditAction(`Updated conversation temperature to ${temp}`, `Conversation #${conversationId}`);
  };

  const cloneLeadToDeals = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv || !conv.propertyCaptured) return;

    const newDeal: PropertyDeal = {
      id: `dl-${Date.now()}`,
      conversationId: conv.id,
      contactId: conv.contactId,
      address: conv.propertyCaptured.address,
      city: conv.propertyCaptured.city || 'Dallas',
      state: conv.propertyCaptured.state || 'TX',
      zip: conv.propertyCaptured.zip || '75201',
      askingPrice: conv.propertyCaptured.askingPrice || 500000,
      beds: conv.propertyCaptured.beds || 3,
      baths: conv.propertyCaptured.baths || 2,
      sqft: conv.propertyCaptured.sqft || 2000,
      lotSize: '0.25 Acres',
      yearBuilt: 2000,
      propertyType: 'Single Family Residence',
      stage: 'New',
      isAiInbound: true,
      ownerId: conv.assignedOwnerId || currentUser.id,
      ownerName: conv.assignedOwnerName || currentUser.name,
      ownerAvatar: (conv.assignedOwnerName || currentUser.name).split(' ').map(n => n[0]).join('').toUpperCase(),
      grade: conv.grade,
      score: conv.score,
      temperature: conv.temperature || 'Hot',
      realtorName: conv.realtorName,
      realtorBrokerage: conv.brokerage,
      realtorPhone: conv.realtorPhone,
      realtorEmail: conv.realtorEmail,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: 'Just now',
      source: 'AI Outreach Capture',
      lastActivity: 'Lead cloned from AI Conversation into AI Deals',
      underwriting: {
        marketValue: Math.round((conv.propertyCaptured.askingPrice || 500000) * 1.2),
        arv: Math.round((conv.propertyCaptured.askingPrice || 500000) * 1.25),
        estimatedRehab: 45000,
        closingCosts: 8000,
        holdingCosts: 6000,
        targetWholesaleFee: 25000,
        calculatedMao: Math.round((conv.propertyCaptured.askingPrice || 500000) * 0.95),
        offerPrice: Math.round((conv.propertyCaptured.askingPrice || 500000) * 0.90),
        estimatedProfit: 25000,
        roi: 20.5
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'created',
          title: 'Deal Created from AI Conversation',
          description: `Captured address ${conv.propertyCaptured.address} from dialogue with ${conv.realtorName}.`,
          timestamp: 'Just now',
          actor: 'Apex AI Bot'
        }
      ]
    };

    setDeals(prev => {
      const exists = prev.some(d => d.id === newDeal.id || d.address === newDeal.address);
      if (exists) return prev;
      return [newDeal, ...prev];
    });

    // Persist deal to backend
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          address: newDeal.address,
          city: newDeal.city,
          state: newDeal.state,
          zip: newDeal.zip,
          askingPrice: newDeal.askingPrice,
          contactId: newDeal.contactId,
          realtorName: newDeal.realtorName,
          realtorBrokerage: newDeal.realtorBrokerage,
          realtorPhone: newDeal.realtorPhone,
          realtorEmail: newDeal.realtorEmail,
          stage: 'New',
          temperature: newDeal.temperature,
          propertyType: newDeal.propertyType,
          beds: newDeal.beds,
          baths: newDeal.baths,
          sqft: newDeal.sqft,
          isAiInbound: true
        })
      }).catch(err => console.error('Failed to persist cloned deal to backend', err));
    }

    // Link deal ID to contact
    if (conv.contactId) {
      setContacts(prev => prev.map(cnt => {
        if (cnt.id === conv.contactId) {
          const existing = cnt.propertyDealIds || [];
          return {
            ...cnt,
            status: 'Lead Created',
            outreachStage: 'Lead Created',
            propertyDealIds: [...existing, newDeal.id]
          };
        }
        return cnt;
      }));
    }

    // Add task
    const task: CRMTask = {
      id: `tsk-${Date.now()}`,
      title: `Lead Cloned: Underwrite ${newDeal.address}`,
      description: `Opportunity cloned into AI Deals. Review MAO and draft LOI.`,
      type: 'lead_created',
      priority: 'HIGH',
      status: 'PENDING',
      assignedToId: newDeal.ownerId,
      assignedToName: newDeal.ownerName,
      dueDate: 'Today',
      relatedContactId: conv.contactId,
      relatedContactName: conv.realtorName,
      relatedDealId: newDeal.id,
      relatedDealAddress: newDeal.address,
      createdAt: 'Just now'
    };
    setTasks(prev => [task, ...prev]);

    logAuditAction(`Cloned property lead ${newDeal.address} into AI Deals`, `Deal #${newDeal.id}`);
  };

  // Deals Handlers
  const addDeal = (dealData: Omit<PropertyDeal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = monthNames[now.getMonth()];
    const dayStr = String(now.getDate()).padStart(2, '0');
    const yearStr = now.getFullYear();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const dateFormatted = `${monthStr} ${dayStr}, ${yearStr} ${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;

    const newDeal: PropertyDeal = {
      ...dealData,
      id: `dl-${Date.now()}`,
      createdAt: dateFormatted,
      updatedAt: 'Just now'
    };
    setDeals(prev => [newDeal, ...prev]);

    // Link to contact if exists
    if (newDeal.contactId) {
      setContacts(prev => prev.map(c => {
        if (c.id === newDeal.contactId) {
          const existing = c.propertyDealIds || [];
          return { ...c, propertyDealIds: [...existing, newDeal.id] };
        }
        return c;
      }));
    }

    logAuditAction(`Manually created deal for ${newDeal.address}`, `Deal #${newDeal.id}`);
  };

  const assignDeal = (dealId: string, userId: string, userName: string, userAvatar?: string) => {
    const activityObj: DealActivity = {
      id: `act-${Date.now()}`,
      type: 'assigned',
      title: `Assigned to ${userName}`,
      description: `Deal ownership transferred to ${userName}.`,
      timestamp: 'Just now',
      actor: currentUser.name
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const existingActivities = d.activities || [];
        return {
          ...d,
          ownerId: userId,
          ownerName: userName,
          ownerAvatar: userAvatar || userName.split(' ').map(n => n[0]).join('').toUpperCase(),
          updatedAt: 'Just now',
          lastActivity: `Assigned to ${userName}`,
          activities: [activityObj, ...existingActivities]
        };
      }
      return d;
    }));

    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${API_BASE_URL}/deals/${dealId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ownerId: userId })
      }).catch(err => console.error('Failed to sync deal assignment to backend:', err));
    }

    logAuditAction(`Assigned deal to ${userName}`, `Deal #${dealId}`);
  };

  const addDealActivity = (dealId: string, activity: { type: string; title: string; description: string; actor?: string }) => {
    const activityObj: DealActivity = {
      id: `act-${Date.now()}`,
      type: activity.type as any,
      title: activity.title,
      description: activity.description,
      timestamp: 'Just now',
      actor: activity.actor || currentUser.name
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const existingActivities = d.activities || [];
        return {
          ...d,
          updatedAt: 'Just now',
          lastActivity: activity.title,
          activities: [activityObj, ...existingActivities]
        };
      }
      return d;
    }));
  };

  const updateDealStage = (dealId: string, newStage: DealStage) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const activityObj: DealActivity = {
      id: `act-${Date.now()}`,
      type: 'stage_changed',
      title: `Stage Changed to ${newStage}`,
      description: `Deal moved from ${deal.stage} to ${newStage}.`,
      timestamp: 'Just now',
      actor: currentUser.name
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const existingActivities = d.activities || [];
        return {
          ...d,
          stage: newStage,
          updatedAt: 'Just now',
          lastActivity: `Moved to ${newStage}`,
          activities: [activityObj, ...existingActivities]
        };
      }
      return d;
    }));

    // Auto Task Trigger on "Need Help" Deal Stage
    if (newStage === 'Need Help' || newStage === 'Negotiation') {
      const managerUser = users.find(u => u.role === 'MANAGER') || users[0];
      const managerTask: CRMTask = {
        id: `tsk-${Date.now()}`,
        title: `Manager Escalation: ${deal.address} Needs Help`,
        description: `Deal moved to "${newStage}" stage. Requires manager review, price concession, or terms approval.`,
        type: 'need_help',
        priority: 'URGENT',
        status: 'PENDING',
        assignedToId: managerUser.id,
        assignedToName: managerUser.name,
        dueDate: 'Today (Urgent)',
        relatedContactId: deal.contactId,
        relatedContactName: deal.realtorName,
        relatedDealId: deal.id,
        relatedDealAddress: deal.address,
        createdAt: 'Just now'
      };
      setTasks(prev => [managerTask, ...prev]);

      // Send app notification
      const notif: AppNotification = {
        id: `nt-${Date.now()}`,
        title: `Deal Stage: ${newStage}`,
        message: `${deal.address} moved to ${newStage}. Task created.`,
        type: 'task_created',
        timestamp: 'Just now',
        read: false,
        targetPath: 'tasks'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAuditAction(`Moved deal stage to ${newStage}`, `Deal #${dealId}`);
  };

  const updateDeal = (dealId: string, updates: Partial<PropertyDeal>) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...updates, updatedAt: 'Just now' } : d));
    logAuditAction(`Updated deal parameters`, `Deal #${dealId}`);
  };

    const deleteDeal = async (dealId: string) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    try {
      const token = localStorage.getItem('accessToken');
      if (token && !dealId.startsWith('dl-')) {
        await fetch(`${API_BASE_URL}/deals/${dealId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to delete deal on server', err);
    }
    logAuditAction(`Deleted deal from workspace`, `Deal #${dealId}`);
  };

  const archiveDeal = async (dealId: string) => {
    await deleteDeal(dealId);
  };

  const bulkDeleteDeals = async (dealIds: string[]) => {
    setDeals(prev => prev.filter(d => !dealIds.includes(d.id)));
    try {
      const token = localStorage.getItem('accessToken');
      const validDbIds = dealIds.filter(id => !id.startsWith('dl-'));
      if (token && validDbIds.length > 0) {
        await fetch(`${API_BASE_URL}/deals/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ids: validDbIds })
        });
      }
    } catch (err) {
      console.error('Failed to bulk delete deals on server', err);
    }
    logAuditAction(`Bulk deleted ${dealIds.length} deals`, `Batch (${dealIds.length} items)`);
  };

  const addGeneratedContract = (dealId: string, contract: { templateName: string; fileName: string; fileType: 'pdf' | 'docx'; generatedBy: string; purchasePrice?: number; status?: 'Draft' | 'Sent for Signature' | 'Executed' | 'Archived' }) => {
    const contractObj = {
      id: `ctr-${Date.now()}`,
      ...contract,
      status: contract.status || 'Draft',
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      version: 1
    };

    const activityObj: DealActivity = {
      id: `act-${Date.now()}`,
      type: 'contract_generated',
      title: `Contract Generated: ${contract.templateName}`,
      description: `Generated ${contract.fileName} for $${(contract.purchasePrice || 0).toLocaleString()}.`,
      timestamp: 'Just now',
      actor: currentUser.name
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const existing = d.generatedContracts || [];
        const existingActivities = d.activities || [];
        contractObj.version = existing.length + 1;
        return {
          ...d,
          stage: 'Contract',
          updatedAt: 'Just now',
          lastActivity: `Generated ${contract.templateName}`,
          generatedContracts: [contractObj, ...existing],
          activities: [activityObj, ...existingActivities]
        };
      }
      return d;
    }));

    logAuditAction(`Generated contract version ${contractObj.version}`, `Deal #${dealId}`);
  };

  const claimLead = (conversationId: string, assignedUserId?: string, assignedUserName?: string) => {
    const targetUserId = assignedUserId || currentUser.id;
    const targetUserName = assignedUserName || currentUser.name;

    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          assignedOwnerId: targetUserId,
          assignedOwnerName: targetUserName,
          status: 'Assigned',
          aiStatus: 'Human Takeover'
        };
      }
      return c;
    }));

    if (conv.contactId) {
      setContacts(prev => prev.map(cnt => {
        if (cnt.id === conv.contactId) {
          return {
            ...cnt,
            ownerId: targetUserId,
            ownerName: targetUserName,
            status: 'Needs Human Touch'
          };
        }
        return cnt;
      }));
    }

    logAuditAction(`Claimed lead (assigned to ${targetUserName})`, `Conversation #${conversationId}`);
  };

  // Tasks Management Handlers
  const addTask = (taskData: Omit<CRMTask, 'id' | 'createdAt'>) => {
    const newTask: CRMTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      createdAt: 'Just now'
    };
    setTasks(prev => [newTask, ...prev]);
    logAuditAction(`Created new task: ${newTask.title}`, `Task #${newTask.id}`);
  };

  const updateTask = (taskId: string, updates: Partial<CRMTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    logAuditAction(`Updated task`, `Task #${taskId}`);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'COMPLETED',
          completedAt: 'Just now'
        };
      }
      return t;
    }));
    logAuditAction(`Marked task as completed`, `Task #${taskId}`);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    logAuditAction(`Deleted task`, `Task #${taskId}`);
  };

  // Phone Call AI-Stop Safeguard Action
  const handlePhoneCallInitiated = (contactId: string, contactName: string) => {
    // 1. Immediately pause AI bot and update stage to "Needs Human Touch"
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          status: 'Needs Human Touch',
          outreachStage: 'Needs Human Touch'
        };
      }
      return c;
    }));

    // 2. Switch any matching conversation to Human Takeover
    setConversations(prev => prev.map(c => {
      if (c.contactId === contactId) {
        return {
          ...c,
          aiStatus: 'Human Takeover',
          status: 'Needs Human',
          outreachStage: 'Needs Human Touch'
        };
      }
      return c;
    }));

    // 3. Create follow-up task
    const newTask: CRMTask = {
      id: `tsk-${Date.now()}`,
      title: `Phone Call Follow-Up: ${contactName}`,
      description: `Live phone call was conducted. AI SMS was paused automatically. Log call notes and send follow-up terms.`,
      type: 'phone_call',
      priority: 'HIGH',
      status: 'PENDING',
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      dueDate: 'Today',
      relatedContactId: contactId,
      relatedContactName: contactName,
      createdAt: 'Just now'
    };
    setTasks(prev => [newTask, ...prev]);

    logAuditAction(`Phone call initiated — AI bot paused & "Needs Human Touch" task created`, `Contact #${contactId}`);
  };

  // Templates Handlers
  const addTemplate = (templateData: Omit<EmailTemplate, 'id' | 'lastUpdated'>) => {
    const newTemplate: EmailTemplate = {
      ...templateData,
      id: `tpl-${Date.now()}`,
      lastUpdated: 'Just now'
    };
    setTemplates(prev => [newTemplate, ...prev]);
    logAuditAction(`Added template: ${newTemplate.name}`, `Template #${newTemplate.id}`);
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, lastUpdated: 'Just now' } : t));
    logAuditAction(`Updated template`, `Template #${id}`);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    logAuditAction(`Deleted template`, `Template #${id}`);
  };

  // Workflows Handlers
  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
    logAuditAction(`Toggled automation workflow active state`, `Workflow #${id}`);
  };

  const simulateWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          executionCount: w.executionCount + 1,
          lastExecuted: 'Just now (Simulated)'
        };
      }
      return w;
    }));

    logAuditAction(`Simulated workflow execution successfully`, `Workflow #${id}`);
  };

  const updateAIConfig = (updates: Partial<AIPersonalityConfig>) => {
    setAiConfig(prev => ({ ...prev, ...updates }));
    logAuditAction(`Updated AI Agent Personality & Instructions`, 'AI Personality Studio');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const logAuditAction = (action: string, affectedRecord: string) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      actor: `${currentUser.name} (${currentUser.role})`,
      action,
      timestamp: 'Just now',
      affectedRecord
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateSettings = (newSettings: Partial<AppContextType['settings']>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAuditAction(`Updated system configuration settings`, 'System Administration');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUserRole,
      isAuthenticated,
      login,
      logout,
      users,
      addUser,
      updateUser,
      toggleUserStatus,
      contacts,
      addContact,
      updateContact,
      updateContactStage,
      updateContactTemperature,
      recycleContactToQueued,
      advanceContactSequence,
      archiveContact,
      bulkDeleteContacts,
      bulkUpdateContacts,
      importContacts,
      conversations,
      activeConversationId,
      setActiveConversationId,
      sendMessage,
      toggleAiTakeover,
      overrideGrade,
      updateConversationTemperature,
      cloneLeadToDeals,
      deals,
      activeDealId,
      setActiveDealId,
      addDeal,
      updateDealStage,
      updateDeal,
      assignDeal,
      addDealActivity,
      archiveDeal,
      deleteDeal,
      bulkDeleteDeals,
      addGeneratedContract,
      claimLead,
      tasks,
      addTask,
      updateTask,
      completeTask,
      deleteTask,
      handlePhoneCallInitiated,
      templates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      workflows,
      toggleWorkflow,
      simulateWorkflow,
      aiConfig,
      updateAIConfig,
      notifications,
      markNotificationRead,
      auditLogs,
      logAuditAction,
      settings,
      updateSettings,
      integrations,
      updateIntegrations
    }}>
      {children}
    </AppContext.Provider>

  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
