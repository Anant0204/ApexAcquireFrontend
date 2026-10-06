import { API_BASE_URL } from '../config/api';
import React, { useState, useRef } from 'react';
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
  RotateCcw,
  Download,
  Check,
  FileText,
  ArrowLeft
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
    bulkDeleteContacts, 
    bulkUpdateContacts, 
    importContacts, 
    currentUser,
    hasPermission
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

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvContacts, setParsedCsvContacts] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [importingCsv, setImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [submitting, setSubmitting] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setApiContacts(json.data);
    } catch (e) {
      console.error('Error fetching contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one data row.');
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
    
    const getIndex = (keywords: string[]) => {
      return headers.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const nameIdx = getIndex(['name', 'full name', 'realtor', 'agent']);
    const licenseIdx = getIndex(['license', 'trec']);
    const brokerageIdx = getIndex(['brokerage', 'broker', 'company', 'office']);
    const emailIdx = getIndex(['email', 'mail']);
    const phoneIdx = getIndex(['phone', 'mobile', 'cell', 'tel']);
    const marketIdx = getIndex(['market', 'city', 'location', 'area']);
    const stageIdx = getIndex(['stage', 'status', 'outreach']);
    const tempIdx = getIndex(['temp', 'temperature']);

    const contactsList: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (row.length === 0 || row.every(c => c === '')) continue;

      const name = nameIdx !== -1 ? row[nameIdx] : (row[0] || 'Unknown Realtor');
      const licenseNumber = licenseIdx !== -1 ? row[licenseIdx] : '';
      const brokerage = brokerageIdx !== -1 ? row[brokerageIdx] : '';
      const email = emailIdx !== -1 ? row[emailIdx] : '';
      const phone = phoneIdx !== -1 ? row[phoneIdx] : '';
      const market = marketIdx !== -1 ? row[marketIdx] : 'Dallas Metro';
      const stage = stageIdx !== -1 ? row[stageIdx] : 'Queued for Outreach';
      const temp = tempIdx !== -1 ? row[tempIdx] : 'Warm';

      if (name || email || phone) {
        contactsList.push({
          name: name || 'Unnamed Realtor',
          licenseNumber: licenseNumber || 'Unverified',
          brokerage: brokerage || 'Independent',
          email: email || '',
          phone: phone || '',
          market: market || 'Dallas Metro',
          outreachStage: stage || 'Queued for Outreach',
          status: stage || 'Queued for Outreach',
          temperature: (['Hot', 'Cold', 'Warm'].includes(temp) ? temp : 'Warm') as ContactTemperature,
          ownerId: currentUser.id,
          ownerName: currentUser.name
        });
      }
    }

    return contactsList;
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setCsvError('Please select a valid .csv file.');
      return;
    }
    setCsvFile(file);
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCsvText(text);
        if (parsed.length === 0) {
          setCsvError('No valid realtor records found in CSV file.');
          return;
        }
        setParsedCsvContacts(parsed);
        setCsvStep(2);
      } catch (err: any) {
        setCsvError(err.message || 'Error parsing CSV file.');
      }
    };
    reader.onerror = () => {
      setCsvError('Failed to read CSV file.');
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Full Name,TREC License,Brokerage,Email,Phone,Market,Outreach Stage,Temperature\n" +
      "Jonathan Sterling,TREC #0891234,Sotheby's International,j.sterling@sothebys.com,(214) 771-0099,Dallas Metro - Southlake,Queued for Outreach,Warm\n" +
      "Sarah Jenkins,TREC #0789123,Compass Real Estate,sarah.j@compass.com,(214) 555-0199,Dallas Metro - Plano,Queued for Outreach,Hot\n" +
      "Michael Chang,TREC #0654321,Keller Williams,mchang@kw.com,(469) 555-0144,Dallas Metro - Frisco,Queued for Outreach,Warm";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "realtors_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteCsvImport = async () => {
    if (parsedCsvContacts.length === 0) return;
    setImportingCsv(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/contacts/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contacts: parsedCsvContacts })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setApiContacts(prev => [...json.data, ...prev]);
        importContacts(json.data);
      }
      setShowCsvWizard(false);
      setCsvFile(null);
      setParsedCsvContacts([]);
      setCsvStep(1);
    } catch (e) {
      console.error('Bulk import error:', e);
      setCsvError('Failed to import contacts to server.');
    } finally {
      setImportingCsv(false);
    }
  };

  React.useEffect(() => {
    fetchContacts();
  }, []);

  const activeContacts = apiContacts.filter(c => !c.isArchived);

  const filteredContacts = activeContacts.filter((c) => {
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.brokerage || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search);

    const matchesStage = stageFilter === 'ALL' || c.outreachStage === stageFilter;
    const matchesTemp = temperatureFilter === 'ALL' || c.temperature === temperatureFilter;

    return matchesSearch && matchesStage && matchesTemp;
  });

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

  const handleCreateOrUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('accessToken');
    try {
      if (editingContact) {
        const res = await fetch(`${API_BASE_URL}/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        const json = await res.json();
        if (json.success && json.data) {
          setApiContacts(prev => prev.map(c => c.id === editingContact.id ? json.data : c));
          updateContact(editingContact.id, json.data);
        }
        setEditingContact(null);
      } else {
        const res = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            lastContacted: 'Just now',
            lastResponse: 'None',
            notes: []
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          setApiContacts(prev => [json.data, ...prev]);
          addContact(json.data);
        }
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to save contact:', err);
      alert('Failed to save contact. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTemperature = async (id: string, temp: ContactTemperature) => {
    setApiContacts(prev => prev.map(c => c.id === id ? { ...c, temperature: temp } : c));
    updateContactTemperature(id, temp);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ temperature: temp })
      });
    } catch (err) {
      console.error('Failed to update temperature:', err);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to delete this realtor contact from the database?')) return;
    setApiContacts(prev => prev.filter(c => c.id !== id));
    archiveContact(id);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected realtors from the database?`)) {
      return;
    }
    setDeletingBulk(true);
    const idsToDelete = [...selectedIds];
    setApiContacts(prev => prev.filter(c => !idsToDelete.includes(c.id)));
    setSelectedIds([]);
    bulkDeleteContacts(idsToDelete);

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/contacts/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: idsToDelete })
      });
    } catch (err) {
      console.error('Failed to bulk delete contacts:', err);
      alert('Failed to delete contacts from database.');
      fetchContacts();
    } finally {
      setDeletingBulk(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-[#475569]">Loading Contacts Directory...</div>;
  }

  const canCreate = hasPermission('Contacts Directory', 'CREATE');
  const canEdit = hasPermission('Contacts Directory', 'EDIT');
  const canDelete = hasPermission('Contacts Directory', 'DELETE');
  const canBulk = canDelete;
  const isReadOnly = !canEdit;

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
          {canCreate && (
            <button
              onClick={() => {
                setShowCsvWizard(true);
                setCsvStep(1);
                setCsvFile(null);
                setParsedCsvContacts([]);
                setCsvError(null);
              }}
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
            <button
              onClick={handleBulkDelete}
              disabled={deletingBulk}
              className="px-3.5 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deletingBulk ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
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
                      onChange={(e) => handleUpdateTemperature(c.id, e.target.value as ContactTemperature)}
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

                      {canEdit && (
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

                      {canDelete && (
                        <button
                          onClick={() => handleArchive(c.id)}
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
          <div className="executive-panel w-full max-w-2xl rounded-2xl p-6 relative space-y-4 bg-white shadow-2xl">
            <button 
              onClick={() => {
                setShowCsvWizard(false);
                setCsvFile(null);
                setParsedCsvContacts([]);
                setCsvError(null);
                setCsvStep(1);
              }} 
              className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-[#155EEF]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1F3A]">Import Realtor CSV List</h3>
                <p className="text-xs text-[#64748B]">Auto-maps headers, parses records & loads them into CRM directory</p>
              </div>
            </div>

            {/* Error Banner */}
            {csvError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{csvError}</span>
              </div>
            )}

            {/* Step 1: Upload File */}
            {csvStep === 1 && (
              <div className="space-y-4 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-[#CBD5E1] hover:border-[#155EEF] hover:bg-[#F1F6FC] rounded-2xl p-8 text-center bg-[#F8FAFC] cursor-pointer transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EAF2FF] text-[#155EEF] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#0F172A] font-bold">Click to choose or drag & drop CSV file here</p>
                  <p className="text-xs text-[#64748B] mt-1">Supports standard CSV files (.csv) with name, phone, email, brokerage</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[#64748B]">Need a format reference?</span>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="flex items-center gap-1.5 text-[#155EEF] hover:text-[#1048B8] font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Preview & Validation */}
            {csvStep === 2 && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between p-3 bg-[#F0FDF4] rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{csvFile?.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                    {parsedCsvContacts.length} Realtors Ready
                  </span>
                </div>

                {/* Preview Table */}
                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#64748B] text-[10px] uppercase font-bold border-b border-[#E2E8F0] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Brokerage</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Phone</th>
                        <th className="py-2 px-3">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                      {parsedCsvContacts.slice(0, 5).map((contact, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="py-2 px-3 font-semibold">{contact.name}</td>
                          <td className="py-2 px-3 text-[#64748B]">{contact.brokerage}</td>
                          <td className="py-2 px-3 text-[#475569]">{contact.email || '-'}</td>
                          <td className="py-2 px-3 font-mono text-[11px]">{contact.phone || '-'}</td>
                          <td className="py-2 px-3 text-[10px] font-bold text-[#155EEF]">{contact.outreachStage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedCsvContacts.length > 5 && (
                  <p className="text-[11px] text-[#64748B] text-center">
                    ...and {parsedCsvContacts.length - 5} more records will be imported.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCsvStep(1);
                      setCsvFile(null);
                      setParsedCsvContacts([]);
                    }}
                    className="flex-1 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setCsvStep(3)}
                    className="flex-2 py-2.5 btn-executive-primary text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Proceed to Import ({parsedCsvContacts.length} Contacts)
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation & Submit */}
            {csvStep === 3 && (
              <div className="space-y-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-[#0F172A] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#155EEF]">
                    <Check className="w-5 h-5 text-[#155EEF]" />
                    <span>Confirmation Summary</span>
                  </div>
                  <p className="text-xs text-[#475569]">
                    You are about to import <strong>{parsedCsvContacts.length} realtor contacts</strong> into the CRM Directory and MySQL database.
                  </p>
                  <ul className="text-[11px] text-[#64748B] list-disc list-inside space-y-1 pt-1">
                    <li>Contacts will be enrolled with outreach status and temperature.</li>
                    <li>Auto-assigned to current logged-in user.</li>
                    <li>Instant directory update without page reload.</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={importingCsv}
                    onClick={() => setCsvStep(2)}
                    className="flex-1 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={importingCsv}
                    onClick={handleExecuteCsvImport}
                    className="flex-2 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {importingCsv ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Importing {parsedCsvContacts.length} Records...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Import {parsedCsvContacts.length} Records To CRM Directory</span>
                      </>
                    )}
                  </button>
                </div>
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
                  placeholder="e.g. Sarah Jenkins"
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
                    placeholder="e.g. TREC #0789123"
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
                    placeholder="e.g. Compass Real Estate"
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
                    placeholder="e.g. agent@example.com"
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
                    placeholder="e.g. (214) 555-0199"
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
                disabled={submitting}
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving to Directory...' : editingContact ? 'Save Changes' : 'Save Realtor To Directory'}
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
              <button onClick={() => setArchivingContactId(null)} className="flex-1 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  handleArchive(archivingContactId);
                  setArchivingContactId(null);
                }}
                className="flex-1 py-2.5 bg-[#E11D48] text-white text-xs font-bold rounded-xl cursor-pointer"
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
