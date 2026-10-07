import React, { useState } from 'react';
import { X, GraduationCap, BookOpen, Hash, ArrowBigUp, Megaphone, FileText, Download, Shield, Trash2 } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { apiFetch, deletePostApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PostDetailModal = ({ post, isOpen, onClose, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();

  const [currentPost, setCurrentPost] = useState(post);
  const [userVote, setUserVote] = useState(
    user && post?.upvotedBy?.includes(user._id)
      ? 'upvote'
      : user && post?.downvotedBy?.includes(user._id)
      ? 'downvote'
      : 'none'
  );

  if (!isOpen || !post) return null;

  const { authorId, channelId, title, body, attachments, isNotice, createdAt } = currentPost;

  const canDelete =
    user &&
    (user._id === authorId?._id ||
      user._id === authorId ||
      ['admin', 'moderator'].includes(user.role));

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePostApi(post._id);
      onClose();
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded bg-red-50 dark:bg-red-950/30 text-[#C43E3E] border border-red-500/30">
            <Shield className="w-2.5 h-2.5 text-[#C43E3E]" /> Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Shield className="w-2.5 h-2.5" /> Moderator
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <GraduationCap className="w-2.5 h-2.5" /> Faculty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
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

  const handleVote = async (voteType) => {
    if (!user) return;

    const isOwnPost = user && (user._id === authorId?._id || user._id === authorId);
    if (isOwnPost) {
      alert("You cannot vote on your own post.");
      return;
    }

    const newVote = userVote === voteType ? 'none' : voteType;
    setUserVote(newVote);

    try {
      const data = await apiFetch(`/posts/${currentPost._id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteType: newVote }),
      });

      const updated = { ...currentPost, score: data.score };
      setCurrentPost(updated);
      if (onPostUpdated) onPostUpdated(updated);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleCommentCountChange = (delta) => {
    const updated = {
      ...currentPost,
      commentCount: Math.max(0, (currentPost.commentCount || 0) + delta),
    };
    setCurrentPost(updated);
    if (onPostUpdated) onPostUpdated(updated);
  };

  const renderFormattedBody = (text) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5] dark:border-[#2A2A2C] bg-[#FAFAFA] dark:bg-[#111214] shrink-0">
          <div className="flex items-center gap-2">
            {channelId && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#111111] dark:text-[#F5F5F5] bg-white dark:bg-[#1A1B1E] px-2.5 py-1 rounded-md border border-[#E5E5E5] dark:border-[#2A2A2C]">
                <Hash className="w-3.5 h-3.5" />
                {channelId.name}
              </span>
            )}
            {isNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C43E3E] bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/40">
                <Megaphone className="w-3.5 h-3.5" /> Official Notice
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#C43E3E] hover:bg-red-50 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-lg transition-all"
                title="Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#111111] dark:hover:text-[#F5F5F5] hover:bg-[#FAFAFA] dark:hover:bg-[#111214] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Author Header */}
          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <img
              src={authorId?.avatarUrl || `https://ui-avatars.com/api/?name=${authorId?.username || 'U'}`}
              alt={authorId?.username}
              className="w-8 h-8 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#111111] dark:text-[#F5F5F5] text-sm">
                  {authorId?.username}
                </span>
                {getRoleBadge(authorId?.role)}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {authorId?.branch} · {timeAgo(createdAt)} ago
              </span>
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-xl font-extrabold text-[#111111] dark:text-[#F5F5F5] leading-snug">
            {title}
          </h1>

          {/* Post Body */}
          <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {renderFormattedBody(body)}
          </p>

          {/* Attachments Gallery */}
          {attachments && attachments.length > 0 && (
            <div className="space-y-3 pt-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-[#2A2A2C] bg-[#FAFAFA] dark:bg-[#111214]">
                  {att.fileType === 'image' && (
                    <img src={att.url} alt={att.name} className="w-full max-h-96 object-contain bg-black" />
                  )}
                  {att.fileType === 'video' && (
                    <video controls className="w-full max-h-96 bg-black">
                      <source src={att.url} />
                    </video>
                  )}
                  {att.fileType === 'pdf' && (
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1B1E]">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-6 h-6 text-[#C43E3E]" />
                        <div>
                          <p className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5]">{att.name || 'Document.pdf'}</p>
                          <p className="text-[10px] text-slate-400">{att.size || 'PDF Document'}</p>
                        </div>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vote Controls Bar */}
          <div className="flex items-center gap-2 py-2 border-y border-[#E5E5E5] dark:border-[#2A2A2C]">
            <div className="flex items-center gap-1 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-1">
              <button
                onClick={() => handleVote('upvote')}
                className={`p-1.5 rounded-lg transition-colors ${
                  userVote === 'upvote'
                    ? 'text-[#C43E3E] bg-red-50 dark:bg-red-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#C43E3E]'
                }`}
                title="Upvote"
              >
                <ArrowBigUp className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5] px-1">{currentPost.score}</span>
              <button
                onClick={() => handleVote('downvote')}
                className={`p-1.5 rounded-lg transition-colors rotate-180 ${
                  userVote === 'downvote'
                    ? 'text-[#C43E3E] bg-red-50 dark:bg-red-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#C43E3E]'
                }`}
                title="Downvote"
              >
                <ArrowBigUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Discussion Comment Thread */}
          <CommentSection postId={currentPost._id} onCommentCountChange={handleCommentCountChange} />
        </div>
      </div>
    </div>
  );
};
