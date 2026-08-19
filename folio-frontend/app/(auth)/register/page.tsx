'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register(data);
      const { user, token } = res.data;
      setAuth(user, token);
      document.cookie = `folio_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`;
      toast('Account created! Welcome, ' + user.name + '.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center gap-2 mb-8">
        <BookOpen size={24} className="text-[#B45309]" strokeWidth={1.5} />
        <span className="font-serif text-2xl text-[#1C1B1A]">Folio</span>
      </div>

      <div className="bg-white border border-[#E7E5E2] rounded-lg p-8 shadow-sm">
        <h1 className="font-serif text-xl text-[#1C1B1A] mb-1">Create account</h1>
        <p className="text-sm text-[#6B6A68] mb-6">Start your reading journey.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name' as const,     label: 'Full name',    type: 'text',     placeholder: 'Ayesha Rahman' },
            { name: 'email' as const,    label: 'Email',        type: 'email',    placeholder: 'you@example.com' },
            { name: 'password' as const, label: 'Password',     type: 'password', placeholder: '6+ characters' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">{field.label}</label>
              <input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 text-sm border border-[#E7E5E2] rounded-md bg-white text-[#1C1B1A] placeholder:text-[#6B6A68] focus:outline-none focus:border-[#B45309] transition-colors"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#B45309] text-white text-sm font-medium rounded-md hover:bg-[#92400e] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#6B6A68] mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-[#B45309] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
