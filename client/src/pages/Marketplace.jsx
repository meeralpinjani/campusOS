import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  ShieldCheck,
  Flag,
  MessageCircle,
  Tag,
  Shield,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMarketplaceListings,
  flagMarketplaceListing,
  getMarketplaceModerationQueue,
  moderateMarketplaceListing,
  updateMarketplaceListing,
} from '../services/api';
import { CreateListingModal } from '../components/CreateListingModal';

const CATEGORIES = [
  'All',
  'Textbooks & Notes',
  'Electronics & Gadgets',
  'Drawing & Drafting Tools',
  'Lab Equipment',
  'Hostel Essentials',
  'Vehicles & Cycles',
  'Other',
];

export const Marketplace = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'moderation'

  // Flag Modal State
  const [flaggingId, setFlaggingId] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);

  // Moderation Queue State
  const [modListings, setModListings] = useState([]);

  const isStaff = user && ['faculty', 'moderator', 'admin'].includes(user.role);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMarketplaceListings({
        category: selectedCategory,
        search: searchQuery,
      });
      setListings(res.listings || []);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  const fetchModerationQueue = useCallback(async () => {
    if (!isStaff) return;
    try {
      const res = await getMarketplaceModerationQueue();
      setModListings(res.listings || []);
    } catch (err) {
      console.error('Error fetching moderation queue:', err);
    }
  }, [isStaff]);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchListings();
    } else if (activeTab === 'moderation') {
      fetchModerationQueue();
    }
  }, [activeTab, fetchListings, fetchModerationQueue]);

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!flaggingId || !flagReason.trim()) return;

    try {
      setFlagSubmitting(true);
      await flagMarketplaceListing(flaggingId, flagReason);
      alert('Listing reported to moderators for review.');
      setFlaggingId(null);
      setFlagReason('');
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to flag listing');
    } finally {
      setFlagSubmitting(false);
    }
  };

  const handleModerateAction = async (id, action) => {
    try {
      await moderateMarketplaceListing(id, action);
      fetchModerationQueue();
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to moderate listing');
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await updateMarketplaceListing(id, { status: 'sold' });
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Marketplace Header */}
      <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] dark:bg-[#111214] text-[#111111] dark:text-[#F5F5F5] border border-[#E5E5E5] dark:border-[#2A2A2C] flex items-center justify-center shadow-2xs">
            <ShoppingBag className="w-6 h-6 text-[#C43E3E]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111111] dark:text-[#F5F5F5] leading-tight">
              KIT Student Marketplace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Buy & Sell Textbooks, Drafters, Gadgets, Hostel Essentials & Lab Gear safely on campus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isStaff && (
            <div className="flex bg-[#FAFAFA] dark:bg-[#111214] p-1 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2C]">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'browse'
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Browse Items
              </button>
              <button
                onClick={() => setActiveTab('moderation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'moderation'
                    ? 'bg-[#C43E3E] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Review Queue ({modListings.length})</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Sell An Item</span>
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Filters & Search Row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
                      : 'bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#111214]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketplace..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-xs text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] focus:outline-none focus:border-[#C43E3E]"
              />
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              Loading marketplace listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-12 text-center space-y-3 shadow-2xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-[#111111] dark:text-[#F5F5F5]">
                No Listings Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your filter criteria. Be the first student to publish a listing!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((item) => {
                const isSeller = user && item.sellerId?._id === user._id;

                return (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl overflow-hidden shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="h-44 bg-[#FAFAFA] dark:bg-[#111214] relative overflow-hidden flex items-center justify-center">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <Tag className="w-8 h-8 opacity-40" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              No Image Provided
                            </span>
                          </div>
                        )}

                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs">
                          ₹{item.price}
                        </span>

                        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-[#111111]/80 text-white backdrop-blur-xs">
                          {item.condition}
                        </span>

                        {item.images && item.images.length > 1 && (
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#111111]/80 text-white backdrop-blur-xs">
                            +{item.images.length - 1} photos
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        <span className="text-[10px] font-extrabold text-[#C43E3E] uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-[#111111] dark:text-[#F5F5F5] text-sm line-clamp-1 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Seller Trust Pill & Actions Footer */}
                    <div className="p-4 pt-0 border-t border-[#E5E5E5] dark:border-[#2A2A2C] mt-2 space-y-3">
                      {/* Seller Trust Badge */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              item.sellerId?.avatarUrl ||
                              'https://ui-avatars.com/api/?name=User'
                            }
                            alt="Seller"
                            className="w-6 h-6 rounded-full border border-[#E5E5E5] object-cover"
                          />
                          <div className="flex flex-col leading-none">
                            <span className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5]">
                              {item.sellerId?.username || 'Student Seller'}
                            </span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[100px]">
                              {item.sellerId?.branch}
                            </span>
                          </div>
                        </div>

                        {/* Verified Student Trust Badge */}
                        <div
                          className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-1.5 py-0.5 rounded-full"
                          title={`Verified Student Seller (${item.sellerId?.reputationScore || 0} Rep)`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified ({item.sellerId?.reputationScore || 0})</span>
                        </div>
                      </div>

                      {/* Contact / Flag Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        {isSeller ? (
                          <button
                            onClick={() => handleMarkSold(item._id)}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                          >
                            Mark As Sold
                          </button>
                        ) : (
                          <>
                            <a
                              href={`mailto:${item.sellerId?.email}?subject=Interested in marketplace item: ${encodeURIComponent(
                                item.title
                              )}`}
                              className="flex-1 py-1.5 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] hover:bg-[#E5E5E5]/50 text-[#111111] dark:text-[#F5F5F5] font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#C43E3E]" />
                              <span>Contact ({item.sellerContactPreference})</span>
                            </a>
                            <button
                              onClick={() => setFlaggingId(item._id)}
                              className="p-1.5 text-slate-400 hover:text-[#C43E3E] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                              title="Report unauthorized / commercial listing"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Moderation Queue View for Faculty & Moderators */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Moderation Review Queue — Reported Listings
            </h2>
          </div>

          {modListings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No flagged or unauthorized listings pending review.
            </p>
          ) : (
            <div className="space-y-3">
              {modListings.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                      <span className="text-xs font-extrabold text-blue-600">₹{item.price}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {item.flags?.length || 0} Reports
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Seller: {item.sellerId?.username} ({item.sellerId?.email})
                    </p>
                    {item.flags && item.flags.length > 0 && (
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/40 p-2 rounded-lg mt-1">
                        Reported Reason: "{item.flags[item.flags.length - 1].reason}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleModerateAction(item._id, 'approve')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      Clear Flags (Approve)
                    </button>
                    <button
                      onClick={() => handleModerateAction(item._id, 'remove')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Listing</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flag Report Modal */}
      {flaggingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              Report Marketplace Listing
            </h3>
            <p className="text-xs text-slate-500">
              Flag commercial spam, prohibited items, or unauthorized listings for moderator review.
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="State reason for reporting this listing..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFlaggingId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagSubmit}
                disabled={flagSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {flagSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onListingCreated={() => {
          fetchListings();
        }}
      />
    </div>
  );
};
