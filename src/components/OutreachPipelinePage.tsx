import { API_BASE_URL } from '../config/api';
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { RealtorContact, OutreachStage, ContactTemperature } from '../types/crm';
import {
  Send,
  Flame,
  Bot,
  UserCheck,
  Building,
  RotateCcw,
  Ban,
  PhoneOff,
  AlertOctagon,
  Search,
  Filter,
  Plus,
  Play,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Users,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';

interface OutreachPipelineProps {
  onSelectContact: (contact: RealtorContact) => void;
  onOpenCallModal?: (contact: RealtorContact) => void;
}

const OUTREACH_STAGES: OutreachStage[] = [
  'Queued for Outreach',
  'Outreach Sent',
  'Responded/Qualifying',
  'Needs Human Touch',
  'Lead Created',
  'No Response, In 30-Day Nurture',
  'Not Interested - CLOSED',
  'Wrong Number / Not an Agent - CLOSED',
  'Opted Out / DND - CLOSED',
  'SMS Error - CLOSED'
];

const STAGE_CONFIG: Record<OutreachStage, {
  label: string;
  shortLabel: string;
  gradientHeader: string;
  badgeStyle: string;
  cardStripe: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = {
  'Queued for Outreach': {
    label: 'QUEUED FOR OUTREACH',
    shortLabel: 'Queued',
    gradientHeader: 'bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white',
    badgeStyle: 'bg-white/20 text-white border border-white/30',
    cardStripe: 'bg-[#64748B]',
    icon: Send,
    description: 'Enrolled & ready for 5-touch initial sequence'
  },
  'Outreach Sent': {
    label: 'OUTREACH SENT (5-TOUCH)',
    shortLabel: '5-Touch Sent',
    gradientHeader: 'bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white',
    badgeStyle: 'bg-white/25 text-white border border-white/30',
    cardStripe: 'bg-[#2563EB]',
    icon: Play,
    description: 'Initial 5-touch cadence currently running'
  },
  'Responded/Qualifying': {
    label: 'RESPONDED / QUALIFYING',
    shortLabel: 'Responded',
    gradientHeader: 'bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#2DD4BF] text-white',
    badgeStyle: 'bg-white/25 text-white border border-white/30',
    cardStripe: 'bg-[#14B8A6]',
    icon: Bot,
    description: 'AI Bot actively conversing & extracting criteria'
  },
  'Needs Human Touch': {
    label: 'NEEDS HUMAN TOUCH',
    shortLabel: 'Human Touch',
    gradientHeader: 'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] text-white',
    badgeStyle: 'bg-white/25 text-white border border-white/30',
    cardStripe: 'bg-[#F59E0B]',
    icon: Flame,
    description: 'Bot paused • Human specialist action required'
  },
  'Lead Created': {
    label: 'LEAD CREATED',
    shortLabel: 'Lead Created',
    gradientHeader: 'bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] text-white',
    badgeStyle: 'bg-white/25 text-white border border-white/30',
    cardStripe: 'bg-[#10B981]',
    icon: Building,
    description: 'Property address captured • Cloned into AI Deals'
  },
  'No Response, In 30-Day Nurture': {
    label: '30-DAY NURTURE (LOOP)',
    shortLabel: '30D Nurture',
    gradientHeader: 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white',
    badgeStyle: 'bg-white/25 text-white border border-white/30',
    cardStripe: 'bg-[#8B5CF6]',
    icon: RotateCcw,
    description: 'Permanent nurture loop • Recycles back after 30 days'
  },
  'Not Interested - CLOSED': {
    label: 'NOT INTERESTED',
    shortLabel: 'Not Interested',
    gradientHeader: 'bg-gradient-to-r from-[#475569] via-[#64748B] to-[#94A3B8] text-white',
    badgeStyle: 'bg-white/20 text-white border border-white/30',
    cardStripe: 'bg-[#64748B]',
    icon: Ban,
    description: 'Realtor declined investor partnership'
  },
  'Wrong Number / Not an Agent - CLOSED': {
    label: 'WRONG NUMBER',
    shortLabel: 'Wrong No.',
    gradientHeader: 'bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white',
    badgeStyle: 'bg-white/20 text-white border border-white/30',
    cardStripe: 'bg-[#DC2626]',
    icon: PhoneOff,
    description: 'Invalid phone or non-licensee contact'
  },
  'Opted Out / DND - CLOSED': {
    label: 'OPTED OUT / DND',
    shortLabel: 'DND / Opt Out',
    gradientHeader: 'bg-gradient-to-r from-[#831843] via-[#BE185D] to-[#F43F5E] text-white',
    badgeStyle: 'bg-white/20 text-white border border-white/30',
    cardStripe: 'bg-[#BE185D]',
    icon: AlertOctagon,
    description: 'STOP reply received • Permanent DND lock'
  },
  'SMS Error - CLOSED': {
    label: 'SMS ERROR',
    shortLabel: 'SMS Error',
    gradientHeader: 'bg-gradient-to-r from-[#78350F] via-[#B45309] to-[#D97706] text-white',
    badgeStyle: 'bg-white/20 text-white border border-white/30',
    cardStripe: 'bg-[#B45309]',
    icon: AlertOctagon,
    description: 'Carrier delivery failure / unreachable'
  }
};

export const OutreachPipelinePage: React.FC<OutreachPipelineProps> = ({ onSelectContact, onOpenCallModal }) => {
  const { 
    contacts, 
    updateContactStage, 
    updateContactTemperature, 
    recycleContactToQueued, 
    advanceContactSequence, 
    currentUser 
  } = useApp();

  const [search, setSearch] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState<'ALL' | ContactTemperature>('ALL');
  const [recycledToast, setRecycledToast] = useState<string | null>(null);
  const [activeJumpStage, setActiveJumpStage] = useState<OutreachStage | null>(null);

  const [apiContacts, setApiContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/outreach/pipeline`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setApiContacts(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPipeline();
  }, []);

  const filteredContacts = apiContacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brokerage.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.market && c.market.toLowerCase().includes(search.toLowerCase()));

    const matchesTemp = temperatureFilter === 'ALL' || c.temperature === temperatureFilter;
    return matchesSearch && matchesTemp;
  });

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    e.dataTransfer.setData('contactId', contactId);
    e.dataTransfer.setData('text/plain', contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleStageChange = async (contactId: string, targetStage: OutreachStage) => {
    // 1. Optimistically update local API contacts so the card moves immediately to target stage
    setApiContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          outreachStage: targetStage,
          status: targetStage
        };
      }
      return c;
    }));

    // 2. Update context for task triggers and audits
    updateContactStage(contactId, targetStage);

    // 3. Persist to Backend MySQL Database
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStage,
          outreachStage: targetStage
        })
      });
    } catch (err) {
      console.error('Failed to update stage in backend:', err);
    }
  };

  const handleTemperatureChange = async (contactId: string, newTemp: ContactTemperature) => {
    // Optimistic UI update
    setApiContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return { ...c, temperature: newTemp };
      }
      return c;
    }));

    updateContactTemperature(contactId, newTemp);

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ temperature: newTemp })
      });
    } catch (err) {
      console.error('Failed to update temperature in backend:', err);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: OutreachStage) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('contactId') || e.dataTransfer.getData('text/plain');
    if (contactId && currentUser.role !== 'READ_ONLY') {
      handleStageChange(contactId, targetStage);
    }
  };

  const handleRecycle = async (contact: RealtorContact) => {
    handleStageChange(contact.id, 'Queued for Outreach');
    recycleContactToQueued(contact.id);
    setRecycledToast(`${contact.name} recycled back to "Queued for Outreach" (Recycle #${(contact.sequenceInfo?.recycleCount || 0) + 1})`);
    setTimeout(() => setRecycledToast(null), 4000);
  };

  const scrollToStage = (stage: OutreachStage) => {
    setActiveJumpStage(stage);
    const colElement = document.getElementById(`outreach-column-${stage.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (colElement) {
      colElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';

  if (loading) {
    return <div className="p-6 text-center text-[#475569]">Loading Outreach Pipeline...</div>;
  }

  return (
    <div className="space-y-5 max-w-full pb-12">
      
      {/* TOAST ALERT FOR RECYCLING */}
      {recycledToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#0B1533] border border-[#60A5FA] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold max-w-md">
          <RotateCcw className="w-4 h-4 text-[#60A5FA] animate-spin shrink-0" />
          <span>{recycledToast}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase tracking-wide">
              Omnichannel Outreach Engine
            </span>
            <span className="text-[11px] text-[#64748B] hidden sm:inline">&bull; 10 Pipeline Stages &bull; 30-Day Nurture Recycle</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1F3A]">
              Agent Outreach / AI Outreach Pipeline
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#155EEF] text-white shadow-xs shrink-0 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {filteredContacts.length} Contacts
            </span>
          </div>

          <p className="text-xs text-[#475569] mt-1.5 max-w-3xl leading-relaxed">
            5-Touch Cadence Tracker, AI Qualifying, Human Takeover Escalation, 30-Day Nurture Auto-Recycle Loop, and Temperature auto-grading.
          </p>
        </div>

        {/* CONTROLS TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          
          {/* Temperature Quick Filter */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-xs w-full sm:w-auto overflow-x-auto justify-between sm:justify-start">
            <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Temp:
            </span>
            <div className="flex items-center gap-1">
              {(['ALL', 'Hot', 'Warm', 'Cold'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemperatureFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    temperatureFilter === t 
                      ? t === 'Hot' ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs' :
                        t === 'Warm' ? 'bg-amber-500 text-white shadow-xs' :
                        t === 'Cold' ? 'bg-blue-600 text-white shadow-xs' :
                        'bg-[#0B1F3A] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t === 'Hot' ? '🔥 Hot' : t === 'Warm' ? '⚡ Warm' : t === 'Cold' ? '❄️ Cold' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search realtor, brokerage, phone..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF] shadow-xs"
            />
          </div>

        </div>
      </div>

      {/* MOBILE STAGE QUICK JUMP BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 no-scrollbar sm:hidden">
        <span className="text-[10px] uppercase font-bold text-[#64748B] px-1 shrink-0">Jump to:</span>
        {OUTREACH_STAGES.map((st) => {
          const count = filteredContacts.filter(c => c.outreachStage === st).length;
          const conf = STAGE_CONFIG[st];
          return (
            <button
              key={st}
              onClick={() => scrollToStage(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border flex items-center gap-1 cursor-pointer ${
                activeJumpStage === st
                  ? 'bg-[#155EEF] text-white border-[#155EEF] shadow-xs'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F6FC]'
              }`}
            >
              <span>{conf.shortLabel}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeJumpStage === st ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#0F172A]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 10-STAGE KANBAN HORIZONTAL SCROLL PIPELINE */}
      <div className="kanban-scroll-container flex gap-4 overflow-x-auto pb-8 pt-2 no-scrollbar">
        {OUTREACH_STAGES.map((stage) => {
          const stageContacts = filteredContacts.filter(c => c.outreachStage === stage);
          const conf = STAGE_CONFIG[stage];
          const Icon = conf.icon;

          return (
            <div
              key={stage}
              id={`outreach-column-${stage.replace(/[^a-zA-Z0-9]/g, '-')}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="kanban-column-snap w-80 flex-shrink-0 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col max-h-[80vh] shadow-sm overflow-hidden"
            >
              
              {/* Header Gradient Banner */}
              <div className={`px-4 py-3.5 flex justify-between items-center ${conf.gradientHeader} shadow-md`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-extrabold tracking-wider uppercase font-sans truncate">
                    {conf.label}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${conf.badgeStyle} shrink-0`}>
                  {stageContacts.length}
                </span>
              </div>

              {/* Column Description Pill */}
              <div className="px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] text-[#64748B] flex items-center justify-between">
                <span className="truncate">{conf.description}</span>
              </div>

              {/* Cards Container */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#F8FAFC]/60"
              >
                {stageContacts.map((contact) => (
                  <div
                    key={contact.id}
                    draggable={!isReadOnly}
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    onClick={() => onSelectContact(contact)}
                    className="executive-panel executive-panel-hover rounded-2xl p-3.5 cursor-pointer border border-[#E2E8F0] group relative bg-white overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Left Accent Color Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${conf.cardStripe}`} />

                    {/* Card Top Row: Temperature Dropdown + Grade Score */}
                    <div className="flex justify-between items-center mb-2 pl-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={contact.temperature}
                          disabled={isReadOnly}
                          onChange={(e) => handleTemperatureChange(contact.id, e.target.value as ContactTemperature)}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none shadow-2xs ${
                            contact.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            contact.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <option value="Hot">🔥 Hot</option>
                          <option value="Warm">⚡ Warm</option>
                          <option value="Cold">❄️ Cold</option>
                        </select>

                        <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-extrabold text-white ${
                          contact.grade === 'A' ? 'bg-emerald-600' :
                          contact.grade === 'B' ? 'bg-blue-600' :
                          contact.grade === 'C' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}>
                          {contact.grade}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-[#64748B]">
                        Score: <strong>{contact.score}</strong>
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="pl-1.5 space-y-1">
                      <div className="font-bold text-xs text-[#0F172A] group-hover:text-[#155EEF] transition-colors truncate">
                        {contact.name}
                      </div>
                      <div className="text-[10px] text-[#64748B] truncate">
                        {contact.brokerage} &bull; {contact.market}
                      </div>
                      <div className="text-[10px] text-[#475569] font-mono">
                        {contact.phone}
                      </div>
                    </div>

                    {/* 5-Touch Cadence Status or 30-Day Nurture Progress Bar */}
                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/80 pl-1.5 space-y-1.5">
                      
                      {/* Outreach Sent (5-Touch) Progress */}
                      {stage === 'Outreach Sent' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-[#475569]">
                            <span>Cadence Progress</span>
                            <span className="text-[#155EEF]">Touch {contact.sequenceInfo?.currentTouch || 0}/5</span>
                          </div>
                          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden flex">
                            {[1, 2, 3, 4, 5].map((t) => (
                              <div
                                key={t}
                                className={`flex-1 border-r border-white ${
                                  t <= (contact.sequenceInfo?.currentTouch || 0) ? 'bg-[#155EEF]' : 'bg-[#E2E8F0]'
                                }`}
                              />
                            ))}
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setApiContacts(prev => prev.map(c => {
                                  if (c.id === contact.id) {
                                    const curr = c.sequenceInfo?.currentTouch || 0;
                                    return {
                                      ...c,
                                      sequenceInfo: { ...c.sequenceInfo, currentTouch: Math.min(5, curr + 1) }
                                    };
                                  }
                                  return c;
                                }));
                                advanceContactSequence(contact.id);
                              }}
                              className="w-full mt-1.5 py-1 bg-[#EAF2FF] hover:bg-[#DBEAFE] text-[#155EEF] text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3" /> Advance to Touch {Math.min(5, (contact.sequenceInfo?.currentTouch || 0) + 1)}
                            </button>
                          )}
                        </div>
                      )}

                      {/* 30-Day Nurture (Permanent Loop) Bar + Recycle Button */}
                      {stage === 'No Response, In 30-Day Nurture' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-[#8B5CF6]">
                            <span>30-Day Nurture Loop</span>
                            <span>Day {contact.sequenceInfo?.nurtureDay || 18}/30</span>
                          </div>
                          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] h-full rounded-full" 
                              style={{ width: `${(((contact.sequenceInfo?.nurtureDay || 18)) / 30) * 100}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-[#64748B] pt-0.5">
                            <span>Recycled: <strong>{contact.sequenceInfo?.recycleCount || 0}x</strong></span>
                            <span className="text-[#8B5CF6] font-semibold">Auto-recycles on Day 30</span>
                          </div>

                          {!isReadOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecycle(contact);
                              }}
                              className="w-full mt-1.5 py-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" /> Recycle to Queued Now
                            </button>
                          )}
                        </div>
                      )}

                      {/* Responded / Qualifying AI Bot Active Indicator */}
                      {stage === 'Responded/Qualifying' && (
                        <div className="p-1.5 bg-[#E6FFFA] rounded-lg border border-[#38B2AC]/30 flex items-center gap-1.5 text-[10px] text-[#0D9488] font-bold">
                          <Bot className="w-3.5 h-3.5 animate-pulse" />
                          <span>AI Bot actively conversing</span>
                        </div>
                      )}

                      {/* Needs Human Touch Action */}
                      {stage === 'Needs Human Touch' && (
                        <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-[10px] text-amber-800 font-bold">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-600" /> Bot Paused
                          </span>
                          {onOpenCallModal && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCallModal(contact);
                              }}
                              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <PhoneCall className="w-2.5 h-2.5" /> Call Now
                            </button>
                          )}
                        </div>
                      )}

                      {/* Lead Created Deals Link */}
                      {stage === 'Lead Created' && (
                        <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cloned to AI Deals
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700">
                            {contact.propertyDealIds?.length || 1} Deal(s)
                          </span>
                        </div>
                      )}

                    </div>

                    {/* 1-Tap Mobile / Quick Stage Move Selector */}
                    {!isReadOnly && (
                      <div 
                        className="mt-2.5 pt-2 border-t border-[#E2E8F0]/80 pl-1.5 flex items-center justify-between gap-1.5" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <ArrowRightLeft className="w-2.5 h-2.5 text-[#155EEF]" /> Move:
                        </span>
                        <select
                          value={contact.outreachStage}
                          onChange={(e) => {
                            handleStageChange(contact.id, e.target.value as OutreachStage);
                          }}
                          className="text-[10px] font-bold bg-[#F1F6FC] hover:bg-[#EAF2FF] text-[#0B1F3A] border border-[#CBD5E1] hover:border-[#155EEF] rounded-lg px-2 py-1 focus:outline-none focus:border-[#155EEF] transition-colors cursor-pointer w-full max-w-[170px] truncate"
                        >
                          {OUTREACH_STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  </div>
                ))}

                {stageContacts.length === 0 && (
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                    className="h-24 border-2 border-dashed border-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center text-[10px] text-[#94A3B8] gap-1 bg-white/60 hover:bg-[#F1F6FC] transition-colors"
                  >
                    <span>Drop Contact Here</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

