import React, { useState, useEffect } from 'react';
import { X, Award, Bookmark, User, Loader2, Camera, Edit3, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { PostCard } from './PostCard';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
];

export const UserProfileModal = ({ isOpen, onClose, onOpenDetail }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit profile state
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/auth/saved-posts');
        setSavedPosts(data.savedPosts || []);
      } catch (err) {
        console.error('Failed to load saved posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      setSuccessMsg('');
      const data = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatarUrl, bio }),
      });
      if (data.user) {
        updateUser(data.user);
        setSuccessMsg('Profile picture & details updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.message || 'Failed to update profile picture.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-[#2A2A2C] bg-[#FAFAFA] dark:bg-[#111214] shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C43E3E]" />
            <h3 className="font-extrabold text-[#111111] dark:text-[#F5F5F5] text-base">
              User Profile & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#111111] dark:hover:text-[#F5F5F5] hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* User Info Card with Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-2xl relative">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl || user.avatarUrl}
                alt={user.username}
                className="w-20 h-20 rounded-full border-2 border-[#111111] dark:border-white object-cover shadow-md"
              />
              <button
                onClick={() => setActiveTab('edit')}
                className="absolute bottom-0 right-0 p-1.5 bg-[#C43E3E] text-white rounded-full shadow-md hover:bg-[#A63333] transition-all cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-black text-[#111111] dark:text-[#F5F5F5]">
                  {user.username}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase border ${
                  user.role === 'admin'
                    ? 'border-red-500/30 text-[#C43E3E] bg-red-50 dark:bg-red-950/30'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {user.branch} {user.year && user.year !== 'N/A' ? `· ${user.year}` : ''}
              </p>
              {user.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-0.5">
                  "{user.bio}"
                </p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#C43E3E] pt-1">
                <Award className="w-4 h-4" />
                <span>{user.reputationScore || 0} Reputation Points</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-[#E5E5E5] dark:border-[#2A2A2C]">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-[#C43E3E] text-[#111111] dark:text-[#F5F5F5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Bookmarks ({savedPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'border-[#C43E3E] text-[#111111] dark:text-[#F5F5F5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile & Picture</span>
            </button>
          </div>

          {/* Tab Content: Saved Bookmarks */}
          {activeTab === 'saved' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 text-[#C43E3E] animate-spin" />
                  <span className="text-xs">Loading saved posts...</span>
                </div>
              ) : savedPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No saved posts yet. Click the bookmark icon on any post card to save it here!
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPosts.map((post) => (
                    <PostCard key={post._id} post={post} onOpenDetail={onOpenDetail} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Edit Profile & Picture */}
          {activeTab === 'edit' && (
            <div className="space-y-4 pt-1">
              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Upload Profile Picture File */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Upload Profile Picture File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAFAFA] file:text-[#111111] dark:file:bg-[#111214] dark:file:text-[#F5F5F5] cursor-pointer"
                />
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Enter Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl font-medium text-[#111111] dark:text-[#F5F5F5] outline-none"
                />
              </div>

              {/* Preset Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Pick a Preset Avatar
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                        avatarUrl === url ? 'border-[#C43E3E] scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bio / Status Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio with the campus..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl font-medium text-[#111111] dark:text-[#F5F5F5] outline-none"
                />
              </div>

              {/* Save Profile Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="w-full py-2.5 bg-[#C43E3E] hover:bg-[#A63333] text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
