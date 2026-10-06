import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Building, UserCheck, MessageSquare, Search, CheckCircle, UserPlus, X } from 'lucide-react';

interface LeadQueueProps {
  onNavigate: (tab: string, convId?: string) => void;
}

export const LeadQueuePage: React.FC<LeadQueueProps> = ({ onNavigate }) => {
  const { conversations, claimLead, currentUser, users, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState<'address' | 'needs_human'>('address');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const leadsWithAddress = conversations.filter(c => c.status === 'Leads With Address' || (c.status === 'Assigned' && !!c.propertyCaptured));
  const needsHumanLeads = conversations.filter(c => c.status === 'Needs Human' || c.status === 'Wants Call' || (c.status === 'Assigned' && !c.propertyCaptured));

  const activeList = (activeTab === 'address' ? leadsWithAddress : needsHumanLeads).filter(conv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = conv.realtorName.toLowerCase().includes(q);
    const brokerMatch = conv.brokerage.toLowerCase().includes(q);
    const addressMatch = conv.propertyCaptured?.address.toLowerCase().includes(q) || false;
    const msgMatch = conv.latestMessage.toLowerCase().includes(q);
    const ownerMatch = conv.assignedOwnerName?.toLowerCase().includes(q) || false;
    return nameMatch || brokerMatch || addressMatch || msgMatch || ownerMatch;
  });

  const canEditOutreach = hasPermission('Outreach Pipeline', 'EDIT');
  const isAdminOrManager = canEditOutreach;

  const handleClaim = (convId: string, targetUserId?: string, targetUserName?: string) => {
    claimLead(convId, targetUserId, targetUserName);
    const assignedTo = targetUserName || currentUser.name;
    showToast(`Lead assigned to ${assignedTo} successfully.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-white border border-[#155EEF] text-[#0F172A] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#64748B] hover:text-[#0F172A] ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] flex items-center gap-2">
            Priority Lead Queue
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#EAF2FF] text-[#155EEF] border border-[#155EEF]/20 font-semibold">
              {leadsWithAddress.length + needsHumanLeads.length} Action Items
            </span>
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            Dedicated triage workspace for high-intent realtor replies, captured addresses, and AI escalations.
          </p>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, address, brokerage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] focus:border-[#155EEF] rounded-xl pl-9 pr-8 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[#E2E8F0] space-x-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('address')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'address' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
        >
          <Building className="w-4 h-4" /> LEADS WITH ADDRESS ({leadsWithAddress.length})
        </button>

        <button
          onClick={() => setActiveTab('needs_human')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'needs_human' ? 'border-[#155EEF] text-[#155EEF]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
        >
          <Flame className="w-4 h-4 text-[#155EEF]" /> NEEDS HUMAN TAKEOVER ({needsHumanLeads.length})
        </button>
      </div>

      {/* LEADS LIST CARDS */}
      <div className="space-y-4">
        {activeList.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0]">
            No leads found matching your criteria.
          </div>
        ) : (
          activeList.map((conv) => {
            const isAssigned = !!conv.assignedOwnerName;

            return (
              <div
                key={conv.id}
                className="executive-panel executive-panel-hover rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden"
              >
                <div className="space-y-2 flex-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center bg-[#EAF2FF] text-[#155EEF] border border-[#155EEF]/20 shrink-0">
                      {conv.grade}
                    </span>
                    <span className="font-bold text-[#0F172A] text-sm truncate">{conv.realtorName}</span>
                    <span className="text-[#475569] text-xs font-normal shrink-0">({conv.brokerage})</span>

                    {/* OWNER BADGE */}
                    {isAssigned ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                        <UserCheck className="w-3 h-3 text-emerald-600" /> Assigned to {conv.assignedOwnerName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        Unassigned
                      </span>
                    )}

                    <span className="text-[10px] text-[#64748B] font-mono ml-auto md:ml-2 shrink-0">&bull; {conv.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#1E293B] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] break-words italic">
                    "{conv.latestMessage}"
                  </p>

                  {conv.propertyCaptured && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 font-semibold">
                      <span>📍 {conv.propertyCaptured.address}, {conv.propertyCaptured.city}</span>
                      <span>&bull;</span>
                      <span>Asking: ${conv.propertyCaptured.askingPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start sm:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                  {canEditOutreach && (
                    <>
                      {/* ADMIN / MANAGER REASSIGNMENT SELECTOR */}
                      {isAdminOrManager && (
                        <div className="relative flex items-center flex-1 sm:flex-initial min-w-[130px]">
                          <select
                            value={conv.assignedOwnerId || ''}
                            onChange={(e) => {
                              const selectedUser = users.find(u => u.id === e.target.value);
                              if (selectedUser) {
                                handleClaim(conv.id, selectedUser.id, selectedUser.name);
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#E2E8F0] hover:border-[#155EEF]/40 text-[#0F172A] text-xs font-semibold rounded-xl transition-all appearance-none pr-8 cursor-pointer focus:outline-none focus:border-[#155EEF] truncate shadow-sm"
                          >
                            <option value="" disabled>Assign Owner...</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id} className="bg-white text-[#0F172A]">
                                {u.name} ({u.role})
                              </option>
                            ))}
                          </select>
                          <UserPlus className="w-3.5 h-3.5 text-[#155EEF] absolute right-2.5 pointer-events-none" />
                        </div>
                      )}

                      {/* CLAIM LEAD BUTTON - SHOW IF UNASSIGNED OR ASSIGNED TO ANOTHER USER */}
                      {(!isAssigned || conv.assignedOwnerId !== currentUser.id) && (
                        <button
                          onClick={() => handleClaim(conv.id)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 btn-executive-primary text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {isAssigned ? 'Reassign to Me' : 'Claim Lead'}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => onNavigate('conversations', conv.id)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-white border border-[#E2E8F0] hover:border-[#155EEF]/40 text-[#0F172A] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#155EEF]" /> Open Thread
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

