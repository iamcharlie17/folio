'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Nav } from '@/components/layout/Nav';
import { BookGrid } from '@/components/books/BookGrid';
import { BookForm } from '@/components/books/BookForm';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { ListSkeleton, BookCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { booksApi } from '@/lib/api';
import type { Book } from '@/types';
import { Plus, Search, BookOpen, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch books
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (status !== 'all') params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;
      
      const res = await booksApi.getAll(params);
      setBooks(res.data.books || []);
    } catch (err) {
      toast('Failed to load books.', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch, toast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleCreateOrEdit = async (data: any) => {
    try {
      if (editingBook) {
        await booksApi.update(editingBook._id, data);
        toast('Book updated successfully.', 'success');
      } else {
        await booksApi.create(data);
        toast('Book added to your library.', 'success');
      }
      setIsFormOpen(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save book.', 'error');
      throw err; // re-throw so form stays open on error
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    try {
      await booksApi.delete(deletingBook._id);
      toast('Book deleted.', 'success');
      setIsDeleteOpen(false);
      setDeletingBook(null);
      fetchBooks();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete book.', 'error');
    }
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const openDelete = (book: Book) => {
    setDeletingBook(book);
    setIsDeleteOpen(true);
  };

  const tabs = [
    { id: 'all',       label: 'All Books' },
    { id: 'reading',   label: 'Reading' },
    { id: 'to-read',   label: 'To Read' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="font-serif text-2xl text-[#1C1B1A]">Library</h1>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6A68]" />
              <input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm border border-[#E7E5E2] rounded-md focus:outline-none focus:border-[#B45309] transition-colors"
              />
            </div>
            
            <button
              onClick={() => { setEditingBook(null); setIsFormOpen(true); }}
              className="flex items-center gap-1.5 bg-[#B45309] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#92400e] transition-colors shrink-0"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={status} onChange={setStatus} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <BookCardSkeleton />
             <BookCardSkeleton />
             <BookCardSkeleton />
          </div>
        ) : books.length > 0 ? (
          <BookGrid books={books} onEdit={openEdit} onDelete={openDelete} />
        ) : (
          <EmptyState
            icon={<BookOpen size={48} className="text-[#E7E5E2]" strokeWidth={1} />}
            title="No books found"
            description={search || status !== 'all' ? "Try adjusting your filters or search term." : "Your library is empty. Add a book to start tracking your reading."}
            action={
              <button
                onClick={() => { setEditingBook(null); setIsFormOpen(true); }}
                className="text-sm font-medium text-[#B45309] hover:underline"
              >
                + Add your first book
              </button>
            }
          />
        )}
      </main>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingBook ? 'Edit Book' : 'Add Book'}
      >
        <BookForm
          defaultValues={editingBook || undefined}
          onSubmit={handleCreateOrEdit}
          submitLabel={editingBook ? 'Save Changes' : 'Add Book'}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Book"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#B45309] bg-amber-50 p-3 rounded-md border border-amber-200">
            <Trash2 size={20} className="shrink-0" />
            <p className="text-sm">This will permanently delete <strong>{deletingBook?.title}</strong> and all its notes, quotes, and characters.</p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#6B6A68] hover:text-[#1C1B1A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Book
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
