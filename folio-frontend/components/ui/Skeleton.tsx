'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-stone-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E7E5E2] bg-white p-5 space-y-3">
      <Skeleton className="h-40 w-full rounded" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E7E5E2] bg-white p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function ListSkeleton({ count = 3, ItemSkeleton = NoteCardSkeleton }: { count?: number; ItemSkeleton?: React.FC }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}
