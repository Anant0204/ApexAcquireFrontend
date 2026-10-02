import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PropertyDeal, DealStage, ContactTemperature } from '../types/crm';
import {
  Kanban,
  List,
  Plus,
  Search,
  Trash2,
  X,
  Building2,
  Home,
  Zap,
  AlertTriangle,
  FileCheck,
  PhoneCall,
  DollarSign,
  ArrowRightLeft
} from 'lucide-react';

interface DealsProps {
  onSelectDeal: (deal: PropertyDeal) => void;
}

const STAGES: DealStage[] = [
  'New Property',
  'Qualifying',
  'Offer Made',
  'Offer Accepted',
  'Offer Rejected',
  'TRASH',
  'Duplicate Lead',
  'Need Help'
];

const STAGE_CONFIG: Record<DealStage, {
  label: string;
  shortLabel: string;
  gradientHeader: string;
  glowBg: string;
  badgeStyle: string;
  cardStripe: string;
}> = {
  'New Property': {
    label: 'NEW PROPERTY',
    shortLabel: 'New',
    gradientHeader: 'bg-gradient-to-r from-[#0B1F3A] via-[#155EEF] to-[#2563EB] text-white',
    glowBg: 'bg-[#155EEF]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#155EEF]'
  },
  'Qualifying': {
    label: 'QUALIFYING',
    shortLabel: 'Qualifying',
    gradientHeader: 'bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#2DD4BF] text-white',
    glowBg: 'bg-[#14B8A6]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#14B8A6]'
  },
  'Offer Made': {
    label: 'OFFER MADE',
    shortLabel: 'Offer Made',
    gradientHeader: 'bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] text-white',
    glowBg: 'bg-[#2563EB]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#2563EB]'
  },
  'Offer Accepted': {
    label: 'OFFER ACCEPTED',
    shortLabel: 'Accepted',
    gradientHeader: 'bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] text-white',
    glowBg: 'bg-[#10B981]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#10B981]'
  },
  'Offer Rejected': {
    label: 'OFFER REJECTED',
    shortLabel: 'Rejected',
    gradientHeader: 'bg-gradient-to-r from-[#475569] via-[#64748B] to-[#94A3B8] text-white',
    glowBg: 'bg-[#64748B]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#64748B]'
  },
  'TRASH': {
    label: 'TRASH',
    shortLabel: 'Trash',
    gradientHeader: 'bg-gradient-to-r from-[#334155] via-[#475569] to-[#64748B] text-white',
    glowBg: 'bg-[#475569]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#475569]'
  },
  'Duplicate Lead': {
    label: 'DUPLICATE LEAD',
    shortLabel: 'Duplicate',
    gradientHeader: 'bg-gradient-to-r from-[#7C2D12] via-[#9A3412] to-[#C2410C] text-white',
    glowBg: 'bg-[#C2410C]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#C2410C]'
  },
  'Need Help': {
    label: 'NEED HELP (MANAGER)',
    shortLabel: 'Need Help',
    gradientHeader: 'bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white',
    glowBg: 'bg-[#DC2626]/25',
    badgeStyle: 'bg-white/25 backdrop-blur-md text-white border border-white/30 animate-pulse',
    cardStripe: 'bg-[#DC2626]'
  }
};

