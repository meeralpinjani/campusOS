import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, Search, Loader2, User } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ChatDrawer = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const data = await apiFetch('/messages/conversations');
        setUsers(data.users || []);
        if (data.users && data.users.length > 0 && !selectedUser) {
          setSelectedUser(data.users[0]);
        }
      } catch (err) {
        console.error('Failed to load chat users:', err);
      }
    };
    fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/messages/${selectedUser._id}`);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.branch?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    setSending(true);
    try {
      const data = await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId: selectedUser._id, content: text.trim() }),
      });
      setMessages([...messages, data.message]);
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1B1E] border-l border-[#E5E5E5] dark:border-[#2A2A2C] w-full max-w-2xl h-full flex flex-col shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5] dark:border-[#2A2A2C] bg-[#FAFAFA] dark:bg-[#111214] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1A1B1E] text-[#111111] dark:text-[#F5F5F5] border border-[#E5E5E5] dark:border-[#2A2A2C] flex items-center justify-center shadow-2xs">
              <MessageCircle className="w-4 h-4 text-[#C43E3E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#111111] dark:text-[#F5F5F5] text-base leading-none">
                Campus Direct Messages
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                1-on-1 Student & Faculty Chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#111111] dark:hover:text-[#F5F5F5] hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[220px_1fr] overflow-hidden">
          {/* User List Sidebar */}
          <div className="border-r border-[#E5E5E5] dark:border-[#2A2A2C] flex flex-col bg-[#FAFAFA] dark:bg-[#111214]">
            <div className="p-3 border-b border-[#E5E5E5] dark:border-[#2A2A2C]">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user..."
                  className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-xs text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-[#2A2A2C]">
              {filteredUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-2.5 p-3 text-left transition-colors ${
                    selectedUser?._id === u._id
                      ? 'bg-white dark:bg-[#1A1B1E] text-[#111111] dark:text-[#F5F5F5] font-bold border-l-2 border-l-[#C43E3E]'
                      : 'hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.username}
                    className="w-7 h-7 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover shrink-0"
                  />
                  <div className="truncate min-w-0">
                    <p className="text-xs font-bold truncate">{u.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.branch}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Conversation Area */}
          <div className="flex flex-col h-full bg-white dark:bg-[#1A1B1E]">
            {selectedUser ? (
              <>
                {/* Active Target Header */}
                <div className="p-3 border-b border-[#E5E5E5] dark:border-[#2A2A2C] flex items-center gap-2.5 bg-[#FAFAFA] dark:bg-[#111214]">
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.username}
                    className="w-7 h-7 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5]">
                      {selectedUser.username}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {selectedUser.branch} ({selectedUser.role})
                    </span>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-[#C43E3E]" />
                      <span className="text-xs">Loading chat...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                      No messages yet. Say hello to @{selectedUser.username}!
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentUser?._id || m.senderId?._id === currentUser?._id;
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs whitespace-pre-line ${
                              isMe
                                ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-br-none font-medium'
                                : 'bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] text-[#111111] dark:text-[#F5F5F5] rounded-bl-none'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E5E5] dark:border-[#2A2A2C] flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Message @${selectedUser.username}...`}
                    className="flex-1 px-3.5 py-2 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-xs text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="px-4 py-2 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select a user to start messaging.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
