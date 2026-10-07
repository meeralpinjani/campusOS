import React, { useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export const CommentSection = ({ postId, onCommentCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/comments/post/${postId}`);
        setComments(data.comments || []);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      const data = await apiFetch(`/comments/post/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content: newCommentText.trim() }),
      });
      setComments([data.comment, ...comments]);
      setNewCommentText('');
      if (onCommentCountChange) onCommentCountChange(1);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (parentCommentId, content) => {
    try {
      const data = await apiFetch(`/comments/post/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content, parentCommentId }),
      });

      const addReplyToTree = (items) => {
        return items.map((item) => {
          if (item._id === parentCommentId) {
            return {
              ...item,
              replies: [...(item.replies || []), data.comment],
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: addReplyToTree(item.replies),
            };
          }
          return item;
        });
      };

      setComments(addReplyToTree(comments));
      if (onCommentCountChange) onCommentCountChange(1);
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });

      const removeCommentFromTree = (items) => {
        return items
          .filter((item) => item._id !== commentId)
          .map((item) => ({
            ...item,
            replies: item.replies ? removeCommentFromTree(item.replies) : [],
          }));
      };

      setComments(removeCommentFromTree(comments));
      if (onCommentCountChange) onCommentCountChange(-1);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[#E5E5E5] dark:border-[#2A2A2C]">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        <h3 className="font-bold text-[#111111] dark:text-[#F5F5F5] text-sm">Discussion</h3>
      </div>

      {/* Main Comment Input */}
      {user ? (
        <form onSubmit={handleCreateComment} className="flex items-start gap-2.5">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-8 h-8 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover shrink-0 mt-0.5"
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="What are your thoughts? Use @username to mention..."
              rows={2}
              className="w-full px-3.5 py-2 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:bg-white dark:focus:bg-[#111214] focus:border-[#C43E3E] focus:ring-2 focus:ring-red-500/10 rounded-xl text-xs text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] outline-none resize-none transition-all"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newCommentText.trim()}
                className="px-4 py-1.5 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
          Please log in to join the conversation.
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 text-[#C43E3E] animate-spin" />
          <span className="text-xs">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
