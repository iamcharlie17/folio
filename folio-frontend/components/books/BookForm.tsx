'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import type { Book } from '@/types';

const schema = z.object({
  title:       z.string().min(1, 'Title is required'),
  author:      z.string().optional(),
  genre:       z.string().optional(),
  coverImage:  z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  totalPages:  z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().int().positive().optional()),
  status:      z.enum(['to-read', 'reading', 'completed']).default('to-read'),
});

type FormData = z.infer<typeof schema>;

interface BookFormProps {
  defaultValues?: Partial<Book>;
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel?: string;
}

export function BookForm({ defaultValues, onSubmit, submitLabel = 'Save' }: BookFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      title:      defaultValues?.title ?? '',
      author:     defaultValues?.author ?? '',
      genre:      defaultValues?.genre ?? '',
      coverImage: defaultValues?.coverImage ?? '',
      totalPages: defaultValues?.totalPages ?? undefined,
      status:     defaultValues?.status ?? 'to-read',
    },
  });

  const inputClass = 'w-full px-3 py-2 text-sm border border-[#E7E5E2] rounded-md bg-white text-[#1C1B1A] placeholder:text-[#6B6A68] focus:outline-none focus:border-[#B45309] transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Title <span className="text-red-400">*</span></label>
        <input {...register('title')} placeholder="The Alchemist" className={inputClass} />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Author / Genre side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Author</label>
          <input {...register('author')} placeholder="Paulo Coelho" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Genre</label>
          <input {...register('genre')} placeholder="Fiction" className={inputClass} />
        </div>
      </div>

      {/* Cover URL */}
      <div>
        <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Cover Image URL</label>
        <input {...register('coverImage')} type="url" placeholder="https://..." className={inputClass} />
        {errors.coverImage && <p className="mt-1 text-xs text-red-500">{errors.coverImage.message}</p>}
      </div>

      {/* Pages / Status side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Total Pages</label>
          <input {...register('totalPages')} type="number" min={1} placeholder="197" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="to-read">To Read</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#B45309] text-white text-sm font-medium rounded-md hover:bg-[#92400e] transition-colors disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={15} className="animate-spin" />}
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
