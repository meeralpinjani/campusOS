import React, { useState } from 'react';
import { GraduationCap, BookOpen, ArrowBigUp, MessageSquare, FileText, Eye, Megaphone, Shield, Bookmark, Trash2 } from 'lucide-react';
import { apiFetch, deletePostApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NoticePdfGeneratorModal } from './NoticePdfGeneratorModal';

export const PostCard = ({ post, onOpenDetail, onPostDeleted }) => {
  const { user } = useAuth();
  const { _id, authorId, channelId, title, body, tags, attachments, isNotice, createdAt } = post;

  const [score, setScore] = useState(post.score || 0);
  const [userVote, setUserVote] = useState(
    user && post.upvotedBy?.includes(user._id)
      ? 'upvote'
      : user && post.downvotedBy?.includes(user._id)
      ? 'downvote'
      : 'none'
  );
  const [commentCount] = useState(post.commentCount || 0);
  const [isSaved, setIsSaved] = useState(user?.savedPosts?.includes(_id) || false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const data = await apiFetch(`/auth/bookmark/${_id}`, { method: 'POST' });
      setIsSaved(data.isSaved);
    } catch (err) {
      console.error('Failed to bookmark post:', err);
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

  const handleVote = async (e, voteType) => {
    e.stopPropagation();
    if (!user) return;

    const isOwnPost = user && (user._id === authorId?._id || user._id === authorId);
    if (isOwnPost) {
      alert("You cannot vote on your own post.");
      return;
    }

    const newVote = userVote === voteType ? 'none' : voteType;
    let scoreDelta = 0;
    if (userVote === 'upvote') scoreDelta -= 1;
    if (userVote === 'downvote') scoreDelta += 1;
    if (newVote === 'upvote') scoreDelta += 1;
    if (newVote === 'downvote') scoreDelta -= 1;

    setUserVote(newVote);
    setScore((prev) => prev + scoreDelta);

    try {
      const data = await apiFetch(`/posts/${_id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteType: newVote }),
      });
      setScore(data.score);
    } catch (err) {
      console.error('Failed to vote:', err);
      setUserVote(userVote);
      setScore(post.score || 0);
    }
  };

  // Format text to highlight @mentions and #hashtags
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
      if (part.startsWith('#')) {
        return (
          <span key={idx} className="font-semibold text-slate-700 dark:text-slate-300 bg-[#FAFAFA] dark:bg-[#2A2A2C] px-1 py-0.5 rounded border border-[#E5E5E5] dark:border-[#2A2A2C]">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article
      onClick={() => onOpenDetail && onOpenDetail(post)}
      className={`bg-white dark:bg-[#1A1B1E] border rounded-xl hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer overflow-hidden ${
        isNotice
          ? 'border-[#C43E3E]/60 ring-1 ring-[#C43E3E]/20'
          : 'border-[#E5E5E5] dark:border-[#2A2A2C]'
      }`}
    >
      {/* Notice Banner Accent */}
      {isNotice && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-950/40 border-b border-red-200/60 dark:border-red-900/60 text-[#C43E3E] text-[11px] font-bold uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5 text-[#C43E3E]" />
          Official Campus Notice
        </div>
      )}

      <div className="flex">
        {/* Left Vote Column */}
        <div className="flex flex-col items-center gap-0.5 px-3 py-3.5 bg-[#FAFAFA] dark:bg-[#111214] border-r border-[#E5E5E5] dark:border-[#2A2A2C] rounded-l-xl">
          <button
            onClick={(e) => handleVote(e, 'upvote')}
            className={`p-1.5 rounded-lg transition-colors ${
              userVote === 'upvote'
                ? 'text-[#C43E3E] bg-red-50 dark:bg-red-950/40'
                : 'text-slate-400 hover:text-[#C43E3E] hover:bg-[#E5E5E5]/60 dark:hover:bg-[#2A2A2C]'
            }`}
            title="Upvote"
          >
            <ArrowBigUp className="w-5 h-5" />
          </button>
          <span
            className={`text-xs font-bold min-w-[20px] text-center ${
              userVote === 'upvote'
                ? 'text-[#C43E3E]'
                : userVote === 'downvote'
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-[#111111] dark:text-[#F5F5F5]'
            }`}
          >
            {score}
          </span>
          <button
            onClick={(e) => handleVote(e, 'downvote')}
            className={`p-1.5 rounded-lg transition-colors rotate-180 ${
              userVote === 'downvote'
                ? 'text-slate-700 dark:text-slate-300 bg-[#E5E5E5] dark:bg-[#2A2A2C]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-[#E5E5E5]/60 dark:hover:bg-[#2A2A2C]'
            }`}
            title="Downvote"
          >
            <ArrowBigUp className="w-5 h-5" />
          </button>
        </div>

        {/* Main Post Content */}
        <div className="flex-1 px-4 sm:px-5 py-3.5 space-y-2.5">
          {/* Header line */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <img
              src={authorId?.avatarUrl || `https://ui-avatars.com/api/?name=${authorId?.username || 'U'}`}
              alt={authorId?.username}
              className="w-5 h-5 rounded-full border border-[#E5E5E5] dark:border-slate-700 object-cover"
            />
            <span className="font-bold text-[#111111] dark:text-[#F5F5F5]">{authorId?.username}</span>
            {getRoleBadge(authorId?.role)}

            <span className="text-slate-400">·</span>
            <span className="truncate max-w-[180px]">{authorId?.branch}</span>
            {authorId?.year && authorId?.year !== 'N/A' && (
              <><span className="text-slate-400">·</span><span>{authorId?.year}</span></>
            )}
            <span className="text-slate-400">·</span>
            <span>{timeAgo(createdAt)}</span>

            {channelId && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#111111] dark:text-[#F5F5F5] bg-[#FAFAFA] dark:bg-[#2A2A2C] px-2.5 py-0.5 rounded border border-[#E5E5E5] dark:border-[#2A2A2C]">
                {channelId.name}
              </span>
            )}
          </div>

          {/* Post Title */}
          <h2 className="text-base sm:text-lg font-extrabold text-[#111111] dark:text-[#F5F5F5] leading-snug hover:text-[#C43E3E] dark:hover:text-[#C43E3E] transition-colors">
            {title}
          </h2>

          {/* Post Body */}
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line line-clamp-4">
            {renderFormattedBody(body)}
          </p>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="space-y-2 pt-1">
              {attachments.map((att, idx) => (
                <div key={idx}>
                  {att.fileType === 'image' && (
                    <img
                      src={att.url}
                      alt={att.name || 'Attachment'}
                      className="w-full max-h-80 object-cover rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2C]"
                    />
                  )}
                  {att.fileType === 'video' && (
                    <video controls className="w-full max-h-80 rounded-xl bg-black">
                      <source src={att.url} />
                    </video>
                  )}
                  {att.fileType === 'pdf' && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPdfModalOpen(true);
                      }}
                      className="flex items-center gap-3 p-3 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] transition-all cursor-pointer"
                      title="Click to Preview PDF Notice"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#C43E3E] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5] truncate">{att.name || 'Document.pdf'}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">PDF {att.size ? `· ${att.size}` : ''}</div>
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#111111] dark:text-[#F5F5F5] bg-white dark:bg-[#1A1B1E] rounded-lg border border-[#E5E5E5] dark:border-[#2A2A2C]">
                        <Eye className="w-3.5 h-3.5 text-[#C43E3E]" /> Preview PDF
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {tags.map((t) => (
                <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FAFAFA] dark:bg-[#2A2A2C] text-slate-700 dark:text-slate-300 border border-[#E5E5E5] dark:border-[#2A2A2C]">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#2A2A2C] text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <button
              onClick={() => onOpenDetail && onOpenDetail(post)}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-[#C43E3E] dark:hover:text-[#C43E3E] transition-colors py-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{commentCount} Comments</span>
            </button>

            {isNotice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPdfModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#111111] dark:text-[#F5F5F5] bg-[#FAFAFA] dark:bg-[#2A2A2C] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-lg hover:bg-[#E5E5E5] transition-all cursor-pointer"
                title="Generate Official PDF Notice with Letterhead, Watermark & QR Code"
              >
                <FileText className="w-3.5 h-3.5 text-[#C43E3E]" />
                <span>Official PDF Notice</span>
              </button>
            )}

            {user && (
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-[#C43E3E] bg-red-50 dark:bg-red-950/40 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#C43E3E] hover:bg-[#FAFAFA] dark:hover:bg-[#2A2A2C]'
                }`}
                title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            {user && (user._id === authorId?._id || user._id === authorId || ['admin', 'moderator'].includes(user.role)) && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm('Are you sure you want to delete this post?')) return;
                  try {
                    await deletePostApi(_id);
                    if (onPostDeleted) onPostDeleted(_id);
                  } catch (err) {
                    alert(err.message || 'Failed to delete post');
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-[#C43E3E] hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg transition-all"
                title="Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <NoticePdfGeneratorModal
        post={post}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </article>
  );
};
