import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Building, 
  ArrowUpRight, 
  Flame, 
  Bot, 
  Sparkles,
  CheckSquare,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string, convId?: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { contacts, conversations, deals, currentUser } = useApp();

  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/v1/dashboard/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setMetrics(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const isAgent = currentUser.role === 'AGENT';
  const isReadOnly = currentUser.role === 'READ_ONLY';
  const isManager = currentUser.role === 'MANAGER';

  if (loading || !metrics) {
    return <div className="p-6 text-center text-[#475569]">Loading Dashboard Telemetry...</div>;
  }

  const { metrics: m, activity: a, inbox: i, pipeline: p, aiTelemetry: ai, assignedTasks } = metrics;
  const myTasks = Array.isArray(assignedTasks) ? assignedTasks : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Welcome Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2EAF5] relative">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] uppercase shrink-0 shadow-xs">
              ROLE: {currentUser.role.replace('_', ' ')}
            </span>
            <span className="text-xs text-[#475569] font-semibold">Dallas-Fort Worth Acquisitions Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1F3A]">
            {isAgent ? `Acquisitions Workbench — ${currentUser.name}` :
             isManager ? 'Acquisitions Workload & Team Telemetry' :
             isReadOnly ? 'Executive Investment Overview' :
             'Executive Acquisition Dashboard'}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time telemetry on realtor outreach, AI conversation grades, assigned tasks, and high-probability deals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('tasks')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-[#CBD5E1] hover:border-[#155EEF] hover:bg-[#F0F6FF] text-[#0B1F3A] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <CheckSquare className="w-4 h-4 text-[#155EEF]" /> Tasks Desk
          </button>
          <button
            onClick={() => onNavigate('deals')}
            className="btn-executive-primary flex-1 sm:flex-initial px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Building className="w-4 h-4" /> Deals Workspace
          </button>
        </div>
      </div>

      {/* KPI TOP METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Contact Metric */}
        <div className="executive-panel executive-panel-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#155EEF]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EAF2FF] to-[#DBEAFE] border border-[#BFDBFE] text-[#155EEF] shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
              Metrics
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] font-mono tracking-tight">{m.totalContacts}</div>
          <div className="text-xs font-bold text-[#475569] mt-0.5">Total Realtor Contacts</div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E2EAF5] text-[11px] text-[#64748B]">
            <span><strong className="text-[#16A34A]">{m.activeContacts}</strong> Active</span>
            <span>&bull;</span>
            <span><strong className="text-[#64748B]">{m.optOutContacts}</strong> Opt-out</span>
          </div>
        </div>

        {/* Outreach Metric */}
        <div className="executive-panel executive-panel-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#155EEF]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EAF2FF] to-[#DBEAFE] border border-[#BFDBFE] text-[#155EEF] shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
              Activity
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] font-mono tracking-tight">{a.outreachDispatched}</div>
          <div className="text-xs font-bold text-[#475569] mt-0.5">Outreach Dispatched (24h)</div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E2EAF5] text-[11px] text-[#64748B]">
            <span>Reply Rate: <strong className="text-[#16A34A]">{a.replyRate}%</strong></span>
            <span>&bull;</span>
            <span>SMS: {a.smsPercentage}%</span>
          </div>
        </div>

        {/* Conversation Metric */}
        <div className="executive-panel executive-panel-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#155EEF]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EAF2FF] to-[#DBEAFE] border border-[#BFDBFE] text-[#155EEF] shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
              Inbox
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] font-mono tracking-tight">{i.activeThreads}</div>
          <div className="text-xs font-bold text-[#475569] mt-0.5">Active Dialog Threads</div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E2EAF5] text-[11px] text-[#64748B]">
            <span><strong className="text-[#155EEF]">{i.needsHuman}</strong> Needs Human</span>
            <span>&bull;</span>
            <span><strong className="text-[#16A34A]">{i.addresses}</strong> Addresses</span>
          </div>
        </div>

        {/* Deals Metric */}
        <div className="executive-panel executive-panel-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#155EEF]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EAF2FF] to-[#DBEAFE] border border-[#BFDBFE] text-[#155EEF] shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
              Pipeline
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] font-mono tracking-tight">${(p.activeDealsVolume / 1000000).toFixed(2)}M</div>
          <div className="text-xs font-bold text-[#475569] mt-0.5">Active Deals Volume</div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E2EAF5] text-[11px] text-[#64748B]">
            <span><strong className="text-[#16A34A]">{p.activeDealsCount}</strong> Active Deals</span>
          </div>
        </div>

      </div>

      {/* SECOND ROW: AI QUALIFICATION & ACTION QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grade Distribution Breakdown - AI Qualification Card */}
        <div className="executive-panel rounded-2xl p-5 sm:p-6 lg:col-span-1 flex flex-col justify-between relative overflow-hidden border-[#BFDBFE]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#155EEF]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] sm:text-xs font-extrabold text-[#0B1F3A] uppercase tracking-wider truncate">AI Qualification Telemetry</h3>
              </div>
              <button onClick={() => onNavigate('conversations')} className="text-xs text-[#155EEF] font-extrabold hover:underline shrink-0 whitespace-nowrap">Details &rarr;</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-6 text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FBFF] border border-[#16A34A]/30 shadow-xs">
                <div className="text-base sm:text-lg font-mono font-bold text-[#16A34A]">{ai.gradeA}</div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#64748B] mt-0.5 whitespace-nowrap">Grade A</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FBFF] border border-[#155EEF]/30 shadow-xs">
                <div className="text-base sm:text-lg font-mono font-bold text-[#155EEF]">{ai.gradeB}</div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#64748B] mt-0.5 whitespace-nowrap">Grade B</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FBFF] border border-[#2563EB]/30 shadow-xs">
                <div className="text-base sm:text-lg font-mono font-bold text-[#2563EB]">{ai.gradeC}</div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#64748B] mt-0.5 whitespace-nowrap">Grade C</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F8FBFF] border border-[#E11D48]/30 shadow-xs">
                <div className="text-base sm:text-lg font-mono font-bold text-[#E11D48]">{ai.gradeD}</div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#64748B] mt-0.5 whitespace-nowrap">Grade D</div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-xs text-[#0B1F3A] flex items-center justify-between gap-2 shadow-xs">
            <span className="flex items-center gap-2 truncate font-semibold">
              <Sparkles className="w-4 h-4 text-[#155EEF] shrink-0" /> <span className="truncate">AI High-Intent Threads</span>
            </span>
            <span className="font-extrabold font-mono text-[#155EEF] text-xs sm:text-sm shrink-0">{ai.qualifiedCount} Qualified</span>
          </div>
        </div>

        {/* Priority Attention Queue */}
        <div className="executive-panel rounded-2xl p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-[#0B1F3A] uppercase tracking-wider">Priority Attention Queue</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#155EEF] text-white shrink-0 shadow-xs">
                {i.needsHuman + i.addresses} Items
              </span>
            </div>
            {!isReadOnly && (
              <button onClick={() => onNavigate('leadqueue')} className="text-xs text-[#155EEF] font-extrabold hover:underline self-start sm:self-auto">
                Open Lead Queue &rarr;
              </button>
            )}
          </div>

          <div className="space-y-3">
            {conversations.slice(0, 3).map((conv) => (
              <div
                key={conv.id}
                onClick={() => onNavigate('conversations', conv.id)}
                className="p-3.5 rounded-xl bg-[#F8FBFF] border border-[#E2EAF5] hover:border-[#155EEF] hover:bg-[#F0F6FF] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs hover:shadow-md"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#155EEF] font-extrabold text-xs flex items-center justify-center border border-[#BFDBFE] shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                    {conv.grade}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs font-bold text-[#0B1F3A] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span>{conv.realtorName}</span>
                      <span className="text-[#64748B] hidden sm:inline">&bull;</span>
                      <span className="text-[#475569] font-normal text-[11px] sm:text-xs">({conv.brokerage})</span>
                    </div>
                    <div className="text-[11px] text-[#475569] truncate italic">
                      "{conv.latestMessage}"
                    </div>
                  </div>
                </div>

                <span className="self-start sm:self-center shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] whitespace-nowrap shadow-xs">
                  {conv.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* THIRD ROW: ASSIGNED OPERATIONAL TASKS */}
      <div className="executive-panel rounded-2xl p-5 sm:p-6 border-[#BFDBFE]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#EAF2FF] text-[#155EEF] border border-[#BFDBFE] shrink-0 shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#0B1F3A] uppercase tracking-wider">
                Assigned Operational Tasks ({myTasks.length})
              </h3>
              <p className="text-[11px] text-[#64748B]">Actionable underwriting and operational tasks assigned in the system</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('tasks')} 
            className="text-xs text-[#155EEF] font-extrabold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Manage All Tasks Desk <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myTasks.length === 0 ? (
          <div className="p-8 text-center bg-[#F8FBFF] rounded-xl border border-[#E2EAF5] text-xs text-[#64748B]">
            No pending operational tasks assigned currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myTasks.slice(0, 6).map((task) => (
              <div 
                key={task.id}
                onClick={() => onNavigate('tasks')}
                className="p-4 rounded-xl bg-white border border-[#E2EAF5] hover:border-[#155EEF] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      task.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {task.dueDate || 'Today'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#0B1F3A] group-hover:text-[#155EEF] transition-colors line-clamp-1">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-[#64748B]">
                  <span className="flex items-center gap-1 font-medium truncate">
                    <UserCheck className="w-3 h-3 text-[#155EEF] shrink-0" />
                    <span className="truncate">{task.assignedToName || 'Unassigned'}</span>
                  </span>
                  <span className="font-bold text-[#155EEF] uppercase shrink-0">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
