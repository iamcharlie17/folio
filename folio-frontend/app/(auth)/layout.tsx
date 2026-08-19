// Auth layout — centered card, no Nav
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      {children}
    </main>
  );
}
