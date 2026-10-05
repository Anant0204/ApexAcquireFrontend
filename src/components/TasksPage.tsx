import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  Check,
  X,
  RefreshCw,
  User,
  Calendar,
  ArrowUpDown,
  Edit2,
  CalendarDays
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (tab: string, convId?: string) => void;
  onSelectContact?: (contact: any) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate, onSelectContact }) => {
  const { users, currentUser, contacts, tasks: contextTasks, addTask: addContextTask, updateTask: updateContextTask, deleteTask: deleteContextTask } = useApp();
  
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING'>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [filterDueDate, setFilterDueDate] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'DUE_DATE' | 'TITLE' | 'PRIORITY'>('DEFAULT');
  const [search, setSearch] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskContactId, setNewTaskContactId] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(currentUser.id);
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-09-26');
  const [newTaskDueTime, setNewTaskDueTime] = useState('08:00 AM (CDT)');
  const [newTaskIsRecurring, setNewTaskIsRecurring] = useState(false);

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbContacts, setDbContacts] = useState<any[]>([]);
  const [apiTasks, setApiTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarBg = (initials: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-amber-100 text-amber-800',
      'bg-emerald-100 text-emerald-800',
      'bg-purple-100 text-purple-800',
      'bg-rose-100 text-rose-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800'
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApiTasks(json.data);
      }
    } catch (e) {
      // If network fails and user is not admin, filter mock tasks by user
      if (contextTasks && contextTasks.length > 0) {
        const userMockTasks = currentUser.role === 'ADMIN' 
          ? contextTasks 
          : contextTasks.filter(t => t.assignedToId === currentUser.id || t.assignedToName?.toLowerCase() === currentUser.name?.toLowerCase());

        setApiTasks(userMockTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          type: t.type || 'human_touch',
          status: t.status === 'COMPLETED' ? 'Completed' : 'Open',
          rawStatus: t.status,
          priority: t.priority || 'HIGH',
          dueDate: t.dueDate || 'Today',
          relatedContactId: t.relatedContactId,
          relatedContactName: t.relatedContactName,
          assignedToId: t.assignedToId || currentUser.id,
          assignedToName: t.assignedToName || currentUser.name,
          createdAt: t.createdAt
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDbUsers(json.data);
        if (!newTaskAssignedTo && json.data.length > 0) {
          setNewTaskAssignedTo(currentUser.id || json.data[0].id);
        }
      }
    } catch (e) {
      // Fallback
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
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchContacts();
  }, []);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskContactId('');
    setNewTaskAssignedTo(currentUser.id);
    const today = new Date().toISOString().split('T')[0];
    setNewTaskDueDate(today);
    setNewTaskDueTime('08:00 AM (CDT)');
    setNewTaskIsRecurring(false);
    setShowAddTaskModal(true);
  };

  const openEditModal = (task: any) => {
    if (!isAdmin) return;
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title || '');
    setNewTaskDesc(task.description || '');
    setNewTaskContactId(task.relatedContactId || '');
    setNewTaskAssignedTo(task.assignedToId || currentUser.id);
    setNewTaskDueDate(task.dueDate?.includes('T') ? task.dueDate.split('T')[0] : '2026-09-26');
    setNewTaskDueTime('08:00 AM (CDT)');
    setNewTaskIsRecurring(!!task.isRecurring);
    setShowAddTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const availableContactsList = dbContacts.length > 0 ? dbContacts : contacts;
    const matchedContact = availableContactsList.find((c: any) => c.id === newTaskContactId);
    const availableList = dbUsers.length > 0 ? dbUsers : users;
    const matchedUser = availableList.find((u: any) => u.id === newTaskAssignedTo);
    const assignedName = matchedUser?.name || (matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : currentUser.name);

    const formattedDue = `${newTaskDueDate} ${newTaskDueTime}`;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      
      if (editingTaskId) {
        // Update existing task
        await fetch(`${API_BASE_URL}/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newTaskTitle,
            description: newTaskDesc,
            assignedToId: newTaskAssignedTo || currentUser.id,
            contactId: newTaskContactId || null,
            dueDate: formattedDue
          })
        });

        setApiTasks(prev => prev.map(t => t.id === editingTaskId ? {
          ...t,
          title: newTaskTitle,
          description: newTaskDesc,
          assignedToId: newTaskAssignedTo,
          assignedToName: assignedName,
          relatedContactId: newTaskContactId,
          relatedContactName: matchedContact?.name || t.relatedContactName,
          dueDate: formattedDue
        } : t));

        if (updateContextTask) {
          updateContextTask(editingTaskId, {
            title: newTaskTitle,
            description: newTaskDesc,
            dueDate: formattedDue,
            assignedToId: newTaskAssignedTo,
            assignedToName: assignedName
          });
        }
      } else {
        // Create new task
        const payload = {
          title: newTaskTitle,
          description: newTaskDesc,
          type: 'human_touch',
          priority: 'HIGH',
          assignedToId: newTaskAssignedTo || currentUser.id,
          contactId: newTaskContactId || null,
          dueDate: formattedDue
        };

        const res = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        
        const createdTaskObj = (json.success && json.data) ? json.data : {
          id: `tsk-${Date.now()}`,
          title: newTaskTitle,
          description: newTaskDesc,
          type: 'human_touch',
          status: 'Open',
          rawStatus: 'PENDING',
          priority: 'HIGH',
          dueDate: formattedDue,
          relatedContactId: newTaskContactId,
          relatedContactName: matchedContact?.name || (newTaskContactId ? 'Robert Vance' : undefined),
          assignedToId: newTaskAssignedTo || currentUser.id,
          assignedToName: assignedName,
          createdAt: new Date().toISOString()
        };

        setApiTasks(prev => [createdTaskObj, ...prev]);

        if (addContextTask) {
          addContextTask({
            title: newTaskTitle,
            description: newTaskDesc,
            status: 'PENDING',
            dueDate: formattedDue,
            assignedToId: newTaskAssignedTo,
            assignedToName: assignedName,
            relatedContactId: newTaskContactId,
            relatedContactName: matchedContact?.name
          });
        }
      }

      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err) {
      console.error('Task save failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const isCompleted = currentStatus === 'Completed' || currentStatus === 'COMPLETED';
    const nextStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    const nextStatusDisplay = isCompleted ? 'Open' : 'Completed';

    setApiTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatusDisplay, rawStatus: nextStatus } : t));

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.error('Task toggle failed', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    setApiTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (deleteContextTask) deleteContextTask(taskId);
    } catch (err) {
      console.error('Task delete failed', err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectOne = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';
  const isAdmin = currentUser.role === 'ADMIN';

  // Filter Tasks
  const filteredTasks = apiTasks.filter(t => {
    // Role-based visibility check: non-admins only see tasks assigned to them
    if (!isAdmin) {
      const isAssigned = t.assignedToId === currentUser.id || 
        t.assignedToName?.toLowerCase() === currentUser.name?.toLowerCase() ||
        (t.assignedTo && t.assignedTo.email === currentUser.email);
      if (!isAssigned) return false;
    }

    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      (t.relatedContactName && t.relatedContactName.toLowerCase().includes(search.toLowerCase()));

    const isPending = t.status === 'Open' || t.status === 'In Progress' || t.rawStatus === 'PENDING' || t.rawStatus === 'IN_PROGRESS';
    const isCompleted = t.status === 'Completed' || t.rawStatus === 'COMPLETED';

    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PENDING' ? isPending : isCompleted);
    const matchesAssignee = filterAssignee === 'ALL' || t.assignedToId === filterAssignee || t.assignedToName?.toLowerCase().includes(filterAssignee.toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'DUE_TODAY') {
      matchesTab = isPending && (t.dueDate?.toLowerCase().includes('today') || t.dueDate?.includes('Sep 16'));
    } else if (activeTab === 'OVERDUE') {
      matchesTab = isPending && (t.dueDate?.toLowerCase().includes('overdue') || t.dueDate?.includes('Aug') || t.dueDate?.includes('Jun'));
    } else if (activeTab === 'UPCOMING') {
      matchesTab = isPending;
    }

    return matchesSearch && matchesStatus && matchesAssignee && matchesTab;
  }).sort((a, b) => {
    if (sortBy === 'TITLE') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const visibleTasks = isAdmin ? apiTasks : apiTasks.filter(t => 
    t.assignedToId === currentUser.id || 
    t.assignedToName?.toLowerCase() === currentUser.name?.toLowerCase() ||
    (t.assignedTo && t.assignedTo.email === currentUser.email)
  );

  const availableUsersList = dbUsers.length > 0 ? dbUsers : users;

  const dueTodayCount = visibleTasks.filter(t => (t.status === 'Open' || t.rawStatus === 'PENDING') && (t.dueDate?.toLowerCase().includes('today') || t.dueDate?.includes('Sep 16'))).length;
  const overdueCount = visibleTasks.filter(t => (t.status === 'Open' || t.rawStatus === 'PENDING') && (t.dueDate?.includes('Aug') || t.dueDate?.includes('Jun'))).length;

  return (
    <div className="space-y-4 max-w-full pb-16">
      
      {/* TOP HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A]">
            Tasks
          </h1>
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#155EEF]">
            {visibleTasks.length} Tasks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2 bg-white border border-[#E2E8F0] hover:border-[#155EEF] text-[#475569] hover:text-[#155EEF] rounded-xl shadow-xs transition-all cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#155EEF] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* TABS SELECTOR ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'bg-transparent text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <span>= All</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>
            {visibleTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DUE_TODAY')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'DUE_TODAY'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'bg-transparent text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Due today</span>
          <span className="text-[11px] text-[#64748B]">{dueTodayCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'OVERDUE'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'bg-transparent text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Overdue</span>
          <span className="text-[11px] text-[#64748B]">{overdueCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'UPCOMING'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'bg-transparent text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
          <span>Upcoming</span>
        </button>

        <button
          onClick={openCreateModal}
          className="px-3 py-1.5 rounded-xl text-[#64748B] hover:text-[#0B1F3A] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> List
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-3 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
          
          {/* Assignee Filter */}
          <div className="relative">
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="pl-7 pr-6 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#475569] appearance-none focus:outline-none focus:border-[#155EEF] cursor-pointer"
            >
              <option value="ALL">Assignee: Any</option>
              {availableUsersList.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name || `${u.firstName} ${u.lastName}`}
                </option>
              ))}
            </select>
            <User className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-7 pr-6 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#475569] appearance-none focus:outline-none focus:border-[#155EEF] cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <Check className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Due Date Filter */}
          <div className="relative">
            <select
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
              className="pl-7 pr-6 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#475569] appearance-none focus:outline-none focus:border-[#155EEF] cursor-pointer"
            >
              <option value="ALL">Due Date: Any</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-7 pr-6 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#475569] appearance-none focus:outline-none focus:border-[#155EEF] cursor-pointer"
            >
              <option value="DEFAULT">Sort (1)</option>
              <option value="TITLE">Task Title</option>
              <option value="DUE_DATE">Due Date</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

        </div>

        {/* Right Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for task title..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF]"
          />
        </div>

      </div>

      {/* TASKS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FAFCFF] text-[#64748B] text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#155EEF] focus:ring-[#155EEF] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-16">STATUS</th>
                <th className="py-3 px-4 min-w-[200px]">TITLE</th>
                <th className="py-3 px-4 min-w-[220px]">DESCRIPTION</th>
                <th className="py-3 px-4 min-w-[170px]">ASSOCIATED CONTACTS</th>
                <th className="py-3 px-3 w-20 text-center">ASSIGNEE</th>
                <th className="py-3 px-4 min-w-[160px]">DUE DATE ( CDT )</th>
                <th className="py-3 px-4 w-20 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    Loading tasks...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    No tasks found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === 'Completed' || task.rawStatus === 'COMPLETED';
                  const contactInitials = getInitials(task.relatedContactName || 'Unknown');
                  const assigneeInitials = getInitials(task.assignedToName || currentUser.name);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-[#F8FAFC] transition-colors ${isCompleted ? 'bg-[#FAFCFF]/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => handleSelectOne(task.id)}
                          className="w-4 h-4 rounded border-[#CBD5E1] text-[#155EEF] focus:ring-[#155EEF] cursor-pointer"
                        />
                      </td>

                      {/* Status Icon */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className="cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                          title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                        >
                          {isCompleted ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-emerald-500 hover:bg-emerald-50" />
                          )}
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-semibold text-[#0F172A] text-xs">
                        <span className={isCompleted ? 'line-through text-[#94A3B8]' : ''}>
                          {task.title}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-[#64748B] text-xs max-w-xs truncate">
                        {task.description || '-'}
                      </td>

                      {/* Associated Contacts */}
                      <td className="py-3 px-4">
                        {task.relatedContactName ? (
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${getAvatarBg(contactInitials)}`}>
                              {contactInitials}
                            </span>
                            <span className="text-xs font-medium text-[#475569] truncate">
                              {task.relatedContactName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] text-[11px]">-</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-2xs ${getAvatarBg(assigneeInitials)}`}>
                            {assigneeInitials}
                          </span>
                        </div>
                      </td>

                      {/* Due Date (CDT) */}
                      <td className="py-3 px-4 text-xs font-medium text-[#155EEF]">
                        {task.dueDate || 'Sep 16, 2026 02:00 PM'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#155EEF] hover:bg-[#EAF2FF] transition-colors cursor-pointer"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[#94A3B8] text-[11px]">-</span>
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
      </div>

      {/* CREATE / EDIT NEW TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EAF2FF] text-[#155EEF] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  {editingTaskId ? 'Edit Task' : 'Create New Task'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              
              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Follow up with seller, Send contract, VET comps..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]"
                />
              </div>

              {/* Description / Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide context, special notes, or instructions for the assignee..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] resize-none"
                />
              </div>

              {/* Row: Associated Contact & Assignee */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                    Associated Contact
                  </label>
                  <select
                    value={newTaskContactId}
                    onChange={(e) => setNewTaskContactId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] cursor-pointer"
                  >
                    <option value="">None (No Contact Linked)</option>
                    {(dbContacts.length > 0 ? dbContacts : contacts).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.brokerage ? `(${c.brokerage})` : (c.phone ? `(${c.phone})` : '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                    Assignee
                  </label>
                  <select
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] cursor-pointer"
                  >
                    {availableUsersList.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name || `${u.firstName} ${u.lastName}`} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Due Date & Due Time */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                    Due Time
                  </label>
                  <select
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] cursor-pointer"
                  >
                    <option value="08:00 AM (CDT)">08:00 AM (CDT)</option>
                    <option value="09:00 AM (CDT)">09:00 AM (CDT)</option>
                    <option value="10:00 AM (CDT)">10:00 AM (CDT)</option>
                    <option value="11:00 AM (CDT)">11:00 AM (CDT)</option>
                    <option value="12:00 PM (CDT)">12:00 PM (CDT)</option>
                    <option value="01:00 PM (CDT)">01:00 PM (CDT)</option>
                    <option value="02:00 PM (CDT)">02:00 PM (CDT)</option>
                    <option value="03:00 PM (CDT)">03:00 PM (CDT)</option>
                    <option value="04:00 PM (CDT)">04:00 PM (CDT)</option>
                    <option value="05:00 PM (CDT)">05:00 PM (CDT)</option>
                    <option value="06:00 PM (CDT)">06:00 PM (CDT)</option>
                  </select>
                </div>
              </div>

              {/* Recurring Task Box */}
              <div className="border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between bg-white">
                <div>
                  <div className="font-bold text-xs text-[#0B1F3A]">Recurring Task</div>
                  <div className="text-[11px] text-[#64748B]">Automatically recreate this task upon completion</div>
                </div>
                <input
                  type="checkbox"
                  checked={newTaskIsRecurring}
                  onChange={(e) => setNewTaskIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#155EEF] focus:ring-[#155EEF] cursor-pointer"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#155EEF] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
