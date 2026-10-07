import React, { useState, useEffect } from 'react';
import { X, Users, Plus, CheckCircle, XCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createCommunityRequest,
  getCommunityRequests,
  approveCommunityRequest,
  rejectCommunityRequest,
} from '../services/api';

export const CommunityRequestsModal = ({ isOpen, onClose, onCommunityApproved }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('request'); // 'request' or 'queue'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Communities (Reddit-Style)',
    reason: '',
  });

  const isStaff = user && ['faculty', 'moderator', 'admin'].includes(user.role);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getCommunityRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setError('Please provide community name and description');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await createCommunityRequest(formData);

      if (res.autoApproved) {
        alert('Community created directly!');
        if (onCommunityApproved) onCommunityApproved(res.channel);
        onClose();
      } else {
        alert('Community creation request submitted for Faculty/Moderator approval!');
        fetchRequests();
        setActiveTab('queue');
      }
    } catch (err) {
      console.error('Submit request error:', err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveCommunityRequest(id, reviewComment);
      alert(res.message);
      fetchRequests();
      if (onCommunityApproved) onCommunityApproved(res.channel);
    } catch (err) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectCommunityRequest(id, reviewComment);
      alert(res.message);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-none">
                Community Creation Requests & Governance
              </h3>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">
                Faculty / Moderator Approval Queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5E5E5] dark:border-[#2A2A2C] px-6 pt-2 bg-[#FAFAFA] dark:bg-[#111214] shrink-0">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'request'
                ? 'border-[#C43E3E] text-[#111111] dark:text-[#F5F5F5]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {isStaff ? 'Direct Community Creation' : 'Submit Community Request'}
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'border-[#C43E3E] text-[#111111] dark:text-[#F5F5F5]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isStaff ? `Approval Queue (${requests.filter((r) => r.status === 'pending').length})` : 'My Requests'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'request' ? (
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-[#C43E3E] rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. r/Robotics_Guild or r/Competitive_Programming"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:border-[#C43E3E]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Purpose *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the scope, intended members, and topic of discussion for this community..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:border-[#C43E3E] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivation / Why should this community be created?
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g. Representing 80+ interested students in the Robotics lab"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:border-[#C43E3E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-[#FAFAFA] dark:hover:bg-[#111214]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C43E3E] hover:bg-[#A63333] disabled:opacity-50 text-white font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {submitting ? 'Submitting...' : isStaff ? 'Create Instantly' : 'Submit Request'}
                </button>
              </div>
            </form>
          ) : (
            /* Queue View */
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-8 text-xs text-slate-400 font-semibold">
                  Loading community requests...
                </p>
              ) : requests.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500 font-medium">
                  No community requests found.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                              {req.name}
                            </h4>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                req.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : req.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {req.description}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium shrink-0">
                          By: {req.requestedBy?.username} ({req.requestedBy?.role})
                        </div>
                      </div>

                      {req.reason && (
                        <p className="text-[11px] font-medium text-slate-500 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          Motivation: "{req.reason}"
                        </p>
                      )}

                      {/* Approval / Rejection Actions for Faculty & Moderators */}
                      {isStaff && req.status === 'pending' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Optional review comment for requester..."
                            value={selectedRequestId === req._id ? reviewComment : ''}
                            onChange={(e) => {
                              setSelectedRequestId(req._id);
                              setReviewComment(e.target.value);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {req.reviewComment && req.status !== 'pending' && (
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                          Reviewer Feedback: "{req.reviewComment}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
