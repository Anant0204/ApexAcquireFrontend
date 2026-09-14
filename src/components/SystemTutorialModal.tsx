import React, { useState } from 'react';
import {
  X,
  Send,
  Bot,
  Building,
  Flame,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Agent Outreach / AI Outreach Pipeline',
    subtitle: '10 Stages, 5-Touch Sequences & 30-Day Nurture',
    icon: Send,
    color: 'from-blue-600 to-indigo-700',
    description: 'The Outreach Pipeline automatically enrolls licensed realtors in a high-converting 5-touch initial cadence. If no reply occurs after 5 touches, contacts fall back into the permanent 30-day nurture loop.',
    highlights: [
      '10 Exact Stages from "Queued for Outreach" to closed statuses',
      '5-Touch Cadence progress tracker (Touch 1/5 → 5/5)',
      '30-Day Nurture Auto-Recycle: After 30 days, contacts recycle back to "Queued for Outreach" with recycle counter',
      'One-click "Recycle to Queued" action button for manual acceleration'
    ]
  },
  {
    step: 2,
    title: 'AI Qualification & Temperature Auto-Grader',
    subtitle: 'Hot 🔥, Warm ⚡, and Cold ❄️ Classification',
    icon: Bot,
    color: 'from-teal-600 to-emerald-700',
    description: 'When a realtor replies, the AI acquisition bot engages in natural SMS/email dialogs, extracts property details, and classifies contact temperature based on conversation flow.',
    highlights: [
      '🔥 HOT: Provided exact property address, price, and urgent closing timeline',
      '⚡ WARM: Confirmed off-market pocket listings or checking with sellers',
      '❄️ COLD: Unresponsive or in 30-day nurture loop',
      'Custom dropdown to manually adjust temperature anytime across all views'
    ]
  },
  {
    step: 3,
    title: 'AI Deals Pipeline & Multi-Deal Tracking',
    subtitle: '8 Stages • Multiple Properties per Realtor',
    icon: Building,
    color: 'from-indigo-600 to-blue-800',
    description: 'Captured property addresses are automatically cloned into AI Deals. Unlike outreach, deals do not recycle and track individual properties all the way to closing.',
    highlights: [
      '8 Exact Deal Stages: New Property, Qualifying, Offer Made, Offer Accepted, Offer Rejected, TRASH, Duplicate Lead, Need Help',
      'Multi-Opportunity support: The same realtor can have multiple active property deals simultaneously',
      'Built-in MAO (Maximum Allowable Offer) underwriting calculator and legal contract generator'
    ]
  },
  {
    step: 4,
    title: 'Automated Operations & Manager Escalation',
    subtitle: 'Instant Tasks on Human Touch, Leads, and "Need Help"',
    icon: Flame,
    color: 'from-amber-500 to-rose-600',
    description: 'The system automatically creates actionable tasks in your Task Inbox when human intervention is needed so nothing slips through the cracks.',
    highlights: [
      'Needs Human Touch: AI bot pauses and creates a high-priority task for the acquisition agent',
      'Lead Created: Generates an underwriting task and clones the opportunity into AI Deals',
      'Need Help: Automatically creates a manager escalation task and sends instant alerts'
    ]
  },
  {
    step: 5,
    title: 'Phone Call AI-Pause Safeguard',
    subtitle: 'Zero Bot Collisions During Live Calls',
    icon: PhoneCall,
    color: 'from-purple-600 to-indigo-900',
    description: 'Whenever you dial or log a phone call with a contact, the system immediately halts all automated AI texting, sets status to "Needs Human Touch", and creates a post-call follow-up task.',
    highlights: [
      'Click-To-Call dialer with live timer and outcome logger',
      'Guaranteed AI silence while speaking directly with agents',
      'Auto-generates follow-up tasks to send formal LOI or terms'
    ]
  }
];

export const SystemTutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIdx];
  const isLast = currentStepIdx === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onClose();
    } else {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="executive-panel w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/80 hover:text-white z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Step Header Banner */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${currentStep.color} text-white relative overflow-hidden`}>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-white/80 uppercase tracking-wider">
            <span>System Walkthrough</span>
            <span>&bull;</span>
            <span>Step {currentStep.step} of {TUTORIAL_STEPS.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-md shrink-0">
              <currentStep.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Body Description & Highlights */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
            {currentStep.description}
          </p>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Key Capabilities & Rules:
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {currentStep.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#0F172A]"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="font-medium leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIdx ? 'w-6 bg-[#155EEF]' : 'w-2 bg-[#CBD5E1]'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 btn-executive-primary text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4" /> Complete Walkthrough
                </>
              ) : (
                <>
                  Next Step <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
