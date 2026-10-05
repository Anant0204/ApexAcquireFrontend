import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { EmailTemplate, WorkflowRule, AIPersonalityConfig } from '../types/crm';
import {
  FileText,
  Zap,
  Bot,
  Plus,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
  Shield,
  Clock,
  Trash2,
  Edit2,
  X,
  Copy,
  Check
} from 'lucide-react';

export const TemplatesAutomationsPage: React.FC = () => {
  const { 
    templates, 
    addTemplate, 
    updateTemplate, 
    deleteTemplate, 
    workflows, 
    toggleWorkflow, 
    simulateWorkflow, 
    aiConfig, 
    updateAIConfig,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'templates' | 'workflows' | 'ai_personality'>('templates');
  const [templateCategory, setTemplateCategory] = useState<'ALL' | '5_touch_cadence' | '30_day_nurture' | 'deal_offers'>('ALL');
  
  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategoryVal, setTemplateCategoryVal] = useState<'5_touch_cadence' | '30_day_nurture' | 'deal_offers' | 'general'>('5_touch_cadence');
  const [templateChannel, setTemplateChannel] = useState<'sms' | 'email'>('sms');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Config Form State
  const [aiPersonaName, setAiPersonaName] = useState('Institutional Buyer (Default)');
  const [aiTone, setAiTone] = useState('direct');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiCreativity, setAiCreativity] = useState(0.2);
  const [aiMaxReplies, setAiMaxReplies] = useState(4);
  const [aiSavedToast, setAiSavedToast] = useState(false);

  const [apiTemplates, setApiTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTemplatesAndSettings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [tplRes, setRes] = await Promise.all([
          fetch(`${API_BASE_URL}/templates`, { headers }),
          fetch(`${API_BASE_URL}/settings`, { headers })
        ]);
        
        const tplJson = await tplRes.json();
        const setJson = await setRes.json();
        
        if (tplJson.success) setApiTemplates(tplJson.data);
        if (setJson.success && setJson.data) {
          setAiInstructions(setJson.data.aiPersonaInstructions || '');
          setAiMaxReplies(setJson.data.aiConsecutiveReplyCap || 4);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplatesAndSettings();
  }, []);

  // Filtered Templates
  const filteredTemplates = apiTemplates.filter(t => {
    if (templateCategory === 'ALL') return true;
    return t.category === templateCategory;
  });

  const handleCopyTemplate = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: templateName,
        category: templateCategoryVal,
        channel: templateChannel,
        subject: templateSubject,
        body: templateBody
      });
    } else {
      addTemplate({
        name: templateName,
        category: templateCategoryVal,
        channel: templateChannel,
        subject: templateSubject,
        body: templateBody,
        variables: ['first_name', 'market', 'property_address']
      });
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleSaveAIConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aiPersonaInstructions: aiInstructions,
          aiConsecutiveReplyCap: aiMaxReplies
        })
      });
      setAiSavedToast(true);
      setTimeout(() => setAiSavedToast(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase">
            Automation & AI Engine Studio
          </span>
          <span className="text-xs text-[#64748B]">&bull; Sequences, Workflow Triggers & Bot Personality</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A]">
          Templates, Workflows & AI Personality
        </h1>
        <p className="text-xs text-[#475569] mt-1">
          Manage omnichannel outreach sequences (5-touch cadence + 30-day nurture), automation execution rules, and conversational AI fine-tuning.
        </p>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-[#E2E8F0] space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'templates' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <FileText className="w-4 h-4" /> Email & SMS Templates ({apiTemplates.length})
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'workflows' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Zap className="w-4 h-4 text-[#155EEF]" /> Workflows & Flowcharts ({workflows.length})
        </button>

        <button
          onClick={() => setActiveTab('ai_personality')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ai_personality' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Bot className="w-4 h-4 text-[#155EEF]" /> AI Agent Personality & Rules
        </button>
      </div>

      {/* TAB 1: EMAIL & SMS TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          
          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['ALL', '5_touch_cadence', '30_day_nurture', 'deal_offers'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    templateCategory === cat ? 'bg-[#0B1F3A] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Templates' :
                   cat === '5_touch_cadence' ? '5-Touch Cadence' :
                   cat === '30_day_nurture' ? '30-Day Nurture' : 'Deal Offers & LOI'}
                </button>
              ))}
            </div>

            {!isReadOnly && (
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setTemplateName('');
                  setTemplateCategoryVal('5_touch_cadence');
                  setTemplateChannel('sms');
                  setTemplateSubject('');
                  setTemplateBody('');
                  setShowTemplateModal(true);
                }}
                className="px-3.5 py-2 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Template
              </button>
            )}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="executive-panel rounded-2xl p-5 space-y-3 bg-white border border-[#E2E8F0] shadow-xs hover:border-[#BFDBFE] transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-[#0B1F3A] leading-tight">
                      {tpl.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      tpl.channel === 'sms' ? 'bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {tpl.channel.toUpperCase()}
                    </span>
                  </div>

                  {tpl.subject && (
                    <div className="text-[11px] font-semibold text-[#155EEF] mb-1">
                      Subject: {tpl.subject}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans">
                    {tpl.body}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {tpl.variables.map((v: string) => (
                      <span key={v} className="px-1.5 py-0.5 bg-[#E2E8F0] rounded text-[9px] font-mono text-[#475569]">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-[10px]">
                  <span className="text-[#64748B]">Updated: {tpl.lastUpdated}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyTemplate(tpl.id, tpl.body)}
                      className="px-2.5 py-1 bg-white border border-[#E2E8F0] hover:bg-[#F5F8FC] text-[#0F172A] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedId === tpl.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#64748B]" />}
                      {copiedId === tpl.id ? 'Copied' : 'Copy'}
                    </button>

                    {!isReadOnly && (
                      <button
                        onClick={() => {
                          setEditingTemplate(tpl);
                          setTemplateName(tpl.name);
                          setTemplateCategoryVal(tpl.category);
                          setTemplateChannel(tpl.channel);
                          setTemplateSubject(tpl.subject || '');
                          setTemplateBody(tpl.body);
                          setShowTemplateModal(true);
                        }}
                        className="p-1 rounded bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]"
                        title="Edit Template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isReadOnly && (
                      <button
                        onClick={() => deleteTemplate(tpl.id)}
                        className="p-1 rounded bg-[#F8FAFC] text-rose-500 hover:text-rose-700"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: WORKFLOWS & FLOWCHARTS */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#BFDBFE] text-xs text-[#0B1F3A] flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-[#155EEF]" />
              <strong>Automations Engine Status:</strong> 6 Active System Workflows Listening to Outreach & Deals Events.
            </span>
            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live & Synced
            </span>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className={`executive-panel rounded-2xl p-5 border transition-all ${
                  wf.isActive ? 'bg-white border-[#E2E8F0] shadow-sm' : 'bg-[#F8FAFC] border-dashed border-[#CBD5E1] opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0B1F3A]">{wf.name}</h4>
                      <p className="text-[11px] text-[#64748B]">{wf.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[#64748B]">
                      Executed: <strong>{wf.executionCount} times</strong> ({wf.lastExecuted})
                    </span>

                    {!isReadOnly && (
                      <button
                        onClick={() => simulateWorkflow(wf.id)}
                        className="px-3 py-1.5 bg-[#F1F6FC] hover:bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3" /> Simulate Trigger
                      </button>
                    )}

                    {!isReadOnly && (
                      <button
                        onClick={() => toggleWorkflow(wf.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          wf.isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Flow Diagram (Trigger -> Condition -> Actions) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#155EEF] uppercase block mb-1">1. TRIGGER</span>
                    <span className="font-semibold text-[#0F172A]">{wf.trigger}</span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] font-bold text-[#D97706] uppercase block mb-1">2. CONDITION</span>
                    <span className="text-[#475569]">{wf.condition}</span>
                  </div>

                  <div className="p-3 bg-[#EAF2FF] rounded-xl border border-[#BFDBFE]">
                    <span className="text-[10px] font-bold text-[#16A34A] uppercase block mb-1">3. EXECUTED ACTIONS</span>
                    <ul className="space-y-0.5 text-[11px] text-[#0F172A] list-disc list-inside">
                      {wf.actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: AI AGENT PERSONALITY STUDIO */}
      {activeTab === 'ai_personality' && (
        <form onSubmit={handleSaveAIConfig} className="executive-panel rounded-2xl p-6 space-y-6 bg-white border border-[#E2E8F0] shadow-sm">
          
          <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="font-bold text-sm text-[#0B1F3A]">AI Outreach Agent Persona & Tone</h3>
              <p className="text-xs text-[#64748B]">Fine-tune GPT-4o acquisition bot conversation behavior and auto-grading thresholds.</p>
            </div>

            {aiSavedToast && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> AI Persona Config Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#475569] font-bold mb-1">Agent Persona Name</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={aiPersonaName}
                onChange={(e) => setAiPersonaName(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
              />
            </div>

            <div>
              <label className="block text-[#475569] font-bold mb-1">Tone & Voice</label>
              <select
                disabled={isReadOnly}
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
              >
                <option value="direct">Direct & Confident (Institutional Buyer)</option>
                <option value="consultative">Consultative & Professional</option>
                <option value="institutional">Institutional Executive</option>
                <option value="friendly">Friendly & Casual Broker</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#475569] font-bold mb-1 text-xs">
              System Instruction Prompt
            </label>
            <textarea
              rows={4}
              disabled={isReadOnly}
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              className="w-full p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          {/* Temperature Criteria Breakdown */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-[#0B1F3A] uppercase tracking-wider text-[11px]">
              AI Temperature Auto-Grading Rules
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  🔥 HOT Lead Rules
                </span>
                <ul className="text-[11px] text-rose-900 list-disc list-inside space-y-0.5">
                  <li>Specific address provided</li>
                  <li>Asking price under market</li>
                  <li>Fast 14-day cash timeline</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  ⚡ WARM Lead Rules
                </span>
                <ul className="text-[11px] text-amber-900 list-disc list-inside space-y-0.5">
                  <li>Has off-market pocket deals</li>
                  <li>Asks for Proof of Funds</li>
                  <li>Checking with seller</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  ❄️ COLD Lead Rules
                </span>
                <ul className="text-[11px] text-blue-900 list-disc list-inside space-y-0.5">
                  <li>No reply after 5 touches</li>
                  <li>In 30-day nurture cycle</li>
                  <li>Unresponsive or generic</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Safeguard Checkbox */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#0F172A]">Phone Call AI Safeguard</div>
              <div className="text-[#64748B] text-[11px]">Automatically halts AI SMS and creates task when a phone call is placed.</div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px]">
              Always Active
            </span>
          </div>

          {!isReadOnly && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Save AI Personality Settings
              </button>
            </div>
          )}

        </form>
      )}

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 bg-white shadow-2xl border border-[#E2E8F0]">
            <button onClick={() => setShowTemplateModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0B1F3A]">{editingTemplate ? 'Edit Template' : 'Add Outreach Template'}</h3>

            <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Touch 1: Highland Park Off-Market Intro"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Category</label>
                  <select
                    value={templateCategoryVal}
                    onChange={(e) => setTemplateCategoryVal(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="5_touch_cadence">5-Touch Cadence</option>
                    <option value="30_day_nurture">30-Day Nurture</option>
                    <option value="deal_offers">Deal Offers & LOI</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">Channel</label>
                  <select
                    value={templateChannel}
                    onChange={(e) => setTemplateChannel(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {templateChannel === 'email' && (
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="e.g. Official Cash LOI — {{property_address}}"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#475569] font-bold mb-1">Template Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Type message content with {{first_name}}, {{market}}, {{property_address}} tags..."
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-all shadow-md cursor-pointer"
              >
                Save Template
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
