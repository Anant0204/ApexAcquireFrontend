import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PropertyDeal, DealStage, ContactTemperature } from '../types/crm';
import {
  Table as TableIcon,
  Kanban,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
  Building2,
  Home,
  Zap,
  AlertTriangle,
  ArrowRightLeft,
  ChevronDown,
  Check,
  Calendar,
  Layers,
  ArrowUpDown,
  Loader2
} from 'lucide-react';

interface DealsProps {
  onSelectDeal: (deal: PropertyDeal) => void;
}

export const PIPELINE_STAGES: DealStage[] = [
  'New Property',
  'Qualifying',
  'Offer Made',
  'Offer Accepted',
  'Offer Rejected',
  'TRASH',
  'Duplicate Lead',
  'Need Help'
];

export const STAGES = PIPELINE_STAGES;

export const normalizeDealStage = (stage?: string): DealStage => {
  if (!stage) return 'New Property';
  if (stage === 'New') return 'New Property';
  if (stage === 'Reviewing') return 'Qualifying';
  if (stage === 'Offer') return 'Offer Made';
  if (stage === 'Contract') return 'Offer Accepted';
  if (stage === 'Closed') return 'Offer Accepted';
  if (stage === 'Lost') return 'Offer Rejected';
  return stage as DealStage;
};

export interface StageVisualConfig {
  label: string;
  shortLabel: string;
  gradientHeader: string;
  glowBg: string;
  badgeStyle: string;
  cardStripe: string;
  icon?: string;
  badgeBg?: string;
  textColor?: string;
  borderColor?: string;
}

export const DEFAULT_STAGE_CONFIG: StageVisualConfig = {
  label: 'DEAL',
  shortLabel: 'Deal',
  gradientHeader: 'bg-gradient-to-r from-[#0B1F3A] via-[#155EEF] to-[#2563EB] text-white',
  glowBg: 'bg-[#155EEF]/25',
  badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
  cardStripe: 'bg-[#155EEF]',
  icon: '⚡',
  badgeBg: 'bg-blue-50',
  textColor: 'text-[#155EEF]',
  borderColor: 'border-blue-200'
};

