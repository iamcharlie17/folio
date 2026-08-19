'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-[#E7E5E2]">
        {icon ?? <BookOpen size={40} strokeWidth={1} />}
      </div>
      <h3 className="font-serif text-lg text-[#1C1B1A] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6B6A68] max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
