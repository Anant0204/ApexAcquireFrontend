import React, { useState } from 'react';
import type { RealtorContact } from '../types/crm';
import { useApp } from '../context/AppContext';
import { Phone, X, PhoneOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CallModalProps {
  contact: RealtorContact | null;
  onClose: () => void;
}

export const ClickToCallModal: React.FC<CallModalProps> = ({ contact, onClose }) => {
  const { logAuditAction, handlePhoneCallInitiated } = useApp();
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('Spoke with Agent - Discussed Criteria');

  if (!contact) return null;

  const handleStartCall = () => {
    // Trigger Phone Call Safeguard Action: Pauses AI bot, moves stage to "Needs Human Touch", creates task
    handlePhoneCallInitiated(contact.id, contact.name);

    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
    }, 1500);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
  };

  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    logAuditAction(`Logged phone call session with ${contact.name} (${callOutcome})`, `Contact #${contact.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="executive-panel w-full max-w-md rounded-3xl p-6 relative bg-white border border-[#E2E8F0] shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          
          {/* Avatar Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAF2FF] to-[#DBEAFE] text-[#155EEF] border border-[#BFDBFE] font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
            {contact.name.substring(0, 2)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0B1F3A]">{contact.name}</h3>
            <p className="text-xs text-[#475569]">{contact.brokerage} &bull; <span className="font-mono text-[#0F172A] font-semibold">{contact.phone}</span></p>
          </div>

          {/* AI-Pause Safeguard Alert Banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Phone Call AI Safeguard:</strong> Initiating a call will immediately halt automated AI SMS, set stage to <em>Needs Human Touch</em>, and create a follow-up task.
            </div>
          </div>

          {callStatus === 'idle' && (
            <button
              onClick={handleStartCall}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" /> Initiate Call & Pause AI Texting
            </button>
          )}

          {callStatus === 'calling' && (
            <div className="py-4 space-y-2">
              <div className="text-[#155EEF] font-mono text-xs font-bold animate-pulse">
                Connecting to {contact.phone}...
              </div>
            </div>
          )}

          {callStatus === 'connected' && (
            <div className="py-4 space-y-3">
              <div className="text-emerald-600 font-mono text-sm font-bold flex items-center justify-center gap-2 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Live Call in Progress (01:24)
              </div>
              <button
                onClick={handleEndCall}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <PhoneOff className="w-4 h-4" /> End Call & Log Notes
              </button>
            </div>
          )}

          {callStatus === 'ended' && (
            <form onSubmit={handleSaveCall} className="space-y-3 text-xs text-left pt-2">
              <div>
                <label className="block text-[#475569] font-semibold mb-1">Call Outcome</label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm cursor-pointer"
                >
                  <option value="Spoke with Agent - Discussed Criteria">Spoke with Agent — Discussed Criteria (Interested)</option>
                  <option value="Spoke with Agent - Has Pocket Listing">Spoke with Agent — Has Pocket Listing (Lead Created)</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Wrong Number / DNC">Wrong Number / DNC</option>
                </select>
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Call Notes & Summary</label>
                <textarea
                  rows={3}
                  required
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Record property details, seller timeline, or agreed follow-up..."
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF] shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Call & Complete Task
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
