import React, { useState } from 'react';
import type { RealtorContact, ContactTemperature, OutreachStage } from '../types/crm';
import { useApp } from '../context/AppContext';
import { X, Mail, Phone, Pause, Play, Ban, Building, Home, RotateCcw, Flame, CheckCircle2 } from 'lucide-react';

interface ContactDrawerProps {
  contact: RealtorContact | null;
  onClose: () => void;
  onOpenCallModal: (contact: RealtorContact) => void;
}

export const ContactDetailDrawer: React.FC<ContactDrawerProps> = ({ contact, onClose, onOpenCallModal }) => {
  const { 
    updateContact, 
    updateContactTemperature, 
    updateContactStage, 
    recycleContactToQueued, 
    deals, 
    currentUser, 
    logAuditAction 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'deals' | 'notes'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>(contact?.notes || [
    'Agent mentioned seller is highly motivated for all-cash quick close.',
    'Confirmed TREC active status and verified license details.'
  ]);

  if (!contact) return null;

  const isReadOnly = currentUser.role === 'READ_ONLY';

  // Find all property deals linked to this contact
  const linkedDeals = deals.filter(d => d.contactId === contact.id || contact.propertyDealIds?.includes(d.id));

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotesList([newNote, ...notesList]);
    setNewNote('');
    logAuditAction(`Added manual note to contact`, `Contact #${contact.id}`);
  };

  const timelineEvents = [
    { type: 'sms_reply', title: 'Realtor SMS Reply Received', desc: '"Yes, 4812 Bordeaux Ave in Highland Park! Asking $1,450,000..."', time: '10 mins ago', actor: contact.name },
    { type: 'ai_response', title: 'AI Automation Dispatched', desc: 'Asked for exact property address and asking price.', time: '12 mins ago', actor: 'Apex AI Bot' },
    { type: 'sms_sent', title: 'Outreach SMS Sent', desc: 'Initial cadence touchpoint dispatched.', time: '15 mins ago', actor: 'Cadence Engine' },
    { type: 'status_change', title: 'Status Changed to Lead Created', desc: 'Property opportunity captured & cloned into AI Deals.', time: '15 mins ago', actor: 'System' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-[#E2E8F0] h-full flex flex-col shadow-2xl relative">
        
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-[#E2E8F0] flex items-start justify-between bg-white">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#0B1F3A]">{contact.name}</h2>
              
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                contact.outreachStage === 'Lead Created' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                contact.outreachStage === 'Needs Human Touch' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]'
              }`}>
                {contact.outreachStage}
              </span>

              {/* Temperature Badge */}
              <select
                value={contact.temperature}
                disabled={isReadOnly}
                onChange={(e) => updateContactTemperature(contact.id, e.target.value as ContactTemperature)}
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none ${
                  contact.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  contact.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <option value="Hot">🔥 Hot</option>
                <option value="Warm">⚡ Warm</option>
                <option value="Cold">❄️ Cold</option>
              </select>
            </div>

            <p className="text-xs text-[#475569] mt-1">{contact.brokerage} &bull; <span className="font-mono text-[#64748B]">{contact.licenseNumber}</span></p>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIONS BAR */}
        {!isReadOnly && (
          <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCallModal(contact)}
                className="px-3.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" /> Call Realtor (Pauses AI)
              </button>
              
              {contact.outreachStage === 'No Response, In 30-Day Nurture' ? (
                <button
                  onClick={() => recycleContactToQueued(contact.id)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Recycle to Queued
                </button>
              ) : (
                <button
                  onClick={() => updateContactStage(contact.id, 'Needs Human Touch')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-amber-50 text-amber-800 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" /> Pause Bot
                </button>
              )}

              <button
                onClick={() => updateContactStage(contact.id, 'Opted Out / DND - CLOSED')}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-rose-50 text-[#E11D48] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
              >
                <Ban className="w-3.5 h-3.5" /> Set DND
              </button>
            </div>

            <div className="text-right">
              <div className="text-[9px] text-[#64748B] uppercase font-bold">Qualification Score</div>
              <div className="font-extrabold font-mono text-[#155EEF] text-xs sm:text-sm">Grade {contact.grade} ({contact.score})</div>
            </div>
          </div>
        )}

        {/* METADATA GRID */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-[#E2E8F0] text-xs bg-[#F8FAFC]">
          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Market</span>
            <span className="text-[#0B1F3A] font-semibold">{contact.market}</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Assigned Owner</span>
            <span className="text-[#0B1F3A] font-semibold">{contact.ownerName}</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Sequence Status</span>
            <span className="text-[#155EEF] font-mono font-semibold">
              {contact.outreachStage === 'Outreach Sent' ? `Touch ${contact.sequenceInfo.currentTouch}/5` :
               contact.outreachStage === 'No Response, In 30-Day Nurture' ? `Day ${contact.sequenceInfo.nurtureDay}/30 (${contact.sequenceInfo.recycleCount}x Recycled)` :
               contact.outreachStage}
            </span>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-[#E2E8F0] bg-white px-4">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'timeline' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B]'
            }`}
          >
            Activity Timeline
          </button>
          
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'deals' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B]'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Associated Deals ({linkedDeals.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'notes' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B]'
            }`}
          >
            Agent Notes ({notesList.length})
          </button>
        </div>

        {/* TAB CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
          
          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="relative pl-6 border-l-2 border-[#E2E8F0] space-y-6">
              {timelineEvents.map((ev, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#155EEF]" />
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-[#0B1F3A]">{ev.title}</h4>
                    <span className="text-[10px] text-[#64748B] font-mono">{ev.time}</span>
                  </div>
                  <p className="text-xs text-[#0F172A] bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
                    {ev.desc}
                  </p>
                  <div className="text-[9px] text-[#64748B] mt-1">Actor: {ev.actor}</div>
                </div>
              ))}
            </div>
          )}

          {/* ASSOCIATED DEALS TAB (MULTI-DEAL PER CONTACT) */}
          {activeTab === 'deals' && (
            <div className="space-y-3">
              <div className="text-xs text-[#64748B]">
                This contact has <strong>{linkedDeals.length} active property deal(s)</strong> in the AI Deals pipeline.
              </div>

              {linkedDeals.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] text-xs text-[#64748B]">
                  No property deals associated with this realtor yet.
                </div>
              ) : (
                linkedDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2 hover:border-[#155EEF] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#155EEF]" />
                        <span className="font-bold text-xs text-[#0B1F3A]">{deal.address}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]">
                        {deal.stage}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#475569] pt-1">
                      <span>{deal.city}, {deal.state} {deal.zip}</span>
                      <strong className="font-mono text-emerald-700">${deal.askingPrice.toLocaleString()}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {!isReadOnly && (
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log specific realtor requirements..."
                    className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#155EEF]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Save Note To Contact
                  </button>
                </form>
              )}

              <div className="space-y-2 pt-2">
                {notesList.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#0F172A] shadow-xs">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
