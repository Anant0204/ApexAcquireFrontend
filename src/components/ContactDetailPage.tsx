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
  Check
} from 'lucide-react';

interface ContactDetailPageProps {
  contact: RealtorContact;
  onBack: () => void;
  onOpenCallModal: (contact: RealtorContact) => void;
  onNavigateToConversation?: (convId: string) => void;
  onSelectDeal?: (deal: any) => void;
}

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
    logAuditAction 
  } = useApp();

  // Current contact live object
  const currentContact = contacts.find(c => c.id === contact.id) || contact;

  const [activeTab, setActiveTab] = useState<'communication' | 'deals' | 'cadence' | 'calls' | 'notes_tasks'>('communication');
  const [quickSmsText, setQuickSmsText] = useState('');
  const [quickEmailSubject, setQuickEmailSubject] = useState('');
  const [quickEmailText, setQuickEmailText] = useState('');
  const [messageChannel, setMessageChannel] = useState<'sms' | 'email'>('sms');
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [newDealAddress, setNewDealAddress] = useState('');
  const [newDealPrice, setNewDealPrice] = useState<number>(450000);
  const [newDealStage, setNewDealStage] = useState<DealStage>('New Property');

  const isReadOnly = currentUser.role === 'READ_ONLY';

  // Find linked conversation
  const linkedConv = conversations.find(c => c.contactId === currentContact.id);

  // Find linked deals
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

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageChannel === 'sms') {
      if (!quickSmsText.trim()) return;
      if (linkedConv) {
        sendMessage(linkedConv.id, quickSmsText);
      }
      logAuditAction(`Sent SMS to ${currentContact.name}: "${quickSmsText}"`, `Contact #${currentContact.id}`);
      setQuickSmsText('');
    } else {
      if (!quickEmailText.trim()) return;
      logAuditAction(`Sent Email to ${currentContact.name} ("${quickEmailSubject}")`, `Contact #${currentContact.id}`);
      setQuickEmailSubject('');
      setQuickEmailText('');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const existing = currentContact.notes || [];
    updateContact(currentContact.id, {
      notes: [newNoteText, ...existing]
    });
    setNewNoteText('');
    logAuditAction(`Added note to ${currentContact.name}`, `Contact #${currentContact.id}`);
  };

  const handleCreateContactDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealAddress.trim()) return;

    addDeal({
      address: newDealAddress,
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
      source: 'Contact Profile Deal Generator'
    });

    setShowAddDealModal(false);
    setNewDealAddress('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      
      {/* TOP NAVIGATION BACK BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#BFDBFE] text-[#0F172A] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#155EEF]" /> Back to Directory
        </button>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={() => onOpenCallModal(currentContact)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Call Realtor (Pauses AI)
            </button>
          )}

          {linkedConv && onNavigateToConversation && (
            <button
              onClick={() => onNavigateToConversation(linkedConv.id)}
              className="px-4 py-2 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Open Full Chat Thread
            </button>
          )}
        </div>
      </div>

      {/* HERO CONTACT PROFILE BANNER */}
      <div className="executive-panel rounded-3xl p-6 bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        {/* Ambient Luxury Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-[#155EEF]/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar + Main Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B1533] to-[#1E40AF] text-white border border-[#60A5FA]/30 font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0">
              {currentContact.name.substring(0, 2)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-[#0B1F3A] tracking-tight">
                  {currentContact.name}
                </h1>

                {/* Temperature Custom Field Dropdown */}
                <select
                  value={currentContact.temperature}
                  disabled={isReadOnly}
                  onChange={(e) => updateContactTemperature(currentContact.id, e.target.value as ContactTemperature)}
                  className={`text-xs font-extrabold px-3 py-1 rounded-xl border cursor-pointer focus:outline-none shadow-xs transition-all ${
                    currentContact.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                    currentContact.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    'bg-blue-50 text-blue-700 border-blue-300'
                  }`}
                >
                  <option value="Hot">🔥 Hot Lead</option>
                  <option value="Warm">⚡ Warm Lead</option>
                  <option value="Cold">❄️ Cold Lead</option>
                </select>

                {/* Outreach Stage Selector */}
                <select
                  value={currentContact.outreachStage}
                  disabled={isReadOnly}
                  onChange={(e) => updateContactStage(currentContact.id, e.target.value as OutreachStage)}
                  className="text-xs font-bold px-3 py-1 bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] rounded-xl cursor-pointer focus:outline-none shadow-2xs"
                >
                  <option value="Queued for Outreach">Queued for Outreach</option>
                  <option value="Outreach Sent">Outreach Sent (5-Touch)</option>
                  <option value="Responded/Qualifying">Responded/Qualifying</option>
                  <option value="Needs Human Touch">Needs Human Touch</option>
                  <option value="Lead Created">Lead Created</option>
                  <option value="No Response, In 30-Day Nurture">No Response, In 30-Day Nurture</option>
                  <option value="Not Interested - CLOSED">Not Interested - CLOSED</option>
                  <option value="Wrong Number / Not an Agent - CLOSED">Wrong Number / Not an Agent - CLOSED</option>
                  <option value="Opted Out / DND - CLOSED">Opted Out / DND - CLOSED</option>
                  <option value="SMS Error - CLOSED">SMS Error - CLOSED</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569]">
                <span className="font-semibold text-[#0F172A]">{currentContact.brokerage}</span>
                <span>&bull;</span>
                <span className="font-mono text-[#64748B]">{currentContact.licenseNumber}</span>
                <span>&bull;</span>
                <span>{currentContact.market}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Owner */}
          <div className="flex flex-wrap items-center gap-4 text-xs border-t lg:border-t-0 lg:border-l border-[#E2E8F0] pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Assigned Specialist</span>
              <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-[#155EEF]" /> {currentContact.ownerName}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Qualification Score</span>
              <span className="font-extrabold font-mono text-[#155EEF] text-base mt-0.5 block">
                Grade {currentContact.grade} ({currentContact.score}/100)
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Associated Deals</span>
              <span className="font-extrabold font-mono text-emerald-700 text-base mt-0.5 block">
                {linkedDeals.length} Deal(s)
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTACT DETAILS & METADATA (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Contact Details Card */}
          <div className="executive-panel rounded-2xl p-5 bg-white border border-[#E2E8F0] shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Contact Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#155EEF]" /> Email Address:
                </span>
                <strong className="text-[#0F172A]">{currentContact.email}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#155EEF]" /> Phone Number:
                </span>
                <strong className="text-[#0F172A] font-mono">{currentContact.phone}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Market Region:</span>
                <strong className="text-[#0F172A]">{currentContact.market}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">TREC License:</span>
                <strong className="text-[#0F172A] font-mono">{currentContact.licenseNumber}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Last Contacted:</span>
                <span className="text-[#475569] font-mono">{currentContact.lastContacted}</span>
              </div>
            </div>
          </div>

          {/* Cadence Lifecycle Telemetry Card */}
          <div className="executive-panel rounded-2xl p-5 bg-white border border-[#E2E8F0] shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 flex items-center justify-between">
              <span>Cadence & Nurture Lifecycle</span>
              <span className="text-[10px] font-mono text-[#155EEF]">5-Touch Engine</span>
            </h3>

            {currentContact.outreachStage === 'Outreach Sent' && (
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-[#0F172A]">
                  <span>5-Touch Sequence Running:</span>
                  <span className="text-[#155EEF]">Touch {currentContact.sequenceInfo.currentTouch}/5</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden flex">
                  {[1, 2, 3, 4, 5].map((t) => (
                    <div
                      key={t}
                      className={`flex-1 border-r border-white ${
                        t <= currentContact.sequenceInfo.currentTouch ? 'bg-[#155EEF]' : 'bg-[#E2E8F0]'
                      }`}
                    />
                  ))}
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => advanceContactSequence(currentContact.id)}
                    className="w-full mt-2 py-2 bg-[#EAF2FF] hover:bg-[#DBEAFE] text-[#155EEF] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Dispatch Next Touch ({currentContact.sequenceInfo.currentTouch + 1}/5)
                  </button>
                )}
              </div>
            )}

            {currentContact.outreachStage === 'No Response, In 30-Day Nurture' && (
              <div className="space-y-2.5">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>30-Day Nurture Loop Active</span>
                    <span className="font-mono">Day {currentContact.sequenceInfo.nurtureDay || 18}/30</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Recycled <strong>{currentContact.sequenceInfo.recycleCount || 0} times</strong> previously. When 30 days elapse, contact automatically lands back in <em>Queued for Outreach</em>.
                  </p>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={() => recycleContactToQueued(currentContact.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-xl shadow-xs transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Recycle Contact to Queued Now
                  </button>
                )}
              </div>
            )}

            {currentContact.outreachStage === 'Needs Human Touch' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 text-amber-600" /> Bot Paused — Human Touch
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Automated SMS is paused. Please place a phone call or reply manually.
                </p>
              </div>
            )}

            {currentContact.outreachStage === 'Lead Created' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Lead Captured
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Property opportunity captured and cloned into AI Deals pipeline.
                </p>
              </div>
            )}

            {currentContact.outreachStage === 'Queued for Outreach' && (
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-[#64748B]">
                Contact is enrolled in queue and ready for Batch Touch 1 launch.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: TABS & DEEP WORKSPACE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SUB-TABS NAVIGATION */}
          <div className="flex border-b border-[#E2E8F0] space-x-6 overflow-x-auto bg-white p-2 rounded-2xl shadow-2xs">
            <button
              onClick={() => setActiveTab('communication')}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'communication' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> SMS & Email Dialogs
            </button>

            <button
              onClick={() => setActiveTab('deals')}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'deals' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Associated Deals ({linkedDeals.length})
            </button>

            <button
              onClick={() => setActiveTab('calls')}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'calls' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call History ({callLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('notes_tasks')}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'notes_tasks' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Notes & Tasks ({linkedTasks.length + (currentContact.notes?.length || 0)})
            </button>
          </div>

          {/* TAB 1: COMMUNICATION & EMAIL/SMS HISTORY */}
          {activeTab === 'communication' && (
            <div className="executive-panel rounded-2xl p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
                    Omnichannel Message Feed
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Full chronological history of all SMS and Email touches.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl">
                  <button
                    onClick={() => setMessageChannel('sms')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      messageChannel === 'sms' ? 'bg-white text-[#155EEF] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    onClick={() => setMessageChannel('email')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      messageChannel === 'email' ? 'bg-white text-[#155EEF] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 p-2 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                {linkedConv && linkedConv.messages.length > 0 ? (
                  linkedConv.messages.map((m) => {
                    const isRealtor = m.sender === 'realtor';
                    const isAi = m.sender === 'ai';

                    return (
                      <div key={m.id} className={`flex flex-col ${isRealtor ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-1.5 mb-1 text-[9px] text-[#64748B]">
                          <span className="font-bold">
                            {isRealtor ? currentContact.name : isAi ? 'Apex AI Bot' : 'Acquisition Specialist'}
                          </span>
                          <span>&bull; {m.timestamp}</span>
                        </div>

                        <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isRealtor ? 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-tl-none shadow-xs' :
                          isAi ? 'bg-[#EAF2FF] border border-[#BFDBFE] text-[#0B1F3A] rounded-tr-none font-medium shadow-xs' :
                          'bg-[#155EEF] text-white rounded-tr-none font-medium shadow-xs'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-[#64748B]">
                    No conversation history recorded yet. Use the composer below to dispatch a message.
                  </div>
                )}
              </div>

              {/* Live Direct Composer */}
              {!isReadOnly && (
                <form onSubmit={handleSendQuickMessage} className="space-y-3 pt-2">
                  {messageChannel === 'email' && (
                    <input
                      type="text"
                      value={quickEmailSubject}
                      onChange={(e) => setQuickEmailSubject(e.target.value)}
                      placeholder="Email Subject Line (e.g. Off-Market Acquisition Criteria — Apex Capital)"
                      className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                    />
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageChannel === 'sms' ? quickSmsText : quickEmailText}
                      onChange={(e) => messageChannel === 'sms' ? setQuickSmsText(e.target.value) : setQuickEmailText(e.target.value)}
                      placeholder={`Type direct ${messageChannel.toUpperCase()} to ${currentContact.name}...`}
                      className="flex-1 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send {messageChannel.toUpperCase()}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* TAB 2: ASSOCIATED PROPERTY DEALS (MULTI-DEAL PER CONTACT) */}
          {activeTab === 'deals' && (
            <div className="executive-panel rounded-2xl p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
                    Associated Property Deals ({linkedDeals.length})
                  </h3>
                  <p className="text-[11px] text-[#64748B]">All properties submitted by or linked to this realtor.</p>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={() => setShowAddDealModal(true)}
                    className="px-3.5 py-1.5 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Property Deal
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {linkedDeals.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1]">
                    No properties linked to this realtor yet. Click "Add Property Deal" above.
                  </div>
                ) : (
                  linkedDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => onSelectDeal && onSelectDeal(deal)}
                      className="p-4 bg-[#F8FAFC] hover:bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#155EEF] transition-all cursor-pointer shadow-2xs space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-[#155EEF]" />
                          <span className="font-bold text-xs text-[#0F172A] group-hover:text-[#155EEF] transition-colors">
                            {deal.address}
                          </span>
                        </div>
                        
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]">
                          {deal.stage}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-[#475569] pt-1 border-t border-[#E2E8F0]">
                        <div>
                          <span className="text-[10px] text-[#64748B] block uppercase">Asking Price</span>
                          <strong className="font-mono text-emerald-700">${deal.askingPrice.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] block uppercase">Calculated MAO</span>
                          <strong className="font-mono text-[#155EEF]">
                            ${deal.underwriting?.calculatedMao ? deal.underwriting.calculatedMao.toLocaleString() : 'Pending'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] block uppercase">Specs</span>
                          <span>{deal.beds}b / {deal.baths}b &bull; {deal.sqft.toLocaleString()} sqft</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CALL LOGS & PHONE HISTORY */}
          {activeTab === 'calls' && (
            <div className="executive-panel rounded-2xl p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
                    Phone Interaction History
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Recorded phone calls, durations, and specialist notes.</p>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={() => onOpenCallModal(currentContact)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Dial Realtor
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {callLogs.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {c.outcome}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">{c.date} &bull; Duration: {c.duration}</span>
                    </div>
                    <p className="text-[#475569] bg-white p-3 rounded-xl border border-[#E2E8F0]">
                      "{c.notes}"
                    </p>
                    <div className="text-[10px] text-[#64748B]">Caller: {c.caller}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NOTES & ACTIONABLE TASKS */}
          {activeTab === 'notes_tasks' && (
            <div className="executive-panel rounded-2xl p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-6">
              
              {/* Linked Tasks */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                  Actionable Operational Tasks ({linkedTasks.length})
                </h3>

                {linkedTasks.length === 0 ? (
                  <div className="text-xs text-[#64748B] py-2">No pending tasks for this contact.</div>
                ) : (
                  linkedTasks.map((t) => (
                    <div key={t.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
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
              </div>

              {/* Agent Notes */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                  Specialist Notes ({currentContact.notes?.length || 0})
                </h3>

                {!isReadOnly && (
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add specific notes about seller motivation, pocket listings, or conversation details..."
                      className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Save Note
                    </button>
                  </form>
                )}

                <div className="space-y-2 pt-2">
                  {currentContact.notes?.map((n, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A]">
                      {n}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* CREATE DEAL FOR THIS CONTACT MODAL */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 bg-white shadow-2xl border border-[#E2E8F0]">
            <button onClick={() => setShowAddDealModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              ×
            </button>

            <h3 className="text-lg font-bold text-[#0B1F3A]">Add Property Deal for {currentContact.name}</h3>

            <form onSubmit={handleCreateContactDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Property Address</label>
                <input
                  type="text"
                  required
                  value={newDealAddress}
                  onChange={(e) => setNewDealAddress(e.target.value)}
                  placeholder="e.g. 5204 Preston Rd"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
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
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">Pipeline Stage</label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as DealStage)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="New Property">New Property</option>
                    <option value="Qualifying">Qualifying</option>
                    <option value="Offer Made">Offer Made</option>
                    <option value="Offer Accepted">Offer Accepted</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-all shadow-md cursor-pointer"
              >
                Create & Link Deal to Realtor
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
