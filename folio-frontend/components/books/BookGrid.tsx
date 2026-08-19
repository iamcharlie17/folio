'use client';

import { BookCard } from './BookCard';
import type { Book } from '@/types';

interface BookGridProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookGrid({ books, onEdit, onDelete }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book._id} book={book} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
