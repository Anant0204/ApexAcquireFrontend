import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PropertyDeal, RealtorContact } from '../types/crm';
import {
  X,
  FileCheck,
  Building,
  Download,
  FileText,
  Calculator,
  Edit2,
  CheckCircle,
  PlusCircle,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DealDetailProps {
  deal: PropertyDeal | null;
  onClose: () => void;
  onOpenConversation: (convId: string) => void;
  onSelectContact?: (contact: RealtorContact) => void;
}

export const DealDetailDrawer: React.FC<DealDetailProps> = ({ deal, onClose, onOpenConversation, onSelectContact }) => {
  const { addGeneratedContract, updateDeal, currentUser, contacts } = useApp();
  
  // Contract Generator Wizard Modal State
  const [showContractWizard, setShowContractWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTemplate, setSelectedTemplate] = useState('TREC One to Four Family Residential Contract');
  const [isGenerating, setIsGenerating] = useState(false);
  const [purchasePriceVal, setPurchasePriceVal] = useState<number>(deal?.offerDetails?.purchasePrice || 0);

  // Underwriting Calculator State
  const [arvInput, setArvInput] = useState<string>('');
  const [rehabInput, setRehabInput] = useState<string>('');
  const [wholesaleFeeInput, setWholesaleFeeInput] = useState<string>('');
  const [underwritingSuccessMsg, setUnderwritingSuccessMsg] = useState<string | null>(null);

  // Offer Details Form State
  const [isEditingOffer, setIsEditingOffer] = useState<boolean>(false);
  const [purchasePriceInput, setPurchasePriceInput] = useState<string>('');
  const [earnestMoneyInput, setEarnestMoneyInput] = useState<string>('');
  const [optionFeeInput, setOptionFeeInput] = useState<string>('');
  const [optionDaysInput, setOptionDaysInput] = useState<string>('');
  const [buyerEntityInput, setBuyerEntityInput] = useState<string>('');
  const [closingDateInput, setClosingDateInput] = useState<string>('');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  // Sync inputs whenever deal changes (only reset edit mode when deal.id changes)
  useEffect(() => {
    if (deal) {
      // Underwriting init
      setArvInput(deal.underwriting?.arv ? deal.underwriting.arv.toString() : (deal.askingPrice ? Math.round(deal.askingPrice * 1.25).toString() : '500000'));
      setRehabInput(deal.underwriting?.estimatedRehab ? deal.underwriting.estimatedRehab.toString() : '50000');
      setWholesaleFeeInput(deal.underwriting?.targetWholesaleFee ? deal.underwriting.targetWholesaleFee.toString() : '25000');

      // Offer details init
      setPurchasePriceInput(deal.offerDetails?.purchasePrice ? deal.offerDetails.purchasePrice.toString() : (deal.askingPrice ? deal.askingPrice.toString() : '450000'));
      setEarnestMoneyInput(deal.offerDetails?.earnestMoney ? deal.offerDetails.earnestMoney.toString() : '5000');
      setOptionFeeInput(deal.offerDetails?.optionFee ? deal.offerDetails.optionFee.toString() : '500');
      setOptionDaysInput(deal.offerDetails?.optionPeriodDays ? deal.offerDetails.optionPeriodDays.toString() : '7');
      setBuyerEntityInput(deal.offerDetails?.buyerEntity || 'Apex Acquisitions DFW LLC');
      setClosingDateInput(deal.offerDetails?.closingDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
  }, [deal?.id]);

  if (!deal) return null;

  const isReadOnly = currentUser.role === 'READ_ONLY';

  // Real-time MAO Calculation (Podio standard: (ARV * 0.8) - Rehab)
  const arvNum = parseFloat(arvInput) || 0;
  const rehabNum = parseFloat(rehabInput) || 0;
  const feeNum = parseFloat(wholesaleFeeInput) || 0;
  const mao80 = Math.max(0, Math.round((arvNum * 0.80) - rehabNum));
  const calculatedMao = mao80;

  const handleSaveUnderwriting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;

    updateDeal(deal.id, {
      underwriting: {
        arv: arvNum,
        estimatedRehab: rehabNum,
        targetWholesaleFee: feeNum,
        calculatedMao: mao80,
        mao80,
        mao77: Math.max(0, Math.round((arvNum * 0.77) - rehabNum)),
        mao75: Math.max(0, Math.round((arvNum * 0.75) - rehabNum)),
        mao70: Math.max(0, Math.round((arvNum * 0.70) - rehabNum))
      }
    });

    setUnderwritingSuccessMsg('Underwriting MAO saved successfully.');
    setTimeout(() => setUnderwritingSuccessMsg(null), 3000);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;

    const pPrice = parseFloat(purchasePriceInput) || 0;
    const eMoney = parseFloat(earnestMoneyInput) || 0;
    const oFee = parseFloat(optionFeeInput) || 0;
    const oDays = parseInt(optionDaysInput, 10) || 7;

    const updatedOffer = {
      purchasePrice: pPrice,
      earnestMoney: eMoney,
      optionFee: oFee,
      optionPeriodDays: oDays,
      buyerEntity: buyerEntityInput || 'Apex Acquisitions DFW LLC',
      closingDate: closingDateInput || new Date().toISOString().split('T')[0],
      sellerName: deal.offerDetails?.sellerName || deal.realtorName || 'Property Seller',
      titleCompany: deal.offerDetails?.titleCompany || 'Republic Title DFW',
      financingType: deal.offerDetails?.financingType || 'Cash',
      inspectionPeriodDays: oDays,
      specialProvisions: deal.offerDetails?.specialProvisions || 'AS-IS cash acquisition.'
    };

    updateDeal(deal.id, {
      offerDetails: updatedOffer
    });

    setIsEditingOffer(false);
    setOfferSuccessMsg('Offer details saved successfully.');
    setTimeout(() => setOfferSuccessMsg(null), 3000);
  };

  const handleStartContractWizard = () => {
    setShowContractWizard(true);
    setWizardStep(1);
  };

  const handleGenerateContract = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addGeneratedContract(deal.id, {
        templateName: selectedTemplate,
        fileName: `${deal.address.replace(/\s+/g, '_')}_Purchase_Agreement_v${(deal.generatedContracts?.length || 0) + 1}.pdf`,
        fileType: 'pdf',
        generatedBy: currentUser.name
      });
      setWizardStep(4);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-end">
      <div className="w-full max-w-3xl bg-[#F7F9FC] border-l border-[#E2E8F0] h-full flex flex-col shadow-2xl relative overflow-y-auto">
        
        {/* HEADER BAR */}
        <div className="p-6 border-b border-[#E2E8F0] bg-white flex items-start justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#0B1F3A]">{deal.address}</h2>
              <span className="px-2.5 py-1 rounded bg-[#EAF2FF] border border-[#155EEF]/20 text-[#155EEF] font-bold text-xs">
                {deal.stage}
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-1">{deal.city}, {deal.state} {deal.zip} &bull; <span className="font-mono text-[#0F172A] font-semibold">{deal.propertyType}</span></p>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={handleStartContractWizard}
                className="px-4 py-2 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileCheck className="w-4 h-4" /> GENERATE CONTRACT
              </button>
            )}

            <button onClick={onClose} className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 space-y-6">
          
          {/* METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Asking Price</span>
              <span className="text-lg font-bold font-mono text-[#155EEF]">${deal.askingPrice.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Beds / Baths</span>
              <span className="text-base font-bold text-[#0F172A]">{deal.beds} Beds &bull; {deal.baths} Baths</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Square Footage</span>
              <span className="text-base font-bold text-[#0F172A]">{deal.sqft.toLocaleString()} sqft</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Year Built</span>
              <span className="text-base font-bold text-[#0F172A]">{deal.yearBuilt}</span>
            </div>
          </div>

          {/* REALTOR CONTACT CARD */}
          <div className="executive-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div 
              onClick={() => {
                const matchedContact = contacts.find(c => c.id === deal.contactId || c.name.toLowerCase() === deal.realtorName.toLowerCase());
                if (matchedContact && onSelectContact) {
                  onSelectContact(matchedContact);
                }
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Click to view full contact profile"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] group-hover:bg-[#DBEAFE] text-[#155EEF] font-bold flex items-center justify-center border border-[#155EEF]/20 transition-colors">
                {deal.realtorName.substring(0, 2)}
              </div>
              <div>
                <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#155EEF] transition-colors flex items-center gap-1.5">
                  <span>{deal.realtorName}</span>
                  <span className="text-[10px] text-[#155EEF] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">(View Profile)</span>
                </div>
                <div className="text-xs text-[#475569]">{deal.realtorBrokerage} &bull; {deal.realtorPhone}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const matchedContact = contacts.find(c => c.id === deal.contactId || c.name.toLowerCase() === deal.realtorName.toLowerCase());
                  if (matchedContact && onSelectContact) {
                    onSelectContact(matchedContact);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#F1F6FC] hover:bg-[#EAF2FF] border border-[#E2E8F0] text-xs font-bold text-[#0B1F3A] hover:text-[#155EEF] transition-all shadow-xs cursor-pointer"
              >
                Contact Details &rarr;
              </button>

              {deal.conversationId && (
                <button
                  onClick={() => { onClose(); onOpenConversation(deal.conversationId!); }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-bold text-[#155EEF] hover:bg-[#EAF2FF] transition-all shadow-xs cursor-pointer"
                >
                  SMS Chat &rarr;
                </button>
              )}
            </div>
          </div>


          {/* SECTION 1: INTERACTIVE UNDERWRITING / MAO CALCULATOR */}
          <div className="executive-panel rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#155EEF]" /> Underwriting MAO Calculator
              </h3>
              {underwritingSuccessMsg && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {underwritingSuccessMsg}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveUnderwriting} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                    ARV (After Repair Value)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-[#64748B] font-mono">$</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      value={arvInput}
                      onChange={(e) => setArvInput(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all disabled:opacity-60 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                    Est. Rehab Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-[#64748B] font-mono">$</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      value={rehabInput}
                      onChange={(e) => setRehabInput(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all disabled:opacity-60 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                    Target Margin / Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-[#64748B] font-mono">$</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      value={wholesaleFeeInput}
                      onChange={(e) => setWholesaleFeeInput(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all disabled:opacity-60 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* MAO CALCULATED BANNER (Podio Standard) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#155EEF] border border-[#BFDBFE] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div>
                  <span className="text-[10px] font-extrabold text-[#93C5FD] uppercase tracking-wider block">
                    Calculated Maximum Allowable Offer (MAO 80%)
                  </span>
                  <span className="text-xs text-slate-200 font-medium">
                    Formula: (ARV ${arvNum.toLocaleString()} &times; 0.80) - Rehab (${rehabNum.toLocaleString()})
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-emerald-400 drop-shadow-sm shrink-0">
                  ${mao80.toLocaleString()}
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-executive-primary px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Save Underwriting Values
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* SECTION 2: OFFER ENTRY & EDIT FORM */}
          <div className="executive-panel rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Purchase Offer Details
              </h3>

              {offerSuccessMsg && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {offerSuccessMsg}
                </span>
              )}

              {!isReadOnly && !isEditingOffer && (
                <button
                  onClick={() => setIsEditingOffer(true)}
                  className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-[#155EEF]/40 text-[#155EEF] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {deal.offerDetails ? <Edit2 className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  {deal.offerDetails ? 'Edit Offer' : 'Add Offer'}
                </button>
              )}
            </div>

            {/* READ-ONLY DISPLAY VIEW */}
            {!isEditingOffer ? (
              deal.offerDetails ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Purchase Price</span>
                    <strong className="text-[#0F172A] text-sm font-mono">${deal.offerDetails.purchasePrice.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Earnest Money</span>
                    <strong className="text-[#0F172A] text-sm font-mono">${deal.offerDetails.earnestMoney.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Option Fee & Days</span>
                    <strong className="text-[#0F172A] text-sm font-mono">${deal.offerDetails.optionFee} ({deal.offerDetails.optionPeriodDays} Days)</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Buyer Entity</span>
                    <strong className="text-[#0F172A] text-xs">{deal.offerDetails.buyerEntity}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Closing Target Date</span>
                    <strong className="text-[#155EEF] font-mono text-xs">{deal.offerDetails.closingDate}</strong>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#64748B]">
                  No formal offer submitted yet. {!isReadOnly && 'Click "Add Offer" to enter purchase terms.'}
                </div>
              )
            ) : (
              /* EDITING / ENTRY FORM VIEW */
              <form onSubmit={handleSaveOffer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={purchasePriceInput}
                      onChange={(e) => setPurchasePriceInput(e.target.value)}
                      placeholder="e.g. 450000"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                      Earnest Money ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={earnestMoneyInput}
                      onChange={(e) => setEarnestMoneyInput(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                      Option Fee ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={optionFeeInput}
                      onChange={(e) => setOptionFeeInput(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                      Option Period (Days)
                    </label>
                    <input
                      type="number"
                      required
                      value={optionDaysInput}
                      onChange={(e) => setOptionDaysInput(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                      Buyer Purchasing Entity
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerEntityInput}
                      onChange={(e) => setBuyerEntityInput(e.target.value)}
                      placeholder="Apex Acquisitions DFW LLC"
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#475569] mb-1">
                      Closing Target Date
                    </label>
                    <input
                      type="date"
                      required
                      value={closingDateInput}
                      onChange={(e) => setClosingDateInput(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditingOffer(false)}
                    className="px-3.5 py-2 bg-slate-100 border border-[#E2E8F0] text-[#475569] hover:bg-slate-200 text-xs font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Save Offer Terms
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* GENERATED CONTRACTS LOG */}
          <div className="executive-panel rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">
              Generated Contract Documents ({deal.generatedContracts?.length || 0})
            </h3>

            {deal.generatedContracts && deal.generatedContracts.length > 0 ? (
              <div className="space-y-2">
                {deal.generatedContracts.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#155EEF]" />
                      <div>
                        <div className="font-bold text-[#0F172A]">{c.fileName}</div>
                        <div className="text-[10px] text-[#64748B]">{c.templateName} &bull; Generated by {c.generatedBy} on {c.generatedAt}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Simulated download: ${c.fileName}`)}
                      className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] text-center py-4">
                No contracts generated yet. Click "GENERATE CONTRACT" above.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* CONTRACT GENERATOR WIZARD MODAL */}
      {showContractWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-xl rounded-2xl p-6 relative space-y-4 shadow-2xl border border-[#E2E8F0]">
            <button onClick={() => setShowContractWizard(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#155EEF]/20 text-[#155EEF]">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1F3A]">Generate Real Estate Contract</h3>
                <p className="text-xs text-[#475569]">Step {wizardStep} of 4 • Auto-populates Underwriting Terms</p>
              </div>
            </div>

            {/* STEP 1: SELECT TEMPLATE */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <label className="block text-[#475569] font-bold">Select Contract Template</label>
                <div className="space-y-2">
                  {[
                    'TREC One to Four Family Residential Contract (Resale)',
                    'Apex Standard Cash Purchase & Sale Agreement',
                    'Assignment of Real Estate Purchase Contract'
                  ].map((t) => (
                    <div
                      key={t}
                      onClick={() => setSelectedTemplate(t)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedTemplate === t ? 'bg-[#EAF2FF] border-[#155EEF] text-[#155EEF] font-bold' : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setWizardStep(2)}
                  className="w-full py-3 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Next: Review Fields & Validation &rarr;
                </button>
              </div>
            )}

            {/* STEP 2: REVIEW REQUIRED FIELDS */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <div className="flex justify-between text-[#475569]"><span>Target Property:</span><strong className="text-[#0F172A]">{deal.address}</strong></div>
                  
                  <div>
                    <label className="block text-[#64748B] mb-1">Purchase Price ($)</label>
                    <input
                      type="number"
                      value={purchasePriceVal}
                      onChange={(e) => setPurchasePriceVal(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] font-mono focus:outline-none focus:border-[#155EEF]"
                    />
                  </div>

                  <div className="flex justify-between text-[#475569]"><span>Buyer Entity:</span><strong className="text-[#0F172A]">{deal.offerDetails?.buyerEntity || 'Apex Acquisitions DFW LLC'}</strong></div>
                </div>

                {purchasePriceVal <= 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4" /> Required purchase price field is missing or invalid.
                  </div>
                )}

                <button
                  disabled={purchasePriceVal <= 0}
                  onClick={() => {
                    setWizardStep(3);
                    handleGenerateContract();
                  }}
                  className="w-full py-3 btn-executive-primary disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm & Generate Document Bundle
                </button>
              </div>
            )}

            {/* STEP 3: LOADING */}
            {wizardStep === 3 && (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#155EEF] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#0F172A]">Compiling Legal Clauses & Merging Fields...</p>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center mx-auto text-lg">
                  ✓
                </div>
                <h4 className="text-base font-bold text-[#0B1F3A]">Contract Package Generated!</h4>
                <p className="text-[#475569]">PDF and DOCX bundles are generated and attached to deal records.</p>

                <button
                  onClick={() => setShowContractWizard(false)}
                  className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Return To Deal Details
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
