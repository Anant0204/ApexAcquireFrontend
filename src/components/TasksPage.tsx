import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { CRMTask, TaskPriority, TaskStatus, TaskType, RealtorContact } from '../types/crm';
import {
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Calendar,
  User,
  ArrowUpDown,
  Repeat,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TasksPageProps {
  onNavigate?: (tab: string, convId?: string) => void;
  onSelectContact?: (contact: RealtorContact) => void;
}

type TopTabType = 'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING';
type DueDateFilterType = 'ANY' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'OVERDUE' | 'CUSTOM';
type SortOptionType = 'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'TITLE_ASC' | 'CREATED_DESC' | 'ASSIGNEE';

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate, onSelectContact }) => {
  const { tasks, addTask, updateTask, completeTask, deleteTask, users, currentUser, contacts } = useApp();

  // Top Tab State
  const [activeTab, setActiveTab] = useState<TopTabType>('ALL');

  // Filter Bar States
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ANY');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilterType>('ANY');
  const [sortOption, setSortOption] = useState<SortOptionType>('DUE_DATE_ASC');

  // Custom Date Range
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Dropdown open states
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Selection & Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null);

  // Form States (for Add & Edit)
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState(currentUser.id);
  const [formContactId, setFormContactId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('08:00 AM');
  const [formPriority, setFormPriority] = useState<TaskPriority>('HIGH');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formRepeatFreq, setFormRepeatFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Helper: Get Initials & Colors
  const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getContactBadgeColor = (initials: string) => {
    const colors = [
      'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]', // Cyan
      'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]', // Orange
      'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]', // Blue
      'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', // Amber
      'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]', // Purple
      'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]', // Pink
      'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', // Green
      'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]', // Teal
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) {
      sum += initials.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getAssigneeBadgeColor = (initials: string) => {
    const colors = [
      'bg-[#F59E0B]/15 text-[#D97706] border-[#FDE68A]',
      'bg-[#3B82F6]/15 text-[#2563EB] border-[#BFDBFE]',
      'bg-[#8B5CF6]/15 text-[#7C3AED] border-[#DDD6FE]',
      'bg-[#10B981]/15 text-[#059669] border-[#A7F3D0]',
      'bg-[#64748B]/15 text-[#475569] border-[#CBD5E1]',
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) {
      sum += initials.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // Helper: Overdue & Date Evaluation
  const parseTaskDate = (task: CRMTask): { isOverdue: boolean; isToday: boolean; isUpcoming: boolean; dateObj: Date | null } => {
    const dueStr = (task.dueDate || '').toLowerCase().trim();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueStr.includes('today')) {
      return { isOverdue: false, isToday: true, isUpcoming: false, dateObj: new Date() };
    }
    if (dueStr.includes('tomorrow') || dueStr.includes('in 1 day') || dueStr.includes('in 2 day') || dueStr.includes('in 4 day') || dueStr.includes('in 14 day') || dueStr.includes('in 24 day')) {
      return { isOverdue: false, isToday: false, isUpcoming: true, dateObj: new Date(Date.now() + 86400000 * 2) };
    }

    // Try parsing standard formats e.g. "Sep 26, 2026", "2026-09-26", "Aug 28, 2026"
    const parsed = Date.parse(task.dueDate);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      d.setHours(0, 0, 0, 0);
      const isPast = d.getTime() < today.getTime();
      const isSame = d.getTime() === today.getTime();
      const isFuture = d.getTime() > today.getTime();

      return {
        isOverdue: isPast && task.status === 'PENDING',
        isToday: isSame,
        isUpcoming: isFuture,
        dateObj: d
      };
    }

    return { isOverdue: false, isToday: false, isUpcoming: false, dateObj: null };
  };

  // Format Display Date & Time
  const formatDisplayDueDate = (task: CRMTask) => {
    let datePart = task.dueDate || 'No Due Date';
    let timePart = task.dueTime || '08:00 AM';

    if (datePart.toLowerCase() === 'today') {
      datePart = 'Sep 16, 2026';
    } else if (datePart.toLowerCase() === 'tomorrow') {
      datePart = 'Sep 17, 2026';
    }

    return `${datePart} ${timePart}`;
  };

  // Filter & Search Engine
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const { isOverdue, isToday, isUpcoming } = parseTaskDate(task);

      // 1. Top Tab Filtering
      if (activeTab === 'DUE_TODAY' && !isToday) return false;
      if (activeTab === 'OVERDUE' && (!isOverdue || task.status === 'COMPLETED')) return false;
      if (activeTab === 'UPCOMING' && !isUpcoming) return false;

      // 2. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        const matchContact = task.relatedContactName?.toLowerCase().includes(query);
        const matchAssignee = task.assignedToName?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchContact && !matchAssignee) return false;
      }

      // 3. Assignee Filter
      if (assigneeFilter !== 'ANY') {
        if (task.assignedToId !== assigneeFilter) return false;
      }

      // 4. Status Filter
      if (statusFilter !== 'ALL') {
        if (task.status !== statusFilter) return false;
      }

      // 5. Due Date Filter Bar
      if (dueDateFilter === 'TODAY' && !isToday) return false;
      if (dueDateFilter === 'OVERDUE' && (!isOverdue || task.status === 'COMPLETED')) return false;
      if (dueDateFilter === 'THIS_WEEK') {
        if (!isToday && !isUpcoming) return false;
      }
      if (dueDateFilter === 'CUSTOM') {
        if (customStart || customEnd) {
          const { dateObj } = parseTaskDate(task);
          if (dateObj) {
            const iso = dateObj.toISOString().split('T')[0];
            if (customStart && iso < customStart) return false;
            if (customEnd && iso > customEnd) return false;
          }
        }
      }

      return true;
    });
  }, [tasks, activeTab, search, assigneeFilter, statusFilter, dueDateFilter, customStart, customEnd]);

  // Sorting
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    list.sort((a, b) => {
      if (sortOption === 'DUE_DATE_ASC') {
        const dateA = Date.parse(a.dueDate) || 0;
        const dateB = Date.parse(b.dueDate) || 0;
        return dateA - dateB;
      }
      if (sortOption === 'DUE_DATE_DESC') {
        const dateA = Date.parse(a.dueDate) || 0;
        const dateB = Date.parse(b.dueDate) || 0;
        return dateA - dateB;
      }
      if (sortOption === 'TITLE_ASC') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortOption === 'CREATED_DESC') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (sortOption === 'ASSIGNEE') {
        return (a.assignedToName || '').localeCompare(b.assignedToName || '');
      }
      return 0;
    });
    return list;
  }, [filteredTasks, sortOption]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedTasks.length / pageSize) || 1;
  const paginatedTasks = sortedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Tab Counts
  const counts = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    tasks.forEach(t => {
      const { isToday, isOverdue, isUpcoming } = parseTaskDate(t);
      if (isToday) dueToday++;
      if (isOverdue && t.status === 'PENDING') overdue++;
      if (isUpcoming) upcoming++;
    });
    return { all: tasks.length, dueToday, overdue, upcoming };
  }, [tasks]);

  // Checkbox Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(paginatedTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Toggle Task Status (Pending <-> Completed)
  const handleToggleStatus = (task: CRMTask) => {
    if (task.status === 'COMPLETED') {
      updateTask(task.id, {
        status: 'PENDING',
        completedAt: undefined
      });
    } else {
      completeTask(task.id);
    }
  };

  // Bulk Actions
  const handleBulkComplete = () => {
    selectedTaskIds.forEach(id => completeTask(id));
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)?`)) {
      selectedTaskIds.forEach(id => deleteTask(id));
      setSelectedTaskIds([]);
    }
  };

  // Open Create Task Modal
  const openCreateModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormAssignedTo(currentUser.id);
    setFormContactId('');
    setFormDueDate('Sep 26, 2026');
    setFormDueTime('08:00 AM');
    setFormPriority('HIGH');
    setFormIsRecurring(false);
    setFormRepeatFreq('WEEKLY');
    setShowAddModal(true);
  };

  // Open Edit Task Modal
  const openEditModal = (task: CRMTask) => {
    setEditingTask(task);
    setFormTitle(task.title || '');
    setFormDesc(task.description || '');
    setFormAssignedTo(task.assignedToId || currentUser.id);
    setFormContactId(task.relatedContactId || '');
    setFormDueDate(task.dueDate || 'Sep 26, 2026');
    setFormDueTime(task.dueTime || '08:00 AM');
    setFormPriority(task.priority || 'HIGH');
    setFormIsRecurring(!!task.isRecurring);
    setFormRepeatFreq(task.repeatFrequency || 'WEEKLY');
    setShowAddModal(true);
  };

  // Save Modal Handler (Create or Edit)
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const assignedUser = users.find(u => u.id === formAssignedTo) || currentUser;
    const relatedContact = contacts.find(c => c.id === formContactId);

    const taskPayload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      type: 'human_touch' as TaskType,
      priority: formPriority,
      status: (editingTask ? editingTask.status : 'PENDING') as TaskStatus,
      assignedToId: assignedUser.id,
      assignedToName: assignedUser.name,
      assignedToInitials: getInitials(assignedUser.name),
      dueDate: formDueDate || 'Today',
      dueTime: formDueTime || '08:00 AM',
      relatedContactId: relatedContact ? relatedContact.id : undefined,
      relatedContactName: relatedContact ? relatedContact.name : undefined,
      relatedContactInitials: relatedContact ? getInitials(relatedContact.name) : undefined,
      isRecurring: formIsRecurring,
      repeatFrequency: formIsRecurring ? formRepeatFreq : undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    setShowAddModal(false);
    setEditingTask(null);
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      

      {/* 2. MAIN HEADER: Tasks + Task Count Pill + Add Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-[#0B1F3A]">
            Tasks
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]">
            {tasks.length} Tasks
          </span>
        </div>

        {!isReadOnly && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#155EEF] hover:bg-[#004EEB] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* 3. TOP TABS (All, Due Today, Overdue, Upcoming, + List) */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pt-1 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <span>≡ All</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.all}</span>
        </button>

        <button
          onClick={() => { setActiveTab('DUE_TODAY'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'DUE_TODAY'
              ? 'bg-[#155EEF] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <span>📅 Due today</span>
          {counts.dueToday > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">{counts.dueToday}</span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('OVERDUE'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'OVERDUE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <span>⚠️ Overdue</span>
          {counts.overdue > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">{counts.overdue}</span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('UPCOMING'); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'UPCOMING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9]'
          }`}
        >
          <span>📅 Upcoming</span>
          {counts.upcoming > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">{counts.upcoming}</span>
          )}
        </button>

        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F1F5F9] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap">
          <Plus className="w-3.5 h-3.5" /> List
        </button>
      </div>

      {/* 4. FILTER TOOLBAR: Assignee, Status, Due Date, Filters, Sort, Search */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Filter Dropdowns Left */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Assignee Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsDateDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  assigneeFilter !== 'ANY'
                    ? 'bg-[#EAF2FF] text-[#155EEF] border-[#BFDBFE]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#64748B]" />
                <span>
                  Assignee:{' '}
                  {assigneeFilter === 'ANY'
                    ? 'Any'
                    : users.find(u => u.id === assigneeFilter)?.name || 'Selected'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {isAssigneeDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  <button
                    onClick={() => { setAssigneeFilter('ANY'); setIsAssigneeDropdownOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] cursor-pointer ${
                      assigneeFilter === 'ANY' ? 'font-bold text-[#155EEF] bg-[#EAF2FF]' : 'text-[#475569]'
                    }`}
                  >
                    <span>Any Assignee</span>
                    {assigneeFilter === 'ANY' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setAssigneeFilter(u.id); setIsAssigneeDropdownOpen(false); }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] cursor-pointer ${
                        assigneeFilter === u.id ? 'font-bold text-[#155EEF] bg-[#EAF2FF]' : 'text-[#475569]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${getAssigneeBadgeColor(u.avatar || getInitials(u.name))}`}>
                          {u.avatar || getInitials(u.name)}
                        </span>
                        <span>{u.name}</span>
                      </div>
                      {assigneeFilter === u.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsAssigneeDropdownOpen(false);
                  setIsDateDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  statusFilter !== 'ALL'
                    ? 'bg-[#EAF2FF] text-[#155EEF] border-[#BFDBFE]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Status: {statusFilter === 'ALL' ? 'All' : statusFilter}</span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {['ALL', 'PENDING', 'COMPLETED'].map(st => (
                    <button
                      key={st}
                      onClick={() => { setStatusFilter(st); setIsStatusDropdownOpen(false); }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] cursor-pointer ${
                        statusFilter === st ? 'font-bold text-[#155EEF] bg-[#EAF2FF]' : 'text-[#475569]'
                      }`}
                    >
                      <span>{st === 'ALL' ? 'All Statuses' : st === 'PENDING' ? 'Pending' : 'Completed'}</span>
                      {statusFilter === st && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsDateDropdownOpen(!isDateDropdownOpen);
                  setIsAssigneeDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  dueDateFilter !== 'ANY'
                    ? 'bg-[#EAF2FF] text-[#155EEF] border-[#BFDBFE]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                <span>
                  Due Date:{' '}
                  {dueDateFilter === 'ANY' ? 'Any' : dueDateFilter.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {isDateDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {[
                    { id: 'ANY', label: 'Any Due Date' },
                    { id: 'TODAY', label: 'Due Today' },
                    { id: 'THIS_WEEK', label: 'This Week' },
                    { id: 'OVERDUE', label: 'Overdue Only' },
                    { id: 'CUSTOM', label: 'Custom Range...' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setDueDateFilter(item.id as DueDateFilterType); setIsDateDropdownOpen(false); }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] cursor-pointer ${
                        dueDateFilter === item.id ? 'font-bold text-[#155EEF] bg-[#EAF2FF]' : 'text-[#475569]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {dueDateFilter === item.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsAssigneeDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
                  setIsDateDropdownOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Sort (1)</span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 py-1 text-xs">
                  {[
                    { id: 'DUE_DATE_ASC', label: 'Due Date: Earliest First' },
                    { id: 'DUE_DATE_DESC', label: 'Due Date: Latest First' },
                    { id: 'TITLE_ASC', label: 'Task Title (A-Z)' },
                    { id: 'CREATED_DESC', label: 'Recently Created' },
                    { id: 'ASSIGNEE', label: 'Assignee Name' }
                  ].map(sort => (
                    <button
                      key={sort.id}
                      onClick={() => { setSortOption(sort.id as SortOptionType); setIsSortDropdownOpen(false); }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] cursor-pointer ${
                        sortOption === sort.id ? 'font-bold text-[#155EEF] bg-[#EAF2FF]' : 'text-[#475569]'
                      }`}
                    >
                      <span>{sort.label}</span>
                      {sortOption === sort.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Search Box Right */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search for task title..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* Custom Date Range Panel (if selected) */}
        {dueDateFilter === 'CUSTOM' && (
          <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center gap-3 text-xs bg-[#F8FAFC] p-2.5 rounded-xl">
            <span className="font-bold text-[#475569]">Custom Due Date Range:</span>
            <div className="flex items-center gap-2">
              <span>From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs"
              />
            </div>
            {(customStart || customEnd) && (
              <button
                onClick={() => { setCustomStart(''); setCustomEnd(''); }}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Bulk Action Bar (When rows are checked) */}
        {selectedTaskIds.length > 0 && (
          <div className="p-2.5 bg-[#0B1F3A] text-white rounded-xl flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-bold px-2 py-0.5 bg-white/20 rounded-md">
                {selectedTaskIds.length} Selected
              </span>
              <span>Bulk Actions Available:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkComplete}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button
                onClick={() => setSelectedTaskIds([])}
                className="px-2.5 py-1 text-white/80 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 5. DATA TABLE (Exact GoHighLevel layout) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                
                {/* Select All Checkbox */}
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedTasks.length > 0 && selectedTaskIds.length === paginatedTasks.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#CBD5E1] text-[#155EEF] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                  />
                </th>

                {/* Status */}
                <th className="py-3 px-3 w-14 font-bold text-[#0B1F3A]">Status</th>

                {/* Title */}
                <th className="py-3 px-4 font-bold text-[#0B1F3A] min-w-[160px]">Title</th>

                {/* Description */}
                <th className="py-3 px-4 font-bold text-[#0B1F3A] min-w-[220px]">Description</th>

                {/* Associated Contacts */}
                <th className="py-3 px-4 font-bold text-[#0B1F3A] min-w-[180px]">Associated Contacts</th>

                {/* Assignee */}
                <th className="py-3 px-3 font-bold text-[#0B1F3A] min-w-[90px]">Assignee</th>

                {/* Due Date (CDT) */}
                <th className="py-3 px-4 font-bold text-[#0B1F3A] min-w-[160px] whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Due Date ( CDT )</span>
                    <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-4 text-right font-bold text-[#0B1F3A] w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#64748B]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-[#0B1F3A]">No tasks found</p>
                      <p className="text-xs text-[#64748B]">
                        Try changing your filters, search criteria, or top tab selection.
                      </p>
                      {!isReadOnly && (
                        <button
                          onClick={openCreateModal}
                          className="mt-2 px-3 py-1.5 bg-[#155EEF] text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          + Create New Task
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTasks.map(task => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const { isOverdue, isToday } = parseTaskDate(task);
                  const isCompleted = task.status === 'COMPLETED';

                  const contactInitials = task.relatedContactInitials || getInitials(task.relatedContactName);
                  const assigneeInitials = task.assignedToInitials || getInitials(task.assignedToName);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-[#F8FAFC] transition-colors group ${
                        isSelected ? 'bg-[#F0F7FF]' : isCompleted ? 'bg-[#FAFCFE]/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectTask(task.id)}
                          className="rounded border-[#CBD5E1] text-[#155EEF] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                        />
                      </td>

                      {/* Status Icon (◯ / ✅) */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          disabled={isReadOnly}
                          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                          className="cursor-pointer transition-transform active:scale-90 flex items-center justify-center"
                        >
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1] group-hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center" />
                          )}
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold text-xs text-[#0B1F3A] ${
                            isCompleted ? 'line-through text-[#94A3B8]' : ''
                          }`}>
                            {task.title}
                          </span>
                          {task.isRecurring && (
                            <span title={`Recurring ${task.repeatFrequency || 'WEEKLY'}`} className="text-[#0284C7]">
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-[#64748B] max-w-[280px]">
                        <span className="line-clamp-1 text-xs" title={task.description}>
                          {task.description || '—'}
                        </span>
                      </td>

                      {/* Associated Contacts */}
                      <td className="py-3 px-4">
                        {task.relatedContactName ? (
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full text-[10px] font-extrabold flex items-center justify-center border shadow-2xs shrink-0 ${getContactBadgeColor(contactInitials)}`}>
                              {contactInitials}
                            </span>
                            <button
                              onClick={() => {
                                const matched = contacts.find(c => c.id === task.relatedContactId || c.name.toLowerCase() === task.relatedContactName?.toLowerCase());
                                if (matched && onSelectContact) {
                                  onSelectContact(matched);
                                }
                              }}
                              className="font-medium text-xs text-[#0B1F3A] hover:text-[#155EEF] hover:underline text-left truncate cursor-pointer"
                              title={`View contact: ${task.relatedContactName}`}
                            >
                              {task.relatedContactName.toLowerCase()}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-3">
                        {task.assignedToName ? (
                          <div className="flex items-center">
                            <span
                              title={`Assigned to: ${task.assignedToName}`}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border shadow-2xs cursor-help ${getAssigneeBadgeColor(assigneeInitials)}`}
                            >
                              {assigneeInitials}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Due Date (CDT) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs ${
                          isCompleted
                            ? 'text-[#94A3B8]'
                            : isOverdue
                            ? 'text-rose-600 font-semibold'
                            : isToday
                            ? 'text-[#155EEF] font-semibold'
                            : 'text-[#475569]'
                        }`}>
                          {formatDisplayDueDate(task)}
                        </span>
                      </td>

                      {/* Actions (Edit / Delete) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 rounded-md text-[#64748B] hover:text-[#155EEF] hover:bg-[#EAF2FF] transition-colors cursor-pointer"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete task "${task.title}"?`)) {
                                    deleteTask(task.id);
                                  }
                                }}
                                className="p-1 rounded-md text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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

        {/* 6. PAGINATION / FOOTER BAR */}
        <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div>
            <span>Page {currentPage} of {totalPages}</span>
            <span className="mx-2">&bull;</span>
            <span>Showing {paginatedTasks.length} of {sortedTasks.length} tasks</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-[#CBD5E1] rounded-lg px-2 py-0.5 text-xs text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F5F9] cursor-pointer flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              
              <span className="px-2.5 py-1 rounded-lg bg-[#155EEF] text-white font-bold text-xs">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F5F9] cursor-pointer flex items-center gap-1 font-semibold"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. ADD / EDIT TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#155EEF] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#0B1F3A]">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                className="text-[#94A3B8] hover:text-[#0B1F3A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              
              {/* Task Title */}
              <div>
                <label className="block text-[#475569] font-bold mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up with seller, Send contract, VET comps..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-[#475569] font-bold mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, special notes, or instructions for the assignee..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              {/* Associated Contact & Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Associated Contact */}
                <div>
                  <label className="block text-[#475569] font-bold mb-1">
                    Associated Contact
                  </label>
                  <select
                    value={formContactId}
                    onChange={(e) => setFormContactId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] cursor-pointer"
                  >
                    <option value="">None (No Contact Linked)</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.brokerage || c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-[#475569] font-bold mb-1">
                    Assignee
                  </label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] cursor-pointer"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Due Date & Due Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sep 26, 2026 or Today"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">
                    Due Time
                  </label>
                  <select
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] cursor-pointer"
                  >
                    <option value="08:00 AM">08:00 AM (CDT)</option>
                    <option value="09:00 AM">09:00 AM (CDT)</option>
                    <option value="11:00 AM">11:00 AM (CDT)</option>
                    <option value="02:00 PM">02:00 PM (CDT)</option>
                    <option value="05:00 PM">05:00 PM (CDT)</option>
                    <option value="06:00 PM">06:00 PM (CDT)</option>
                  </select>
                </div>
              </div>

              {/* Priority & Recurrence */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0B1F3A] block">Recurring Task</span>
                    <span className="text-[11px] text-[#64748B]">Automatically recreate this task upon completion</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="rounded text-[#155EEF] w-4 h-4 cursor-pointer"
                  />
                </div>

                {formIsRecurring && (
                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-2">
                    <span className="text-xs font-bold text-[#475569]">Repeat Frequency:</span>
                    <select
                      value={formRepeatFreq}
                      onChange={(e) => setFormRepeatFreq(e.target.value as any)}
                      className="px-2 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-bold text-xs rounded-xl hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#155EEF] hover:bg-[#004EEB] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
