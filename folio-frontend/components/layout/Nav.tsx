'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Search, Tag, LogOut, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { useState } from 'react';

export function Nav() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    document.cookie = 'folio_token=; path=/; max-age=0';
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Library',  icon: BookOpen },
    { href: '/tags',      label: 'Tags',      icon: Tag },
    { href: '/search',    label: 'Search',    icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E7E5E2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <BookOpen size={20} className="text-[#B45309]" strokeWidth={1.5} />
          <span className="font-serif text-lg text-[#1C1B1A]">Folio</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors duration-150 ${
                  active
                    ? 'text-[#B45309] bg-amber-50'
                    : 'text-[#6B6A68] hover:text-[#1C1B1A] hover:bg-stone-50'
                }`}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="hidden sm:flex items-center gap-2">
          {user && (
            <span className="text-xs text-[#6B6A68] flex items-center gap-1">
              <User size={13} />
              {user.name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-[#6B6A68] hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
            title="Log out"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-[#6B6A68]"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#E7E5E2] bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-[#6B6A68] hover:text-[#1C1B1A] hover:bg-stone-50"
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
