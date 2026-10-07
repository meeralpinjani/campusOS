import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, MessageSquare, ArrowBigUp, AtSign, Loader2 } from 'lucide-react';
import { apiFetch } from '../services/api';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'upvote':
        return <ArrowBigUp className="w-4 h-4 text-[#C43E3E]" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-slate-700 dark:text-slate-300" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-[#C43E3E]" />;
      default:
        return <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] transition-all relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C43E3E] text-white font-extrabold text-[9px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-2xl shadow-2xl z-50 overflow-hidden transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-[#2A2A2C] bg-[#FAFAFA] dark:bg-[#111214]">
            <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-[#C43E3E]" />
              <span>Activity Alerts</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-[#C43E3E] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> Mark read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-[#2A2A2C]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 flex items-start gap-2.5 text-xs transition-colors ${
                    !n.isRead ? 'bg-red-50/40 dark:bg-red-950/20 font-semibold' : 'hover:bg-[#FAFAFA] dark:hover:bg-[#111214]'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#111111] dark:text-[#F5F5F5] leading-snug">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
