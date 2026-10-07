import React, { useState } from 'react';
import { voteCampusPoll as votePollApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Vote, CheckCircle2, Lock, ShieldAlert, BarChart3 } from 'lucide-react';

export const PollWidget = ({ poll: initialPoll, onPollUpdated }) => {
  const { user } = useAuth();
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!poll) return null;

  // Check if current user has already voted
  const userVoterRecord = poll.voters?.find(
    (v) => v.userId === user?._id || v.userId?._id === user?._id
  );
  const hasVoted = Boolean(userVoterRecord);
  const userOptionId = userVoterRecord?.optionId;

  // Gating Checks
  const isRoleAllowed =
    !poll.targetRoles ||
    poll.targetRoles.length === 0 ||
    poll.targetRoles.includes(user?.role);

  const isBranchAllowed =
    !poll.targetBranches ||
    poll.targetBranches.length === 0 ||
    poll.targetBranches.includes(user?.branch);

  const isEligibleToVote = isRoleAllowed && isBranchAllowed;

  const handleVoteSubmit = async () => {
    if (!selectedOptionId) return;
    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await votePollApi(poll._id, selectedOptionId);
      setPoll(res.poll);
      if (onPollUpdated) onPollUpdated(res.poll);
    } catch (err) {
      console.error('Vote failed:', err);
      setErrorMsg(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const totalVotes = poll.totalVotes || 0;

  return (
    <div className="my-3 p-4 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl shadow-2xs space-y-3">
      {/* Poll Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1B1E] text-slate-700 dark:text-slate-300 border border-[#E5E5E5] dark:border-[#2A2A2C] flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#C43E3E]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-[#C43E3E] uppercase tracking-wider">
              Campus Pulse Poll
            </span>
            <h4 className="text-sm font-bold text-[#111111] dark:text-[#F5F5F5] leading-snug">
              {poll.question}
            </h4>
          </div>
        </div>
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] px-2 py-0.5 rounded-full shrink-0">
          {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
        </div>
      </div>

      {/* Gating Restriction Warning Banner */}
      {!isEligibleToVote && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
          <Lock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Poll restricted to:{' '}
            {poll.targetRoles?.length ? `Roles: ${poll.targetRoles.join(', ')} ` : ''}
            {poll.targetBranches?.length ? `Departments: ${poll.targetBranches.join(', ')}` : ''}
          </span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-[#C43E3E] flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#C43E3E]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Poll Options */}
      <div className="space-y-2">
        {poll.options.map((option) => {
          const voteCount = option.votes || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isUserSelection = hasVoted && (userOptionId === option._id || selectedOptionId === option._id);

          if (hasVoted || !isEligibleToVote) {
            return (
              <div key={option._id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {isUserSelection && <CheckCircle2 className="w-3.5 h-3.5 text-[#C43E3E] shrink-0" />}
                    <span className="truncate">{option.text}</span>
                  </div>
                  <span className="font-bold shrink-0">{percentage}% ({voteCount})</span>
                </div>

                <div className="w-full h-3 bg-[#E5E5E5] dark:bg-[#2A2A2C] rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ease-out rounded-full ${
                      isUserSelection ? 'bg-[#C43E3E]' : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          }

          const isSelected = selectedOptionId === option._id;

          return (
            <button
              key={option._id}
              onClick={() => setSelectedOptionId(option._id)}
              type="button"
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#111111] dark:border-white bg-white dark:bg-[#1A1B1E] text-[#111111] dark:text-[#F5F5F5]'
                  : 'border-[#E5E5E5] dark:border-[#2A2A2C] bg-white dark:bg-[#1A1B1E] text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{option.text}</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-[#111111] dark:border-white bg-[#111111] dark:bg-white' : 'border-[#E5E5E5] dark:border-[#2A2A2C]'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#111111]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      {!hasVoted && isEligibleToVote && (
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">
            Anti-tamper protection: 1 vote per user
          </span>
          <button
            onClick={handleVoteSubmit}
            disabled={!selectedOptionId || submitting}
            className="px-4 py-1.5 bg-[#C43E3E] hover:bg-[#A63333] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Vote className="w-3.5 h-3.5" />
            <span>{submitting ? 'Casting...' : 'Submit Vote'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
