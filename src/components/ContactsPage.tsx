import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { RealtorContact, OutreachStage, ContactTemperature, Grade } from '../types/crm';
import {
  Users,
  Upload,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  X,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  RotateCcw
} from 'lucide-react';

interface ContactsProps {
  onSelectContact: (contact: RealtorContact) => void;
  onOpenCallModal?: (contact: RealtorContact) => void;
}

const OUTREACH_STAGES_LIST: OutreachStage[] = [
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

export const ContactsPage: React.FC<ContactsProps> = ({ onSelectContact, onOpenCallModal }) => {
  const { 
    contacts, 
    addContact, 
    updateContact, 
    updateContactTemperature, 
    updateContactStage, 
    archiveContact, 
    bulkUpdateContacts, 
    importContacts, 
    currentUser 
  } = useApp();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<RealtorContact | null>(null);
  const [archivingContactId, setArchivingContactId] = useState<string | null>(null);
  const [showCsvWizard, setShowCsvWizard] = useState(false);
  const [csvStep, setCsvStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    brokerage: '',
    email: '',
    phone: '',
    market: 'Dallas Metro',
    status: 'Queued for Outreach' as OutreachStage,
    outreachStage: 'Queued for Outreach' as OutreachStage,
    temperature: 'Warm' as ContactTemperature,
    ownerId: currentUser.id,
    ownerName: currentUser.name,
    tags: ['Realtor Directory'],
    grade: 'B' as Grade,
    score: 75,
    sequenceInfo: {
      currentTouch: 0,
      totalTouches: 5,
      nurtureDay: 0,
      recycleCount: 0,
      lastTouchDate: 'Never',
      nextScheduledTouch: 'Touch 1 Ready',
      channel: 'sms' as const
    },
    propertyDealIds: []
  });

  const [apiContacts, setApiContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/v1/contacts', {
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
    fetchContacts();
  }, []);

  const activeContacts = apiContacts.filter(c => !c.isArchived);

  const filteredContacts = activeContacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brokerage.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const matchesStage = stageFilter === 'ALL' || c.outreachStage === stageFilter;
    const matchesTemp = temperatureFilter === 'ALL' || c.temperature === temperatureFilter;

    return matchesSearch && matchesStage && matchesTemp;
  });

  if (loading) {
    return <div className="p-6 text-center text-[#475569]">Loading Contacts Directory...</div>;
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredContacts.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleCreateOrUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateContact(editingContact.id, formData);
      setEditingContact(null);
    } else {
      addContact({
        ...formData,
        lastContacted: 'Just now',
        lastResponse: 'None',
        notes: []
      });
    }
    setShowAddModal(false);
  };

  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';
  const canCreate = isAdmin || isManager;
  const canBulk = isAdmin || isManager;
  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="space-y-6 max-w-full pb-12">

      {/* Header & Main CTAs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase">
              Realtor Master Database
            </span>
            <span className="text-xs text-[#64748B]">&bull; 10 Outreach Stages &bull; Temperature Custom Field</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A] flex items-center gap-2">
            Realtor Contacts Directory
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#155EEF] text-white">
              {activeContacts.length} Active
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage licensed realtors across DFW, outreach sequence progress, Hot/Warm/Cold temperature grading, and linked property deals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => { setShowCsvWizard(true); setCsvStep(1); }}
              className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F5F8FC] hover:border-[#BFDBFE] text-[#0F172A] text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#155EEF]" /> Upload CSV
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => {
                setEditingContact(null);
                setFormData({
                  name: '',
                  licenseNumber: '',
                  brokerage: '',
                  email: '',
                  phone: '',
                  market: 'Dallas Metro',
                  status: 'Queued for Outreach',
                  outreachStage: 'Queued for Outreach',
                  temperature: 'Warm',
                  ownerId: currentUser.id,
                  ownerName: currentUser.name,
                  tags: ['Realtor Directory'],
                  grade: 'B',
                  score: 75,
                  sequenceInfo: {
                    currentTouch: 0,
                    totalTouches: 5,
                    nurtureDay: 0,
                    recycleCount: 0,
                    lastTouchDate: 'Never',
                    nextScheduledTouch: 'Touch 1 Ready',
                    channel: 'sms'
                  },
                  propertyDealIds: []
                });
                setShowAddModal(true);
              }}
              className="px-4 py-2 btn-executive-primary text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Realtor
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="executive-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, brokerage, phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#155EEF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <Filter className="w-3.5 h-3.5" /> Stage:
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#155EEF]"
          >
            <option value="ALL">All 10 Stages</option>
            {OUTREACH_STAGES_LIST.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Temperature Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#475569] ml-2">Temp:</div>
          <select
            value={temperatureFilter}
            onChange={(e) => setTemperatureFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#155EEF]"
          >
            <option value="ALL">All Temps</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">⚡ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && canBulk && (
        <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-between shadow-xs">
          <div className="text-xs text-[#155EEF] font-bold">
            {selectedIds.length} Realtors Selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                bulkUpdateContacts(selectedIds, { status: 'Queued for Outreach', outreachStage: 'Queued for Outreach' });
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 rounded-lg btn-executive-primary text-white text-xs font-bold cursor-pointer"
            >
              Enroll in 5-Touch Cadence
            </button>
            <button
              onClick={() => {
                bulkUpdateContacts(selectedIds, { status: 'Opted Out / DND - CLOSED', outreachStage: 'Opted Out / DND - CLOSED' });
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#E11D48] hover:bg-rose-50 text-xs font-semibold"
            >
              Set DND / Opt Out
            </button>
          </div>
        </div>
      )}

      {/* REALTOR CONTACTS TABLE */}
      <div className="executive-panel rounded-2xl overflow-hidden shadow-xs border border-[#E2E8F0]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider text-[10px] bg-[#F8FAFC]">
                {canBulk && (
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="py-3 px-4">Realtor Name & Brokerage</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Outreach Stage</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">Sequence / Nurture</th>
                <th className="py-3 px-4">Linked Deals</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {filteredContacts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  {canBulk && (
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => handleToggleSelect(c.id)}
                      />
                    </td>
                  )}

                  <td className="py-3.5 px-4 cursor-pointer" onClick={() => onSelectContact(c)}>
                    <div className="font-bold text-[#0B1F3A] group-hover:text-[#155EEF] transition-colors">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-[#475569]">{c.brokerage} &bull; <span className="font-mono text-[10px]">{c.licenseNumber}</span></div>
                  </td>

                  <td className="py-3.5 px-4 cursor-pointer" onClick={() => onSelectContact(c)}>
                    <div className="text-[#475569] flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#64748B]" /> {c.email}
                    </div>
                    <div className="text-[#64748B] text-[11px] flex items-center gap-1.5 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-[#64748B]" /> {c.phone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      c.outreachStage === 'Lead Created' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      c.outreachStage === 'Needs Human Touch' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      c.outreachStage === 'Responded/Qualifying' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                      c.outreachStage === 'Outreach Sent' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      c.outreachStage === 'No Response, In 30-Day Nurture' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {c.outreachStage}
                    </span>
                  </td>

                  {/* Temperature Dropdown (Inline edit) */}
                  <td className="py-3.5 px-4">
                    <select
                      value={c.temperature}
                      disabled={isReadOnly}
                      onChange={(e) => updateContactTemperature(c.id, e.target.value as ContactTemperature)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                        c.temperature === 'Hot' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        c.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <option value="Hot">🔥 Hot</option>
                      <option value="Warm">⚡ Warm</option>
                      <option value="Cold">❄️ Cold</option>
                    </select>
                  </td>

                  {/* Sequence Progress */}
                  <td className="py-3.5 px-4">
                    {c.outreachStage === 'Outreach Sent' && (
                      <span className="px-2 py-0.5 bg-[#EAF2FF] text-[#155EEF] font-bold text-[10px] rounded-lg">
                        Touch {c.sequenceInfo.currentTouch}/5
                      </span>
                    )}
                    {c.outreachStage === 'No Response, In 30-Day Nurture' && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-lg flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5" /> Day {c.sequenceInfo.nurtureDay || 18}/30 ({c.sequenceInfo.recycleCount || 0}x)
                      </span>
                    )}
                    {c.outreachStage === 'Queued for Outreach' && (
                      <span className="text-[10px] text-[#64748B]">Ready for Launch</span>
                    )}
                    {c.outreachStage === 'Lead Created' && (
                      <span className="text-[10px] text-emerald-700 font-bold">Captured</span>
                    )}
                  </td>

                  {/* Linked Deals */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold text-[#155EEF] bg-[#EAF2FF] px-2 py-0.5 rounded">
                      {c.propertyDealIds?.length || 0} Deal(s)
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[#475569]">{c.ownerName}</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onOpenCallModal && (
                        <button
                          onClick={() => onOpenCallModal(c)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                          title="Call Realtor (Pauses AI)"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onSelectContact(c)}
                        className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#EAF2FF] text-[11px] font-semibold transition-all"
                      >
                        Profile
                      </button>

                      {canCreate && (
                        <button
                          onClick={() => {
                            setEditingContact(c);
                            setFormData({
                              name: c.name,
                              licenseNumber: c.licenseNumber,
                              brokerage: c.brokerage,
                              email: c.email,
                              phone: c.phone,
                              market: c.market,
                              status: c.outreachStage,
                              outreachStage: c.outreachStage,
                              temperature: c.temperature,
                              ownerId: c.ownerId,
                              ownerName: c.ownerName,
                              tags: c.tags,
                              grade: c.grade,
                              score: c.score,
                              sequenceInfo: c.sequenceInfo,
                              propertyDealIds: c.propertyDealIds as any || []
                            });
                            setShowAddModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#0B1F3A]"
                          title="Edit Realtor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canCreate && (
                        <button
                          onClick={() => setArchivingContactId(c.id)}
                          className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#E11D48] hover:bg-rose-50"
                          title="Archive Realtor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV IMPORT MODAL */}
      {showCsvWizard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-xl rounded-2xl p-6 relative space-y-4 bg-white shadow-2xl">
            <button onClick={() => setShowCsvWizard(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-[#155EEF]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1F3A]">Import Realtor CSV List</h3>
                <p className="text-xs text-[#64748B]">Auto-Maps Columns & Enrolls in Queued Outreach</p>
              </div>
            </div>

            {csvStep === 1 && (
              <div className="space-y-4 pt-2">
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center bg-[#F8FAFC] cursor-pointer">
                  <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
                  <p className="text-xs text-[#0F172A] font-semibold">Upload DFW Realtor CSV file</p>
                </div>
                <button
                  onClick={() => setCsvStep(2)}
                  className="w-full py-3 btn-executive-primary text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Simulate Upload "dfw_realtors_q3.csv"
                </button>
              </div>
            )}

            {csvStep === 2 && (
              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#475569]">Column: Name</span>
                  <strong className="text-[#155EEF]">&rarr; Full Name</strong>
                </div>
                <button
                  onClick={() => setCsvStep(3)}
                  className="w-full py-3 btn-executive-primary text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Confirm Mapping & Validate
                </button>
              </div>
            )}

            {csvStep === 3 && (
              <div className="space-y-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-[#155EEF] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>2 duplicate records detected & merged automatically.</span>
                </div>
                <button
                  onClick={() => {
                    importContacts([
                      {
                        name: 'Jonathan Sterling',
                        licenseNumber: 'TREC #0891234',
                        brokerage: 'Sotheby\'s International',
                        email: 'j.sterling@sothebys.com',
                        phone: '(214) 771-0099',
                        market: 'Dallas Metro - Southlake',
                        status: 'Queued for Outreach',
                        outreachStage: 'Queued for Outreach',
                        temperature: 'Warm',
                        sequenceInfo: {
                          currentTouch: 0,
                          totalTouches: 5,
                          nurtureDay: 0,
                          recycleCount: 0,
                          lastTouchDate: 'Never',
                          nextScheduledTouch: 'Touch 1 Ready',
                          channel: 'sms'
                        },
                        ownerId: currentUser.id,
                        ownerName: currentUser.name,
                        tags: ['Imported CSV'],
                        lastContacted: 'Just now',
                        lastResponse: 'None',
                        grade: 'B',
                        score: 78,
                        notes: []
                      }
                    ]);
                    setShowCsvWizard(false);
                  }}
                  className="w-full py-3 bg-[#16A34A] text-white font-bold text-xs rounded-xl"
                >
                  Import 48 Valid Records To CRM
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MANUAL ADD / EDIT CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 bg-white shadow-2xl">
            <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0B1F3A]">{editingContact ? 'Edit Realtor Record' : 'Add Realtor Contact'}</h3>

            <form onSubmit={handleCreateOrUpdateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-semibold mb-1">TREC License Number</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-semibold mb-1">Brokerage Office</label>
                  <input
                    type="text"
                    required
                    value={formData.brokerage}
                    onChange={(e) => setFormData({ ...formData, brokerage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-semibold mb-1">Outreach Stage</label>
                  <select
                    value={formData.outreachStage}
                    onChange={(e) => setFormData({ ...formData, outreachStage: e.target.value as OutreachStage, status: e.target.value as OutreachStage })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    {OUTREACH_STAGES_LIST.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] font-semibold mb-1">Temperature</label>
                  <select
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value as ContactTemperature })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">⚡ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-colors cursor-pointer"
              >
                {editingContact ? 'Save Changes' : 'Save Realtor To Directory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ARCHIVE MODAL */}
      {archivingContactId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-sm rounded-2xl p-6 relative space-y-4 text-center bg-white shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-[#E11D48] mx-auto" />
            <h3 className="text-base font-bold text-[#0B1F3A]">Archive Realtor Record?</h3>
            <p className="text-xs text-[#64748B]">Soft-deletes record while preserving audit trail history.</p>
            <div className="flex gap-2">
              <button onClick={() => setArchivingContactId(null)} className="flex-1 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-xl">Cancel</button>
              <button
                onClick={() => {
                  archiveContact(archivingContactId);
                  setArchivingContactId(null);
                }}
                className="flex-1 py-2.5 bg-[#E11D48] text-white text-xs font-bold rounded-xl"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
