'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-[#E7E5E2] overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              isActive
                ? 'text-[#B45309]'
                : 'text-[#6B6A68] hover:text-[#1C1B1A]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-amber-50 text-[#B45309]' : 'bg-stone-100 text-[#6B6A68]'}`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B45309] rounded-t" />
            )}
          </button>
        );
      })}
    </div>
  );
}