export const STAGE_CONFIG: Record<string, StageVisualConfig> = {
  'New Property': {
    label: 'NEW PROPERTY',
    shortLabel: 'New',
    gradientHeader: 'bg-gradient-to-r from-[#0B1F3A] via-[#155EEF] to-[#2563EB] text-white',
    glowBg: 'bg-[#155EEF]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#155EEF]',
    icon: '⚡',
    badgeBg: 'bg-blue-50',
    textColor: 'text-[#155EEF]',
    borderColor: 'border-blue-200'
  },
  'Qualifying': {
    label: 'QUALIFYING',
    shortLabel: 'Qualifying',
    gradientHeader: 'bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#2DD4BF] text-white',
    glowBg: 'bg-[#14B8A6]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#14B8A6]',
    icon: '🔍',
    badgeBg: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200'
  },
  'Offer Made': {
    label: 'OFFER MADE',
    shortLabel: 'Offer Made',
    gradientHeader: 'bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] text-white',
    glowBg: 'bg-[#2563EB]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#2563EB]',
    icon: '📝',
    badgeBg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  'Offer Accepted': {
    label: 'OFFER ACCEPTED',
    shortLabel: 'Accepted',
    gradientHeader: 'bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] text-white',
    glowBg: 'bg-[#10B981]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#10B981]',
    icon: '🤝',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  'Offer Rejected': {
    label: 'OFFER REJECTED',
    shortLabel: 'Rejected',
    gradientHeader: 'bg-gradient-to-r from-[#475569] via-[#64748B] to-[#94A3B8] text-white',
    glowBg: 'bg-[#64748B]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#64748B]',
    icon: '❌',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300'
  },
  'TRASH': {
    label: 'TRASH',
    shortLabel: 'Trash',
    gradientHeader: 'bg-gradient-to-r from-[#334155] via-[#475569] to-[#64748B] text-white',
    glowBg: 'bg-[#475569]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#475569]',
    icon: '🗑️',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300'
  },
  'Duplicate Lead': {
    label: 'DUPLICATE LEAD',
    shortLabel: 'Duplicate',
    gradientHeader: 'bg-gradient-to-r from-[#7C2D12] via-[#9A3412] to-[#C2410C] text-white',
    glowBg: 'bg-[#C2410C]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#C2410C]',
    icon: '⚠️',
    badgeBg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  'Need Help': {
    label: 'NEED HELP (MANAGER)',
    shortLabel: 'Need Help',
    gradientHeader: 'bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white',
    glowBg: 'bg-[#DC2626]/25',
    badgeStyle: 'bg-white/25 backdrop-blur-md text-white border border-white/30 animate-pulse',
    cardStripe: 'bg-[#DC2626]',
    icon: '🚨',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200'
  },
  'New': {
    label: 'NEW PROPERTY',
    shortLabel: 'New',
    gradientHeader: 'bg-gradient-to-r from-[#0B1F3A] via-[#155EEF] to-[#2563EB] text-white',
    glowBg: 'bg-[#155EEF]/25',
    badgeStyle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
    cardStripe: 'bg-[#155EEF]',
    icon: '⚡',
    badgeBg: 'bg-blue-50',
    textColor: 'text-[#155EEF]',
    borderColor: 'border-blue-200'
  }
};

export const getStageConfig = (stage: string): StageVisualConfig => {
  return STAGE_CONFIG[stage] || {
    ...DEFAULT_STAGE_CONFIG,
    label: stage.toUpperCase(),
    shortLabel: stage
  };
};

export const DealsPage: React.FC<DealsProps> = ({ onSelectDeal }) => {
  const { deals, addDeal, updateDealStage, archiveDeal, deleteDeal, bulkDeleteDeals, contacts, users, currentUser, hasPermission } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedView, setSelectedView] = useState<'ALL' | 'SORT_ACTIVITY' | 'NEED_MANAGER_ARV' | 'UNDER_CONTRACT' | 'CLOSED_FUNDED'>('ALL');
  const [selectedOwner, setSelectedOwner] = useState<string>('ALL');
  const [viewTab, setViewTab] = useState<'team' | 'private'>('team');
  const [search, setSearch] = useState('');
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [activeJumpStage, setActiveJumpStage] = useState<DealStage | null>(null);

  // Modals state
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [archivingDealId, setArchivingDealId] = useState<string | null>(null);
  // Delete confirmation modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    dealId?: string;
    dealAddress?: string;
    count?: number;
  }>({ isOpen: false, type: 'single' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteSingle = (dealId: string, address: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteModalState({
      isOpen: true,
      type: 'single',
      dealId,
      dealAddress: address
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedDealIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'bulk',
      count: selectedDealIds.length
    });
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      if (deleteModalState.type === 'single' && deleteModalState.dealId) {
        const id = deleteModalState.dealId;
        setApiDeals(prev => prev.filter(d => d.id !== id));
        setSelectedDealIds(prev => prev.filter(i => i !== id));
        if (deleteDeal) {
          await deleteDeal(id);
        } else {
          await archiveDeal(id);
        }
      } else if (deleteModalState.type === 'bulk') {
        const idsToDelete = [...selectedDealIds];
        setApiDeals(prev => prev.filter(d => !idsToDelete.includes(d.id)));
        setSelectedDealIds([]);
        if (bulkDeleteDeals) {
          await bulkDeleteDeals(idsToDelete);
        }
      }
    } catch (err) {
      console.error('Error deleting deal(s):', err);
    } finally {
      setIsDeleting(false);
      setDeleteModalState({ isOpen: false, type: 'single' });
    }
  };


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
    realtorEmail: '',
    ownerId: currentUser.id,
    managerArvStatus: 'Need Manager ARV' as 'Need Manager ARV' | 'ARV RAN' | 'Manager Approved ARV'
  });

  const [apiDeals, setApiDeals] = useState<PropertyDeal[]>([]);
  const [dbContacts, setDbContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDeals = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/deals/pipeline`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized: PropertyDeal[] = json.data.map((d: any) => ({
            id: d.id,
            address: d.address || '',
            city: d.city || '',
            state: d.state || '',
            zip: d.zip || '',
            askingPrice: d.askingPrice || 0,
            beds: d.propertyDetails?.beds ?? d.beds ?? 3,
            baths: d.propertyDetails?.baths ?? d.baths ?? 2,
            sqft: d.propertyDetails?.sqft ?? d.sqft ?? 0,
            yearBuilt: d.propertyDetails?.yearBuilt ?? d.yearBuilt ?? 2000,
            propertyType: d.propertyType || 'Single Family Residence',
            stage: normalizeDealStage(d.stage),
            temperature: d.temperature || 'Warm',
            managerArvStatus: d.managerArvStatus || (d.id === 'dl-1' ? 'ARV RAN' : 'Manager Approved ARV'),
            contactId: d.contactId || '',
            realtorName: d.realtorName || d.contactName || 'Realtor',
            realtorBrokerage: d.realtorBrokerage || 'Brokerage',
            isAiInbound: !!d.isAiInbound,
            ownerId: d.ownerId || currentUser.id,
            ownerName: d.ownerName || currentUser.name,
            grade: d.grade || 'B',
            score: d.score || 80,
            isArchived: !!d.isArchived,
            createdAt: d.createdAt || '09/16/2026',
            updatedAt: d.updatedAt || '09/16/2026'
          }));
          setApiDeals(normalized);
        }
      } catch (e) {
        if (deals && deals.length > 0) {
          setApiDeals(deals.map(d => ({ ...d, stage: normalizeDealStage(d.stage) })));
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/contacts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbContacts(json.data);
        }
      } catch (e) {}
    };

    fetchDeals();
    fetchContacts();
  }, [deals, currentUser]);

  const combinedDeals = React.useMemo(() => {
    const dealsMap = new Map();
    // 1. Add context deals
    if (Array.isArray(deals)) {
      deals.forEach(d => {
        if (d && d.id) dealsMap.set(d.id, { ...d, stage: normalizeDealStage(d.stage) });
      });
    }
    // 2. Merge apiDeals from backend
    if (Array.isArray(apiDeals)) {
      apiDeals.forEach(d => {
        if (d && d.id) dealsMap.set(d.id, { ...d, stage: normalizeDealStage(d.stage) });
      });
    }
    return Array.from(dealsMap.values());
  }, [deals, apiDeals]);

  const activeDeals = combinedDeals.filter(d => !d.isArchived);

  // Filter deals based on view, owner, and search
  const filteredDeals = activeDeals.filter((d) => {
    // Owner filter
    if (selectedOwner !== 'ALL') {
      const matchOwner = d.ownerId === selectedOwner || d.ownerName?.toLowerCase() === selectedOwner.toLowerCase();
      if (!matchOwner) return false;
    }

    // View filter
    if (selectedView === 'NEED_MANAGER_ARV') {
      if (d.managerArvStatus !== 'Need Manager ARV') return false;
    } else if (selectedView === 'UNDER_CONTRACT') {
      const norm = normalizeDealStage(d.stage);
      if (norm !== 'Offer Accepted') return false;
    } else if (selectedView === 'CLOSED_FUNDED') {
      if (d.stage !== 'Closed' && d.stage !== 'Offer Accepted') return false;
    }

    // Search filter
    const matchesSearch = d.address.toLowerCase().includes(search.toLowerCase()) ||
      (d.realtorName && d.realtorName.toLowerCase().includes(search.toLowerCase())) ||
      (d.ownerName && d.ownerName.toLowerCase().includes(search.toLowerCase())) ||
      d.city.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    if (selectedView === 'SORT_ACTIVITY') {
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    }
    return 0;
  });

  const canCreateDeal = hasPermission('AI Deals & Offers', 'CREATE');
  const canEditDeal = hasPermission('AI Deals & Offers', 'EDIT');
  const canDeleteDeal = hasPermission('AI Deals & Offers', 'DELETE');

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    if (!canEditDeal) return;
    e.dataTransfer.setData('dealId', dealId);
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEditDeal) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDealStageChange = async (dealId: string, targetStage: DealStage) => {
    if (!canEditDeal) return;
    setApiDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return { ...d, stage: targetStage };
      }
      return d;
    }));
    updateDealStage(dealId, targetStage);

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/deals/${dealId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stage: targetStage })
      });
    } catch (err) {
      console.error('Error updating deal stage in backend:', err);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId') || e.dataTransfer.getData('text/plain');
    if (dealId && canEditDeal) {
      handleDealStageChange(dealId, targetStage);
    }
  };

  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);

  const handleCreateDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingDeal) return;
    setIsSubmittingDeal(true);

    try {
      const availableContacts = dbContacts.length > 0 ? dbContacts : contacts;
      const selectedContact = availableContacts.find((c: any) => c.id === newDeal.contactId);
      const assignedUser = users.find(u => u.id === newDeal.ownerId) || currentUser;

      const token = localStorage.getItem('accessToken');
      const payload = {
        address: newDeal.address,
        city: newDeal.city || 'Dallas',
        state: newDeal.state || 'TX',
        zip: newDeal.zip || '75205',
        askingPrice: Number(newDeal.askingPrice) || 0,
        beds: Number(newDeal.beds) || 3,
        baths: Number(newDeal.baths) || 2,
        sqft: Number(newDeal.sqft) || 2000,
        yearBuilt: Number(newDeal.yearBuilt) || 2000,
        propertyType: newDeal.propertyType || 'Single Family Residence',
        stage: newDeal.stage || 'New Property',
        contactId: newDeal.contactId || undefined,
        realtorName: selectedContact ? selectedContact.name : (newDeal.realtorName || 'New Realtor'),
        realtorBrokerage: selectedContact ? selectedContact.brokerage : (newDeal.realtorBrokerage || 'Independent'),
        realtorPhone: selectedContact ? selectedContact.phone : (newDeal.realtorPhone || '5550000000'),
        realtorEmail: selectedContact ? selectedContact.email : (newDeal.realtorEmail || `realtor_${Date.now()}@apexacquire.local`),
        ownerId: assignedUser.id,
        grade: 'B'
      };

      const res = await fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        const formattedCreatedDeal: PropertyDeal = {
          id: d.id,
          address: d.address || payload.address,
          city: d.city || payload.city,
          state: d.state || payload.state,
          zip: d.zip || payload.zip,
          askingPrice: d.askingPrice ?? payload.askingPrice,
          beds: d.propertyDetails?.beds ?? d.beds ?? payload.beds,
          baths: d.propertyDetails?.baths ?? d.baths ?? payload.baths,
          sqft: d.propertyDetails?.sqft ?? d.sqft ?? payload.sqft,
          yearBuilt: d.propertyDetails?.yearBuilt ?? d.yearBuilt ?? payload.yearBuilt,
          propertyType: d.propertyDetails?.type ?? payload.propertyType,
          stage: normalizeDealStage(d.stage || payload.stage),
          temperature: newDeal.temperature,
          managerArvStatus: newDeal.managerArvStatus,
          contactId: d.contactId || payload.contactId || '',
          realtorName: d.realtorName || payload.realtorName,
          realtorBrokerage: d.realtorBrokerage || payload.realtorBrokerage,
          realtorPhone: payload.realtorPhone,
          realtorEmail: payload.realtorEmail,
          isAiInbound: false,
          ownerId: d.ownerId || assignedUser.id,
          ownerName: d.ownerName || assignedUser.name,
          grade: d.grade || 'B',
          score: 80,
          source: 'Acquisition Desk Manual Entry',
          createdAt: d.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: d.updatedAt || 'Just now'
        };

        setApiDeals(prev => [formattedCreatedDeal, ...prev]);
        addDeal(formattedCreatedDeal);
      } else {
        const localDealPayload: Omit<PropertyDeal, 'id' | 'createdAt' | 'updatedAt'> = {
          address: newDeal.address,
          city: newDeal.city,
          state: newDeal.state,
          zip: newDeal.zip,
          askingPrice: Number(newDeal.askingPrice),
          beds: Number(newDeal.beds),
          baths: Number(newDeal.baths),
          sqft: Number(newDeal.sqft),
          yearBuilt: Number(newDeal.yearBuilt),
          propertyType: newDeal.propertyType,
          stage: newDeal.stage,
          temperature: newDeal.temperature,
          managerArvStatus: newDeal.managerArvStatus,
          contactId: newDeal.contactId || (selectedContact ? selectedContact.id : `ct-${Date.now()}`),
          realtorName: selectedContact ? selectedContact.name : newDeal.realtorName || 'New Realtor',
          realtorBrokerage: selectedContact ? selectedContact.brokerage : newDeal.realtorBrokerage || 'Brokerage',
          realtorPhone: selectedContact ? selectedContact.phone : newDeal.realtorPhone || '5550000000',
          realtorEmail: selectedContact ? selectedContact.email : newDeal.realtorEmail || 'realtor@apexacquire.local',
          isAiInbound: false,
          ownerId: assignedUser.id,
          ownerName: assignedUser.name,
          grade: 'B',
          score: 80,
          source: 'Acquisition Desk Manual Entry'
        };
        addDeal(localDealPayload);
        const createdDeal: PropertyDeal = {
          ...localDealPayload,
          id: `dl-${Date.now()}`,
          createdAt: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          updatedAt: 'Just now'
        };
        setApiDeals(prev => [createdDeal, ...prev]);
      }

      setShowAddDealModal(false);
      setNewDeal({
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
        realtorEmail: '',
        ownerId: currentUser.id,
        managerArvStatus: 'Need Manager ARV' as 'Need Manager ARV' | 'ARV RAN' | 'Manager Approved ARV'
      });
    } catch (err) {
      console.error('Failed to create deal:', err);
    } finally {
      setIsSubmittingDeal(false);
    }
  };

  const handleSelectAllCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDealIds(filteredDeals.map(d => d.id));
    } else {
      setSelectedDealIds([]);
    }
  };

  const handleSelectDealCheckbox = (dealId: string) => {
    setSelectedDealIds(prev =>
      prev.includes(dealId) ? prev.filter(id => id !== dealId) : [...prev, dealId]
    );
  };

  const scrollToStage = (stage: DealStage) => {
    setActiveJumpStage(stage);
    const element = document.getElementById(`deal-column-${stage.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Dynamic Team member counts
  const teamMembersList = React.useMemo(() => {
    if (!users || users.length === 0) return [];
    return users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      count: activeDeals.filter(d => d.ownerId === u.id || (d.ownerName && u.name && d.ownerName.toLowerCase() === u.name.toLowerCase())).length
    }));
  }, [users, activeDeals]);

  const needArvCount = activeDeals.filter(d => d.managerArvStatus === 'Need Manager ARV' || d.stage === 'New Property' || d.stage === 'New').length;
  const underContractCount = activeDeals.filter(d => normalizeDealStage(d.stage) === 'Offer Accepted').length;
  const closedCount = activeDeals.filter(d => d.stage === 'Closed' || normalizeDealStage(d.stage) === 'Offer Accepted').length;

  if (loading) {
    return <div className="p-8 text-center text-[#475569] font-semibold">Loading Deals Workspace...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 max-w-full pb-12 animate-fadeIn font-sans">
      
      {/* 1. LEFT SIDEBAR: PODIO VIEWS & TEAM FILTERS */}
      <div className="w-full lg:w-64 shrink-0 space-y-4">
        
        {/* Title Header */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
          <h2 className="text-base font-black text-[#0B1F3A] tracking-tight">
            AI Deals & Offers
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Active acquisitions & property offers pipeline
          </p>
        </div>

        {/* Views Panel */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xs space-y-3">
          
          <div className="flex items-center justify-between text-xs font-bold text-[#0B1F3A]">
            <span>Views</span>
            {canCreateDeal && (
              <button 
                onClick={() => setShowAddDealModal(true)}
                className="text-[11px] text-[#155EEF] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                + Add
              </button>
            )}
          </div>

          {/* Unsaved view banner */}
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs">
            <span className="text-[#475569] text-[11px] font-medium">Unsaved view</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-[#155EEF] text-white text-[10px] font-bold rounded shadow-2xs">
                Save
              </span>
              <span className="text-xs font-bold text-[#0B1F3A]">{activeDeals.length}</span>
            </div>
          </div>

          {/* Team / Private Tabs */}
          <div className="flex items-center gap-2 pt-1 border-b border-[#E2E8F0] pb-2 text-xs">
            <button
              onClick={() => setViewTab('team')}
              className={`font-bold pb-0.5 cursor-pointer ${
                viewTab === 'team' ? 'text-[#155EEF] border-b-2 border-[#155EEF]' : 'text-[#64748B] hover:text-[#0B1F3A]'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setViewTab('private')}
              className={`font-bold pb-0.5 cursor-pointer ${
                viewTab === 'private' ? 'text-[#155EEF] border-b-2 border-[#155EEF]' : 'text-[#64748B] hover:text-[#0B1F3A]'
              }`}
            >
              Private
            </button>
          </div>

          {/* Views List */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedView('ALL');
                setSelectedOwner('ALL');
              }}
              className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedView === 'ALL' && selectedOwner === 'ALL'
                  ? 'bg-[#EAF2FF] text-[#155EEF]'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="truncate">All Deals & Offers</span>
              <span className="font-mono text-xs opacity-80">{activeDeals.length}</span>
            </button>

            <button
              onClick={() => setSelectedView('SORT_ACTIVITY')}
              className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedView === 'SORT_ACTIVITY'
                  ? 'bg-[#EAF2FF] text-[#155EEF]'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="truncate text-left text-[11px]">Sort by last Activity Newest first</span>
              <span className="font-mono text-xs opacity-80">{activeDeals.length}</span>
            </button>
          </div>

          {/* ASSIGNED TEAM MEMBERS */}
          <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] px-1">
              ASSIGNED TEAM MEMBERS
            </div>

            {teamMembersList.map((tm) => (
              <button
                key={tm.id || tm.name}
                onClick={() => setSelectedOwner(selectedOwner === tm.name || selectedOwner === tm.id ? 'ALL' : tm.name)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                  selectedOwner === tm.name || selectedOwner === tm.id
                    ? 'bg-[#155EEF] text-white font-bold'
                    : 'text-[#475569] hover:bg-[#F1F5F9] font-medium'
                }`}
              >
                <span className="truncate">{tm.name}</span>
                <span className="font-mono text-[11px] opacity-80">{tm.count}</span>
              </button>
            ))}
          </div>

          {/* Quick Stage Filters */}
          <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
            <button
              onClick={() => setSelectedView(selectedView === 'NEED_MANAGER_ARV' ? 'ALL' : 'NEED_MANAGER_ARV')}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                selectedView === 'NEED_MANAGER_ARV' ? 'bg-[#EAF2FF] text-[#155EEF] font-bold' : 'text-[#155EEF] hover:bg-blue-50 font-semibold'
              }`}
            >
              <span>Need Manager ARV</span>
              <span className="font-mono text-xs font-bold">{needArvCount}</span>
            </button>

            <button
              onClick={() => setSelectedView(selectedView === 'UNDER_CONTRACT' ? 'ALL' : 'UNDER_CONTRACT')}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                selectedView === 'UNDER_CONTRACT' ? 'bg-[#EAF2FF] text-[#155EEF] font-bold' : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Under Contract</span>
              <span className="font-mono text-xs font-bold">{underContractCount}</span>
            </button>

            <button
              onClick={() => setSelectedView(selectedView === 'CLOSED_FUNDED' ? 'ALL' : 'CLOSED_FUNDED')}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                selectedView === 'CLOSED_FUNDED' ? 'bg-[#EAF2FF] text-[#155EEF] font-bold' : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Closed & Funded</span>
              <span className="font-mono text-xs font-bold">{closedCount}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. RIGHT MAIN PANEL: PODIO MLS TABLE / KANBAN */}
      <div className="flex-1 space-y-4 min-w-0">
        
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: View switcher + Counts + Search */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* View Mode Icons */}
            <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-[#E2E8F0] rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#155EEF] shadow-2xs' : 'text-[#64748B] hover:text-[#0B1F3A]'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-[#155EEF] shadow-2xs' : 'text-[#64748B] hover:text-[#0B1F3A]'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedView('ALL');
                  setSelectedOwner('ALL');
                  setSearch('');
                }}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B1F3A] cursor-pointer"
                title="Reset Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Total Count Link */}
            <button
              onClick={() => {
                setSelectedView('ALL');
                setSelectedOwner('ALL');
                setSearch('');
              }}
              className="text-xs text-[#155EEF] hover:underline font-bold cursor-pointer shrink-0"
            >
              {filteredDeals.length} of {activeDeals.length} Show all
            </button>

            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals, address, realtor..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF]"
              />
            </div>

          </div>

          {/* Right: Reports & Add Deal Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            
            {selectedDealIds.length > 0 && canDeleteDeal && (
              <button
                onClick={handleOpenDeleteBulk}
                className="px-3.5 py-1.5 bg-[#E11D48] hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer animate-fadeIn"
                title="Delete selected deals"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedDealIds.length})</span>
              </button>
            )}

            <div className="relative">
              <button className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer">
                <span>Reports Create report</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>
            </div>

            {canCreateDeal && (
              <button
                onClick={() => setShowAddDealModal(true)}
                className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Deal
              </button>
            )}

          </div>

        </div>

        {/* 3. TABLE VIEW (Screenshot 1 Exact Replica) */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            {/* Multi-Select Action Banner */}
            {selectedDealIds.length > 0 && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  <span><strong>{selectedDealIds.length}</strong> deal{selectedDealIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDealIds([])}
                    className="px-2.5 py-1 rounded-lg text-xs text-[#64748B] hover:text-[#0B1F3A] hover:bg-rose-100 font-medium cursor-pointer"
                  >
                    Deselect All
                  </button>
                  {canDeleteDeal && (
                    <button
                      onClick={handleOpenDeleteBulk}
                      className="px-3 py-1 rounded-lg bg-[#E11D48] hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedDealIds.length})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#FAFCFF] text-[#475569] text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDealIds.length === filteredDeals.length && filteredDeals.length > 0}
                        onChange={handleSelectAllCheckbox}
                        className="rounded border-[#CBD5E1] text-[#155EEF] focus:ring-[#155EEF] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-2 w-8 text-center text-[#64748B]">#</th>
                    <th className="py-3 px-4 min-w-[200px]">*Property Address:</th>
                    <th className="py-3 px-3 min-w-[90px]">*Date</th>
                    <th className="py-3 px-3 min-w-[120px]">Team Member:</th>
                    <th className="py-3 px-3 min-w-[140px]">Manager Check ARV</th>
                    <th className="py-3 px-3 min-w-[90px]">Status:</th>
                    <th className="py-3 px-3 min-w-[90px]">Temperature</th>
                    <th className="py-3 px-3 min-w-[100px]">Asking Price</th>
                    <th className="py-3 px-4 min-w-[160px]">Realtor / Agent</th>
                    <th className="py-3 px-3 text-right min-w-[90px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-[#64748B]">
                        No deals found matching the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal, idx) => {
                      const isSelected = selectedDealIds.includes(deal.id);
                      const normStage = normalizeDealStage(deal.stage);

                      return (
                        <tr 
                          key={deal.id}
                          className={`hover:bg-[#F8FBFF] transition-colors cursor-pointer ${isSelected ? 'bg-[#F1F6FC]' : ''}`}
                          onClick={() => onSelectDeal(deal)}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectDealCheckbox(deal.id)}
                              className="rounded border-[#CBD5E1] text-[#155EEF] focus:ring-[#155EEF] cursor-pointer"
                            />
                          </td>

                          {/* Row Index */}
                          <td className="py-3.5 px-2 text-center font-mono text-[11px] text-[#64748B]">
                            {idx + 1}
                          </td>

                          {/* Property Address */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0B1F3A] hover:text-[#155EEF] transition-colors">
                              {deal.address}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {deal.city}, {deal.state} {deal.zip}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-3 font-mono text-[11px] text-[#475569]">
                            {deal.createdAt || '09/16/2026'}
                          </td>

                          {/* Team Member */}
                          <td className="py-3.5 px-3 font-medium text-[#0B1F3A]">
                            {deal.ownerName || 'Marcus Sterling'}
                          </td>

                          {/* Manager Check ARV */}
                          <td className="py-3.5 px-3">
                            {deal.managerArvStatus === 'ARV RAN' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded bg-[#F59E0B] text-white font-extrabold text-[9px] uppercase tracking-wide shadow-2xs">
                                ARV RAN
                              </span>
                            ) : deal.managerArvStatus === 'Need Manager ARV' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded bg-rose-500 text-white font-extrabold text-[9px] uppercase tracking-wide shadow-2xs">
                                Need Manager ARV
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded bg-[#1D4ED8] text-white font-extrabold text-[9px] uppercase tracking-wide shadow-2xs">
                                Manager Approved ARV
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            {normStage === 'New Property' || deal.stage === 'New' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px]">
                                Active
                              </span>
                            ) : normStage === 'Qualifying' || deal.stage === 'Reviewing' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-300 font-bold text-[10px]">
                                Pending
                              </span>
                            ) : normStage === 'Offer Made' || deal.stage === 'Offer' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-300 font-bold text-[10px]">
                                Offer Made
                              </span>
                            ) : normStage === 'Offer Accepted' || deal.stage === 'Contract' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300 font-bold text-[10px]">
                                Contract
                              </span>
                            ) : deal.stage === 'Closed' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold text-[10px]">
                                Closed
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px]">
                                {deal.stage}
                              </span>
                            )}
                          </td>

                          {/* Temperature */}
                          <td className="py-3.5 px-3">
                            {deal.temperature === 'Hot' ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-extrabold text-[9px] uppercase tracking-wide">
                                HOT
                              </span>
                            ) : deal.temperature === 'Warm' ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[9px] uppercase tracking-wide">
                                WARM
                              </span>
                            ) : deal.temperature === 'Cold' ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold text-[9px] uppercase tracking-wide">
                                COLD
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-extrabold text-[9px] uppercase tracking-wide">
                                TRASH
                              </span>
                            )}
                          </td>

                          {/* Asking Price */}
                          <td className="py-3.5 px-3 font-mono font-extrabold text-[#0B1F3A]">
                            ${deal.askingPrice.toLocaleString()}
                          </td>

                          {/* Realtor / Agent */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0B1F3A]">
                              {deal.realtorName || 'Sarah Jenkins'}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {deal.realtorBrokerage || 'Compass Real Estate DFW'}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onSelectDeal(deal)}
                                className="px-3 py-1 bg-[#155EEF] hover:bg-[#1048B5] text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                Open &gt;
                              </button>
                              {canDeleteDeal && (
                                <button
                                  onClick={(e) => handleOpenDeleteSingle(deal.id, deal.address, e)}
                                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#E11D48] hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                                  title="Delete Deal"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 bg-[#FAFCFF] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>Showing {filteredDeals.length} of {activeDeals.length} Total Property Deals</span>
              <span className="font-medium text-[#0B1F3A]">Page 1 of 1</span>
            </div>
          </div>
        )}

        {/* 4. KANBAN BOARD VIEW */}
        {viewMode === 'kanban' && (
          <div className="kanban-scroll-container flex gap-4 overflow-x-auto pb-8 pt-2 no-scrollbar">
            {STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter(d => normalizeDealStage(d.stage) === stage);
              const conf = getStageConfig(stage);

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
                        draggable={canEditDeal}
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onClick={() => onSelectDeal(deal)}
                        className="executive-panel executive-panel-hover rounded-2xl p-3.5 cursor-pointer border border-[#E2E8F0] group relative bg-white overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${conf.cardStripe}`} />

                        <div className="flex justify-between items-center mb-2 pl-1.5">
                          <div className="flex items-center gap-1.5">
                            {deal.temperature && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                deal.temperature === 'Hot' ? 'bg-rose-100 text-rose-700' :
                                deal.temperature === 'Warm' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {deal.temperature.toUpperCase()}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#EAF2FF] text-[#155EEF] rounded">
                              {deal.grade}
                            </span>
                          </div>
                          <span className="font-mono font-extrabold text-xs text-[#0B1F3A]">
                            ${deal.askingPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-[#0B1F3A] pl-1.5 group-hover:text-[#155EEF] transition-colors leading-snug mb-1">
                          {deal.address}
                        </div>
                        <div className="text-[10px] text-[#64748B] pl-1.5 mb-2">
                          {deal.city}, {deal.state} {deal.zip} &bull; {deal.beds}b/{deal.baths}ba
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] pl-1.5 text-[10px] text-[#64748B]">
                          <span className="font-medium truncate max-w-[110px]">{deal.realtorName}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{deal.createdAt || 'Recent'}</span>
                            {canDeleteDeal && (
                              <button
                                onClick={(e) => handleOpenDeleteSingle(deal.id, deal.address, e)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Deal"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="h-28 border-2 border-dashed border-[#CBD5E1] rounded-xl flex items-center justify-center text-xs text-[#94A3B8] font-medium">
                        Drop Deal Here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* CREATE DEAL MODAL */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Create New Property Deal</h3>
              </div>
              <button onClick={() => setShowAddDealModal(false)} className="text-[#64748B] hover:text-[#0B1F3A] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-[#475569] font-bold mb-1">Associate with Existing Realtor</label>
                <select
                  value={newDeal.contactId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const match = (dbContacts.length > 0 ? dbContacts : contacts).find((c: any) => c.id === cId);
                    setNewDeal({
                      ...newDeal,
                      contactId: cId,
                      realtorName: match ? match.name : '',
                      realtorBrokerage: match ? match.brokerage : '',
                      realtorPhone: match ? match.phone : '',
                      realtorEmail: match ? match.email : ''
                    });
                  }}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                >
                  <option value="">Create with New Realtor...</option>
                  {(dbContacts.length > 0 ? dbContacts : contacts).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} {c.brokerage ? `(${c.brokerage})` : (c.phone ? `(${c.phone})` : '')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">Property Address <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newDeal.address}
                  onChange={(e) => setNewDeal({ ...newDeal, address: e.target.value })}
                  placeholder="e.g. 7420 Armstrong Pkwy"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newDeal.city}
                    onChange={(e) => setNewDeal({ ...newDeal, city: e.target.value })}
                    className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newDeal.state}
                    onChange={(e) => setNewDeal({ ...newDeal, state: e.target.value })}
                    className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={newDeal.zip}
                    onChange={(e) => setNewDeal({ ...newDeal, zip: e.target.value })}
                    className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Assign Team Member</label>
                  <select
                    value={newDeal.ownerId}
                    onChange={(e) => setNewDeal({ ...newDeal, ownerId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-semibold cursor-pointer"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">Deal Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as DealStage })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-semibold cursor-pointer"
                  >
                    {STAGES.map(st => (
                      <option key={st} value={st}>{st}</option>
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
                  disabled={isSubmittingDeal}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingDeal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating Deal...
                    </>
                  ) : (
                    'Create Deal'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    
      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl border border-[#E2E8F0] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  {deleteModalState.type === 'bulk'
                    ? `Delete ${deleteModalState.count} Deals`
                    : 'Delete Property Deal'}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  This deal will be permanently removed from your pipeline.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed">
              {deleteModalState.type === 'bulk' ? (
                <span>
                  Are you sure you want to delete <strong className="text-rose-600">{deleteModalState.count}</strong> selected property deals?
                </span>
              ) : (
                <span>
                  Are you sure you want to delete deal for <strong className="text-[#0B1F3A]">{deleteModalState.dealAddress || 'this property'}</strong>?
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, type: 'single' })}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
};
