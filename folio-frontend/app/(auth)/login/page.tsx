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
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router  = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { user, token } = res.data;
      setAuth(user, token);
      // Set cookie for middleware auth guard
      document.cookie = `folio_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`;
      toast('Welcome back, ' + user.name + '!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <BookOpen size={24} className="text-[#B45309]" strokeWidth={1.5} />
        <span className="font-serif text-2xl text-[#1C1B1A]">Folio</span>
      </div>

      <div className="bg-white border border-[#E7E5E2] rounded-lg p-8 shadow-sm">
        <h1 className="font-serif text-xl text-[#1C1B1A] mb-1">Sign in</h1>
        <p className="text-sm text-[#6B6A68] mb-6">Welcome back to your reading room.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-[#E7E5E2] rounded-md bg-white text-[#1C1B1A] placeholder:text-[#6B6A68] focus:outline-none focus:border-[#B45309] transition-colors"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1B1A] mb-1.5">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-[#E7E5E2] rounded-md bg-white text-[#1C1B1A] placeholder:text-[#6B6A68] focus:outline-none focus:border-[#B45309] transition-colors"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#B45309] text-white text-sm font-medium rounded-md hover:bg-[#92400e] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#6B6A68] mt-4">
        New to Folio?{' '}
        <Link href="/register" className="text-[#B45309] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
