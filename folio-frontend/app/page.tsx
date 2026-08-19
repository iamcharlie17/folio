import { redirect } from 'next/navigation';

// Root page: redirect to /dashboard (middleware handles unauthenticated → /login)
export default function Home() {
  redirect('/dashboard');
}
