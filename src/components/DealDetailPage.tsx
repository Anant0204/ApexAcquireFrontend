import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PropertyDeal, RealtorContact, DealStage, ContactTemperature } from '../types/crm';
import { PIPELINE_STAGES, normalizeDealStage, STAGE_CONFIG } from './DealsPage';
import {
  ArrowLeft,
  Building,
  DollarSign,
  User,
  Phone,
  Mail,
  Flame,
  Calendar,
  Sparkles,
  FileCheck,
  Download,
  FileText,
  Calculator,
  Edit2,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Send,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronDown,
  Check,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DealDetailPageProps {
  deal: PropertyDeal;
  onBack: () => void;
  onOpenConversation: (convId: string) => void;
  onSelectContact?: (contact: RealtorContact) => void;
  onOpenCallModal?: (contact: RealtorContact) => void;
}

type WorkspaceTab = 'analysis' | 'conversation' | 'contact' | 'contracts' | 'timeline';

export const DealDetailPage: React.FC<DealDetailPageProps> = ({
  deal,
  onBack,
  onOpenConversation,
  onSelectContact,
  onOpenCallModal
}) => {
  const {
    deals,
    updateDeal,
    updateDealStage,
    assignDeal,
    addGeneratedContract,
    addDealActivity,
    currentUser,
    contacts,
    conversations,
    users,
    sendMessage
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('analysis');

  // Interactive Re-assignment Dropdown
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);

  // Major Work Needed Options (Podio Photo Replica)
  const MAJOR_WORK_OPTIONS = [
    { id: 'foundation', label: 'Foundation ($5,000)', cost: 5000 },
    { id: 'roof', label: 'Roof ($5,000)', cost: 5000 },
    { id: 'hvac', label: 'HVAC ($5,000)', cost: 5000 },
    { id: 'plumbing', label: 'Plumbing ($5,000)', cost: 5000 },
    { id: 'light_labor', label: 'Light Labor (15K)', cost: 15000 },
    { id: 'medium_labor', label: 'Medium Labor (30K)', cost: 30000 },
    { id: 'heavy_labor', label: 'Heavy Labor (50K)', cost: 50000 },
  ];

  // Financial Analysis State
  const [marketValueInput, setMarketValueInput] = useState<string>('');
  const [arvInput, setArvInput] = useState<string>('');
  const [rehabInput, setRehabInput] = useState<string>('');
  const [selectedMajorWork, setSelectedMajorWork] = useState<string[]>([]);
  const [estRentInput, setEstRentInput] = useState<string>('');
  const [conditionNotesInput, setConditionNotesInput] = useState<string>('');
  const [closingCostsInput, setClosingCostsInput] = useState<string>('');
  const [holdingCostsInput, setHoldingCostsInput] = useState<string>('');
  const [wholesaleFeeInput, setWholesaleFeeInput] = useState<string>('');
  const [offerPriceInput, setOfferPriceInput] = useState<string>('');
  const [analysisSuccessMsg, setAnalysisSuccessMsg] = useState<string | null>(null);
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [analysisSavedFeedback, setAnalysisSavedFeedback] = useState(false);

  // Property Specs State
  const [bedsInput, setBedsInput] = useState<number>(deal.beds || 3);
  const [bathsInput, setBathsInput] = useState<number>(deal.baths || 2);
  const [sqftInput, setSqftInput] = useState<number>(deal.sqft || 2000);
  const [lotSizeInput, setLotSizeInput] = useState<string>(deal.lotSize || '0.25 Acres');
  const [yearBuiltInput, setYearBuiltInput] = useState<number>(deal.yearBuilt || 2000);
  const [propertyTypeInput, setPropertyTypeInput] = useState<string>(deal.propertyType || 'Single Family Residence');

  // Contract Generator State
  const [selectedTemplate, setSelectedTemplate] = useState('TREC One to Four Family Residential Contract');
  const [contractPurchasePrice, setContractPurchasePrice] = useState<number>(deal.offerDetails?.purchasePrice || deal.askingPrice || 450000);
  const [contractEarnestMoney, setContractEarnestMoney] = useState<number>(deal.offerDetails?.earnestMoney || 5000);
  const [contractOptionFee, setContractOptionFee] = useState<number>(deal.offerDetails?.optionFee || 500);
  const [contractOptionDays, setContractOptionDays] = useState<number>(deal.offerDetails?.optionPeriodDays || 7);
  const [contractClosingDate, setContractClosingDate] = useState<string>(deal.offerDetails?.closingDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [contractBuyerEntity, setContractBuyerEntity] = useState<string>(deal.offerDetails?.buyerEntity || 'Apex Acquisitions DFW LLC');
  const [contractSpecialProvisions, setContractSpecialProvisions] = useState<string>(deal.offerDetails?.specialProvisions || 'AS-IS Cash settlement. Seller provides standard warranty deed.');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [contractSuccessMsg, setContractSuccessMsg] = useState<string | null>(null);

  // Quick Chat Reply in Deal View
  const [quickReplyText, setQuickReplyText] = useState('');

  // Sync state whenever deal changes
  useEffect(() => {
    if (deal) {
      setMarketValueInput(deal.underwriting?.marketValue?.toString() || Math.round((deal.askingPrice || 450000) * 1.2).toString());
      setArvInput(deal.underwriting?.arv?.toString() || Math.round((deal.askingPrice || 450000) * 1.25).toString());
      setRehabInput(deal.underwriting?.estimatedRehab?.toString() || '45000');
      setSelectedMajorWork(deal.underwriting?.majorWorkItems || []);
      setEstRentInput(deal.underwriting?.estimatedRent?.toString() || '2400');
      setConditionNotesInput(deal.underwriting?.conditionNotes || 'Property requires moderate cosmetic updates and roof inspection.');
      setClosingCostsInput(deal.underwriting?.closingCosts?.toString() || '8000');
      setHoldingCostsInput(deal.underwriting?.holdingCosts?.toString() || '6000');
      setWholesaleFeeInput(deal.underwriting?.targetWholesaleFee?.toString() || '30000');
      setOfferPriceInput(deal.underwriting?.offerPrice?.toString() || deal.offerDetails?.purchasePrice?.toString() || Math.round((deal.askingPrice || 450000) * 0.9).toString());
      
      setBedsInput(deal.beds || 3);
      setBathsInput(deal.baths || 2);
      setSqftInput(deal.sqft || 2000);
      setLotSizeInput(deal.lotSize || '0.25 Acres');
      setYearBuiltInput(deal.yearBuilt || 2000);
      setPropertyTypeInput(deal.propertyType || 'Single Family Residence');
    }
  }, [deal.id]);

  // Find linked contact & linked conversation
  const matchedContact = contacts.find(c => c.id === deal.contactId || c.name.toLowerCase() === deal.realtorName.toLowerCase());
  const matchedConversation = conversations.find(c => c.id === deal.conversationId || (matchedContact && c.contactId === matchedContact.id));

  // Computed Live Underwriting Values
  const arvNum = parseFloat(arvInput) || 0;
  const rehabNum = parseFloat(rehabInput) || 0;
  const closingNum = parseFloat(closingCostsInput) || 0;
  const holdingNum = parseFloat(holdingCostsInput) || 0;
  const feeNum = parseFloat(wholesaleFeeInput) || 0;
  const offerPriceNum = parseFloat(offerPriceInput) || 0;

  // Multi-Tier MAO (Podio Replica: (Estimated ARV * %) - Estimated Rehab)
  const mao80 = Math.max(0, Math.round((arvNum * 0.80) - rehabNum));
  const mao77 = Math.max(0, Math.round((arvNum * 0.77) - rehabNum));
  const mao75 = Math.max(0, Math.round((arvNum * 0.75) - rehabNum));
  const mao70 = Math.max(0, Math.round((arvNum * 0.70) - rehabNum));

  // Primary MAO (80% Standard)
  const calculatedMao = mao80;
  const estimatedProfit = Math.max(0, arvNum - rehabNum - closingNum - holdingNum - offerPriceNum);
  const roi = offerPriceNum > 0 ? ((estimatedProfit / (offerPriceNum + rehabNum)) * 100).toFixed(1) : '0';

  const isReadOnly = currentUser.role === 'READ_ONLY';
  const normStage = normalizeDealStage(deal.stage);
  const stageConfig = STAGE_CONFIG[normStage] || STAGE_CONFIG['New'];

  // Toggle Major Work Pills (Podio replica)
  const handleToggleMajorWork = (workId: string) => {
    if (isReadOnly) return;
    let next: string[];
    if (selectedMajorWork.includes(workId)) {
      next = selectedMajorWork.filter(id => id !== workId);
    } else {
      next = [...selectedMajorWork, workId];
    }
    setSelectedMajorWork(next);

    // Auto-sum selected pills into rehab
    const totalSelected = next.reduce((sum, id) => {
      const found = MAJOR_WORK_OPTIONS.find(o => o.id === id);
      return sum + (found ? found.cost : 0);
    }, 0);
    setRehabInput(totalSelected > 0 ? totalSelected.toString() : '');
  };

  // Save Underwriting Numbers
  const handleSaveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || isSavingAnalysis) return;
    setIsSavingAnalysis(true);

    const updatedUnderwriting = {
      marketValue: parseFloat(marketValueInput) || arvNum * 0.95,
      arv: arvNum,
      estimatedRehab: rehabNum,
      closingCosts: closingNum,
      holdingCosts: holdingNum,
      targetWholesaleFee: feeNum,
      calculatedMao: mao80,
      mao80,
      mao77,
      mao75,
      mao70,
      estimatedRent: parseFloat(estRentInput) || undefined,
      conditionNotes: conditionNotesInput,
      majorWorkItems: selectedMajorWork,
      offerPrice: offerPriceNum,
      estimatedProfit,
      roi: parseFloat(roi)
    };

    updateDeal(deal.id, {
      beds: bedsInput,
      baths: bathsInput,
      sqft: sqftInput,
      lotSize: lotSizeInput,
      yearBuilt: yearBuiltInput,
      propertyType: propertyTypeInput,
      underwriting: updatedUnderwriting
    });

    addDealActivity(deal.id, {
      type: 'underwriting_updated',
      title: 'Underwriting Analysis Updated',
      description: `MAO (80%) calculated at $${mao80.toLocaleString()} | MAO (77%): $${mao77.toLocaleString()} | MAO (75%): $${mao75.toLocaleString()} | MAO (70%): $${mao70.toLocaleString()} (ARV: $${arvNum.toLocaleString()}, Rehab: $${rehabNum.toLocaleString()})`
    });

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://localhost:5000/api/v1/deals/${deal.id}/analysis`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          beds: bedsInput,
          baths: bathsInput,
          sqft: sqftInput,
          lotSize: lotSizeInput,
          yearBuilt: yearBuiltInput,
          propertyType: propertyTypeInput,
          underwriting: updatedUnderwriting
        })
      });
    } catch (err) {
      console.error('Error saving underwriting analysis to backend:', err);
    } finally {
      setIsSavingAnalysis(false);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}

    setAnalysisSuccessMsg('Podio Property & Financial Analysis saved successfully.');
    setAnalysisSavedFeedback(true);
    setTimeout(() => {
      setAnalysisSuccessMsg(null);
      setAnalysisSavedFeedback(false);
    }, 4000);
  };

  // Manager ARV Approval Handlers
  const handleApproveArv = () => {
    if (isReadOnly) return;
    const currentArv = parseFloat(arvInput) || deal.underwriting?.arv || 0;
    updateDeal(deal.id, {
      managerArvStatus: 'Manager Approved ARV',
      arvApprovedBy: currentUser.name,
      arvApprovedAt: new Date().toLocaleDateString('en-US')
    });
    addDealActivity(deal.id, {
      type: 'underwriting_updated',
      title: 'Manager Approved ARV',
      description: `ARV of $${currentArv.toLocaleString()} officially verified & approved by ${currentUser.name}. Ready for Offer & Contract generation.`,
      actor: currentUser.name
    });
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
    setAnalysisSuccessMsg(`ARV approved by ${currentUser.name}! Status updated to Manager Approved ARV.`);
    setTimeout(() => setAnalysisSuccessMsg(null), 4000);
  };

  const handleSetArvStatus = (newStatus: 'Need Manager ARV' | 'ARV RAN' | 'Manager Approved ARV') => {
    if (isReadOnly) return;
    updateDeal(deal.id, {
      managerArvStatus: newStatus,
      ...(newStatus === 'Manager Approved ARV' ? {
        arvApprovedBy: currentUser.name,
        arvApprovedAt: new Date().toLocaleDateString('en-US')
      } : {})
    });
    addDealActivity(deal.id, {
      type: 'underwriting_updated',
      title: `Manager ARV Status: ${newStatus}`,
      description: `Underwriting check status set to "${newStatus}" by ${currentUser.name}`,
      actor: currentUser.name
    });
    setAnalysisSuccessMsg(`ARV status set to "${newStatus}"`);
    setTimeout(() => setAnalysisSuccessMsg(null), 3500);
  };

  // Generate Contract Handler
  const handleGenerateContract = () => {
    if (isReadOnly) return;
    setIsGeneratingContract(true);

    setTimeout(() => {
      setIsGeneratingContract(false);

      const fileName = `${selectedTemplate.replace(/\s+/g, '_')}_${deal.address.replace(/\s+/g, '_')}_v1.pdf`;
      
      addGeneratedContract(deal.id, {
        templateName: selectedTemplate,
        fileName,
        fileType: 'pdf',
        generatedBy: currentUser.name,
        purchasePrice: contractPurchasePrice,
        status: 'Draft'
      });

      updateDeal(deal.id, {
        stage: 'Contract',
        offerDetails: {
          purchasePrice: contractPurchasePrice,
          earnestMoney: contractEarnestMoney,
          optionFee: contractOptionFee,
          optionPeriodDays: contractOptionDays,
          closingDate: contractClosingDate,
          buyerEntity: contractBuyerEntity,
          sellerName: deal.realtorName || 'Seller of Record',
          titleCompany: 'Republic Title DFW',
          financingType: 'Cash',
          inspectionPeriodDays: contractOptionDays,
          specialProvisions: contractSpecialProvisions
        }
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }

      setContractSuccessMsg(`Successfully drafted ${selectedTemplate} for $${contractPurchasePrice.toLocaleString()}!`);
      setTimeout(() => setContractSuccessMsg(null), 4000);
    }, 1200);
  };

  // Quick Send Message in Deal View
  const handleSendQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyText.trim() || !matchedConversation) return;

    sendMessage(matchedConversation.id, quickReplyText.trim());
    addDealActivity(deal.id, {
      type: 'message_received',
      title: 'Message Sent to Realtor',
      description: quickReplyText.trim(),
      actor: currentUser.name
    });

    setQuickReplyText('');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 animate-fadeIn">
      
      {/* TOP NAVIGATION BACK BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0B1F3A] hover:bg-[#F8FAFC] text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to AI Deals Pipeline
        </button>

        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="font-mono">Deal ID: <strong className="text-[#0B1F3A]">#{deal.id}</strong></span>
          <span>&bull;</span>
          <span>Received: <strong className="text-[#0B1F3A]">{deal.createdAt || 'Today'}</strong></span>
        </div>
      </div>

      {/* 1. EXECUTIVE DEAL HEADER */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Address & Badges */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${stageConfig.badgeBg} ${stageConfig.textColor} ${stageConfig.borderColor}`}>
                {stageConfig.icon} {normStage}
              </span>

              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                deal.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                deal.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <Flame className="w-3.5 h-3.5" /> {deal.temperature || 'Warm'} Temperature
              </span>

              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {deal.source || 'AI Outreach'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
              {deal.address}
            </h1>
            
            <p className="text-xs text-[#64748B]">
              {deal.city}, {deal.state} {deal.zip} &bull; {deal.beds} Beds &bull; {deal.baths} Baths &bull; {deal.sqft} SqFt &bull; {deal.propertyType}
            </p>
          </div>

          {/* Quick Actions Right */}
          <div className="flex flex-wrap items-center gap-2">
            {matchedContact && (
              <button
                onClick={() => onSelectContact && onSelectContact(matchedContact)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B1F3A] font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#155EEF]" /> View Contact Profile
              </button>
            )}

            {matchedConversation && (
              <button
                onClick={() => onOpenConversation(matchedConversation.id)}
                className="px-3.5 py-2 rounded-xl bg-[#EAF2FF] hover:bg-[#Dbeafe] text-[#155EEF] border border-[#BFDBFE] font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" /> View Conversation
              </button>
            )}

            {matchedContact && onOpenCallModal && !isReadOnly && (
              <button
                onClick={() => onOpenCallModal(matchedContact)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Phone className="w-3.5 h-3.5" /> Call Realtor
              </button>
            )}

            {!isReadOnly && (
              <button
                onClick={() => setActiveTab('contracts')}
                className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#004EEB] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" /> Generate Contract
              </button>
            )}
          </div>

        </div>

        {/* 2. TEAM MEMBER ASSIGNMENT, STAGE & MANAGER ARV ROW */}
        <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8FAFC] p-3 rounded-xl text-xs">
          
          {/* Assigned Team Member Dropdown */}
          <div className="relative">
            <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">
              Assigned Team Member
            </label>
            <button
              onClick={() => {
                if (!isReadOnly) {
                  setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen);
                  setIsStageDropdownOpen(false);
                }
              }}
              disabled={isReadOnly}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#0B1F3A] flex items-center justify-between cursor-pointer hover:border-[#155EEF] transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#155EEF] text-white text-[9px] font-extrabold flex items-center justify-center">
                  {deal.ownerAvatar || deal.ownerName?.substring(0, 2).toUpperCase() || 'UN'}
                </span>
                <span>{deal.ownerName || 'Unassigned'}</span>
              </div>
              {!isReadOnly && <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />}
            </button>

            {isAssigneeDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-30 py-1 text-xs">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      assignDeal(deal.id, u.id, u.name, u.avatar);
                      setIsAssigneeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#F1F5F9] cursor-pointer ${
                      deal.ownerId === u.id ? 'bg-[#EAF2FF] font-bold text-[#155EEF]' : 'text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#155EEF]/10 text-[#155EEF] text-[9px] font-bold flex items-center justify-center">
                        {u.avatar || u.name.substring(0, 2).toUpperCase()}
                      </span>
                      <span>{u.name} ({u.role})</span>
                    </div>
                    {deal.ownerId === u.id && <Check className="w-3.5 h-3.5 text-[#155EEF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deal Stage Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">
              Deal Pipeline Stage
            </label>
            <select
              value={normStage}
              disabled={isReadOnly}
              onChange={(e) => updateDealStage(deal.id, e.target.value as DealStage)}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#0B1F3A] focus:outline-none focus:border-[#155EEF] cursor-pointer"
            >
              {PIPELINE_STAGES.map((s: DealStage) => (
                <option key={s} value={s}>{STAGE_CONFIG[s]?.icon || '⚡'} {s}</option>
              ))}
            </select>
          </div>

          {/* Temperature Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">
              Deal Temperature
            </label>
            <select
              value={deal.temperature || 'Warm'}
              disabled={isReadOnly}
              onChange={(e) => {
                updateDeal(deal.id, { temperature: e.target.value as ContactTemperature });
                addDealActivity(deal.id, {
                  type: 'temperature_changed',
                  title: `Temperature Updated to ${e.target.value}`,
                  description: `Acquisitions priority adjusted.`
                });
              }}
              className={`w-full px-3 py-2 bg-white border rounded-xl font-bold cursor-pointer focus:outline-none ${
                deal.temperature === 'Hot' ? 'text-rose-700 border-rose-300 bg-rose-50/50' :
                deal.temperature === 'Warm' ? 'text-amber-700 border-amber-300 bg-amber-50/50' :
                'text-blue-700 border-blue-300 bg-blue-50/50'
              }`}
            >
              <option value="Hot">🔥 Hot (Urgent / High Motivation)</option>
              <option value="Warm">⚡ Warm (Qualifying / Numbers Spread)</option>
              <option value="Cold">❄️ Cold (High Asking / Low Spread)</option>
            </select>
          </div>

          {/* Manager Check ARV Status & Quick Approve */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748B] block mb-1 flex items-center justify-between">
              <span>Manager Check ARV</span>
              {deal.managerArvStatus === 'Manager Approved ARV' && (
                <span className="text-[9px] text-[#0284C7] font-bold">✓ Approved</span>
              )}
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={deal.managerArvStatus || (deal.underwriting?.arv && normStage !== 'New' ? 'Manager Approved ARV' : 'ARV RAN')}
                disabled={isReadOnly}
                onChange={(e) => handleSetArvStatus(e.target.value as any)}
                className={`flex-1 px-2.5 py-2 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
                  (deal.managerArvStatus === 'Manager Approved ARV' || (!deal.managerArvStatus && deal.underwriting?.arv && normStage !== 'New'))
                    ? 'bg-[#0284C7] text-white border-[#0284C7]'
                    : deal.managerArvStatus === 'ARV RAN'
                    ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                    : 'bg-white text-[#475569] border-[#CBD5E1]'
                }`}
              >
                <option value="Manager Approved ARV">Manager Approved ARV</option>
                <option value="ARV RAN">ARV RAN</option>
                <option value="Need Manager ARV">Need Manager ARV</option>
              </select>

              {deal.managerArvStatus !== 'Manager Approved ARV' && (
                <button
                  type="button"
                  onClick={handleApproveArv}
                  title="1-Click Manager Approve ARV"
                  className="px-2.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Approve</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. PROMINENT ASKING PRICE & FINANCIAL HIGHLIGHTS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* PROMINENT ASKING PRICE (Crucial Requirement) */}
        <div className="bg-gradient-to-br from-[#0B1F3A] to-[#155EEF] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]">
            List Price / Asking Price
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            ${(deal.askingPrice || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#BFDBFE] mt-1 flex items-center gap-1">
            <span>Direct price requested by {deal.realtorName}</span>
          </div>
        </div>

        {/* Calculated Maximum Allowable Offer (MAO 80%) */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span>Max Allowable Offer (80%)</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">PODIO</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${mao80.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            (Estimated ARV &times; 0.80) - Estimated Rehab
          </div>
        </div>

        {/* After Repair Value (ARV) */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Estimated ARV
          </div>
          <div className="text-2xl font-black text-[#0B1F3A] mt-1">
            ${arvNum.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Rehab Budget: ${rehabNum.toLocaleString()}
          </div>
        </div>

        {/* Target Offer & Wholesale Fee */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Offer Target & Net Profit
          </div>
          <div className="text-2xl font-black text-[#6941C6] mt-1">
            ${offerPriceNum.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6941C6] font-bold mt-1">
            Spread: +${estimatedProfit.toLocaleString()} ({roi}% ROI)
          </div>
        </div>

      </div>

      {/* 4. WORKSPACE SEGMENTED TABS */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analysis'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" /> Property & Financial Analysis
        </button>

        <button
          onClick={() => setActiveTab('conversation')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'conversation'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> AI Conversation & SMS Thread
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contact'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Realtor & Contact Connection
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" /> Contract Generation Desk
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Activity Timeline
        </button>
      </div>

      {/* 5. TAB CONTENT PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* MAIN 8-COLUMN CONTENT */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* TAB 1: PROPERTY & FINANCIAL ANALYSIS (PODIO PHOTO REPLICATION) */}
          {activeTab === 'analysis' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7] flex items-center gap-1">
                    <span>PODIO WORKSPACE REPLICA</span> &bull; <span>MLS OFFERS</span>
                  </div>
                  <h2 className="text-xl font-black text-[#0B1F3A]">
                    ANALYSIS
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Property Analysis &amp; Maximum Allowable Offer (MAO) Underwriting.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E0F2FE] text-[#0284C7] text-xs font-bold border border-[#BAE6FD]">
                    Podio Formula Active
                  </span>
                </div>
              </div>

              {analysisSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{analysisSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAnalysis} className="space-y-6">
                
                {/* 1. PODIO ANALYSIS CORE SECTION */}
                <div className="space-y-4 p-5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-xs">
                  
                  {/* List Price */}
                  <div>
                    <label className="block text-[#0B1F3A] font-extrabold mb-1">
                      List Price:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={`$${(deal.askingPrice || 0).toLocaleString()}`}
                        placeholder="Add List Price:..."
                        className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-xs font-black text-[#0B1F3A]"
                      />
                    </div>
                  </div>

                  {/* Major Work Needed (Podio Interactive Chips) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[#0B1F3A] font-extrabold">
                        Major Work Needed:
                      </label>
                      <span className="text-[10px] text-[#64748B] font-medium">
                        Click to toggle &amp; auto-calculate rehab cost
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {MAJOR_WORK_OPTIONS.map((opt) => {
                        const isSelected = selectedMajorWork.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleToggleMajorWork(opt.id)}
                            disabled={isReadOnly}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                                : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rehab Input */}
                  <div>
                    <label className="block text-[#0B1F3A] font-extrabold mb-1">
                      Rehab:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={rehabInput}
                        onChange={(e) => setRehabInput(e.target.value)}
                        placeholder="Add Rehab:..."
                        className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>

                  {/* ARV Input */}
                  <div>
                    <label className="block text-[#0B1F3A] font-extrabold mb-1">
                      ARV: <span className="text-[#0284C7]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={arvInput}
                        onChange={(e) => setArvInput(e.target.value)}
                        placeholder="Add ARV:..."
                        className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>

                  {/* 4-TIER MAO OUTPUTS (Exact Podio Photo Replica) */}
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                      <span>Multi-Tier Maximum Allowable Offer (MAO)</span>
                      <span className="text-[10px] font-mono text-[#0284C7]">MAO = (Estimated ARV &times; %) - Estimated Rehab</span>
                    </div>

                    {/* MAO 80% */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-2xs hover:border-[#0284C7] transition-all">
                      <div>
                        <div className="font-extrabold text-xs text-[#0B1F3A]">
                          Max Allowable Offer (80%):
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          (${arvNum.toLocaleString()} &times; 0.80) - ${rehabNum.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                          ${mao80.toLocaleString()}
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => setOfferPriceInput(mao80.toString())}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 cursor-pointer"
                            title="Copy to Offer Price"
                          >
                            Set Offer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MAO 77% */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-2xs hover:border-[#0284C7] transition-all">
                      <div>
                        <div className="font-extrabold text-xs text-[#0B1F3A]">
                          Max Allowable Offer (77%):
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          (${arvNum.toLocaleString()} &times; 0.77) - ${rehabNum.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-[#0284C7] font-mono">
                          ${mao77.toLocaleString()}
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => setOfferPriceInput(mao77.toString())}
                            className="px-2 py-1 rounded-lg bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] text-[10px] font-bold border border-[#BAE6FD] cursor-pointer"
                            title="Copy to Offer Price"
                          >
                            Set Offer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MAO 75% */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-2xs hover:border-[#0284C7] transition-all">
                      <div>
                        <div className="font-extrabold text-xs text-[#0B1F3A]">
                          Max Allowable Offer (75%):
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          (${arvNum.toLocaleString()} &times; 0.75) - ${rehabNum.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                          ${mao75.toLocaleString()}
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => setOfferPriceInput(mao75.toString())}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 cursor-pointer"
                            title="Copy to Offer Price"
                          >
                            Set Offer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MAO 70% */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-2xs hover:border-[#0284C7] transition-all">
                      <div>
                        <div className="font-extrabold text-xs text-[#0B1F3A]">
                          Max Allowable Offer (70%):
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          (${arvNum.toLocaleString()} &times; 0.70) - ${rehabNum.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-purple-700 font-mono">
                          ${mao70.toLocaleString()}
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => setOfferPriceInput(mao70.toString())}
                            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 cursor-pointer"
                            title="Copy to Offer Price"
                          >
                            Set Offer
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* EST. Rent Input */}
                  <div>
                    <label className="block text-[#0B1F3A] font-extrabold mb-1">
                      EST. Rent:
                    </label>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      value={estRentInput}
                      onChange={(e) => setEstRentInput(e.target.value)}
                      placeholder="Add EST. Rent:..."
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  {/* Condition Notes */}
                  <div>
                    <label className="block text-[#0B1F3A] font-extrabold mb-1">
                      Condition Notes:
                    </label>
                    <textarea
                      rows={3}
                      disabled={isReadOnly}
                      value={conditionNotesInput}
                      onChange={(e) => setConditionNotesInput(e.target.value)}
                      placeholder="Add Condition Notes:..."
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  {/* Target Offer Price & Profit Spread (Contract Integration) */}
                  <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Contract Target Offer Price ($)
                      </label>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={offerPriceInput}
                        onChange={(e) => setOfferPriceInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#155EEF] rounded-xl text-xs font-black text-[#155EEF]"
                      />
                    </div>

                    <div className="flex flex-col justify-center bg-white p-2.5 rounded-xl border border-[#CBD5E1]">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase">Estimated Net Wholesale Profit</span>
                      <span className="font-extrabold text-sm text-[#0B1F3A]">
                        +${estimatedProfit.toLocaleString()} <span className="text-emerald-600 font-bold text-xs">({roi}% ROI)</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* 2. Property Physical Specs */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                    Property Specifications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Property Type</label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={propertyTypeInput}
                        onChange={(e) => setPropertyTypeInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Bedrooms</label>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={bedsInput}
                        onChange={(e) => setBedsInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Bathrooms</label>
                      <input
                        type="number"
                        step="0.5"
                        disabled={isReadOnly}
                        value={bathsInput}
                        onChange={(e) => setBathsInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Square Feet</label>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={sqftInput}
                        onChange={(e) => setSqftInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Lot Size</label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={lotSizeInput}
                        onChange={(e) => setLotSizeInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Year Built</label>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={yearBuiltInput}
                        onChange={(e) => setYearBuiltInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {analysisSavedFeedback && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Analysis numbers saved to database!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingAnalysis}
                      className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 ${
                        analysisSavedFeedback 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
                      }`}
                    >
                      {isSavingAnalysis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving Analysis...
                        </>
                      ) : analysisSavedFeedback ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Saved Successfully!
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Save Podio Analysis Numbers
                        </>
                      )}
                    </button>
                  </div>
                )}

              </form>

            </div>
          )}

          {/* TAB 2: AI CONVERSATION & SMS THREAD */}
          {activeTab === 'conversation' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-black text-[#0B1F3A]">
                    Connected SMS Conversation
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Text message dialogue that captured this property address lead.
                  </p>
                </div>
                {matchedConversation && (
                  <button
                    onClick={() => onOpenConversation(matchedConversation.id)}
                    className="px-3 py-1.5 bg-[#EAF2FF] text-[#155EEF] font-bold text-xs rounded-xl border border-[#BFDBFE] hover:bg-[#Dbeafe] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Inbox
                  </button>
                )}
              </div>

              {matchedConversation ? (
                <div className="space-y-4">
                  {/* Chat Messages Container */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] max-h-[420px] overflow-y-auto space-y-3">
                    {matchedConversation.messages.map(msg => {
                      const isRealtor = msg.sender === 'realtor';
                      const isAI = msg.sender === 'ai';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isRealtor ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1 text-[10px] text-[#64748B] mb-0.5">
                            <span className="font-bold">
                              {isRealtor ? deal.realtorName : isAI ? '🤖 Apex AI Bot' : '👤 Acquisition Specialist'}
                            </span>
                            <span>&bull;</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                              isRealtor
                                ? 'bg-white text-[#0F172A] border border-[#E2E8F0] shadow-2xs rounded-tl-xs'
                                : 'bg-[#155EEF] text-white shadow-xs rounded-tr-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Reply Box */}
                  {!isReadOnly && (
                    <form onSubmit={handleSendQuickReply} className="flex gap-2">
                      <input
                        type="text"
                        value={quickReplyText}
                        onChange={(e) => setQuickReplyText(e.target.value)}
                        placeholder={`Send quick SMS message to ${deal.realtorName}...`}
                        className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                      />
                      <button
                        type="submit"
                        disabled={!quickReplyText.trim()}
                        className="px-4 py-2 bg-[#155EEF] disabled:opacity-50 hover:bg-[#004EEB] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-[#64748B]">
                  No connected SMS conversation was linked to this manual deal entry.
                </div>
              )}

            </div>
          )}

          {/* TAB 3: REALTOR & CONTACT CONNECTION */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-black text-[#0B1F3A]">
                    Realtor Contact Profile
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Connected agent / wholesaler relationship for this transaction.
                  </p>
                </div>
                {matchedContact && (
                  <button
                    onClick={() => onSelectContact && onSelectContact(matchedContact)}
                    className="px-3.5 py-1.5 bg-[#155EEF] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#004EEB] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Full Contact Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                  <div className="text-[11px] uppercase font-bold text-[#64748B]">Contact Identity</div>
                  <div className="font-extrabold text-sm text-[#0B1F3A]">{deal.realtorName}</div>
                  <div className="text-[#475569]">{deal.realtorBrokerage}</div>
                  <div className="text-xs font-mono font-bold text-[#155EEF]">
                    {deal.realtorLicense || matchedContact?.licenseNumber || 'TREC #0748291'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                  <div className="text-[11px] uppercase font-bold text-[#64748B]">Communication Channels</div>
                  <div className="flex items-center gap-2 text-[#0B1F3A] font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#64748B]" /> {deal.realtorPhone}
                  </div>
                  <div className="flex items-center gap-2 text-[#0B1F3A] font-semibold">
                    <Mail className="w-3.5 h-3.5 text-[#64748B]" /> {deal.realtorEmail}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Market: {matchedContact?.market || 'Dallas / Fort Worth Corridor'}
                  </div>
                </div>

              </div>

              {matchedContact?.notes && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-[11px] uppercase font-bold text-[#64748B]">Contact History Notes</div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-[#475569]">
                    {matchedContact.notes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: CONTRACT GENERATION DESK */}
          {activeTab === 'contracts' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-black text-[#0B1F3A]">
                    Contract Generation & Legal Execution
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Generate standardized TREC purchase contracts and assignment addenda populated with deal figures.
                  </p>
                </div>
                <FileCheck className="w-5 h-5 text-emerald-600" />
              </div>

              {contractSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{contractSuccessMsg}</span>
                </div>
              )}

              {/* Generator Configuration Form */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Contract Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Contract Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <option value="TREC One to Four Family Residential Contract">TREC One to Four Family Residential Contract (Resale)</option>
                      <option value="Standard Wholesale Assignment Agreement">Standard Real Estate Assignment Agreement</option>
                      <option value="Cash LOI Purchase Agreement">Cash Letter of Intent (LOI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Contract Purchase Price ($)</label>
                    <input
                      type="number"
                      value={contractPurchasePrice}
                      onChange={(e) => setContractPurchasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-black text-[#0B1F3A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Earnest Money Deposit ($)</label>
                    <input
                      type="number"
                      value={contractEarnestMoney}
                      onChange={(e) => setContractEarnestMoney(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B1F3A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Option Period (Days)</label>
                    <input
                      type="number"
                      value={contractOptionDays}
                      onChange={(e) => setContractOptionDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B1F3A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Buyer Legal Entity</label>
                    <input
                      type="text"
                      value={contractBuyerEntity}
                      onChange={(e) => setContractBuyerEntity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B1F3A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] font-bold mb-1">Closing Date</label>
                    <input
                      type="date"
                      value={contractClosingDate}
                      onChange={(e) => setContractClosingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B1F3A]"
                    />
                  </div>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={handleGenerateContract}
                    disabled={isGeneratingContract}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingContract ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Document...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" /> Generate & Compile Contract
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Generated Contracts Archive */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                  Contract History & Executed Documents ({deal.generatedContracts?.length || 0})
                </h3>

                {deal.generatedContracts && deal.generatedContracts.length > 0 ? (
                  <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
                    {deal.generatedContracts.map(ctr => (
                      <div key={ctr.id} className="p-3.5 bg-white flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                            PDF
                          </div>
                          <div>
                            <div className="font-extrabold text-[#0B1F3A]">{ctr.fileName}</div>
                            <div className="text-[11px] text-[#64748B]">
                              Generated by {ctr.generatedBy} &bull; {ctr.generatedAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ctr.status === 'Executed' ? 'bg-emerald-100 text-emerald-800' :
                            ctr.status === 'Sent for Signature' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ctr.status || 'Draft'}
                          </span>

                          <button
                            onClick={() => alert(`Simulated downloading ${ctr.fileName}`)}
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-xl">
                    No contracts generated yet for this deal. Use the parameters above to draft an agreement.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-black text-[#0B1F3A]">
                    Deal Audit & Activity History
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Chronological audit log of all system and team events for this property.
                  </p>
                </div>
                <Clock className="w-5 h-5 text-[#155EEF]" />
              </div>

              <div className="space-y-3 pt-2">
                {deal.activities && deal.activities.length > 0 ? (
                  deal.activities.map((act) => (
                    <div key={act.id} className="flex gap-3 text-xs items-start">
                      <div className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#155EEF] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        &bull;
                      </div>
                      <div className="flex-1 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#0B1F3A]">{act.title}</span>
                          <span className="text-[10px] text-[#94A3B8]">{act.timestamp}</span>
                        </div>
                        <p className="text-[#475569] text-xs">{act.description}</p>
                        <div className="text-[10px] text-[#64748B] font-semibold pt-1">
                          Actor: {act.actor}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-[#64748B]">
                    No activity logs recorded yet.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT 4-COLUMN DEAL QUICK-LOOK SIDEBAR */}
        <div className="lg:col-span-4 space-y-4 sticky top-4">
          
          {/* Quick-Scan Deal Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-black text-xs text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-[#E2E8F0]">
              Deal Quick Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Property Address:</span>
                <span className="font-bold text-[#0B1F3A] text-right truncate max-w-[160px]">{deal.address}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Date Received:</span>
                <span className="font-semibold text-[#0B1F3A]">{deal.createdAt || 'Today'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Lead Source:</span>
                <span className="font-bold text-[#155EEF]">{deal.source || 'AI Outreach'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Assigned Specialist:</span>
                <span className="font-bold text-[#0B1F3A]">{deal.ownerName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Current Stage:</span>
                <span className="font-bold uppercase text-[#0B1F3A]">{normStage}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Asking Price:</span>
                <span className="font-black text-[#0B1F3A]">${(deal.askingPrice || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Calculated MAO (80%):</span>
                <span className="font-bold text-emerald-700 font-mono">${mao80.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Connected Realtor:</span>
                <span className="font-bold text-[#0B1F3A]">{deal.realtorName}</span>
              </div>
            </div>

          </div>

          {/* Connected Realtor Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Connected Realtor</span>
              <span className="text-[10px] font-mono font-bold text-[#155EEF]">{deal.realtorLicense || 'TREC #0748291'}</span>
            </div>

            <div className="font-black text-sm text-[#0B1F3A]">{deal.realtorName}</div>
            <div className="text-[#64748B] text-[11px]">{deal.realtorBrokerage}</div>
            
            <div className="pt-2 border-t border-[#F1F5F9] space-y-1 text-[#475569]">
              <div>📞 {deal.realtorPhone}</div>
              <div className="truncate">✉️ {deal.realtorEmail}</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
