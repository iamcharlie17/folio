import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Folio — Your Reading Room',
  description: 'A note-taking app for readers. Capture thoughts, quotes, and characters from every book you read.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8]">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