export const DealsPage: React.FC<DealsProps> = ({ onSelectDeal }) => {
  const { deals, addDeal, updateDealStage, archiveDeal, contacts, currentUser } = useApp();

  const [pipelineTab, setPipelineTab] = useState<'DEALS' | 'AI_INBOUND'>('DEALS');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [activeJumpStage, setActiveJumpStage] = useState<DealStage | null>(null);

  // Modals state
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [archivingDealId, setArchivingDealId] = useState<string | null>(null);

  const [newDeal, setNewDeal] = useState({
    address: '',
    city: 'Dallas',
    state: 'TX',
    zip: '75205',
    askingPrice: 500000,
    beds: 3,
    baths: 2,
    sqft: 2000,
    yearBuilt: 2000,
    propertyType: 'Single Family Residence',
    stage: 'New Property' as DealStage,
    temperature: 'Hot' as ContactTemperature,
    contactId: '',
    realtorName: '',
    realtorBrokerage: '',
    realtorPhone: '',
    realtorEmail: ''
  });

  const [apiDeals, setApiDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDeals = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/v1/deals/pipeline', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setApiDeals(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const activeDeals = apiDeals.filter(d => !d.isArchived);

  const filteredDeals = activeDeals.filter((d) => {
    const matchesPipeline = pipelineTab === 'AI_INBOUND' ? d.isAiInbound : true;
    const matchesSearch = d.address.toLowerCase().includes(search.toLowerCase()) ||
      (d.realtorName && d.realtorName.toLowerCase().includes(search.toLowerCase())) ||
      d.city.toLowerCase().includes(search.toLowerCase());

    return matchesPipeline && matchesSearch;
  });

  if (loading) {
    return <div className="p-6 text-center text-[#475569]">Loading Deals Pipeline...</div>;
  }

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDealStageChange = (dealId: string, targetStage: DealStage) => {
    setApiDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return { ...d, stage: targetStage };
      }
      return d;
    }));
    updateDealStage(dealId, targetStage);
  };

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId') || e.dataTransfer.getData('text/plain');
    if (dealId && currentUser.role !== 'READ_ONLY') {
      handleDealStageChange(dealId, targetStage);
    }
  };

  const scrollToStage = (stage: DealStage) => {
    setActiveJumpStage(stage);
    const colElement = document.getElementById(`deal-column-${stage.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (colElement) {
      colElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedContact = contacts.find(c => c.id === newDeal.contactId);

    addDeal({
      address: newDeal.address,
      city: newDeal.city,
      state: newDeal.state,
      zip: newDeal.zip,
      askingPrice: newDeal.askingPrice,
      beds: newDeal.beds,
      baths: newDeal.baths,
      sqft: newDeal.sqft,
      yearBuilt: newDeal.yearBuilt,
      propertyType: newDeal.propertyType,
      stage: newDeal.stage,
      temperature: newDeal.temperature,
      contactId: selectedContact ? selectedContact.id : `cnt-${Date.now()}`,
      realtorName: selectedContact ? selectedContact.name : newDeal.realtorName,
      realtorBrokerage: selectedContact ? selectedContact.brokerage : newDeal.realtorBrokerage,
      realtorPhone: selectedContact ? selectedContact.phone : newDeal.realtorPhone,
      realtorEmail: selectedContact ? selectedContact.email : newDeal.realtorEmail,
      isAiInbound: false,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      grade: 'B',
      score: 80,
      source: 'Acquisition Desk Manual Entry'
    });

    setShowAddDealModal(false);
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="space-y-5 max-w-full pb-12">

      {/* HEADER & SWITCHERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase tracking-wide">
              Property Acquisition Pipeline
            </span>
            <span className="text-[11px] text-[#64748B] hidden sm:inline">&bull; 8 Stages &bull; Multi-Property per Contact &bull; Non-Recycling</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1F3A]">
              AI Deals Workspace
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#EAF2FF] text-[#155EEF] border border-[#155EEF]/20 font-bold shrink-0">
              {filteredDeals.length} Active Deals
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-1.5 max-w-3xl leading-relaxed">
            Track all property addresses that enter the CRM. Deals don't recycle here. Same contact can hold multiple opportunities.
          </p>
        </div>

        {/* View Mode & Pipeline Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">

          {!isReadOnly && (
            <button
              onClick={() => setShowAddDealModal(true)}
              className="px-3.5 py-2 btn-executive-primary text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Deal
            </button>
          )}

          {/* Dual Pipeline Selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => setPipelineTab('DEALS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pipelineTab === 'DEALS' ? 'btn-executive-primary text-white shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Deals
            </button>
            <button
              onClick={() => setPipelineTab('AI_INBOUND')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                pipelineTab === 'AI_INBOUND' ? 'bg-[#155EEF]/10 text-[#155EEF] border border-[#155EEF]/30' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> AI Inbound
            </button>
          </div>

          {/* Kanban vs List Switcher */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'kanban' ? 'bg-[#EAF2FF] text-[#155EEF] shadow-xs' : 'text-[#64748B]'}`}
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#EAF2FF] text-[#155EEF] shadow-xs' : 'text-[#64748B]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* SEARCH & VOLUME BAR */}
      <div className="executive-panel rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, city, realtor..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-[#475569] flex items-center gap-1.5">
            <span className="font-semibold text-[#0F172A]">Active Volume:</span>
            <span className="font-mono font-extrabold text-[#155EEF] text-sm">
              ${filteredDeals.reduce((sum, d) => sum + d.askingPrice, 0).toLocaleString()}
            </span>
          </div>

          <div className="text-[#475569] flex items-center gap-1.5">
            <span className="font-semibold text-[#0F172A]">Need Help:</span>
            <span className="font-mono font-extrabold text-rose-600 text-sm">
              {filteredDeals.filter(d => d.stage === 'Need Help').length}
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE STAGE QUICK JUMP BAR */}
      {viewMode === 'kanban' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 no-scrollbar sm:hidden">
          <span className="text-[10px] uppercase font-bold text-[#64748B] px-1 shrink-0">Jump to:</span>
          {STAGES.map((st) => {
            const count = filteredDeals.filter(d => d.stage === st).length;
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
      )}

      {/* KANBAN BOARD VIEW (8 STAGES) */}
      {viewMode === 'kanban' && (
        <div className="kanban-scroll-container flex gap-4 overflow-x-auto pb-8 pt-2 no-scrollbar">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const conf = STAGE_CONFIG[stage];

            return (
              <div
                key={stage}
                id={`deal-column-${stage.replace(/[^a-zA-Z0-9]/g, '-')}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className="kanban-column-snap w-80 flex-shrink-0 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col max-h-[80vh] shadow-sm overflow-hidden"
              >
                {/* Gradient Header Banner */}
                <div className={`px-4 py-3.5 flex justify-between items-center ${conf.gradientHeader} shadow-md`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {stage === 'Need Help' && <AlertTriangle className="w-4 h-4 text-white animate-bounce shrink-0" />}
                    <span className="text-xs font-extrabold tracking-wider uppercase font-sans truncate">
                      {conf.label}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${conf.badgeStyle}`}>
                    {stageDeals.length}
                  </span>
                </div>

                {/* Card Droppable Container */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                  className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#F8FAFC]/60"
                >
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable={!isReadOnly}
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => onSelectDeal(deal)}
                      className="executive-panel executive-panel-hover rounded-2xl p-3.5 cursor-pointer border border-[#E2E8F0] group relative bg-white overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Left vertical color accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${conf.cardStripe}`} />

                      {/* Header Row: Temperature + Grade + Asking Price */}
                      <div className="flex justify-between items-center mb-2 pl-1.5">
                        <div className="flex items-center gap-1.5">
                          {deal.temperature && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              deal.temperature === 'Hot' ? 'bg-rose-100 text-rose-700' :
                              deal.temperature === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {deal.temperature === 'Hot' ? '🔥 Hot' : deal.temperature === 'Warm' ? '⚡ Warm' : '❄️ Cold'}
                            </span>
                          )}

                          <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-extrabold text-white ${
                            deal.grade === 'A' ? 'bg-emerald-600' :
                            deal.grade === 'B' ? 'bg-blue-600' :
                            deal.grade === 'C' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}>
                            {deal.grade}
                          </span>

                          {deal.isAiInbound && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" /> AI
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                          ${deal.askingPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Address & Specs */}
                      <div className="pl-1.5 space-y-1">
                        <div className="font-bold text-xs text-[#0F172A] group-hover:text-[#155EEF] transition-colors line-clamp-1 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-[#155EEF] shrink-0" />
                          <span className="truncate">{deal.address}</span>
                        </div>
                        
                        <div className="text-[10px] text-[#64748B] flex items-center gap-2">
                          <span>{deal.city}, {deal.state}</span>
                          {deal.beds ? (
                            <>
                              <span>•</span>
                              <span className="font-medium text-[#475569]">{deal.beds}b / {deal.baths}b</span>
                            </>
                          ) : null}
                          {deal.sqft ? (
                            <>
                              <span>•</span>
                              <span className="font-medium text-[#475569]">{deal.sqft.toLocaleString()} sqft</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Footer: Realtor Name + Soft Delete */}
                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#E2E8F0]/80 pl-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 text-[#475569] font-medium truncate max-w-[170px]">
                          <Building2 className="w-3.5 h-3.5 text-[#155EEF] shrink-0" />
                          <span className="truncate">{deal.realtorName}</span>
                        </div>

                        {!isReadOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setArchivingDealId(deal.id);
                            }}
                            className="p-1 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Move Deal to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 1-Tap Mobile / Quick Deal Stage Move Selector */}
                      {!isReadOnly && (
                        <div 
                          className="mt-2.5 pt-2 border-t border-[#E2E8F0]/80 pl-1.5 flex items-center justify-between gap-1.5" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1 shrink-0">
                            <ArrowRightLeft className="w-2.5 h-2.5 text-[#155EEF]" /> Move:
                          </span>
                          <select
                            value={deal.stage}
                            onChange={(e) => {
                              handleDealStageChange(deal.id, e.target.value as DealStage);
                            }}
                            className="text-[10px] font-bold bg-[#F1F6FC] hover:bg-[#EAF2FF] text-[#0B1F3A] border border-[#CBD5E1] hover:border-[#155EEF] rounded-lg px-2 py-1 focus:outline-none focus:border-[#155EEF] transition-colors cursor-pointer w-full max-w-[170px] truncate"
                          >
                            {STAGES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center text-[11px] text-[#94A3B8] gap-1 bg-white/60">
                      <span>Drop Deal Here</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="executive-panel rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider text-[10px] bg-[#F8FAFC]">
                <th className="py-3 px-4">Property Address</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">Asking Price</th>
                <th className="py-3 px-4">Realtor</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {filteredDeals.map((deal) => {
                const conf = STAGE_CONFIG[deal.stage];

                return (
                  <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-[#155EEF]" />
                        <span>{deal.address}, {deal.city}</span>
                        {deal.isAiInbound && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">AI</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg ${conf.gradientHeader} font-bold text-[10px] shadow-2xs`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold">
                        {deal.temperature === 'Hot' ? '🔥 Hot' : deal.temperature === 'Warm' ? '⚡ Warm' : '❄️ Cold'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700">${deal.askingPrice.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-[#475569]">{deal.realtorName}</td>
                    <td className="py-3.5 px-4 text-[#475569]">{deal.ownerName}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectDeal(deal)}
                        className="px-3 py-1 btn-executive-primary text-white font-semibold rounded-lg text-[11px] transition-all cursor-pointer shadow-xs"
                      >
                        Inspect
                      </button>
                      {!isReadOnly && (
                        <button
                          onClick={() => setArchivingDealId(deal.id)}
                          className="p-1 rounded bg-slate-100 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Archive Deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE DEAL MODAL (MULTI-DEAL CONTACT LINKING) */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 shadow-2xl border border-[#E2E8F0] bg-white">
            <button onClick={() => setShowAddDealModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0B1F3A]">Create Acquisition Deal (Multi-Property)</h3>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              
              {/* Select Existing Contact or Enter New */}
              <div>
                <label className="block text-[#475569] font-bold mb-1">Associate with Existing Realtor</label>
                <select
                  value={newDeal.contactId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const match = contacts.find(c => c.id === cId);
                    setNewDeal({
                      ...newDeal,
                      contactId: cId,
                      realtorName: match ? match.name : '',
                      realtorBrokerage: match ? match.brokerage : '',
                      realtorPhone: match ? match.phone : '',
                      realtorEmail: match ? match.email : ''
                    });
                  }}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                >
                  <option value="">Create with New Realtor...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.brokerage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">Property Address</label>
                <input
                  type="text"
                  required
                  value={newDeal.address}
                  onChange={(e) => setNewDeal({ ...newDeal, address: e.target.value })}
                  placeholder="e.g. 7420 Armstrong Pkwy"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Asking Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newDeal.askingPrice}
                    onChange={(e) => setNewDeal({ ...newDeal, askingPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Deal Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as DealStage })}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    {STAGES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!newDeal.contactId && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Realtor Name</label>
                    <input
                      type="text"
                      required
                      value={newDeal.realtorName}
                      onChange={(e) => setNewDeal({ ...newDeal, realtorName: e.target.value })}
                      className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Realtor Phone</label>
                    <input
                      type="text"
                      required
                      value={newDeal.realtorPhone}
                      onChange={(e) => setNewDeal({ ...newDeal, realtorPhone: e.target.value })}
                      className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-all shadow-md cursor-pointer"
              >
                Save Deal To Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ARCHIVE MODAL */}
      {archivingDealId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-sm rounded-2xl p-6 relative space-y-4 text-center shadow-2xl border border-[#E2E8F0] bg-white">
            <h3 className="text-base font-bold text-[#0B1F3A]">Move Deal to TRASH?</h3>
            <p className="text-xs text-[#475569]">Moves deal record to TRASH stage while retaining audit records.</p>
            <div className="flex gap-2">
              <button onClick={() => setArchivingDealId(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold rounded-xl transition-colors">Cancel</button>
              <button
                onClick={() => {
                  archiveDeal(archivingDealId);
                  setArchivingDealId(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Move to TRASH
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
