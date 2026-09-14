import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Conversation, Grade, ContactTemperature } from '../types/crm';
import {
  Bot,
  User,
  Send,
  Building,
  Flame,
  Search,
  X,
  ArrowLeft,
  Info,
  MessageSquare,
  Sliders,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface ConversationsPageProps {
  onOpenCallModal?: (contact: any) => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({ onOpenCallModal }) => {
  const {
    conversations,
    contacts,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    toggleAiTakeover,
    overrideGrade,
    updateConversationTemperature,
    cloneLeadToDeals,
    updateContactStage,
    currentUser,
    claimLead
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [clonedSuccessToast, setClonedSuccessToast] = useState<string | null>(null);

  // Mobile View Switcher State ('list' | 'chat' | 'details')
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('chat');

  // Grade Override Modal state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideGradeVal, setOverrideGradeVal] = useState<Grade>('A');
  const [overrideScoreVal, setOverrideScoreVal] = useState<number>(92);
  const [overrideReason, setOverrideReason] = useState('');

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const matchingContact = contacts.find(c => c.id === activeConv?.contactId);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.realtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brokerage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.latestMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' ? true :
      filterCategory === 'Needs Human' ? c.status === 'Needs Human' || c.outreachStage === 'Needs Human Touch' :
      filterCategory === 'Leads With Address' ? c.status === 'Leads With Address' || c.outreachStage === 'Lead Created' :
      filterCategory === 'Wants Call' ? c.status === 'Wants Call' : true;

    const matchesTemp = temperatureFilter === 'ALL' || c.temperature === temperatureFilter;

    return matchesSearch && matchesCategory && matchesTemp;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;
    sendMessage(activeConv.id, messageInput);
    setMessageInput('');
  };

  const handleGradeOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !overrideReason.trim()) return;
    overrideGrade(activeConv.id, overrideGradeVal, overrideScoreVal, overrideReason);
    setShowOverrideModal(false);
    setOverrideReason('');
  };

  const handleCloneLead = () => {
    if (!activeConv) return;
    cloneLeadToDeals(activeConv.id);
    setClonedSuccessToast(`Property ${activeConv.propertyCaptured?.address || 'Lead'} successfully cloned into AI Deals!`);
    setTimeout(() => setClonedSuccessToast(null), 4000);
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col max-w-full mx-auto space-y-4">
      
      {/* CLONED TOAST */}
      {clonedSuccessToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#0B1533] border border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{clonedSuccessToast}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase">
              Omnichannel Inbox
            </span>
            <span className="text-xs text-[#64748B]">&bull; AI Bot Dialogs &bull; Auto-Grading (Hot / Warm / Cold)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1F3A] flex flex-wrap items-center gap-2">
            <span>Conversations Workspace</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] shrink-0">
              {conversations.length} Active Dialogs
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {matchingContact && onOpenCallModal && !isReadOnly && (
            <button
              onClick={() => onOpenCallModal(matchingContact)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Realtor (Pause AI)
            </button>
          )}

          {activeConv && activeConv.status === 'Needs Human' && !isReadOnly && (
            <button
              onClick={() => claimLead(activeConv.id)}
              className="px-4 py-2 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Flame className="w-4 h-4" /> Claim & Take Over
            </button>
          )}
        </div>
      </div>

      {/* WORKSPACE MAIN 3-COLUMN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        
        {/* COLUMN 1: CONVERSATION LIST (4 COLS) */}
        <div className={`lg:col-span-4 executive-panel rounded-2xl flex flex-col overflow-hidden ${
          mobileView === 'list' ? 'flex h-full' : 'hidden lg:flex'
        }`}>
          
          {/* List Search & Filters */}
          <div className="p-3 border-b border-[#E2E8F0] space-y-2 bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search realtor or dialog..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {(['ALL', 'Needs Human', 'Leads With Address', 'Wants Call'] as string[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    filterCategory === cat ? 'bg-[#155EEF] text-white' : 'bg-white text-[#475569] hover:bg-[#EAF2FF] border border-[#E2E8F0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setMobileView('chat');
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-[#EAF2FF] border-l-4 border-[#155EEF]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1.5">
                      {conv.realtorName}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">{conv.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-[#475569] line-clamp-2 mb-2 font-light">
                    {conv.latestMessage}
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {conv.temperature && (
                        <span className={`px-1.5 py-0.2 rounded font-extrabold ${
                          conv.temperature === 'Hot' ? 'bg-rose-100 text-rose-700' :
                          conv.temperature === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {conv.temperature === 'Hot' ? '🔥 Hot' : conv.temperature === 'Warm' ? '⚡ Warm' : '❄️ Cold'}
                        </span>
                      )}

                      <span className="px-1.5 py-0.2 rounded font-bold uppercase bg-[#EAF2FF] text-[#155EEF]">
                        Grade {conv.grade} ({conv.score})
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[9px] ${
                      conv.aiStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      conv.aiStatus === 'Human Takeover' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {conv.aiStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* COLUMN 2: THREAD & COMPOSER (5 COLS) */}
        <div className={`lg:col-span-5 executive-panel rounded-2xl flex flex-col overflow-hidden ${
          mobileView === 'chat' ? 'flex h-full' : 'hidden lg:flex'
        }`}>
          
          {/* Thread Header */}
          {activeConv && (
            <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>
                  <div className="text-xs font-bold text-[#0B1F3A] leading-tight flex items-center gap-1.5">
                    {activeConv.realtorName}
                    <span className="text-[10px] text-[#64748B] font-normal">({activeConv.brokerage})</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono">{activeConv.realtorPhone}</div>
                </div>
              </div>

              {/* AI Controls */}
              <div className="flex items-center gap-1.5">
                {!isReadOnly && (
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0]">
                    <button
                      onClick={() => toggleAiTakeover(activeConv.id, 'Active')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeConv.aiStatus === 'Active' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      AI Active
                    </button>
                    <button
                      onClick={() => toggleAiTakeover(activeConv.id, 'Human Takeover')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeConv.aiStatus === 'Human Takeover' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Human
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            {activeConv?.messages.map((m) => {
              const isRealtor = m.sender === 'realtor';
              const isAi = m.sender === 'ai';

              return (
                <div key={m.id} className={`flex flex-col ${isRealtor ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-1.5 mb-1 text-[9px] text-[#64748B]">
                    {isAi && <Bot className="w-3 h-3 text-[#155EEF]" />}
                    {!isRealtor && !isAi && <User className="w-3 h-3 text-[#0B1F3A]" />}
                    <span className="font-bold">
                      {isRealtor ? activeConv.realtorName : isAi ? 'Apex AI Bot' : 'Human Specialist'}
                    </span>
                    <span>&bull; {m.timestamp}</span>
                  </div>

                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isRealtor ? 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-tl-none shadow-xs' :
                    isAi ? 'bg-[#EAF2FF] border border-[#BFDBFE] text-[#0B1F3A] rounded-tr-none shadow-xs font-medium' :
                    'bg-[#155EEF] text-white rounded-tr-none font-medium shadow-xs'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Composer */}
          <div className="p-3 border-t border-[#E2E8F0] bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                disabled={isReadOnly}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={isReadOnly ? 'Read-only role cannot send messages' : 'Type SMS response to realtor...'}
                className="flex-1 px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#155EEF]"
              />
              <button
                type="submit"
                disabled={isReadOnly || !messageInput.trim()}
                className="px-4 py-2 btn-executive-primary disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>

        </div>

        {/* COLUMN 3: REALTOR QUALIFICATION & TEMPERATURE PANEL (3 COLS) */}
        <div className={`lg:col-span-3 executive-panel rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-4 ${
          mobileView === 'details' ? 'flex h-full' : 'hidden lg:flex'
        }`}>
          
          {activeConv && (
            <div className="space-y-4">
              
              {/* Temperature Custom Field Dropdown */}
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1.5">
                <label className="text-[10px] text-[#64748B] uppercase font-bold block">
                  Lead Temperature (Auto-Graded)
                </label>
                <select
                  value={activeConv.temperature || 'Warm'}
                  disabled={isReadOnly}
                  onChange={(e) => updateConversationTemperature(activeConv.id, e.target.value as ContactTemperature)}
                  className={`w-full p-2 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
                    activeConv.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    activeConv.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  <option value="Hot">🔥 Hot (Urgent / Property Provided)</option>
                  <option value="Warm">⚡ Warm (Inventory Available / Qualifying)</option>
                  <option value="Cold">❄️ Cold (Nurture / Low Priority)</option>
                </select>
              </div>

              {/* Grade & Score Box */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">Qualification Score</span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setOverrideGradeVal(activeConv.grade);
                        setOverrideScoreVal(activeConv.score);
                        setShowOverrideModal(true);
                      }}
                      className="text-[10px] text-[#155EEF] font-bold hover:underline"
                    >
                      Override
                    </button>
                  )}
                </div>
                <div className="text-xl font-extrabold font-mono text-[#155EEF]">
                  Grade {activeConv.grade} <span className="text-xs text-[#64748B] font-normal">({activeConv.score}/100)</span>
                </div>
                <p className="text-[11px] text-[#475569] mt-1 leading-snug">
                  {activeConv.gradeReason}
                </p>
              </div>

              {/* Captured Property Box + Clone CTA */}
              {activeConv.propertyCaptured ? (
                <div className="p-3.5 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Building className="w-4 h-4" /> Captured Opportunity
                  </div>
                  <div className="font-bold text-[#0B1F3A]">{activeConv.propertyCaptured.address}</div>
                  <div className="text-[11px] text-[#475569]">{activeConv.propertyCaptured.city}, {activeConv.propertyCaptured.state}</div>

                  <div className="space-y-1 text-[11px] pt-1 border-t border-[#BFDBFE]/60">
                    <div className="flex justify-between text-[#475569]">
                      <span>Asking Price:</span>
                      <strong className="text-[#0B1F3A]">${activeConv.propertyCaptured.askingPrice.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-[#475569]">
                      <span>Timeline:</span>
                      <strong className="text-[#155EEF]">{activeConv.propertyCaptured.timeline}</strong>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={handleCloneLead}
                      className="w-full py-2 btn-executive-primary text-white font-bold text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Clone Property to AI Deals
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] text-center">
                  No property address captured in thread yet.
                </div>
              )}

              {/* Quick Stage Change Shortcuts */}
              {!isReadOnly && (
                <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                    Quick Pipeline Action
                  </span>

                  <button
                    onClick={() => {
                      if (activeConv.contactId) {
                        updateContactStage(activeConv.contactId, 'Needs Human Touch');
                      }
                    }}
                    className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-600" /> Move to "Needs Human Touch"
                  </button>

                  <button
                    onClick={() => {
                      if (activeConv.contactId) {
                        updateContactStage(activeConv.contactId, 'No Response, In 30-Day Nurture');
                      }
                    }}
                    className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> Move to 30-Day Nurture
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* MANUAL GRADE OVERRIDE MODAL */}
      {showOverrideModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-md rounded-2xl p-6 relative bg-white shadow-2xl">
            <button onClick={() => setShowOverrideModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0B1F3A] mb-4">Manual Grade Override</h3>
            
            <form onSubmit={handleGradeOverrideSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#475569] font-semibold mb-1">New Grade</label>
                <select
                  value={overrideGradeVal}
                  onChange={(e) => setOverrideGradeVal(e.target.value as Grade)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none"
                >
                  <option value="A">Grade A (Hot Lead)</option>
                  <option value="B">Grade B (Moderate)</option>
                  <option value="C">Grade C (Low Priority)</option>
                  <option value="D">Grade D (Unqualified)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScoreVal}
                  onChange={(e) => setOverrideScoreVal(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Reason / Justification</label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Apply Grade Override
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
