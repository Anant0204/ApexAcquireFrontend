import React, { useState } from 'react';
import type { RealtorContact, ContactTemperature, OutreachStage, DealStage, Grade } from '../types/crm';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Home,
  Calendar,
  Clock,
  Send,
  RotateCcw,
  Flame,
  CheckCircle2,
  Plus,
  Play,
  Ban,
  MessageSquare,
  FileText,
  UserCheck,
  Shield,
  PhoneCall,
  DollarSign,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  History,
  Tag,
  ExternalLink,
  Sparkles,
  Sliders,
  Briefcase,
  X,
  FileCheck,
  Layers,
  Wrench,
  CheckSquare,
  Download,
  Bell,
  Eye
} from 'lucide-react';

interface ContactDetailPageProps {
  contact: RealtorContact;
  onBack: () => void;
  onOpenCallModal: (contact: RealtorContact) => void;
  onNavigateToConversation?: (convId: string) => void;
  onSelectDeal?: (deal: any) => void;
}

type RightPanelTab = 'associations' | 'history' | 'settings' | 'tasks' | 'calendar' | 'contracts';

export const ContactDetailPage: React.FC<ContactDetailPageProps> = ({
  contact,
  onBack,
  onOpenCallModal,
  onNavigateToConversation,
  onSelectDeal
}) => {
  const { 
    contacts,
    updateContact, 
    updateContactTemperature, 
    updateContactStage, 
    recycleContactToQueued, 
    advanceContactSequence,
    conversations,
    deals,
    addDeal,
    tasks,
    completeTask,
    addTask,
    sendMessage,
    currentUser, 
    users,
    logAuditAction 
  } = useApp();

  // Current contact live object
  const currentContact = contacts.find(c => c.id === contact.id) || contact;

  // Center Tab State
  const [centerTab, setCenterTab] = useState<'conversations' | 'calls' | 'tasks'>('conversations');
  const [messageChannel, setMessageChannel] = useState<'sms' | 'email'>('sms');
  const [quickSmsText, setQuickSmsText] = useState('');
  const [quickEmailSubject, setQuickEmailSubject] = useState('');
  const [quickEmailText, setQuickEmailText] = useState('');

  // Right Panel Tab State (Controlled by the 8 Icons)
  const [rightTab, setRightTab] = useState<RightPanelTab>('associations');

  // Accordion Sections State in Left Panel
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contact: true,
    realtor: true,
    wholesaler: false,
    contract: false,
    general: false,
    additional: false
  });
  const [fieldSearch, setFieldSearch] = useState('');

  // Associations Right Panel State
  const [companiesExpanded, setCompaniesExpanded] = useState(true);
  const [dealsExpanded, setDealsExpanded] = useState(true);

  // Add Deal & Add Company Modal State
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [newDealAddress, setNewDealAddress] = useState('');
  const [newDealPrice, setNewDealPrice] = useState<number>(450000);
  const [newDealStage, setNewDealStage] = useState<DealStage>('New');

  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState(currentContact.brokerage || '');

  // Edit Contact Modal State
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editName, setEditName] = useState(currentContact.name);
  const [editEmail, setEditEmail] = useState(currentContact.email);
  const [editPhone, setEditPhone] = useState(currentContact.phone);
  const [editBrokerage, setEditBrokerage] = useState(currentContact.brokerage);
  const [editLicense, setEditLicense] = useState(currentContact.licenseNumber || '');
  const [editMarket, setEditMarket] = useState(currentContact.market);
  const [editTemperature, setEditTemperature] = useState<ContactTemperature>(currentContact.temperature);

  // Add Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('Today, 5:00 PM');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // DND Setting State
  const [dndActive, setDndActive] = useState(false);
  const [tagsList, setTagsList] = useState<string[]>(['realtor', 'agent', 'off-market']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');

  const isReadOnly = currentUser.role === 'READ_ONLY';

  // Find linked conversation
  const linkedConv = conversations.find(c => c.contactId === currentContact.id);

  // Find linked deals from AI Deals Pipeline
  const linkedDeals = deals.filter(d => d.contactId === currentContact.id || currentContact.propertyDealIds?.includes(d.id));

  // Find linked tasks
  const linkedTasks = tasks.filter(t => t.relatedContactId === currentContact.id);

  // Simulated Call Logs
  const callLogs = [
    {
      id: 'call-1',
      date: 'Today, 10:45 AM',
      duration: '03:12',
      outcome: 'Spoke with Agent - Discussed Criteria',
      caller: 'Marcus Sterling',
      notes: 'Sarah confirmed estate probate listing on Bordeaux Ave. Motivated for 14-day cash settlement. Needs proof of funds.'
    },
    {
      id: 'call-2',
      date: 'Yesterday, 02:15 PM',
      duration: '01:05',
      outcome: 'Left Voicemail',
      caller: 'Marcus Sterling',
      notes: 'Left voicemail inquiring about upcoming pocket listings in Highland Park.'
    }
  ];

  // Activity History Events
  const activityHistory = [
    {
      id: 'act-1',
      type: 'message',
      title: 'SMS Message Received',
      desc: '"Yes, 4812 Bordeaux Ave in Highland Park! Asking $1,450,000..."',
      time: '12 mins ago',
      actor: currentContact.name,
      icon: MessageSquare,
      color: 'text-[#0284C7] bg-[#E0F2FE]'
    },
    {
      id: 'act-2',
      type: 'deal',
      title: 'Deal Cloned to Pipeline',
      desc: 'Property opportunity 4812 Bordeaux Ave associated with contact.',
      time: '14 mins ago',
      actor: 'Apex AI Assistant',
      icon: Home,
      color: 'text-emerald-700 bg-emerald-50'
    },
    {
      id: 'act-3',
      type: 'call',
      title: 'Outbound Call Completed',
      desc: 'Duration: 03:12. Outcome: Spoke with Agent - Criteria discussed.',
      time: '2 hours ago',
      actor: currentContact.ownerName || 'Marcus Sterling',
      icon: PhoneCall,
      color: 'text-purple-700 bg-purple-50'
    },
    {
      id: 'act-4',
      type: 'cadence',
      title: 'Cadence Touch 1 Dispatched',
      desc: 'Introductory off-market acquisition text sent via SMS.',
      time: '1 day ago',
      actor: 'Cadence Engine',
      icon: Send,
      color: 'text-amber-700 bg-amber-50'
    }
  ];

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageChannel === 'sms') {
      if (!quickSmsText.trim()) return;
      if (linkedConv) {
        sendMessage(linkedConv.id, quickSmsText.trim());
      }
      logAuditAction(`Sent SMS to ${currentContact.name}: "${quickSmsText.trim()}"`, `Contact #${currentContact.id}`);
      setQuickSmsText('');
    } else {
      if (!quickEmailText.trim()) return;
      logAuditAction(`Sent Email to ${currentContact.name} ("${quickEmailSubject}")`, `Contact #${currentContact.id}`);
      setQuickEmailSubject('');
      setQuickEmailText('');
    }
  };

  const handleCreateContactDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealAddress.trim()) return;

    addDeal({
      address: newDealAddress.trim(),
      city: 'Dallas',
      state: 'TX',
      zip: '75205',
      askingPrice: newDealPrice,
      beds: 3,
      baths: 2,
      sqft: 2100,
      yearBuilt: 2002,
      propertyType: 'Single Family Residence',
      stage: newDealStage,
      temperature: currentContact.temperature,
      contactId: currentContact.id,
      realtorName: currentContact.name,
      realtorBrokerage: currentContact.brokerage,
      realtorPhone: currentContact.phone,
      realtorEmail: currentContact.email,
      isAiInbound: false,
      ownerId: currentContact.ownerId || currentUser.id,
      ownerName: currentContact.ownerName || currentUser.name,
      grade: currentContact.grade,
      score: currentContact.score,
      source: 'Contact Association Desk'
    });

    setShowAddDealModal(false);
    setNewDealAddress('');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    updateContact(currentContact.id, { brokerage: newCompanyName.trim() });
    setShowAddCompanyModal(false);
  };

  const handleSaveContactEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact(currentContact.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      brokerage: editBrokerage.trim(),
      licenseNumber: editLicense.trim(),
      market: editMarket.trim(),
      temperature: editTemperature
    });
    logAuditAction(`Updated contact details for ${editName}`, `Contact #${currentContact.id}`);
    setShowEditContactModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || `Follow up with ${currentContact.name}`,
      dueDate: newTaskDue,
      priority: 'HIGH',
      status: 'PENDING',
      assignedTo: currentContact.ownerName || currentUser.name,
      assignedToName: currentContact.ownerName || currentUser.name,
      assignedToInitials: (currentContact.ownerName || currentUser.name).split(' ').map((n: string) => n[0]).join(''),
      relatedContactId: currentContact.id,
      relatedContactName: currentContact.name
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskModal(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    if (!tagsList.includes(newTagInput.trim().toLowerCase())) {
      setTagsList([...tagsList, newTagInput.trim().toLowerCase()]);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const existing = currentContact.notes || [];
    updateContact(currentContact.id, {
      notes: [newNoteText.trim(), ...existing]
    });
    setNewNoteText('');
    logAuditAction(`Added note to ${currentContact.name}`, `Contact #${currentContact.id}`);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen -m-6 p-3 sm:p-4 text-xs font-sans">
      
      {/* TOP HEADER SUBNAV ROW */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 mb-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B1F3A] font-bold text-xs cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0284C7]" /> Back to Contacts
          </button>
          
          <div className="h-4 w-px bg-[#CBD5E1]" />

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#0B1F3A]">{currentContact.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              currentContact.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              currentContact.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {currentContact.temperature || 'Warm'} Lead
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">ID: #{currentContact.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditName(currentContact.name);
              setEditEmail(currentContact.email);
              setEditPhone(currentContact.phone);
              setEditBrokerage(currentContact.brokerage);
              setEditLicense(currentContact.licenseNumber || '');
              setEditMarket(currentContact.market);
              setEditTemperature(currentContact.temperature);
              setShowEditContactModal(true);
            }}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B1F3A] font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#0284C7]" /> Edit Contact
          </button>

          {!isReadOnly && (
            <button
              onClick={() => onOpenCallModal(currentContact)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Agent
            </button>
          )}

          {linkedConv && onNavigateToConversation && (
            <button
              onClick={() => onNavigateToConversation(linkedConv.id)}
              className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Full Inbox
            </button>
          )}
        </div>
      </div>

      {/* 3-COLUMN GHL / REVORA WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LEFT CONTACT INFO & ACCORDION CUSTOM FIELDS (3.5 / 12 COLS)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Top Contact Identity Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 space-y-3.5">
            
            {/* Name, Avatar, Delete */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E0F2FE] text-[#0284C7] font-extrabold text-base flex items-center justify-center border border-[#BAE6FD]">
                  {currentContact.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-[#0B1F3A] leading-tight">
                    {currentContact.name}
                  </h2>
                  <p className="text-[11px] text-[#64748B]">{currentContact.brokerage || 'Independent Realtor'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditName(currentContact.name);
                    setShowEditContactModal(true);
                  }}
                  title="Edit Contact"
                  className="p-1.5 text-[#94A3B8] hover:text-[#0284C7] rounded-lg hover:bg-[#F0F9FF] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Owner & Followers */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#94A3B8] block mb-1">Owner</span>
                <div className="flex items-center gap-1 text-[#0B1F3A] font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span className="truncate">{currentContact.ownerName || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#94A3B8] block mb-1">Followers</span>
                <button
                  onClick={() => alert(`Added ${currentUser.name} as follower to ${currentContact.name}`)}
                  className="flex items-center gap-1 text-[#0284C7] font-bold hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Tags ({tagsList.length})</span>
                <button
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-[10px] text-[#0284C7] font-bold hover:underline cursor-pointer"
                >
                  + Add Tag
                </button>
              </div>

              {showTagInput && (
                <form onSubmit={handleAddTag} className="flex gap-1 pt-1">
                  <input
                    type="text"
                    placeholder="New tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-[11px] focus:outline-none focus:border-[#0284C7]"
                  />
                  <button type="submit" className="px-2 py-1 bg-[#0284C7] text-white font-bold text-[10px] rounded-md cursor-pointer">
                    Add
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                {tagsList.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] font-semibold text-[11px] flex items-center gap-1">
                    {t} <X onClick={() => handleRemoveTag(t)} className="w-2.5 h-2.5 text-[#94A3B8] cursor-pointer hover:text-rose-500" />
                  </span>
                ))}
              </div>
            </div>

            {/* Action Pills */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => {
                  setExpandedSections({ contact: true, realtor: true, wholesaler: true, contract: true, general: true, additional: true });
                }}
                className="py-1 px-2 rounded-lg bg-[#F8FAFC] hover:bg-[#E0F2FE] hover:text-[#0284C7] border border-[#E2E8F0] text-[#0B1F3A] font-bold text-[10px] text-center cursor-pointer transition-colors"
              >
                All fields
              </button>
              <button
                onClick={() => {
                  setDndActive(!dndActive);
                  logAuditAction(`DND status updated to ${!dndActive ? 'Active' : 'Off'}`, `Contact #${currentContact.id}`);
                }}
                className={`py-1 px-2 rounded-lg border font-bold text-[10px] text-center cursor-pointer transition-colors ${
                  dndActive ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-[#F8FAFC] hover:bg-[#E2E8F0] border-[#E2E8F0] text-[#0B1F3A]'
                }`}
              >
                {dndActive ? 'DND Active ⛔' : 'DND'}
              </button>
              <button
                onClick={() => {
                  setRightTab('settings');
                }}
                className="py-1 px-2 rounded-lg bg-[#F8FAFC] hover:bg-[#E0F2FE] hover:text-[#0284C7] border border-[#E2E8F0] text-[#0B1F3A] font-bold text-[10px] text-center cursor-pointer transition-colors"
              >
                Actions
              </button>
            </div>

            {/* Search fields input */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search fields and folders..."
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[11px] focus:outline-none focus:border-[#0284C7]"
              />
            </div>

          </div>

          {/* ACCORDION SECTIONS (Standard Revora / GHL Specs) */}
          <div className="space-y-2">
            
            {/* 1. Contact Accordion */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
              <button
                onClick={() => toggleSection('contact')}
                className="w-full px-4 py-2.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between font-bold text-xs text-[#0B1F3A] cursor-pointer transition-colors"
              >
                <span>Contact</span>
                {expandedSections.contact ? <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />}
              </button>

              {expandedSections.contact && (
                <div className="p-4 pt-1 space-y-2.5 border-t border-[#F1F5F9] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">First name</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={currentContact.name.split(' ')[0] || ''}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold"
                      readOnly
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Last name</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={currentContact.name.split(' ').slice(1).join(' ') || ''}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold"
                      readOnly
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Email ✉️</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={currentContact.email}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Phone 📞</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={currentContact.phone}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono font-semibold"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Contact source</span>
                      <span className="text-[#0B1F3A] font-bold text-[11px]">AI Inbound / SMS</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Contact type</span>
                      <span className="text-[#0284C7] font-bold text-[11px]">Lead</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Realtor Info Accordion */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
              <button
                onClick={() => toggleSection('realtor')}
                className="w-full px-4 py-2.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between font-bold text-xs text-[#0B1F3A] cursor-pointer transition-colors"
              >
                <span>Realtor Info</span>
                {expandedSections.realtor ? <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />}
              </button>

              {expandedSections.realtor && (
                <div className="p-4 pt-1 space-y-2 border-t border-[#F1F5F9] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Brokerage</span>
                    <strong className="text-[#0B1F3A]">{currentContact.brokerage}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">TREC License #</span>
                    <span className="font-mono text-[#0284C7] font-bold">{currentContact.licenseNumber || 'TREC #0748291'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">Market Focus</span>
                    <span className="text-[#475569]">{currentContact.market}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Wholesaler Info Accordion */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
              <button
                onClick={() => toggleSection('wholesaler')}
                className="w-full px-4 py-2.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between font-bold text-xs text-[#0B1F3A] cursor-pointer transition-colors"
              >
                <span>Wholesaler Info</span>
                {expandedSections.wholesaler ? <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />}
              </button>

              {expandedSections.wholesaler && (
                <div className="p-4 pt-1 space-y-2 border-t border-[#F1F5F9] text-xs text-[#475569]">
                  <div>Target Rehab Spread: <strong>$25,000 - $60,000</strong></div>
                  <div>Preferred Closing Timeline: <strong>7-14 Days Cash</strong></div>
                  <div>Proof of Funds: <span className="text-emerald-700 font-bold">Verified on File</span></div>
                </div>
              )}
            </div>

            {/* 4. Contract Generation Defaults */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
              <button
                onClick={() => toggleSection('contract')}
                className="w-full px-4 py-2.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between font-bold text-xs text-[#0B1F3A] cursor-pointer transition-colors"
              >
                <span>Contract Generation</span>
                {expandedSections.contract ? <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />}
              </button>

              {expandedSections.contract && (
                <div className="p-4 pt-1 space-y-2 border-t border-[#F1F5F9] text-xs text-[#475569]">
                  <div>Buyer Entity: <strong>Momentum Capital Partners LLC</strong></div>
                  <div>Title Company: <strong>Republic Title DFW</strong></div>
                  <div>Standard Earnest Money: <strong>$2,500</strong></div>
                </div>
              )}
            </div>

            {/* 5. General & Additional Info */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
              <button
                onClick={() => toggleSection('general')}
                className="w-full px-4 py-2.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between font-bold text-xs text-[#0B1F3A] cursor-pointer transition-colors"
              >
                <span>General & Additional Info</span>
                {expandedSections.general ? <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />}
              </button>

              {expandedSections.general && (
                <div className="p-4 pt-1 space-y-2 border-t border-[#F1F5F9] text-xs text-[#475569]">
                  <div>Score: <strong className="text-[#0284C7]">Grade {currentContact.grade} ({currentContact.score}/100)</strong></div>
                  <div>Last Contacted: <strong className="font-mono">{currentContact.lastContacted}</strong></div>
                  <div>Cadence Stage: <strong>{currentContact.outreachStage}</strong></div>
                </div>
              )}
            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* COLUMN 2: CENTER LIVE CONVERSATIONS TAB & CHAT THREAD (5.5 / 12 COLS)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Center Tabs Navigation */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-1 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center">
              <button
                onClick={() => setCenterTab('conversations')}
                className={`py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  centerTab === 'conversations'
                    ? 'text-[#0284C7] bg-[#E0F2FE] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Conversations
              </button>

              <button
                onClick={() => setCenterTab('calls')}
                className={`py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  centerTab === 'calls'
                    ? 'text-[#0284C7] bg-[#E0F2FE] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" /> Calls ({callLogs.length})
              </button>

              <button
                onClick={() => setCenterTab('tasks')}
                className={`py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  centerTab === 'tasks'
                    ? 'text-[#0284C7] bg-[#E0F2FE] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Tasks ({linkedTasks.length})
              </button>
            </div>

            <button
              onClick={() => onOpenCallModal(currentContact)}
              className="p-2 text-[#64748B] hover:text-[#0284C7] rounded-xl hover:bg-[#F8FAFC] cursor-pointer"
              title="Call agent"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: LIVE CONVERSATIONS (Default) */}
          {centerTab === 'conversations' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[650px] overflow-hidden">
              
              {/* Voice AI / Calls Banner (As seen in GHL screenshot) */}
              <div className="bg-[#F0F9FF] border-b border-[#BAE6FD] p-3 flex items-center justify-between text-xs text-[#0369A1]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0284C7] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold block">Live Omnichannel AI Assistant Active</span>
                    <span className="text-[11px] text-[#0284C7]">Qualifying off-market properties 24/7</span>
                  </div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => onOpenCallModal(currentContact)}
                    className="px-2.5 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-[11px] rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    Voice AI →
                  </button>
                )}
              </div>

              {/* Chat Thread Header */}
              <div className="px-4 py-2.5 border-b border-[#F1F5F9] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-[#0B1F3A]">{currentContact.name}</span>
                  <span className="font-mono text-[10px] text-[#94A3B8]">{currentContact.phone}</span>
                </div>

                <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setMessageChannel('sms')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      messageChannel === 'sms' ? 'bg-white text-[#0284C7] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    onClick={() => setMessageChannel('email')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      messageChannel === 'email' ? 'bg-white text-[#0284C7] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              {/* Live Chat Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFDFE]">
                {linkedConv && linkedConv.messages.length > 0 ? (
                  linkedConv.messages.map((m) => {
                    const isRealtor = m.sender === 'realtor';
                    const isAi = m.sender === 'ai';

                    return (
                      <div key={m.id} className={`flex flex-col ${isRealtor ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-1.5 mb-1 text-[9px] text-[#94A3B8]">
                          <span className="font-bold">
                            {isRealtor ? currentContact.name : isAi ? 'Apex AI Bot' : 'Acquisitions Specialist'}
                          </span>
                          <span>&bull; {m.timestamp}</span>
                        </div>

                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                          isRealtor ? 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-tl-none' :
                          isAi ? 'bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] rounded-tr-none font-medium' :
                          'bg-[#0284C7] text-white rounded-tr-none font-medium'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#94A3B8] space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-xs text-[#0B1F3A]">Start a new conversation</p>
                    <p className="text-[11px]">Send an SMS or Email below to initiate dialogue.</p>
                  </div>
                )}
              </div>

              {/* Message Input Composer (GHL Bottom Bar) */}
              {!isReadOnly && (
                <form onSubmit={handleSendQuickMessage} className="p-3 border-t border-[#E2E8F0] bg-white space-y-2">
                  {messageChannel === 'email' && (
                    <input
                      type="text"
                      value={quickEmailSubject}
                      onChange={(e) => setQuickEmailSubject(e.target.value)}
                      placeholder="Subject Line (e.g. Off-Market Acquisition Criteria)"
                      className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageChannel === 'sms' ? quickSmsText : quickEmailText}
                      onChange={(e) => messageChannel === 'sms' ? setQuickSmsText(e.target.value) : setQuickEmailText(e.target.value)}
                      placeholder={`Type a message to ${currentContact.name}...`}
                      className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* TAB 2: CALL HISTORY */}
          {centerTab === 'calls' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 space-y-3 h-[650px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="font-extrabold text-xs text-[#0B1F3A]">Phone Interaction Log</h3>
                <button
                  onClick={() => onOpenCallModal(currentContact)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  + Dial Agent
                </button>
              </div>

              {callLogs.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold text-[#0B1F3A]">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {c.outcome}</span>
                    <span className="font-mono text-[10px] text-[#64748B]">{c.date}</span>
                  </div>
                  <p className="text-[#475569] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                    "{c.notes}"
                  </p>
                  <div className="text-[10px] text-[#64748B]">Recorded by: {c.caller} &bull; Duration: {c.duration}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TASKS & NOTES */}
          {centerTab === 'tasks' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 space-y-4 h-[650px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="font-extrabold text-xs text-[#0B1F3A] uppercase tracking-wider">Actionable Tasks ({linkedTasks.length})</h3>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-2.5 py-1 bg-[#0284C7] text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              </div>

              {linkedTasks.length === 0 ? (
                <div className="text-xs text-[#64748B] py-2">No pending tasks for this contact.</div>
              ) : (
                linkedTasks.map((t) => (
                  <div key={t.id} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0F172A]">{t.title}</div>
                      <div className="text-[10px] text-[#64748B]">{t.description} &bull; Due: {t.dueDate}</div>
                    </div>
                    {t.status === 'PENDING' && !isReadOnly && (
                      <button
                        onClick={() => completeTask(t.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ))
              )}

              {/* Notes */}
              <div className="space-y-2 pt-3 border-t border-[#F1F5F9]">
                <h3 className="font-extrabold text-xs text-[#0B1F3A] uppercase tracking-wider">Specialist Notes</h3>
                {!isReadOnly && (
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add conversation notes..."
                      className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-[#0284C7] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
                      Save Note
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {currentContact.notes?.map((n, idx) => (
                    <div key={idx} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A]">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>


        {/* ========================================================================= */}
        {/* COLUMN 3: RIGHT INTERACTIVE ASSOCIATIONS & TOOL PANEL (3.5 / 12 COLS)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* Main Associations Widget Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            
            {/* Header with Title & Action */}
            <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {rightTab === 'associations' && <Layers className="w-4 h-4 text-[#0284C7]" />}
                {rightTab === 'history' && <History className="w-4 h-4 text-[#0284C7]" />}
                {rightTab === 'settings' && <Wrench className="w-4 h-4 text-[#0284C7]" />}
                {rightTab === 'tasks' && <CheckSquare className="w-4 h-4 text-[#0284C7]" />}
                {rightTab === 'calendar' && <Calendar className="w-4 h-4 text-[#0284C7]" />}
                {rightTab === 'contracts' && <FileText className="w-4 h-4 text-[#0284C7]" />}
                <h3 className="font-extrabold text-xs text-[#0B1F3A] capitalize">
                  {rightTab === 'associations' ? 'Associations' :
                   rightTab === 'history' ? 'Activity History' :
                   rightTab === 'settings' ? 'Contact Settings' :
                   rightTab === 'tasks' ? 'Tasks & Reminders' :
                   rightTab === 'calendar' ? 'Follow-Up Schedule' :
                   'Contracts & Files'}
                </h3>
              </div>

              <div className="flex items-center gap-1 text-[#64748B]">
                {rightTab === 'associations' && (
                  <button
                    onClick={() => setShowAddDealModal(true)}
                    className="text-[11px] text-[#0284C7] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
                {rightTab === 'tasks' && (
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="text-[11px] text-[#0284C7] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Task
                  </button>
                )}
              </div>
            </div>

            {/* QUICK GHL TOOL ICONS STRIP (100% CLICKABLE & INTERACTIVE) */}
            <div className="px-2.5 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] grid grid-cols-7 gap-1 items-center">
              
              {/* 1. History Icon */}
              <button
                onClick={() => setRightTab('history')}
                title="Activity History & Logs"
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  rightTab === 'history'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
              </button>

              {/* 2. Associations Icon */}
              <button
                onClick={() => setRightTab('associations')}
                title="Associations (Companies & Deals)"
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  rightTab === 'associations'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              {/* 3. Settings Icon */}
              <button
                onClick={() => setRightTab('settings')}
                title="Preferences & Settings"
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  rightTab === 'settings'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
              </button>

              {/* 4. Edit Fields Icon */}
              <button
                onClick={() => {
                  setEditName(currentContact.name);
                  setEditEmail(currentContact.email);
                  setEditPhone(currentContact.phone);
                  setEditBrokerage(currentContact.brokerage);
                  setEditLicense(currentContact.licenseNumber || '');
                  setEditMarket(currentContact.market);
                  setEditTemperature(currentContact.temperature);
                  setShowEditContactModal(true);
                }}
                title="Edit Contact Fields"
                className="p-1.5 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE] transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* 5. Tasks Icon */}
              <button
                onClick={() => setRightTab('tasks')}
                title="Actionable Tasks"
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  rightTab === 'tasks'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>

              {/* 6. Calendar Icon */}
              <button
                onClick={() => setRightTab('calendar')}
                title="Calendar & Follow-Up Schedule"
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  rightTab === 'calendar'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>

              {/* 7. Contracts / Files Icon */}
              <button
                onClick={() => setRightTab('contracts')}
                title="Documents & Contracts"
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  rightTab === 'contracts'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
              </button>

            </div>

            {/* TAB CONTENT PANELS */}
            <div className="p-3">
              
              {/* ============================================================= */}
              {/* VIEW 1: ASSOCIATIONS (Default)                               */}
              {/* ============================================================= */}
              {rightTab === 'associations' && (
                <div className="space-y-4">
                  {/* Companies Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => setCompaniesExpanded(!companiesExpanded)}
                        className="font-extrabold text-[#0B1F3A] flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Companies ({currentContact.brokerage ? 1 : 0})</span>
                        {companiesExpanded ? <ChevronUp className="w-3 h-3 text-[#94A3B8]" /> : <ChevronDown className="w-3 h-3 text-[#94A3B8]" />}
                      </button>

                      <button
                        onClick={() => setShowAddCompanyModal(true)}
                        className="text-[#0284C7] font-bold text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {companiesExpanded && (
                      <div>
                        {currentContact.brokerage ? (
                          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 hover:border-[#BAE6FD] transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-[#0284C7]" />
                                {currentContact.brokerage}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                            </div>
                            <div className="text-[11px] text-[#64748B] pl-4">{currentContact.market || 'Dallas Metro'}</div>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] space-y-1">
                            <span className="text-[11px] text-[#64748B] block">No Company created</span>
                            <button
                              onClick={() => setShowAddCompanyModal(true)}
                              className="text-xs text-[#0284C7] font-bold hover:underline cursor-pointer"
                            >
                              Create new
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Deals in Pipeline Section */}
                  <div className="space-y-2 pt-3 border-t border-[#F1F5F9]">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => setDealsExpanded(!dealsExpanded)}
                        className="font-extrabold text-[#0B1F3A] flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Deals ({linkedDeals.length})</span>
                        {dealsExpanded ? <ChevronUp className="w-3 h-3 text-[#94A3B8]" /> : <ChevronDown className="w-3 h-3 text-[#94A3B8]" />}
                      </button>

                      <button
                        onClick={() => setShowAddDealModal(true)}
                        className="text-[#0284C7] font-bold text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {dealsExpanded && (
                      <div className="space-y-2">
                        {linkedDeals.length === 0 ? (
                          <div className="text-center py-5 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] space-y-1.5">
                            <Home className="w-5 h-5 text-[#94A3B8] mx-auto" />
                            <span className="text-[11px] text-[#64748B] block">No associated deals in pipeline</span>
                            <button
                              onClick={() => setShowAddDealModal(true)}
                              className="px-3 py-1 bg-[#0284C7] text-white font-bold text-[11px] rounded-lg shadow-2xs hover:bg-[#0369A1] cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Link New Deal
                            </button>
                          </div>
                        ) : (
                          linkedDeals.map((deal) => (
                            <div
                              key={deal.id}
                              onClick={() => onSelectDeal && onSelectDeal(deal)}
                              className="p-3 bg-[#F8FAFC] hover:bg-[#F0F9FF] rounded-xl border border-[#E2E8F0] hover:border-[#0284C7] transition-all cursor-pointer shadow-2xs space-y-1.5 group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="font-bold text-xs text-[#0B1F3A] group-hover:text-[#0284C7] transition-colors leading-tight">
                                  {deal.address}
                                </div>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shrink-0">
                                  {deal.stage}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#64748B]">Asking Price:</span>
                                <span className="font-black text-[#0B1F3A]">${deal.askingPrice.toLocaleString()}</span>
                              </div>

                              {deal.underwriting?.arv && (
                                <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                                  <span>ARV: <strong>${deal.underwriting.arv.toLocaleString()}</strong></span>
                                  <span className="text-[#0284C7] font-bold group-hover:underline flex items-center">
                                    Open Deal →
                                  </span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VIEW 2: ACTIVITY HISTORY                                      */}
              {/* ============================================================= */}
              {rightTab === 'history' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-[#64748B]">
                    Full audit trail & telemetry recorded for {currentContact.name}.
                  </div>

                  <div className="space-y-2.5">
                    {activityHistory.map((act) => {
                      const IconComponent = act.icon;
                      return (
                        <div key={act.id} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center ${act.color}`}>
                                <IconComponent className="w-3 h-3" />
                              </span>
                              {act.title}
                            </span>
                            <span className="text-[9px] font-mono text-[#94A3B8]">{act.time}</span>
                          </div>
                          <p className="text-[11px] text-[#475569] pl-6 leading-tight">{act.desc}</p>
                          <div className="text-[9px] text-[#94A3B8] pl-6 font-semibold">Actor: {act.actor}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VIEW 3: SETTINGS & PREFERENCES                                */}
              {/* ============================================================= */}
              {rightTab === 'settings' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                    <span className="font-bold text-[#0B1F3A] block">Communication Channels</span>
                    <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#0284C7]" /> SMS Automation Allowed
                    </label>
                    <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#0284C7]" /> Email Broadcasts Allowed
                    </label>
                    <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dndActive}
                        onChange={(e) => setDndActive(e.target.checked)}
                        className="rounded text-rose-600"
                      /> <span className={dndActive ? 'text-rose-600 font-bold' : ''}>Do Not Disturb (DND Active)</span>
                    </label>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                    <span className="font-bold text-[#0B1F3A] block">Assigned Specialist</span>
                    <select
                      value={currentContact.ownerId || currentUser.id}
                      onChange={(e) => {
                        const u = users.find(usr => usr.id === e.target.value);
                        if (u) updateContact(currentContact.id, { ownerId: u.id, ownerName: u.name });
                      }}
                      className="w-full p-2 bg-white border border-[#CBD5E1] rounded-lg font-bold text-xs"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VIEW 4: TASKS                                                 */}
              {/* ============================================================= */}
              {rightTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B1F3A]">Pending Tasks ({linkedTasks.length})</span>
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="px-2 py-0.5 bg-[#0284C7] text-white font-bold text-[10px] rounded-md shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Task
                    </button>
                  </div>

                  {linkedTasks.length === 0 ? (
                    <div className="text-center py-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] text-[#64748B] text-xs">
                      No pending tasks for this contact.
                    </div>
                  ) : (
                    linkedTasks.map(t => (
                      <div key={t.id} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1 text-xs">
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-[#0B1F3A]">{t.title}</span>
                          {t.status === 'PENDING' && (
                            <button
                              onClick={() => completeTask(t.id)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded"
                            >
                              ✓ Done
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-[#64748B]">{t.description}</div>
                        <div className="text-[9px] font-mono text-[#0284C7] font-semibold">Due: {t.dueDate}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* VIEW 5: CALENDAR & FOLLOW-UP SCHEDULE                         */}
              {/* ============================================================= */}
              {rightTab === 'calendar' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl text-[#0369A1] space-y-1">
                    <span className="font-bold block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Next Scheduled Cadence Touch
                    </span>
                    <span className="text-[11px]">Automated follow-up planned for Tomorrow at 10:00 AM CST</span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                    <span className="font-bold text-[#0B1F3A] block">Schedule Quick Meeting / Call</span>
                    <input
                      type="date"
                      defaultValue="2026-09-17"
                      className="w-full p-2 bg-white border border-[#CBD5E1] rounded-lg text-xs"
                    />
                    <button
                      onClick={() => {
                        addTask({
                          title: `Scheduled Call with ${currentContact.name}`,
                          description: 'Follow-up meeting scheduled from Calendar tab.',
                          dueDate: 'Tomorrow, 10:00 AM',
                          priority: 'HIGH',
                          status: 'PENDING',
                          assignedTo: currentContact.ownerName || currentUser.name,
                          relatedContactId: currentContact.id,
                          relatedContactName: currentContact.name
                        });
                        alert(`Call appointment scheduled with ${currentContact.name}!`);
                      }}
                      className="w-full py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-lg shadow-2xs cursor-pointer"
                    >
                      Book Call Reminder
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VIEW 6: CONTRACTS & DOCUMENTS ARCHIVE                         */}
              {/* ============================================================= */}
              {rightTab === 'contracts' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1F3A]">Generated Contracts</span>
                    <span className="text-[10px] text-[#64748B]">TREC Standard</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0B1F3A] flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#0284C7]" /> TREC_1-4_Contract_Bordeaux.pdf
                        </span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Ready</span>
                      </div>
                      <div className="text-[10px] text-[#64748B]">Purchase Price: $1,450,000 &bull; Generated by Marcus Sterling</div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => alert('Downloading contract PDF...')}
                          className="px-2 py-0.5 text-[#0284C7] font-bold text-[10px] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ADD PROPERTY DEAL MODAL (Linked to Contact)                              */}
      {/* ========================================================================= */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                  <Home className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0B1F3A]">
                  Associate New Deal with {currentContact.name}
                </h3>
              </div>
              <button onClick={() => setShowAddDealModal(false)} className="text-[#94A3B8] hover:text-[#0B1F3A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContactDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">
                  Property Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4812 Bordeaux Ave, Dallas, TX 75205"
                  value={newDealAddress}
                  onChange={(e) => setNewDealAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Asking Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newDealPrice}
                    onChange={(e) => setNewDealPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">Pipeline Stage</label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as DealStage)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="New">Active / New</option>
                    <option value="Reviewing">Reviewing / Qualifying</option>
                    <option value="Offer">Offer Made</option>
                    <option value="Negotiation">Pending Negotiation</option>
                    <option value="Contract">Under Contract</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="px-4 py-2 bg-[#F1F5F9] text-[#475569] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create & Associate Deal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADD COMPANY MODAL */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-sm text-[#0B1F3A]">Link Company / Brokerage</h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-[#94A3B8] hover:text-[#0B1F3A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Company / Brokerage Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compass Real Estate DFW"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 bg-[#F1F5F9] text-[#475569] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CONTACT MODAL */}
      {showEditContactModal && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-sm text-[#0B1F3A]">Edit Contact Information</h3>
              <button onClick={() => setShowEditContactModal(false)} className="text-[#94A3B8] hover:text-[#0B1F3A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContactEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Brokerage</label>
                  <input
                    type="text"
                    value={editBrokerage}
                    onChange={(e) => setEditBrokerage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">TREC License #</label>
                  <input
                    type="text"
                    value={editLicense}
                    onChange={(e) => setEditLicense(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Market Focus</label>
                  <input
                    type="text"
                    value={editMarket}
                    onChange={(e) => setEditMarket(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Temperature</label>
                  <select
                    value={editTemperature}
                    onChange={(e) => setEditTemperature(e.target.value as ContactTemperature)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">⚡ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditContactModal(false)}
                  className="px-4 py-2 bg-[#F1F5F9] text-[#475569] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-sm text-[#0B1F3A]">Create Task for {currentContact.name}</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-[#94A3B8] hover:text-[#0B1F3A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Task Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up on rehab estimate"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 5:00 PM"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional context..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 bg-[#F1F5F9] text-[#475569] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
