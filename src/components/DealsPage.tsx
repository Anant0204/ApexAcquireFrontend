import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { PropertyDeal, DealStage, ContactTemperature, Grade } from '../types/crm';
import {
  Search,
  Plus,
  Filter,
  Check,
  X,
  Building2,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  Layers,
  Table as TableIcon,
  Sliders,
  DollarSign,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  Download,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';

interface DealsProps {
  onSelectDeal: (deal: PropertyDeal) => void;
}

export const PIPELINE_STAGES: DealStage[] = [
  'New',
  'Reviewing',
  'Offer',
  'Negotiation',
  'Contract',
  'Closed',
  'Lost'
];

export const normalizeDealStage = (stage: DealStage | string): DealStage => {
  if (stage === 'New Property') return 'New';
  if (stage === 'Qualifying') return 'Reviewing';
  if (stage === 'Offer Made') return 'Offer';
  if (stage === 'Need Help') return 'Negotiation';
  if (stage === 'Offer Accepted') return 'Contract';
  if (stage === 'Offer Rejected' || stage === 'TRASH' || stage === 'Duplicate Lead') return 'Lost';
  return (stage as DealStage) || 'New';
};

export const STAGE_CONFIG: Record<string, {
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  icon: string;
}> = {
  'New': {
    label: 'Active',
    badgeBg: 'bg-[#DCFCE7]',
    textColor: 'text-[#15803D]',
    borderColor: 'border-[#BBF7D0]',
    icon: '🟢'
  },
  'Reviewing': {
    label: 'Active',
    badgeBg: 'bg-[#DCFCE7]',
    textColor: 'text-[#15803D]',
    borderColor: 'border-[#BBF7D0]',
    icon: '🟢'
  },
  'Offer': {
    label: 'Offer Made',
    badgeBg: 'bg-[#DBEAFE]',
    textColor: 'text-[#1D4ED8]',
    borderColor: 'border-[#BFDBFE]',
    icon: '💵'
  },
  'Negotiation': {
    label: 'Pendi...',
    badgeBg: 'bg-[#EDE9FE]',
    textColor: 'text-[#6D28D9]',
    borderColor: 'border-[#DDD6FE]',
    icon: '⏳'
  },
  'Contract': {
    label: 'Contract',
    badgeBg: 'bg-[#D1FAE5]',
    textColor: 'text-[#047857]',
    borderColor: 'border-[#A7F3D0]',
    icon: '📜'
  },
  'Closed': {
    label: 'Closed',
    badgeBg: 'bg-[#F3E8FF]',
    textColor: 'text-[#7E22CE]',
    borderColor: 'border-[#E9D5FF]',
    icon: '🏆'
  },
  'Lost': {
    label: 'TRASH',
    badgeBg: 'bg-[#F1F5F9]',
    textColor: 'text-[#475569]',
    borderColor: 'border-[#CBD5E1]',
    icon: '🗑️'
  }
};

export const formatTableDate = (dateStr?: string): string => {
  if (!dateStr) return '09/16/2026';

  const clean = dateStr.trim();
  if (clean.toLowerCase().includes('just') || clean.toLowerCase().includes('today') || clean.toLowerCase().includes('ago')) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  const commaIdx = clean.indexOf(',');
  if (commaIdx !== -1) {
    const monthDay = clean.substring(0, commaIdx).trim();
    const rest = clean.substring(commaIdx + 1).trim();
    const year = rest.split(' ')[0];
    return `${monthDay}, ${year}`;
  }

  return clean;
};

export const DealsPage: React.FC<DealsProps> = ({ onSelectDeal }) => {
  const { deals, addDeal, contacts, users, currentUser } = useApp();

  // Sidebar Filter & Views State
  const [selectedView, setSelectedView] = useState<string>('ALL');
  const [sidebarTab, setSidebarTab] = useState<'Team' | 'Private'>('Team');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Search & Sorting
  const [search, setSearch] = useState('');
  const [sortByNewest, setSortByNewest] = useState(true);

  // Selection
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);

  // Toolbar Actions State (The 3 Buttons)
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>('comfortable');
  const [showDensityMenu, setShowDensityMenu] = useState(false);

  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    address: true,
    date: true,
    teamMember: true,
    arv: true,
    status: true,
    temperature: true,
    price: true,
    realtor: true,
    action: true
  });

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterArvStatus, setFilterArvStatus] = useState<string>('ALL');
  const [filterTemp, setFilterTemp] = useState<string>('ALL');
  const [filterDatePreset, setFilterDatePreset] = useState<string>('ALL');
  const [filterCreatedDate, setFilterCreatedDate] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const hasActiveAdvancedFilters = 
    filterStage !== 'ALL' || 
    filterArvStatus !== 'ALL' || 
    filterTemp !== 'ALL' || 
    Boolean(selectedMemberFilter) || 
    filterDatePreset !== 'ALL' || 
    filterCreatedDate !== '' || 
    minPrice !== '' || 
    maxPrice !== '';

  // Add Deal Modal
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    address: '',
    city: 'Dallas',
    state: 'TX',
    zip: '75205',
    askingPrice: 450000,
    beds: 3,
    baths: 2,
    sqft: 2000,
    lotSize: '0.25 Acres',
    yearBuilt: 2000,
    propertyType: 'Single Family Residence',
    stage: 'New' as DealStage,
    temperature: 'Hot' as ContactTemperature,
    ownerId: '',
    contactId: '',
    realtorName: '',
    realtorBrokerage: '',
    realtorPhone: '',
    realtorEmail: ''
  });

  const activeDeals = useMemo(() => deals.filter(d => !d.isArchived), [deals]);

  // Filter Engine
  const filteredDeals = useMemo(() => {
    return activeDeals.filter((d) => {
      const normStage = normalizeDealStage(d.stage);

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchAddress = d.address?.toLowerCase().includes(q);
        const matchRealtor = d.realtorName?.toLowerCase().includes(q);
        const matchCity = d.city?.toLowerCase().includes(q);
        const matchAssignee = d.ownerName?.toLowerCase().includes(q);
        if (!matchAddress && !matchRealtor && !matchCity && !matchAssignee) return false;
      }

      // Unified Member Filter (Sidebar & Popup Synchronized)
      if (selectedMemberFilter && d.ownerId !== selectedMemberFilter) {
        return false;
      }

      // Sidebar category filter
      if (selectedCategoryFilter === 'NEED_MANAGER_ARV') {
        const hasArv = d.underwriting?.arv && d.underwriting?.arv > 0;
        if (hasArv && normStage !== 'Reviewing' && normStage !== 'New') return false;
      } else if (selectedCategoryFilter === 'UNDER_CONTRACT') {
        if (normStage !== 'Contract') return false;
      } else if (selectedCategoryFilter === 'CLOSED') {
        if (normStage !== 'Closed') return false;
      } else if (selectedCategoryFilter === 'TRASH') {
        if (normStage !== 'Lost') return false;
      }

      // Advanced Toolbar Filters
      if (filterStage !== 'ALL' && normStage !== filterStage) return false;
      if (filterTemp !== 'ALL' && d.temperature !== filterTemp) return false;
      
      if (filterArvStatus === 'Approved') {
        const isApp = d.managerArvStatus === 'Manager Approved ARV' || (!d.managerArvStatus && Boolean(d.underwriting?.arv && normStage !== 'New'));
        if (!isApp) return false;
      } else if (filterArvStatus === 'Ran') {
        const isRan = d.managerArvStatus === 'ARV RAN' || (!d.managerArvStatus && Boolean(d.underwriting?.arv && normStage === 'New'));
        if (!isRan) return false;
      } else if (filterArvStatus === 'Need') {
        if (d.managerArvStatus !== 'Need Manager ARV') return false;
      }

      // Day Created / Date Filtering
      if (d.createdAt) {
        const dealDate = new Date(d.createdAt);
        if (!isNaN(dealDate.getTime())) {
          if (filterCreatedDate) {
            const y = dealDate.getFullYear();
            const m = String(dealDate.getMonth() + 1).padStart(2, '0');
            const day = String(dealDate.getDate()).padStart(2, '0');
            const formattedDate = `${y}-${m}-${day}`;
            if (formattedDate !== filterCreatedDate) return false;
          }

          if (filterDatePreset !== 'ALL' && !filterCreatedDate) {
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - dealDate.getTime()) / (1000 * 3600 * 24));

            if (filterDatePreset === 'TODAY') {
              if (dealDate.toDateString() !== now.toDateString()) return false;
            } else if (filterDatePreset === 'YESTERDAY') {
              const yest = new Date(now);
              yest.setDate(now.getDate() - 1);
              if (dealDate.toDateString() !== yest.toDateString()) return false;
            } else if (filterDatePreset === 'LAST_7_DAYS') {
              if (diffDays < 0 || diffDays > 7) return false;
            } else if (filterDatePreset === 'LAST_30_DAYS') {
              if (diffDays < 0 || diffDays > 30) return false;
            } else if (filterDatePreset === 'THIS_MONTH') {
              if (dealDate.getMonth() !== now.getMonth() || dealDate.getFullYear() !== now.getFullYear()) return false;
            }
          }
        }
      }

      if (minPrice && (d.askingPrice || 0) < Number(minPrice)) return false;
      if (maxPrice && (d.askingPrice || 0) > Number(maxPrice)) return false;

      return true;
    });
  }, [activeDeals, search, selectedMemberFilter, selectedCategoryFilter, filterStage, filterArvStatus, filterTemp, filterDatePreset, filterCreatedDate, minPrice, maxPrice]);

  // Sorted list
  const displayDeals = useMemo(() => {
    const list = [...filteredDeals];
    if (sortByNewest) {
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    return list;
  }, [filteredDeals, sortByNewest]);

  // Counts for Sidebar
  const memberCounts = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      map[u.id] = activeDeals.filter(d => d.ownerId === u.id).length;
    });
    return map;
  }, [activeDeals, users]);

  const needArvCount = useMemo(() => {
    return activeDeals.filter(d => {
      const s = normalizeDealStage(d.stage);
      return s === 'New' || s === 'Reviewing' || s === 'Negotiation';
    }).length;
  }, [activeDeals]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDealIds(displayDeals.map(d => d.id));
    } else {
      setSelectedDealIds([]);
    }
  };

  const handleToggleSelectDeal = (id: string) => {
    setSelectedDealIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.address) return;

    const matchedContact = contacts.find(c => c.id === newDeal.contactId);
    const assignedUser = users.find(u => u.id === newDeal.ownerId) || users.find(u => u.role === 'AGENT') || currentUser;

    addDeal({
      address: newDeal.address,
      city: newDeal.city,
      state: newDeal.state,
      zip: newDeal.zip,
      askingPrice: Number(newDeal.askingPrice) || 500000,
      beds: Number(newDeal.beds) || 3,
      baths: Number(newDeal.baths) || 2,
      sqft: Number(newDeal.sqft) || 2000,
      lotSize: newDeal.lotSize || '0.25 Acres',
      yearBuilt: Number(newDeal.yearBuilt) || 2000,
      propertyType: newDeal.propertyType,
      stage: newDeal.stage,
      isAiInbound: false,
      ownerId: assignedUser.id,
      ownerName: assignedUser.name,
      ownerAvatar: assignedUser.avatar || assignedUser.name.split(' ').map(n => n[0]).join(''),
      grade: 'A' as Grade,
      score: 85,
      temperature: newDeal.temperature,
      contactId: matchedContact ? matchedContact.id : `cnt-${Date.now()}`,
      realtorName: matchedContact ? matchedContact.name : newDeal.realtorName || 'Private Seller',
      realtorBrokerage: matchedContact ? matchedContact.brokerage : newDeal.realtorBrokerage || 'Direct Owner',
      realtorPhone: matchedContact ? matchedContact.phone : newDeal.realtorPhone || '(214) 555-0100',
      realtorEmail: matchedContact ? matchedContact.email : newDeal.realtorEmail || 'seller@apexacquire.com',
      realtorLicense: matchedContact ? matchedContact.licenseNumber : 'TREC #0000000',
      source: 'Direct Acquisition Entry',
      lastActivity: 'Manually created and assigned to ' + assignedUser.name,
      underwriting: {
        marketValue: Math.round(Number(newDeal.askingPrice) * 1.2),
        arv: Math.round(Number(newDeal.askingPrice) * 1.25),
        estimatedRehab: 45000,
        closingCosts: 8000,
        holdingCosts: 6000,
        targetWholesaleFee: 30000,
        calculatedMao: Math.round(Number(newDeal.askingPrice) * 1.25 * 0.80) - 45000,
        offerPrice: Math.round(Number(newDeal.askingPrice) * 0.90),
        estimatedProfit: 30000,
        roi: 22.5
      }
    });

    setShowAddDealModal(false);
    setNewDeal({
      address: '',
      city: 'Dallas',
      state: 'TX',
      zip: '75205',
      askingPrice: 450000,
      beds: 3,
      baths: 2,
      sqft: 2000,
      lotSize: '0.25 Acres',
      yearBuilt: 2000,
      propertyType: 'Single Family Residence',
      stage: 'New',
      temperature: 'Hot',
      ownerId: '',
      contactId: '',
      realtorName: '',
      realtorBrokerage: '',
      realtorPhone: '',
      realtorEmail: ''
    });
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="bg-[#F8FAFC] min-h-screen -m-6 p-4 sm:p-6 flex flex-col lg:flex-row gap-4 items-start text-xs">
      
      {/* 1. LEFT VIEWS SIDEBAR (Podio Style) */}
      <div className="w-full lg:w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 space-y-4 shrink-0">
        
        {/* Title & Info */}
        <div className="border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0B1F3A] flex items-center gap-1.5">
              <span>AI Deals & Offers</span>
            </h2>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Active acquisitions & property offers pipeline
          </p>
        </div>

        {/* Views Header & Save */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#0B1F3A]">Views</span>
            <button
              onClick={() => {
                setSelectedMemberFilter(null);
                setSelectedCategoryFilter(null);
                setSearch('');
              }}
              className="text-[#0284C7] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B]">Unsaved view</span>
            <div className="flex items-center gap-1.5">
              <button className="px-2 py-0.5 bg-[#0284C7] text-white font-bold text-[10px] rounded-md shadow-xs">
                Save
              </button>
              <span className="font-mono font-bold text-xs text-[#0B1F3A]">{activeDeals.length}</span>
            </div>
          </div>
        </div>

        {/* Team vs Private Tabs */}
        <div className="flex items-center border-b border-[#E2E8F0] text-xs font-bold">
          <button
            onClick={() => setSidebarTab('Team')}
            className={`pb-1.5 px-1 mr-4 cursor-pointer transition-colors ${
              sidebarTab === 'Team' ? 'text-[#0284C7] border-b-2 border-[#0284C7]' : 'text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setSidebarTab('Private')}
            className={`pb-1.5 px-1 cursor-pointer transition-colors ${
              sidebarTab === 'Private' ? 'text-[#0284C7] border-b-2 border-[#0284C7]' : 'text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Private
          </button>
        </div>

        {/* Views List */}
        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
          
          {/* Main All Offers Link */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedMemberFilter(null);
                setSelectedCategoryFilter(null);
              }}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left font-bold cursor-pointer transition-colors ${
                selectedMemberFilter === null && selectedCategoryFilter === null
                  ? 'text-[#0284C7] bg-[#E0F2FE]'
                  : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>All Deals & Offers</span>
              <span className="font-mono text-[11px]">{activeDeals.length}</span>
            </button>

            <button
              onClick={() => setSortByNewest(!sortByNewest)}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-[11px] font-semibold cursor-pointer transition-colors ${
                sortByNewest ? 'text-[#0284C7] bg-[#F0F9FF]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>Sort by last Activity Newest first</span>
              <span className="font-mono">{activeDeals.length}</span>
            </button>
          </div>

          {/* By Team Member Section */}
          <div className="space-y-1 pt-2 border-t border-[#F1F5F9]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] px-1.5">
              Assigned Team Members
            </div>

            {users.map(u => {
              const count = memberCounts[u.id] || 0;
              const isSelected = selectedMemberFilter === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedMemberFilter(isSelected ? null : u.id);
                    setSelectedCategoryFilter(null);
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left cursor-pointer transition-colors text-xs ${
                    isSelected ? 'text-[#0284C7] bg-[#E0F2FE] font-bold' : 'text-[#475569] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span className="truncate">{u.name}</span>
                  <span className="font-mono text-[11px] text-[#64748B]">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Need Manager ARV Section */}
          <div className="space-y-1 pt-2 border-t border-[#F1F5F9]">
            <button
              onClick={() => {
                setSelectedCategoryFilter(selectedCategoryFilter === 'NEED_MANAGER_ARV' ? null : 'NEED_MANAGER_ARV');
                setSelectedMemberFilter(null);
              }}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left font-bold cursor-pointer transition-colors text-xs ${
                selectedCategoryFilter === 'NEED_MANAGER_ARV' ? 'text-[#0284C7] bg-[#E0F2FE]' : 'text-[#0B1F3A] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>Need Manager ARV</span>
              <span className="font-mono text-[11px] text-[#0284C7] font-bold">{needArvCount}</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategoryFilter(selectedCategoryFilter === 'UNDER_CONTRACT' ? null : 'UNDER_CONTRACT');
                setSelectedMemberFilter(null);
              }}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left font-semibold cursor-pointer transition-colors text-xs ${
                selectedCategoryFilter === 'UNDER_CONTRACT' ? 'text-emerald-700 bg-emerald-50' : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>Under Contract</span>
              <span className="font-mono text-[11px] text-[#64748B]">
                {activeDeals.filter(d => normalizeDealStage(d.stage) === 'Contract').length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategoryFilter(selectedCategoryFilter === 'CLOSED' ? null : 'CLOSED');
                setSelectedMemberFilter(null);
              }}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left font-semibold cursor-pointer transition-colors text-xs ${
                selectedCategoryFilter === 'CLOSED' ? 'text-purple-700 bg-purple-50' : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>Closed & Funded</span>
              <span className="font-mono text-[11px] text-[#64748B]">
                {activeDeals.filter(d => normalizeDealStage(d.stage) === 'Closed').length}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. MAIN TABLE LIST CONTENT AREA (Podio Style Table) */}
      <div className="flex-1 w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
        
        {/* Top Actions & Toolbar */}
        <div className="p-3.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-white">
          
          {/* Left Toolbar Icons & Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#64748B] relative">
              
              {/* 1. View / Density Mode Toggle Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDensityMenu(!showDensityMenu);
                    setShowColumnMenu(false);
                    setShowFilterMenu(false);
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    showDensityMenu || densityMode === 'compact'
                      ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#0B1F3A]'
                  }`}
                  title="Toggle Display Density / Layout Mode"
                >
                  <TableIcon className="w-4 h-4" />
                </button>

                {showDensityMenu && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-fadeIn text-xs">
                    <span className="text-[10px] font-bold uppercase text-[#94A3B8] px-2 block">Table Density</span>
                    <button
                      onClick={() => {
                        setDensityMode('comfortable');
                        setShowDensityMenu(false);
                      }}
                      className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between font-semibold cursor-pointer ${
                        densityMode === 'comfortable' ? 'bg-[#E0F2FE] text-[#0284C7] font-bold' : 'hover:bg-[#F8FAFC] text-[#0B1F3A]'
                      }`}
                    >
                      <span>Comfortable (Default)</span>
                      {densityMode === 'comfortable' && <Check className="w-3.5 h-3.5 text-[#0284C7]" />}
                    </button>
                    <button
                      onClick={() => {
                        setDensityMode('compact');
                        setShowDensityMenu(false);
                      }}
                      className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between font-semibold cursor-pointer ${
                        densityMode === 'compact' ? 'bg-[#E0F2FE] text-[#0284C7] font-bold' : 'hover:bg-[#F8FAFC] text-[#0B1F3A]'
                      }`}
                    >
                      <span>Compact (Dense Rows)</span>
                      {densityMode === 'compact' && <Check className="w-3.5 h-3.5 text-[#0284C7]" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Column Settings Customizer Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowColumnMenu(!showColumnMenu);
                    setShowDensityMenu(false);
                    setShowFilterMenu(false);
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    showColumnMenu
                      ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                  }`}
                  title="Configure Visible Columns"
                >
                  <Sliders className="w-4 h-4" />
                </button>

                {showColumnMenu && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-30 p-3 space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
                      <span className="font-bold text-xs text-[#0B1F3A]">Visible Columns</span>
                      <button
                        onClick={() => setVisibleColumns({
                          address: true, date: true, teamMember: true, arv: true,
                          status: true, temperature: true, price: true, realtor: true, action: true
                        })}
                        className="text-[10px] text-[#0284C7] font-bold hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {[
                        { key: 'address', label: 'Property Address' },
                        { key: 'date', label: 'Date' },
                        { key: 'teamMember', label: 'Team Member' },
                        { key: 'arv', label: 'Manager Check ARV' },
                        { key: 'status', label: 'Status' },
                        { key: 'temperature', label: 'Temperature' },
                        { key: 'price', label: 'Asking Price' },
                        { key: 'realtor', label: 'Realtor / Agent' },
                        { key: 'action', label: 'Action (Open)' }
                      ].map(col => (
                        <label key={col.key} className="flex items-center gap-2 p-1 hover:bg-[#F8FAFC] rounded-lg cursor-pointer text-[#475569]">
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key as keyof typeof visibleColumns]}
                            onChange={(e) => setVisibleColumns({
                              ...visibleColumns,
                              [col.key]: e.target.checked
                            })}
                            className="rounded border-[#CBD5E1] text-[#0284C7] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="font-medium text-[11px]">{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Advanced Filters Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu);
                    setShowDensityMenu(false);
                    setShowColumnMenu(false);
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer relative ${
                    showFilterMenu || hasActiveAdvancedFilters
                      ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                  }`}
                  title="Filter Deals List"
                >
                  <Filter className="w-4 h-4" />
                  {hasActiveAdvancedFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] absolute top-1 right-1" />
                  )}
                </button>

                {showFilterMenu && (
                  <div className="absolute left-0 mt-1.5 w-72 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-30 p-3.5 space-y-2.5 animate-fadeIn text-xs max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
                      <span className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-[#0284C7]" /> Filter Pipeline
                      </span>
                      {hasActiveAdvancedFilters && (
                        <button
                          onClick={() => {
                            setSelectedMemberFilter(null);
                            setSelectedCategoryFilter(null);
                            setFilterStage('ALL');
                            setFilterArvStatus('ALL');
                            setFilterTemp('ALL');
                            setFilterDatePreset('ALL');
                            setFilterCreatedDate('');
                            setMinPrice('');
                            setMaxPrice('');
                          }}
                          className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {/* 1. Team Member Filter (2-Way Synced with Sidebar) */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">
                        Team Member (Responsible)
                      </label>
                      <select
                        value={selectedMemberFilter || 'ALL'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedMemberFilter(val === 'ALL' ? null : val);
                          setSelectedCategoryFilter(null);
                        }}
                        className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] font-semibold text-[#0B1F3A] cursor-pointer"
                      >
                        <option value="ALL">All Team Members</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Day Created Filter */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">
                        Day / Date Created
                      </label>
                      <div className="space-y-1.5">
                        <select
                          value={filterDatePreset}
                          onChange={(e) => {
                            setFilterDatePreset(e.target.value);
                            if (e.target.value !== 'CUSTOM') {
                              setFilterCreatedDate('');
                            }
                          }}
                          className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] font-semibold text-[#0B1F3A] cursor-pointer"
                        >
                          <option value="ALL">All Time (Any Day)</option>
                          <option value="TODAY">Today</option>
                          <option value="YESTERDAY">Yesterday</option>
                          <option value="LAST_7_DAYS">Last 7 Days</option>
                          <option value="LAST_30_DAYS">Last 30 Days</option>
                          <option value="THIS_MONTH">This Month</option>
                          <option value="CUSTOM">Specific Day (Pick Date)</option>
                        </select>
                        {filterDatePreset === 'CUSTOM' && (
                          <input
                            type="date"
                            value={filterCreatedDate}
                            onChange={(e) => setFilterCreatedDate(e.target.value)}
                            className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                          />
                        )}
                      </div>
                    </div>

                    {/* 3. Deal Stage */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">Deal Stage</label>
                      <select
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value)}
                        className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] font-semibold text-[#0B1F3A] cursor-pointer"
                      >
                        <option value="ALL">All Stages</option>
                        <option value="New">Active / New</option>
                        <option value="Reviewing">Reviewing / Qualifying</option>
                        <option value="Offer">Offer Made</option>
                        <option value="Negotiation">Pending Negotiation</option>
                        <option value="Contract">Under Contract</option>
                        <option value="Closed">Closed & Funded</option>
                        <option value="Lost">TRASH</option>
                      </select>
                    </div>

                    {/* 4. Manager Check ARV */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">Manager Check ARV</label>
                      <select
                        value={filterArvStatus}
                        onChange={(e) => setFilterArvStatus(e.target.value)}
                        className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] font-semibold text-[#0B1F3A] cursor-pointer"
                      >
                        <option value="ALL">All ARV Statuses</option>
                        <option value="Approved">Manager Approved ARV</option>
                        <option value="Ran">ARV RAN</option>
                        <option value="Need">Need Manager ARV</option>
                      </select>
                    </div>

                    {/* 5. Temperature */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">Temperature</label>
                      <select
                        value={filterTemp}
                        onChange={(e) => setFilterTemp(e.target.value)}
                        className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px] font-semibold text-[#0B1F3A] cursor-pointer"
                      >
                        <option value="ALL">All Temperatures</option>
                        <option value="Hot">🔥 Hot</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Cold">❄️ Cold</option>
                      </select>
                    </div>

                    {/* 6. Asking Price Range */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">Asking Price Range ($)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="number"
                          placeholder="Min $"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px]"
                        />
                        <input
                          type="number"
                          placeholder="Max $"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full p-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[11px]"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            <div className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
              <span>{displayDeals.length} of {activeDeals.length}</span>
              <button
                onClick={() => {
                  setSelectedMemberFilter(null);
                  setSelectedCategoryFilter(null);
                  setSearch('');
                  setFilterStage('ALL');
                  setFilterArvStatus('ALL');
                  setFilterTemp('ALL');
                  setFilterDatePreset('ALL');
                  setFilterCreatedDate('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-[#0284C7] hover:underline font-bold cursor-pointer"
              >
                Show all
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals, address, realtor..."
                className="w-full pl-7 pr-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1.5 text-[#94A3B8]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[#64748B] font-semibold">
              <span>Reports</span>
              <button className="flex items-center gap-0.5 hover:text-[#0B1F3A] cursor-pointer">
                <span>Create report</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setShowAddDealModal(true)}
                className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Deal
              </button>
            )}
          </div>

        </div>

        {/* FULL DATA TABLE (Exact Podio Layout) */}
        <div className="overflow-x-auto min-h-[480px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] font-bold text-[11px] select-none">
                
                {/* Checkbox */}
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={displayDeals.length > 0 && selectedDealIds.length === displayDeals.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#CBD5E1] text-[#0284C7] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                  />
                </th>

                {/* Index # */}
                <th className="py-2.5 px-2 w-8 text-[#94A3B8] font-mono">#</th>

                {/* Property Address */}
                {visibleColumns.address && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[220px]">
                    *Property Address:
                  </th>
                )}

                {/* Date */}
                {visibleColumns.date && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[90px]">
                    *Date
                  </th>
                )}

                {/* Team Member */}
                {visibleColumns.teamMember && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[120px]">
                    Team Member:
                  </th>
                )}

                {/* Manager Check ARV */}
                {visibleColumns.arv && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[150px]">
                    Manager Check ARV
                  </th>
                )}

                {/* Status */}
                {visibleColumns.status && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[80px]">
                    Status:
                  </th>
                )}

                {/* Temperature */}
                {visibleColumns.temperature && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[90px]">
                    Temperature
                  </th>
                )}

                {/* Asking Price */}
                {visibleColumns.price && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[100px]">
                    Asking Price
                  </th>
                )}

                {/* Realtor / Agent */}
                {visibleColumns.realtor && (
                  <th className="py-2.5 px-3 font-bold text-[#0B1F3A] min-w-[130px]">
                    Realtor / Agent
                  </th>
                )}

                {/* Action */}
                {visibleColumns.action && (
                  <th className="py-2.5 px-3 text-right font-bold text-[#0B1F3A] w-16">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {displayDeals.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-[#64748B]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="font-bold text-sm text-[#0B1F3A]">No matching deals found</p>
                      <p className="text-xs text-[#64748B]">
                        Try clearing search filters or selecting "Show all" in the left sidebar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayDeals.map((deal, idx) => {
                  const isSelected = selectedDealIds.includes(deal.id);
                  const norm = normalizeDealStage(deal.stage);
                  const stageStyle = STAGE_CONFIG[norm] || STAGE_CONFIG['New'];

                  // ARV Manager Check Badge
                  const hasApprovedArv = deal.managerArvStatus === 'Manager Approved ARV' || (!deal.managerArvStatus && Boolean(deal.underwriting?.arv && norm !== 'New'));
                  const isArvRan = deal.managerArvStatus === 'ARV RAN' || (!deal.managerArvStatus && Boolean(deal.underwriting?.arv && norm === 'New'));
                  const isNeedManagerArv = deal.managerArvStatus === 'Need Manager ARV';

                  const rowPadding = densityMode === 'compact' ? 'py-1 px-3' : 'py-2.5 px-3';

                  return (
                    <tr
                      key={deal.id}
                      onClick={() => onSelectDeal(deal)}
                      className={`hover:bg-[#F0F9FF] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[#E0F2FE]/50' : idx % 2 === 1 ? 'bg-[#FCFDFE]' : 'bg-white'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className={`${rowPadding} text-center`} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectDeal(deal.id)}
                          className="rounded border-[#CBD5E1] text-[#0284C7] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                        />
                      </td>

                      {/* Row Index Number */}
                      <td className={`${densityMode === 'compact' ? 'py-1' : 'py-2.5'} px-2 font-mono text-[#94A3B8] text-[11px]`}>
                        {idx + 1}
                      </td>

                      {/* Property Address */}
                      {visibleColumns.address && (
                        <td className={rowPadding}>
                          <div className="font-bold text-xs text-[#0B1F3A] group-hover:text-[#0284C7] transition-colors leading-tight">
                            {deal.address}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {deal.city}, {deal.state} {deal.zip}
                          </div>
                        </td>
                      )}

                      {/* Date */}
                      {visibleColumns.date && (
                        <td className={`${rowPadding} whitespace-nowrap text-[#475569] font-mono text-[11px]`}>
                          {formatTableDate(deal.createdAt)}
                        </td>
                      )}

                      {/* Team Member */}
                      {visibleColumns.teamMember && (
                        <td className={`${rowPadding} whitespace-nowrap`}>
                          <span className="font-semibold text-xs text-[#0B1F3A]">
                            {deal.ownerName || 'Tristan Genzel'}
                          </span>
                        </td>
                      )}

                      {/* Manager Check ARV Badge */}
                      {visibleColumns.arv && (
                        <td className={`${rowPadding} whitespace-nowrap`}>
                          {hasApprovedArv ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#0284C7] text-white font-extrabold text-[10px] shadow-2xs tracking-wide">
                              Manager Approved ARV
                            </span>
                          ) : isArvRan ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#F59E0B] text-white font-extrabold text-[10px] shadow-2xs tracking-wide">
                              ARV RAN
                            </span>
                          ) : isNeedManagerArv ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#E2E8F0] text-[#475569] font-bold text-[10px]">
                              Need Manager ARV
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] text-[11px]">—</span>
                          )}
                        </td>
                      )}

                      {/* Status Badge */}
                      {visibleColumns.status && (
                        <td className={`${rowPadding} whitespace-nowrap`}>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${stageStyle.badgeBg} ${stageStyle.textColor} ${stageStyle.borderColor}`}>
                            {stageStyle.label}
                          </span>
                        </td>
                      )}

                      {/* Temperature Pill */}
                      {visibleColumns.temperature && (
                        <td className={`${rowPadding} whitespace-nowrap`}>
                          {norm === 'Lost' ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#475569] text-white font-bold text-[10px]">
                              TRASH
                            </span>
                          ) : deal.temperature === 'Warm' ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#84CC16]/20 text-[#4D7C0F] border border-[#A3E635] font-extrabold text-[10px]">
                              WARM
                            </span>
                          ) : deal.temperature === 'Hot' ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-[10px]">
                              HOT
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] text-[11px]">0.00</span>
                          )}
                        </td>
                      )}

                      {/* Asking Price */}
                      {visibleColumns.price && (
                        <td className={`${rowPadding} whitespace-nowrap font-black text-xs text-[#0B1F3A]`}>
                          ${(deal.askingPrice || 0).toLocaleString()}
                        </td>
                      )}

                      {/* Realtor / Agent */}
                      {visibleColumns.realtor && (
                        <td className={`${rowPadding} whitespace-nowrap text-[#475569]`}>
                          <div className="font-semibold text-xs text-[#0B1F3A]">{deal.realtorName}</div>
                          <div className="text-[10px] text-[#64748B]">{deal.realtorBrokerage}</div>
                        </td>
                      )}

                      {/* Action */}
                      {visibleColumns.action && (
                        <td className={`${rowPadding} text-right`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDeal(deal);
                            }}
                            className="px-2.5 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-[11px] rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            Open <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      )}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
          <span>Showing {displayDeals.length} of {activeDeals.length} Total Property Deals</span>
          <div className="flex items-center gap-2 font-semibold">
            <span>Page 1 of 1</span>
          </div>
        </div>

      </div>

      {/* 3. ADD MANUAL DEAL MODAL */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#0B1F3A]">
                  Add New Property Deal / Offer
                </h2>
              </div>
              <button onClick={() => setShowAddDealModal(false)} className="text-[#94A3B8] hover:text-[#0B1F3A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[#475569] font-bold mb-1">
                  Property Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2014 Arizona Avenue"
                  value={newDeal.address}
                  onChange={(e) => setNewDeal({ ...newDeal, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={newDeal.city}
                    onChange={(e) => setNewDeal({ ...newDeal, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">State</label>
                  <input
                    type="text"
                    value={newDeal.state}
                    onChange={(e) => setNewDeal({ ...newDeal, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Zip</label>
                  <input
                    type="text"
                    value={newDeal.zip}
                    onChange={(e) => setNewDeal({ ...newDeal, zip: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Asking Price ($)</label>
                  <input
                    type="number"
                    value={newDeal.askingPrice}
                    onChange={(e) => setNewDeal({ ...newDeal, askingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Beds</label>
                  <input
                    type="number"
                    value={newDeal.beds}
                    onChange={(e) => setNewDeal({ ...newDeal, beds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Baths</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDeal.baths}
                    onChange={(e) => setNewDeal({ ...newDeal, baths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">SqFt</label>
                  <input
                    type="number"
                    value={newDeal.sqft}
                    onChange={(e) => setNewDeal({ ...newDeal, sqft: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Assign Team Member */}
                <div>
                  <label className="block text-[#475569] font-bold mb-1">
                    Assign Team Member <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newDeal.ownerId || (users.find(u => u.role === 'AGENT')?.id || currentUser.id)}
                    onChange={(e) => setNewDeal({ ...newDeal, ownerId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-semibold cursor-pointer focus:outline-none focus:border-[#0284C7]"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Connect Realtor / Contact */}
                <div>
                  <label className="block text-[#475569] font-bold mb-1">
                    Connect Realtor / Contact
                  </label>
                  <select
                    value={newDeal.contactId}
                    onChange={(e) => setNewDeal({ ...newDeal, contactId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] cursor-pointer focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="">Select an existing CRM Realtor contact...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.brokerage || c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-bold text-xs rounded-xl hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Create Deal
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
