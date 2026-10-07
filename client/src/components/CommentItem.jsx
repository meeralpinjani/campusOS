import React, { useState } from 'react';
import { Reply, Trash2, GraduationCap, BookOpen, Send, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CommentItem = ({ comment, onAddReply, onDeleteComment, depth = 0 }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { _id, authorId, content, createdAt, replies = [] } = comment;
  const isAuthor = user && (user._id === authorId?._id || user._id === authorId);
  const isStaff = user && ['moderator', 'admin'].includes(user.role);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-px rounded bg-red-50 dark:bg-red-950/30 text-[#C43E3E] border border-red-500/30">
            <Shield className="w-2.5 h-2.5 text-[#C43E3E]" /> Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-px rounded bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Shield className="w-2.5 h-2.5" /> Moderator
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-px rounded bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <GraduationCap className="w-2.5 h-2.5" /> Faculty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold px-1.5 py-px rounded bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <BookOpen className="w-2.5 h-2.5" /> Student
          </span>
        );
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddReply(_id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormattedContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        return (
          <span key={idx} className="font-bold text-[#111111] dark:text-[#F5F5F5] bg-[#FAFAFA] dark:bg-[#2A2A2C] px-1 py-0.5 rounded border border-[#E5E5E5] dark:border-[#2A2A2C]">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-4 sm:ml-6 pl-3 border-l-2 border-[#E5E5E5] dark:border-[#2A2A2C]' : ''}`}>
      <div className="bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-3 space-y-2 transition-colors">
        {/* Comment Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <img
              src={authorId?.avatarUrl || `https://ui-avatars.com/api/?name=${authorId?.username || 'U'}`}
              alt={authorId?.username}
              className="w-5 h-5 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover"
            />
            <span className="font-bold text-[#111111] dark:text-[#F5F5F5]">{authorId?.username || 'Anonymous'}</span>
            {getRoleBadge(authorId?.role)}

            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">{timeAgo(createdAt)}</span>
          </div>

          {(isAuthor || isStaff) && (
            <button
              onClick={() => onDeleteComment(_id)}
              className="text-slate-400 hover:text-[#C43E3E] p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Delete Comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Comment Body */}
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-7">
          {renderFormattedContent(content)}
        </p>

        {/* Actions Bar */}
        {user && depth < 3 && (
          <div className="pl-7 flex items-center gap-3">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C43E3E] transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>
        )}
      </div>

      {/* Inline Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="ml-7 flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to @${authorId?.username}...`}
            className="flex-1 px-3 py-1.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-xs text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={isSubmitting || !replyText.trim()}
            className="px-3 py-1.5 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </form>
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="space-y-2 pt-1">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onAddReply={onAddReply}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
