import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, ShieldAlert, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { RenderMotifIcon } from '../utils/motifIcons';

export const ChannelSidebar = ({
  channels,
  selectedChannel,
  onSelectChannel,
  onOpenCreateModal,
  onOpenCommunityRequestsModal,
  onChannelDeleted,
}) => {
  const { user } = useAuth();
  const isStaff = user && ['moderator', 'admin'].includes(user.role);
  const canCreateChannel = user && ['faculty', 'moderator', 'admin'].includes(user.role);

  // Filter out any stale r/Buy_Sell_Trade channel if present
  const filteredChannels = channels.filter((ch) => ch.slug !== 'r-buy-sell-trade');

  // Group channels by their hierarchical Group property
  const groupedChannels = filteredChannels.reduce((acc, ch) => {
    const groupName = ch.group || 'Official Announcements';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(ch);
    return acc;
  }, {});

  // Group collapse state
  const [collapsed, setCollapsed] = useState({});

  const toggleGroup = (groupName) => {
    setCollapsed((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleDeleteChannel = async (e, channelId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this channel?')) return;
    try {
      await apiFetch(`/channels/${channelId}`, { method: 'DELETE' });
      if (onChannelDeleted) onChannelDeleted(channelId);
    } catch (err) {
      alert(err.message || 'Failed to delete channel');
    }
  };

  const groups = Object.keys(groupedChannels);

  return (
    <aside className="bg-[#FAFAFA] dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-3.5 space-y-3 transition-colors">
      {/* Sidebar Top Header */}
      <div className="flex items-center justify-between px-1 pb-2 border-b border-[#E5E5E5] dark:border-[#2A2A2C]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <h2 className="font-extrabold text-[#111111] dark:text-[#F5F5F5] text-xs tracking-wider uppercase">
            Campus Channels
          </h2>
        </div>
        <button
          onClick={onOpenCommunityRequestsModal || onOpenCreateModal}
          className="text-[11px] font-bold text-[#111111] dark:text-[#F5F5F5] hover:bg-[#E5E5E5]/60 dark:hover:bg-[#2A2A2C] px-2 py-1 rounded-md border border-[#E5E5E5] dark:border-[#2A2A2C] transition-all flex items-center gap-1 cursor-pointer"
          title={canCreateChannel ? 'Create or Approve Communities' : 'Submit Request to Create Community'}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{canCreateChannel ? '+ Community' : 'Request'}</span>
        </button>
      </div>

      {/* Main All Feed Button */}
      <button
        onClick={() => onSelectChannel(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
          selectedChannel === null
            ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
            : 'text-slate-700 dark:text-slate-300 hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C]'
        }`}
      >
        <RenderMotifIcon iconName="MessageSquare" className="w-3.5 h-3.5" />
        <span>All Community Feed</span>
      </button>

      {/* Hierarchical Groups & Sub-Channels */}
      <div className="space-y-3 pt-1">
        {groups.map((groupName) => {
          const isCollapsed = collapsed[groupName];
          const groupChannels = groupedChannels[groupName];

          return (
            <div key={groupName} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-wider px-1 py-0.5 transition-colors group"
              >
                <div className="flex items-center gap-1 truncate">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="truncate">{groupName}</span>
                </div>
                <span className="text-[9px] bg-[#E5E5E5] dark:bg-[#2A2A2C] text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded-full font-bold">
                  {groupChannels.length}
                </span>
              </button>

              {/* Channel List under Group */}
              {!isCollapsed && (
                <nav className="space-y-0.5 pl-1.5">
                  {groupChannels.map((ch) => {
                    const isActive = selectedChannel === ch.slug;
                    return (
                      <div
                        key={ch._id}
                        onClick={() => onSelectChannel(ch.slug)}
                        className={`group/item w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-[#111214] text-[#111111] dark:text-[#F5F5F5] font-bold border-l-2 border-l-[#C43E3E] border-t border-r border-b border-[#E5E5E5] dark:border-[#2A2A2C]'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-[#E5E5E5]/40 dark:hover:bg-[#2A2A2C] hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <RenderMotifIcon
                            iconName={ch.icon || 'Hash'}
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive
                                ? 'text-[#C43E3E]'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          <span className="truncate">{ch.name}</span>
                        </div>

                        {/* Admin / Moderator Delete Action */}
                        {isStaff && ch.slug !== 'official-notices' && (
                          <button
                            onClick={(e) => handleDeleteChannel(e, ch._id)}
                            className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-[#C43E3E] hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-all"
                            title="Delete Channel"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Staff Management Badge */}
      {isStaff && (
        <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#2A2A2C] flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-300 font-bold bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] p-2 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#C43E3E]" />
          <span>Staff Mode: Manage groups & channels.</span>
        </div>
      )}
    </aside>
  );
};
