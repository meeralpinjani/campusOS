import React, { useState } from 'react';
import { X, Hash, Plus, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../services/api';

export const CreateChannelModal = ({ isOpen, onClose, onChannelCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('branch');
  const [category, setCategory] = useState('Engineering Departments');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Channel name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch('/channels', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), description, type, category }),
      });
      onChannelCreated(data.channel);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl shadow-2xl w-full max-w-md p-5 relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] dark:border-[#2A2A2C]">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="font-bold text-[#111111] dark:text-[#F5F5F5]">Create Channel</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[#FAFAFA] dark:hover:bg-[#111214]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2 text-[#C43E3E] text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Research Guild"
              className="w-full px-3 py-2 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Group Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] outline-none"
            >
              <option value="Official & General">Official & General</option>
              <option value="Engineering Departments">Engineering Departments</option>
              <option value="Clubs & Careers">Clubs & Careers</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Channel purpose..."
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] outline-none"
            >
              <option value="branch">Department</option>
              <option value="general">General</option>
              <option value="interest">Interest / Club</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#111214] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#C43E3E] hover:bg-[#A63333] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
