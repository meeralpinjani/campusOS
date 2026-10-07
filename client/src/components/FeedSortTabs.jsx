import React from 'react';
import { Flame, Clock, Trophy } from 'lucide-react';

export const FeedSortTabs = ({ currentSort, onSelectSort }) => {
  const tabs = [
    { id: 'hot', label: 'Hot', icon: Flame },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'top', label: 'Top', icon: Trophy },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-1 shadow-2xs flex items-center gap-1 transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentSort === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectSort(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#111214]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
