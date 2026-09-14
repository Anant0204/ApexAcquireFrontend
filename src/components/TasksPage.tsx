import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CRMTask, TaskType, TaskPriority } from '../types/crm';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Building,
  PhoneCall,
  UserCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (tab: string, convId?: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { tasks, addTask, updateTask, completeTask, deleteTask, users, currentUser } = useApp();
  
  const [filterType, setFilterType] = useState<'ALL' | TaskType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');
  const [search, setSearch] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('human_touch');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('HIGH');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(currentUser.id);
  const [newTaskDueDate, setNewTaskDueDate] = useState('Today');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.relatedContactName && t.relatedContactName.toLowerCase().includes(search.toLowerCase())) ||
      (t.relatedDealAddress && t.relatedDealAddress.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = users.find(u => u.id === newTaskAssignedTo) || currentUser;

    addTask({
      title: newTaskTitle,
      description: newTaskDesc,
      type: newTaskType,
      priority: newTaskPriority,
      status: 'PENDING',
      assignedToId: assignedUser.id,
      assignedToName: assignedUser.name,
      dueDate: newTaskDueDate
    });

    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase">
              Automated Operations Inbox
            </span>
            <span className="text-xs text-[#64748B]">&bull; Needs Human Touch, Lead Clones, Manager Help</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A] flex items-center gap-2.5">
            Task Management Desk
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#155EEF] text-white shadow-xs">
              {tasks.filter(t => t.status === 'PENDING').length} Pending
            </span>
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            Centrally resolve human takeover prompts, deal underwriting tasks, manager escalations, and phone call follow-ups.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2.5 btn-executive-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Custom Task
          </button>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="executive-panel rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task, contact, deal address..."
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF]"
          />
        </div>

        {/* Task Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'ALL' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Types
          </button>

          <button
            onClick={() => setFilterType('human_touch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              filterType === 'human_touch' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Flame className="w-3 h-3" /> Needs Human Touch
          </button>

          <button
            onClick={() => setFilterType('lead_created')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              filterType === 'lead_created' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Building className="w-3 h-3" /> Lead Clones
          </button>

          <button
            onClick={() => setFilterType('need_help')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              filterType === 'need_help' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <AlertTriangle className="w-3 h-3" /> Manager Escalations
          </button>
        </div>

        {/* Status Toggle (Pending vs Completed) */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'PENDING' ? 'bg-white text-[#155EEF] shadow-xs' : 'text-[#64748B]'
            }`}
          >
            Pending ({tasks.filter(t => t.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'COMPLETED' ? 'bg-white text-emerald-600 shadow-xs' : 'text-[#64748B]'
            }`}
          >
            Completed ({tasks.filter(t => t.status === 'COMPLETED').length})
          </button>
        </div>

      </div>

      {/* TASKS LIST */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="executive-panel rounded-2xl p-12 text-center text-xs text-[#64748B]">
            No tasks found matching current filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isPending = task.status === 'PENDING';

            return (
              <div
                key={task.id}
                className={`executive-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border transition-all ${
                  !isPending ? 'opacity-70 bg-[#F8FAFC]' : 'bg-white hover:border-[#BFDBFE]'
                }`}
              >
                
                {/* Left Side Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      task.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {task.priority}
                    </span>

                    {/* Task Type Badge */}
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                      task.type === 'human_touch' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      task.type === 'lead_created' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      task.type === 'need_help' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE]'
                    }`}>
                      {task.type === 'human_touch' && <Flame className="w-3 h-3 text-amber-600" />}
                      {task.type === 'lead_created' && <Building className="w-3 h-3 text-emerald-600" />}
                      {task.type === 'need_help' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {task.type === 'phone_call' && <PhoneCall className="w-3 h-3 text-[#155EEF]" />}
                      <span className="capitalize">{task.type.replace('_', ' ')}</span>
                    </span>

                    <span className="font-bold text-sm text-[#0B1F3A]">{task.title}</span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    {task.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#64748B] pt-1">
                    <span className="flex items-center gap-1 font-medium text-[#0F172A]">
                      <UserCheck className="w-3.5 h-3.5 text-[#155EEF]" /> Assigned: {task.assignedToName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due: {task.dueDate}
                    </span>
                    {task.relatedContactName && (
                      <span>Realtor: <strong className="text-[#0F172A]">{task.relatedContactName}</strong></span>
                    )}
                    {task.relatedDealAddress && (
                      <span>Property: <strong className="text-[#155EEF]">{task.relatedDealAddress}</strong></span>
                    )}
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                  {task.relatedConversationId && (
                    <button
                      onClick={() => onNavigate('conversations', task.relatedConversationId)}
                      className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-[#155EEF] text-[#155EEF] text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                    >
                      Open Chat <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {task.relatedDealId && (
                    <button
                      onClick={() => onNavigate('deals')}
                      className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-[#155EEF] text-[#155EEF] text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                    >
                      Open Deal <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {!isReadOnly && isPending && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Done
                    </button>
                  )}

                  {!isReadOnly && !isPending && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}

                  {!isReadOnly && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="executive-panel w-full max-w-lg rounded-2xl p-6 relative space-y-4 bg-white shadow-2xl border border-[#E2E8F0]">
            <button onClick={() => setShowAddTaskModal(false)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0B1F3A]">Create Operational Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Underwrite 4812 Bordeaux Ave and send LOI"
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">Description / Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specify notes, seller terms, or underwriting guidelines..."
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Task Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="human_touch">Needs Human Touch</option>
                    <option value="lead_created">Lead Created</option>
                    <option value="need_help">Manager Escalation (Need Help)</option>
                    <option value="phone_call">Phone Call Follow-Up</option>
                    <option value="general">General Follow-Up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-bold mb-1">Assign To</label>
                  <select
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] font-bold mb-1">Due Date</label>
                  <input
                    type="text"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    placeholder="e.g. Today by 5 PM"
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-executive-primary text-white font-bold rounded-xl mt-3 transition-all shadow-md cursor-pointer"
              >
                Save Operational Task
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
