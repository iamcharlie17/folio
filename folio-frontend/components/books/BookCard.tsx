'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/types';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const statusConfig = {
  'to-read':  { label: 'To Read',   className: 'bg-stone-100 text-[#6B6A68]' },
  reading:    { label: 'Reading',   className: 'bg-amber-50 text-[#B45309]' },
  completed:  { label: 'Completed', className: 'bg-green-50 text-green-700' },
};

export function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const status = statusConfig[book.status] ?? statusConfig['to-read'];
  const pct = book.completionPercent ?? 0;

  return (
    <div className="group bg-white border border-[#E7E5E2] rounded-lg overflow-hidden hover:shadow-sm transition-shadow duration-200 flex flex-col">
      {/* Cover */}
      <Link href={`/books/${book._id}`} className="block aspect-[2/3] bg-stone-100 relative overflow-hidden">
        {book.coverImage ? (
          <Image src={book.coverImage} alt={book.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={36} className="text-stone-300" strokeWidth={1} />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded ${status.className}`}>
          {status.label}
        </span>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <Link href={`/books/${book._id}`}>
          <h3 className="font-serif text-base text-[#1C1B1A] leading-snug line-clamp-2 hover:text-[#B45309] transition-colors">
            {book.title}
          </h3>
        </Link>
        {book.author && <p className="text-xs text-[#6B6A68] truncate">{book.author}</p>}
        {book.genre && <p className="text-xs text-[#6B6A68]">{book.genre}</p>}

        {/* Progress bar */}
        {book.totalPages && book.totalPages > 0 && (
          <div className="mt-auto pt-3">
            <div className="flex justify-between text-xs text-[#6B6A68] mb-1">
              <span>p. {book.currentPage}/{book.totalPages}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B45309] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions (visible on hover) */}
        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => { e.preventDefault(); onEdit(book); }}
            className="text-xs text-[#6B6A68] hover:text-[#1C1B1A] transition-colors"
          >
            Edit
          </button>
          <span className="text-[#E7E5E2]">·</span>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(book); }}
            className="text-xs text-[#6B6A68] hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
