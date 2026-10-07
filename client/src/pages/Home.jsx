import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { ChannelSidebar } from '../components/ChannelSidebar';
import { FeedSortTabs } from '../components/FeedSortTabs';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { CreateChannelModal } from '../components/CreateChannelModal';
import { CommunityRequestsModal } from '../components/CommunityRequestsModal';
import { PostDetailModal } from '../components/PostDetailModal';
import { NoticePdfGeneratorModal } from '../components/NoticePdfGeneratorModal';
import { PlusCircle, Loader2, BookOpen, GraduationCap, MessageSquare, Award, Shield, FileText } from 'lucide-react';

export const Home = ({ searchQuery = '' }) => {
  const { user } = useAuth();

  const [channels, setChannels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [sort, setSort] = useState('hot');
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isCommunityRequestsOpen, setIsCommunityRequestsOpen] = useState(false);
  const [isNoticeComposerOpen, setIsNoticeComposerOpen] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await apiFetch('/channels');
        setChannels(data.channels || []);
      } catch (err) {
        console.error('Failed to load channels:', err);
      }
    };
    fetchChannels();
  }, []);

  // Fetch posts when filter/sort changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        let url = `/posts?sort=${sort}`;
        if (selectedChannel) url += `&channel=${selectedChannel}`;
        const data = await apiFetch(url);
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [selectedChannel, sort]);

  const handlePostCreated = (newPost) => setPosts([newPost, ...posts]);
  const handleChannelCreated = (newChannel) => {
    setChannels([...channels, newChannel]);
    setSelectedChannel(newChannel.slug);
  };

  const handleChannelDeleted = (deletedId) => {
    setChannels(channels.filter((c) => c._id !== deletedId));
    if (selectedChannel && channels.find((c) => c._id === deletedId)?.slug === selectedChannel) {
      setSelectedChannel(null);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p)));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    if (selectedPostDetail && selectedPostDetail._id === deletedId) {
      setSelectedPostDetail(null);
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

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = post.title?.toLowerCase().includes(q);
    const matchBody = post.body?.toLowerCase().includes(q);
    const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
    const matchAuthor = post.authorId?.username?.toLowerCase().includes(q);
    return matchTitle || matchBody || matchTags || matchAuthor;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-5 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_240px] gap-5">
        {/* Left: Channel Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <ChannelSidebar
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              onOpenCreateModal={() => setIsChannelModalOpen(true)}
              onOpenCommunityRequestsModal={() => setIsCommunityRequestsOpen(true)}
              onChannelDeleted={handleChannelDeleted}
            />
          </div>
        </div>

        {/* Center: Feed */}
        <div className="space-y-3">
          {/* Create Post Bar */}
          <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-3 shadow-2xs flex items-center gap-3 transition-colors">
            <img
              src={user?.avatarUrl}
              alt={user?.username}
              className="w-9 h-9 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover shrink-0"
            />
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex-1 text-left px-3.5 py-2 bg-[#FAFAFA] dark:bg-[#111214] hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors"
            >
              Start a post in KITCommunity... Use @username or #tags!
            </button>
            {user && ['faculty', 'moderator', 'admin'].includes(user.role) && (
              <button
                onClick={() => setIsNoticeComposerOpen(true)}
                className="flex items-center gap-1 px-3 py-2 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] text-[#111111] dark:text-[#F5F5F5] font-bold text-xs rounded-xl hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] transition-all shrink-0 cursor-pointer"
                title="Generate Official Institutional Notice Circular"
              >
                <FileText className="w-3.5 h-3.5 text-[#C43E3E]" />
                <span className="hidden sm:inline">Official Notice</span>
              </button>
            )}
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Post
            </button>
          </div>

          {/* Sort Tabs */}
          <FeedSortTabs currentSort={sort} onSelectSort={setSort} />

          {/* Post Feed */}
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 dark:text-slate-500">
              <Loader2 className="w-6 h-6 text-[#C43E3E] animate-spin" />
              <span className="text-xs font-medium">Loading feed...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-8 text-center space-y-2 shadow-2xs transition-colors">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-[#111111] dark:text-[#F5F5F5]">No matching posts found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try searching for a different topic, tag, or username.
              </p>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#C43E3E] hover:bg-[#A63333] text-white text-xs font-bold rounded-xl shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onOpenDetail={setSelectedPostDetail}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Profile Card */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-4 shadow-2xs space-y-3 transition-colors">
              <div className="flex items-center gap-2.5">
                <img
                  src={user?.avatarUrl}
                  alt={user?.username}
                  className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2C] object-cover"
                />
                <div className="truncate">
                  <h3 className="font-bold text-[#111111] dark:text-[#F5F5F5] text-sm truncate">
                    {user?.username}
                  </h3>
                  {getRoleBadge(user?.role)}
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#E5E5E5] dark:border-[#2A2A2C] text-xs space-y-2">
                <div className="flex items-center justify-between bg-[#FAFAFA] dark:bg-[#111214] p-2 rounded-lg border border-[#E5E5E5] dark:border-[#2A2A2C]">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Award className="w-4 h-4 text-[#C43E3E]" />
                    <span className="text-[11px] font-bold">Reputation</span>
                  </div>
                  <span className="text-xs font-black text-[#111111] dark:text-[#F5F5F5]">
                    {user?.reputationScore || 0} pts
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Department
                  </span>
                  <p className="font-semibold text-[#111111] dark:text-[#F5F5F5] text-[11px] leading-tight">
                    {user?.branch}
                  </p>
                </div>
                {user?.year && user?.year !== 'N/A' && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Academic Year
                    </span>
                    <p className="font-semibold text-[#111111] dark:text-[#F5F5F5] text-[11px]">
                      {user?.year}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(() => {
        const activeChannelObj = channels.find(
          (c) => c.slug === selectedChannel || c._id === selectedChannel
        );
        const activeChannelId = activeChannelObj ? activeChannelObj._id : null;
        return (
          <>
            <CreatePostModal
              isOpen={isPostModalOpen}
              onClose={() => setIsPostModalOpen(false)}
              channels={channels}
              defaultChannelId={activeChannelId}
              onPostCreated={handlePostCreated}
            />
            <NoticePdfGeneratorModal
              isOpen={isNoticeComposerOpen}
              onClose={() => setIsNoticeComposerOpen(false)}
              channels={channels}
              defaultChannelId={activeChannelId}
              onPostCreated={handlePostCreated}
            />
          </>
        );
      })()}
      <CreateChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        onChannelCreated={handleChannelCreated}
      />
      <CommunityRequestsModal
        isOpen={isCommunityRequestsOpen}
        onClose={() => setIsCommunityRequestsOpen(false)}
        onCommunityApproved={handleChannelCreated}
      />
      {selectedPostDetail && (
        <PostDetailModal
          post={selectedPostDetail}
          isOpen={!!selectedPostDetail}
          onClose={() => setSelectedPostDetail(null)}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
};
