import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Video as VideoIcon, FileText, Send, Loader2, AlertCircle, Trash2, Megaphone, AtSign } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreatePostModal = ({ isOpen, onClose, channels, defaultChannelId, onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channelId, setChannelId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [mentionInput, setMentionInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isNotice, setIsNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && channels && channels.length > 0) {
      if (defaultChannelId) {
        const matched = channels.find((c) => c._id === defaultChannelId || c.slug === defaultChannelId);
        if (matched) {
          setChannelId(matched._id);
        } else {
          setChannelId(channels[0]._id);
        }
      } else if (!channelId) {
        setChannelId(channels[0]._id);
      }
    }
  }, [isOpen, defaultChannelId, channels]);

  const canPublishNotice = user && ['faculty', 'moderator', 'admin'].includes(user.role);

  if (!isOpen) return null;

  // Group channels by hierarchical group property
  const channelGroups = channels.reduce((acc, ch) => {
    const groupName = ch.group || 'Official Announcements';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(ch);
    return acc;
  }, {});

  const handleAddTag = () => {
    const cleaned = tagInput.replace(/^#+/, '').trim().toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddMention = (username) => {
    if (!username.trim()) return;
    const cleanUser = username.replace(/^@+/, '').trim();
    setBody((prev) => `${prev} @${cleanUser} `);
    setMentionInput('');
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachments([
        ...attachments,
        {
          url: ev.target.result,
          fileType,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const targetChannelId = channelId || channels[0]?._id;
    if (!title.trim() || !body.trim() || !targetChannelId) {
      setError('Please provide title, body, and select a channel');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          channelId: targetChannelId,
          tags,
          attachments,
          isNotice: canPublishNotice ? isNotice : false,
        }),
      });
      onPostCreated(data.post);
      onClose();
      setTitle('');
      setBody('');
      setTags([]);
      setAttachments([]);
      setIsNotice(false);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-5 sm:p-6 relative max-h-[90vh] flex flex-col my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">Create Post</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Target Channel Group Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Department Channel
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none"
            >
              {Object.keys(channelGroups).map((groupName) => (
                <optgroup key={groupName} label={groupName} className="font-bold text-slate-700 dark:text-slate-300">
                  {channelGroups[groupName].map((ch) => {
                    const isOfficial = groupName === 'Official Announcements' || ['official-notices', 'general-lounge'].includes(ch.slug);
                    const isDisabledForStudent = isOfficial && !canPublishNotice;
                    return (
                      <option key={ch._id} value={ch._id} disabled={isDisabledForStudent}>
                        {ch.name} {isDisabledForStudent ? '(Faculty Only)' : ''}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Official Channel Posting Permission Warning for Students */}
          {(() => {
            const selectedCh = channels.find((c) => c._id === channelId);
            const isOfficialSelected =
              selectedCh?.group === 'Official Announcements' ||
              ['official-notices', 'general-lounge'].includes(selectedCh?.slug);
            if (isOfficialSelected && !canPublishNotice) {
              return (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Posting in Official Announcements channels is restricted to Faculty members only. Please select a student community or department channel.
                  </span>
                </div>
              );
            }
            return null;
          })()}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a descriptive title..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none font-medium"
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Content & Discussion
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share updates, project ideas, academic notes, or ask questions... Use @username to tag peers!"
              rows={4}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none resize-none"
              required
            />
          </div>

          {/* Mention Helper Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={mentionInput}
                onChange={(e) => setMentionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMention(mentionInput);
                  }
                }}
                placeholder="Type username to @mention (e.g. alex_student)..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
              <AtSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="button"
              onClick={() => handleAddMention(mentionInput)}
              className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              Tag User
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Hashtags & Topics
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags (e.g. ai, python, midterm)..."
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
              >
                Add Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Attachments (Images, Videos, PDFs)
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                <VideoIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>PDF / Document</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                      {att.name} ({att.fileType})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Notice Option for Faculty & Staff */}
          {canPublishNotice && (
            <label className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isNotice}
                onChange={(e) => setIsNotice(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Publish as Official Campus Notice (highlighted circular)
              </span>
            </label>
          )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] dark:border-[#2A2A2C]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              {body.length}/2000 chars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#111214] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className="px-5 py-2 bg-[#C43E3E] hover:bg-[#A63333] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isNotice ? 'Publish Notice' : 'Post'}</span>
                </>
              )}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};
