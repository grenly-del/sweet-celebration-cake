'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  getSuggestedAdminDisplayName,
  getSuggestedAdminUsername,
} from '@/lib/admin';
import { normalizeUsername } from '@/lib/orders';

const supabase = getSupabaseBrowserClient();
const initialForm = {
  username: '',
  email: '',
  displayName: '',
  password: '',
  confirmPassword: '',
};

export default function AdminSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkBootstrap() {
      try {
        const { data, error } = await supabase.rpc('is_admin_bootstrap_available');

        if (error) {
          throw error;
        }

        if (!isActive) {
          return;
        }

        setStatus(data ? 'available' : 'closed');
      } catch (error) {
        console.error('Failed to check admin bootstrap availability:', error);

        if (isActive) {
          setStatus('error');
          setErrorMessage('Status setup admin belum bisa diperiksa. Pastikan SQL Supabase terbaru sudah dijalankan.');
        }
      }
    }

    checkBootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const username = normalizeUsername(form.username);
    const email = form.email.trim().toLowerCase();
    const displayName = form.displayName.trim();

    if (!username || !email || !form.password) {
      setErrorMessage('Username, email, dan password wajib diisi.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Konfirmasi password belum sama.');
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            username,
            display_name: displayName || 'Admin',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session && data.user) {
        const bootstrapUsername = getSuggestedAdminUsername(data.user, username);
        const bootstrapDisplayName = getSuggestedAdminDisplayName(data.user, displayName);
        const { error: claimError } = await supabase.rpc('claim_first_admin_profile', {
          input_username: bootstrapUsername,
          input_display_name: bootstrapDisplayName,
        });

        if (claimError) {
          throw claimError;
        }

        setSuccessMessage('Akun admin pertama berhasil dibuat. Anda akan diarahkan ke dashboard.');
        setTimeout(() => {
          router.replace('/admin');
        }, 1200);
        return;
      }

      setSuccessMessage(
        'Akun auth berhasil dibuat. Jika Confirm email aktif di Supabase, cek email Anda lalu login di halaman admin untuk menyelesaikan aktivasi admin pertama.'
      );
      setForm(initialForm);
    } catch (error) {
      console.error('Failed to create admin account:', error);
      setErrorMessage(error.message || 'Akun admin belum berhasil dibuat.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'checking') {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-pink-100 bg-white p-10 text-center shadow-[0_24px_80px_rgba(232,168,124,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Admin Setup</p>
          <h1 className="mt-4 font-serif text-4xl font-bold text-charcoal">Memeriksa status setup</h1>
          <p className="mt-4 text-sm text-charcoal/60">
            Sistem sedang memeriksa apakah akun admin pertama masih bisa dibuat.
          </p>
        </div>
      </section>
    );
  }

  if (status === 'closed') {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-pink-100 bg-white p-10 text-center shadow-[0_24px_80px_rgba(232,168,124,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Admin Setup</p>
          <h1 className="mt-4 font-serif text-4xl font-bold text-charcoal">Akun admin sudah tersedia</h1>
          <p className="mt-4 text-sm leading-7 text-charcoal/60">
            Setup admin pertama sudah ditutup karena tabel admin sudah terisi. Silakan login dari halaman admin menggunakan akun yang sudah ada.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/85"
            >
              Ke Login Admin
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-pink-300 hover:bg-pink-light"
            >
              Kembali ke website
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-pink-100 bg-white p-10 text-center shadow-[0_24px_80px_rgba(232,168,124,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Admin Setup</p>
          <h1 className="mt-4 font-serif text-4xl font-bold text-charcoal">Setup belum siap</h1>
          <p className="mt-4 text-sm leading-7 text-charcoal/60">
            {errorMessage}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/85"
            >
              Ke Login Admin
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-pink-300 hover:bg-pink-light"
            >
              Kembali ke website
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[36px] bg-[linear-gradient(145deg,rgba(248,180,200,0.18),rgba(232,168,124,0.1))] p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-600">Bootstrap Admin</p>
          <h1 className="mt-5 font-serif text-5xl font-bold leading-tight text-charcoal">
            Buat akun admin pertama langsung dari aplikasi.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-charcoal/70">
            Form ini hanya aktif selama belum ada admin sama sekali. Setelah akun pertama berhasil dibuat, halaman ini otomatis tertutup.
          </p>

          <div className="mt-8 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(248,180,200,0.12)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-charcoal/50">Cara kerja</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-charcoal/65">
              <li>Akun email dan password dibuat di Supabase Authentication.</li>
              <li>Setelah login atau setelah email terverifikasi, akun itu akan di-claim sebagai admin pertama.</li>
              <li>Jika Confirm email aktif di Supabase, cek inbox email Anda sebelum login.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[36px] border border-pink-100 bg-white p-8 shadow-[0_24px_80px_rgba(232,168,124,0.16)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Buat Akun</p>
          <h2 className="mt-4 font-serif text-4xl font-bold text-charcoal">Admin pertama</h2>

          {errorMessage && (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(event) => updateForm('username', normalizeUsername(event.target.value))}
                placeholder="contoh: admin"
                autoComplete="username"
                className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Nama Admin</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(event) => updateForm('displayName', event.target.value)}
                placeholder="contoh: Admin Toko"
                className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateForm('password', event.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Konfirmasi Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateForm('confirmPassword', event.target.value)}
                placeholder="Ulangi password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-pink-default to-rose px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:shadow-[0_14px_30px_rgba(232,168,124,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Membuat Akun...' : 'Buat Akun Admin'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-charcoal/60">
            Sudah punya akun?{' '}
            <Link href="/admin" className="font-semibold text-pink-600 hover:underline">
              Kembali ke login admin
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
