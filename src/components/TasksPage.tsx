import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Search,
  ChevronDown,
  Calendar,
  AlertTriangle,
  List,
  Plus,
  X,
  Edit2,
  Trash2,
  Check,
  User
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (tab: string, convId?: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { currentUser } = useApp();
  
  const [apiTasks, setApiTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('Any');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDueDate, setFilterDueDate] = useState('Any');
  const [sortOrder, setSortOrder] = useState('1');

  // Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskContact, setNewTaskContact] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.name);
  const [newTaskDueDate, setNewTaskDueDate] = useState('Sep 26, 2026');
  const [newTaskDueTime, setNewTaskDueTime] = useState('08:00 AM (CDT)');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/v1/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setApiTasks(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would POST to /api/v1/tasks
    // For now, we update local state to avoid dummy data and simulate creation
    const newTask = {
      id: Math.random().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      status: 'Open',
      relatedContactName: newTaskContact !== 'None' ? newTaskContact : undefined,
      assignedToName: newTaskAssignee,
      dueDate: `${newTaskDueDate} ${newTaskDueTime.split(' ')[0]} ${newTaskDueTime.split(' ')[1]}`
    };
    setApiTasks([newTask, ...apiTasks]);
    setShowAddTaskModal(false);
    
    // Reset
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const toggleTaskStatus = (id: string, currentStatus: string) => {
    setApiTasks(apiTasks.map(t => 
      t.id === id 
        ? { ...t, status: currentStatus === 'Completed' ? 'Open' : 'Completed' } 
        : t
    ));
  };

  const deleteTask = (id: string) => {
    setApiTasks(apiTasks.filter(t => t.id !== id));
  };

  const filteredTasks = apiTasks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      (t.relatedContactName && t.relatedContactName.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Completed' ? t.status === 'Completed' : (t.status === 'Open' || t.status === 'In Progress'));
      
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="p-6 text-center text-[#475569]">Loading Tasks...</div>;
  }

  const isReadOnly = currentUser.role === 'READ_ONLY';

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans bg-white min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold text-[#0B1F3A] tracking-tight">Tasks</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#155EEF]">
              {apiTasks.length} Tasks
            </span>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 bg-[#155EEF] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>

        {/* QUICK FILTERS */}
        <div className="flex items-center gap-6 mb-6 text-sm font-semibold text-[#475569]">
          <button className="flex items-center gap-2 text-[#0B1F3A] bg-[#F1F5F9] px-3 py-1.5 rounded-md">
            <List className="w-4 h-4" /> All <span className="ml-1 bg-white px-1.5 py-0.5 rounded text-xs">{apiTasks.length}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-[#0B1F3A]">
            <Calendar className="w-4 h-4" /> Due today <span className="ml-1 text-[#0B1F3A]">0</span>
          </button>
          <button className="flex items-center gap-2 text-[#E11D48]">
            <AlertTriangle className="w-4 h-4" /> Overdue <span className="ml-1 font-bold">0</span>
          </button>
          <button className="flex items-center gap-2 hover:text-[#0B1F3A]">
            <Calendar className="w-4 h-4" /> Upcoming
          </button>
          <button className="flex items-center gap-2 hover:text-[#0B1F3A]">
            <Plus className="w-4 h-4" /> List
          </button>
        </div>

        {/* DETAILED FILTERS & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="appearance-none bg-white border border-[#E2E8F0] text-[#475569] text-sm pl-9 pr-8 py-1.5 rounded-md focus:outline-none focus:border-[#155EEF]"
              >
                <option value="Any">Assignee: Any</option>
              </select>
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-2.5 text-[#94A3B8] pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-[#E2E8F0] text-[#475569] text-sm pl-9 pr-8 py-1.5 rounded-md focus:outline-none focus:border-[#155EEF]"
              >
                <option value="All">Status: All</option>
                <option value="Open">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <CheckCircle2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-2.5 text-[#94A3B8] pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="appearance-none bg-white border border-[#E2E8F0] text-[#475569] text-sm pl-9 pr-8 py-1.5 rounded-md focus:outline-none focus:border-[#155EEF]"
              >
                <option value="Any">Due Date: Any</option>
              </select>
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-2.5 text-[#94A3B8] pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-white border border-[#E2E8F0] text-[#475569] text-sm pl-9 pr-8 py-1.5 rounded-md focus:outline-none focus:border-[#155EEF]"
              >
                <option value="1">Sort (1)</option>
              </select>
              <div className="w-3.5 h-3.5 absolute left-3 top-2.5 flex flex-col justify-center items-center gap-[2px] text-[#94A3B8]">
                <div className="w-3 h-[1px] bg-current"></div>
                <div className="w-2 h-[1px] bg-current"></div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-2.5 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for task title..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF]"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-[#cbd5e1] text-[#155EEF] focus:ring-[#155EEF]" />
                </th>
                <th className="py-3 px-2">STATUS</th>
                <th className="py-3 px-4">TITLE</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">ASSOCIATED CONTACTS</th>
                <th className="py-3 px-4">ASSIGNEE</th>
                <th className="py-3 px-4 flex items-center gap-1">DUE DATE ( CDT ) <ChevronDown className="w-3 h-3" /></th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#64748B]">
                    No tasks found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  return (
                    <tr key={task.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] group transition-colors">
                      <td className="py-4 px-4">
                        <input type="checkbox" className="rounded border-[#cbd5e1] text-[#155EEF] focus:ring-[#155EEF]" />
                      </td>
                      <td className="py-4 px-2">
                        <button onClick={() => toggleTaskStatus(task.id, task.status)} className="focus:outline-none">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#CBD5E1] hover:text-[#94A3B8]" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-[#0B1F3A] max-w-[200px] truncate" title={task.title}>
                        {task.title}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#64748B] max-w-[250px] truncate" title={task.description}>
                        {task.description || '-'}
                      </td>
                      <td className="py-4 px-4">
                        {task.relatedContactName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#155EEF] font-bold text-[10px] flex items-center justify-center">
                              {getInitials(task.relatedContactName)}
                            </div>
                            <span className="text-sm font-medium text-[#0B1F3A] lowercase">{task.relatedContactName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#94A3B8]">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center" title={task.assignedToName}>
                          {getInitials(task.assignedToName || currentUser.name)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#155EEF]">
                        {task.dueDate ? task.dueDate : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-[#94A3B8] hover:text-[#155EEF]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isReadOnly && (
                            <button onClick={() => deleteTask(task.id)} className="text-[#94A3B8] hover:text-rose-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* PAGINATION (MOCK) */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between py-4 text-sm text-[#64748B]">
            <div>
              Page 1 of 1 &bull; Showing {filteredTasks.length} of {apiTasks.length} tasks
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                Rows: 
                <select className="bg-transparent border border-[#E2E8F0] rounded p-1 text-[#0F172A] focus:outline-none">
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 text-[#94A3B8] cursor-not-allowed">&lt; Prev</button>
                <button className="w-7 h-7 flex items-center justify-center bg-[#155EEF] text-white rounded font-bold">1</button>
                <button className="px-2 py-1 text-[#94A3B8] cursor-not-allowed">Next &gt;</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#155EEF] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0B1F3A]">Create New Task</h3>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1.5">Task Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Follow up with seller, Send contract, VET comps..."
                  className="w-full p-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1.5">Description / Instructions</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide context, special notes, or instructions for the assignee..."
                  className="w-full p-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1.5">Associated Contact</label>
                  <select
                    value={newTaskContact}
                    onChange={(e) => setNewTaskContact(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="None">None (No Contact Linked)</option>
                    <option value="Robert Vance">Robert Vance</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1.5">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="Alexander Vance">Alexander Vance (ADMIN)</option>
                    <option value="Elena Rostova">Elena Rostova (MANAGER)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1.5">Due Date</label>
                  <input
                    type="text"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1.5">Due Time</label>
                  <select
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                  >
                    <option value="08:00 AM (CDT)">08:00 AM (CDT)</option>
                    <option value="09:00 AM (CDT)">09:00 AM (CDT)</option>
                    <option value="05:00 PM (CDT)">05:00 PM (CDT)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                <div className="flex-1">
                  <div className="font-bold text-[#0B1F3A]">Recurring Task</div>
                  <div className="text-xs text-[#64748B]">Automatically recreate this task upon completion</div>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="mt-1 rounded border-[#cbd5e1] text-[#155EEF] focus:ring-[#155EEF] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-5 py-2.5 border border-[#cbd5e1] text-[#475569] font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#155EEF] hover:bg-[#1D4ED8] text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
