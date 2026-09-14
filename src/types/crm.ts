export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'READ_ONLY';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  status: 'Active' | 'Deactivated';
}

export type OutreachStage = 
  | 'Queued for Outreach'
  | 'Outreach Sent'
  | 'Responded/Qualifying'
  | 'Needs Human Touch'
  | 'Lead Created'
  | 'No Response, In 30-Day Nurture'
  | 'Not Interested - CLOSED'
  | 'Wrong Number / Not an Agent - CLOSED'
  | 'Opted Out / DND - CLOSED'
  | 'SMS Error - CLOSED';

export type ContactStatus = OutreachStage;

export type ContactTemperature = 'Hot' | 'Warm' | 'Cold';
export type Grade = 'A' | 'B' | 'C' | 'D';

export interface OutreachSequenceInfo {
  currentTouch: number; // 1 to 5
  totalTouches: number; // 5
  nurtureDay: number;   // 1 to 30
  recycleCount: number; // number of times recycled back to queued
  lastTouchDate: string;
  nextScheduledTouch?: string;
  channel: 'sms' | 'email' | 'omnichannel';
}

export interface RealtorContact {
  id: string;
  name: string;
  licenseNumber: string;
  brokerage: string;
  email: string;
  phone: string;
  market: string;
  status: OutreachStage;
  outreachStage: OutreachStage;
  temperature: ContactTemperature;
  sequenceInfo: OutreachSequenceInfo;
  ownerId: string;
  ownerName: string;
  tags: string[];
  lastContacted: string;
  lastResponse: string;
  grade: Grade;
  score: number;
  notes: string[];
  isArchived?: boolean;
  propertyDealIds?: string[];
}

export type TaskType = 'human_touch' | 'lead_created' | 'need_help' | 'phone_call' | 'general';
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface CRMTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  assignedToName: string;
  dueDate: string;
  relatedContactId?: string;
  relatedContactName?: string;
  relatedDealId?: string;
  relatedDealAddress?: string;
  relatedConversationId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ActivityEvent {
  id: string;
  contactId: string;
  type: 'email_sent' | 'sms_sent' | 'email_reply' | 'sms_reply' | 'ai_response' | 'human_response' | 'call' | 'note' | 'status_change' | 'assignment_change' | 'recycle' | 'task_created';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export type AIStatus = 'Active' | 'Human Takeover' | 'AI Off';
export type ClassificationType = 'Interested' | 'Not Interested' | 'Has Property' | 'Question' | 'Wants Call' | 'Unclear' | 'Opt-out';

export interface Message {
  id: string;
  sender: 'realtor' | 'ai' | 'human';
  text: string;
  timestamp: string;
  channel: 'sms' | 'email';
}

export interface Conversation {
  id: string;
  contactId: string;
  realtorName: string;
  realtorPhone: string;
  realtorEmail: string;
  brokerage: string;
  latestMessage: string;
  timestamp: string;
  grade: Grade;
  score: number;
  temperature: ContactTemperature;
  gradeReason: string;
  status: 'Needs Human' | 'Leads With Address' | 'Interested' | 'Not Interested' | 'Questions' | 'Wants Call' | 'Unclear' | 'Opt-out' | 'Assigned';
  outreachStage: OutreachStage;
  aiStatus: AIStatus;
  assignedOwnerId?: string;
  assignedOwnerName?: string;
  unread: boolean;
  classification: ClassificationType;
  messages: Message[];
  propertyCaptured?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    askingPrice: number;
    beds: number;
    baths: number;
    sqft: number;
    condition: string;
    timeline: string;
    intent: string;
  };
}

export type DealStage = 
  | 'New Property' 
  | 'Qualifying' 
  | 'Offer Made' 
  | 'Offer Accepted' 
  | 'Offer Rejected' 
  | 'TRASH' 
  | 'Duplicate Lead' 
  | 'Need Help';

export interface PropertyDeal {
  id: string;
  conversationId?: string;
  contactId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  askingPrice: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  propertyType: string;
  stage: DealStage;
  isAiInbound: boolean;
  ownerId: string;
  ownerName: string;
  grade: Grade;
  score: number;
  temperature?: ContactTemperature;
  realtorName: string;
  realtorBrokerage: string;
  realtorPhone: string;
  realtorEmail: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  isArchived?: boolean;
  underwriting?: {
    arv: number;
    estimatedRehab: number;
    targetWholesaleFee: number;
    calculatedMao: number;
  };
  offerDetails?: {
    purchasePrice: number;
    earnestMoney: number;
    optionFee: number;
    optionPeriodDays: number;
    closingDate: string;
    buyerEntity: string;
    sellerName: string;
    titleCompany: string;
    financingType: string;
    inspectionPeriodDays: number;
    specialProvisions: string;
  };
  generatedContracts?: Array<{
    id: string;
    templateName: string;
    fileName: string;
    fileType: 'pdf' | 'docx';
    generatedAt: string;
    generatedBy: string;
    version: number;
  }>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: '5_touch_cadence' | '30_day_nurture' | 'deal_offers' | 'general';
  touchNumber?: number;
  channel: 'sms' | 'email';
  subject?: string;
  body: string;
  variables: string[];
  lastUpdated: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  actions: string[];
  isActive: boolean;
  executionCount: number;
  lastExecuted: string;
}

export interface AIPersonalityConfig {
  personaName: string;
  tone: 'institutional' | 'direct' | 'consultative' | 'friendly';
  systemInstructions: string;
  creativityTemperature: number;
  autoGradeHotCriteria: string[];
  autoGradeWarmCriteria: string[];
  autoGradeColdCriteria: string[];
  maxConsecutiveReplies: number;
  pauseOnPhoneCall: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'lead_assigned' | 'conversation_escalated' | 'address_captured' | 'integration_alert' | 'system' | 'task_created';
  timestamp: string;
  read: boolean;
  targetPath?: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  affectedRecord: string;
}
