'use client';

import Image from 'next/image';
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { formatPrice } from '@/data/products';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  getSuggestedAdminDisplayName,
  getSuggestedAdminUsername,
} from '@/lib/admin';
import {
  formatOrderDate,
  normalizeUsername,
} from '@/lib/orders';
import {
  buildMapsLink,
  getCoordinatesText,
} from '@/lib/location';

const supabase = getSupabaseBrowserClient();
const initialLoginForm = { username: '', password: '' };

function formatDashboardCode(recordType, value = '') {
  const prefix = recordType === 'custom_cake' ? 'CST' : 'ORD';
  return `${prefix}-${String(value).slice(0, 8).toUpperCase()}`;
}

function createSearchText(values = []) {
  return values
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function createOrderEntry(order) {
  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: order.id,
    recordType: 'order',
    createdAt: order.created_at,
    status: order.status || 'baru',
    customerName: order.customer_name,
    customerEmail: order.customer_email || '',
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    customerLocationLat: order.customer_location_lat,
    customerLocationLng: order.customer_location_lng,
    customerLocationLink: order.customer_location_link || buildMapsLink(order.customer_location_lat, order.customer_location_lng),
    customerCoordinates: getCoordinatesText(order.customer_location_lat, order.customer_location_lng),
    customerNotes: order.customer_notes || '',
    itemCount: order.item_count || 0,
    totalAmount: order.total_amount || 0,
    items,
    searchText: createSearchText([
      'order katalog',
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.customer_address,
      order.customer_location_link,
      getCoordinatesText(order.customer_location_lat, order.customer_location_lng),
      order.customer_notes,
      order.status,
      formatDashboardCode('order', order.id),
      ...items.map((item) => `${item.name} ${item.size_label || ''}`),
    ]),
  };
}

function createCustomCakeEntry(request) {
  return {
    id: request.id,
    recordType: 'custom_cake',
    createdAt: request.created_at,
    status: request.status || 'baru',
    customerName: request.customer_name,
    customerEmail: request.customer_email || '',
    customerPhone: request.customer_phone,
    customerAddress: request.customer_address || 'Dikonfirmasi via WhatsApp',
    customerLocationLat: request.customer_location_lat,
    customerLocationLng: request.customer_location_lng,
    customerLocationLink: request.customer_location_link || buildMapsLink(request.customer_location_lat, request.customer_location_lng),
    customerCoordinates: getCoordinatesText(request.customer_location_lat, request.customer_location_lng),
    customerNotes: request.customer_notes || '',
    itemCount: 1,
    totalAmount: 0,
    flavorLabel: request.flavor_label,
    sizeLabel: request.size_label,
    servingEstimate: request.serving_estimate,
    designImageUrl: request.design_image_url,
    designImageName: request.design_image_name,
    requestChannel: request.request_channel || 'website',
    searchText: createSearchText([
      'custom cake',
      request.customer_name,
      request.customer_email,
      request.customer_phone,
      request.customer_address,
      request.customer_location_link,
      getCoordinatesText(request.customer_location_lat, request.customer_location_lng),
      request.customer_notes,
      request.flavor,
      request.flavor_label,
      request.size_value,
      request.size_label,
      request.serving_estimate,
      request.status,
      formatDashboardCode('custom_cake', request.id),
      request.design_image_name,
    ]),
  };
}

function matchesSearch(entry, rawSearchTerm) {
  const searchTerm = rawSearchTerm.trim().toLowerCase();

  if (!searchTerm) {
    return true;
  }

  return entry.searchText.includes(searchTerm);
}

export default function AdminPage() {
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [session, setSession] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [dashboardEntries, setDashboardEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authError, setAuthError] = useState('');
  const [ordersError, setOrdersError] = useState('');

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadAdminProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, display_name, email')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }, []);

  const isBootstrapAvailable = useCallback(async () => {
    const { data, error } = await supabase.rpc('is_admin_bootstrap_available');

    if (error) {
      throw error;
    }

    return Boolean(data);
  }, []);

  const claimFirstAdminProfile = useCallback(async (user) => {
    const username = getSuggestedAdminUsername(user);
    const displayName = getSuggestedAdminDisplayName(user);

    const { error } = await supabase.rpc('claim_first_admin_profile', {
      input_username: username,
      input_display_name: displayName,
    });

    if (error) {
      throw error;
    }

    return loadAdminProfile(user.id);
  }, [loadAdminProfile]);

  const fetchDashboardEntries = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsRefreshing(true);
    }

    const [ordersResult, customRequestsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('custom_cake_requests')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const nextEntries = [
      ...(ordersResult.data || []).map(createOrderEntry),
      ...(customRequestsResult.data || []).map(createCustomCakeEntry),
    ].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    if (ordersResult.error || customRequestsResult.error) {
      console.error('Failed to load dashboard entries:', {
        ordersError: ordersResult.error,
        customRequestsError: customRequestsResult.error,
      });
      setOrdersError('Sebagian data admin belum bisa dimuat. Periksa policy tabel order, custom_cake_requests, dan setup Storage.');
    } else {
      setOrdersError('');
    }

    startTransition(() => {
      setDashboardEntries(nextEntries);
    });

    if (!silent) {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function bootstrapSession() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!isActive) {
          return;
        }

        setSession(data.session);
      } catch (error) {
        console.error('Failed to restore admin session:', error);

        if (isActive) {
          setAuthError('Sesi admin tidak bisa dipulihkan. Coba login ulang.');
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);
      setIsInitializing(false);
      setLoginForm((current) => ({ ...current, password: '' }));
      setLoginError('');
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function verifyAdminAccess() {
      if (!session?.user?.id) {
        setAdminProfile(null);
        setDashboardEntries([]);
        setIsCheckingAdmin(false);
        return;
      }

      setIsCheckingAdmin(true);

      try {
        const profile = await loadAdminProfile(session.user.id);

        if (!isActive) {
          return;
        }

        setAdminProfile(profile);
        setAuthError('');
      } catch (error) {
        console.error('Failed to verify admin access:', error);

        if (!isActive) {
          return;
        }

        try {
          const bootstrapAvailable = await isBootstrapAvailable();

          if (bootstrapAvailable) {
            const claimedProfile = await claimFirstAdminProfile(session.user);

            if (!isActive) {
              return;
            }

            setAdminProfile(claimedProfile);
            setAuthError('');
            return;
          }
        } catch (bootstrapError) {
          console.error('Failed to bootstrap first admin profile:', bootstrapError);
        }

        setAdminProfile(null);
        setDashboardEntries([]);
        setAuthError('Akun ini belum terdaftar sebagai admin. Jika belum ada admin, buat dulu di halaman setup.');
        await supabase.auth.signOut();
      } finally {
        if (isActive) {
          setIsCheckingAdmin(false);
        }
      }
    }

    verifyAdminAccess();

    return () => {
      isActive = false;
    };
  }, [claimFirstAdminProfile, isBootstrapAvailable, loadAdminProfile, session]);

  useEffect(() => {
    if (!adminProfile) {
      return undefined;
    }

    fetchDashboardEntries();

    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchDashboardEntries({ silent: true });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_cake_requests' },
        () => {
          fetchDashboardEntries({ silent: true });
        }
      )
      .subscribe();

    const intervalId = window.setInterval(() => {
      fetchDashboardEntries({ silent: true });
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
      void supabase.removeChannel(channel);
    };
  }, [adminProfile, fetchDashboardEntries]);

  const filteredEntries = dashboardEntries.filter((entry) => matchesSearch(entry, deferredSearchTerm));
  const totalRevenue = filteredEntries.reduce(
    (total, entry) => total + (entry.recordType === 'order' ? entry.totalAmount : 0),
    0
  );
  const latestOrderDate = filteredEntries[0]?.createdAt ? formatOrderDate(filteredEntries[0].createdAt) : 'Belum ada';
  const totalCustomers = new Set(
    filteredEntries.map((entry) => `${entry.customerName}-${entry.customerPhone}`)
  ).size;
  const customCakeCount = filteredEntries.filter((entry) => entry.recordType === 'custom_cake').length;

  async function handleLogin(event) {
    event.preventDefault();

    const username = normalizeUsername(loginForm.username);

    if (!username || !loginForm.password) {
      setLoginError('Username dan password wajib diisi.');
      return;
    }

    setIsSigningIn(true);
    setLoginError('');
    setAuthError('');

    try {
      const { data: email, error: lookupError } = await supabase.rpc('get_admin_login_email', {
        input_username: username,
      });

      if (lookupError) {
        throw lookupError;
      }

      if (!email) {
        setLoginError('Username admin tidak ditemukan.');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: loginForm.password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setLoginError(
            'Username ditemukan, tetapi password tidak cocok atau email di tabel admin_users tidak sama dengan email user di Supabase Authentication.'
          );
        } else {
          setLoginError(signInError.message);
        }
      }
    } catch (error) {
      console.error('Failed to sign in admin:', error);
      setLoginError('Login admin gagal diproses. Pastikan function dan tabel Supabase sudah dibuat.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAdminProfile(null);
    setDashboardEntries([]);
    setSearchTerm('');
  }

  async function handleRefresh() {
    await fetchDashboardEntries();
  }

  const isBusy = isInitializing || (session && isCheckingAdmin);

  if (isBusy) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-pink-100 bg-white p-10 text-center shadow-[0_24px_80px_rgba(232,168,124,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Admin Panel</p>
            <h1 className="mt-4 font-serif text-4xl font-bold text-charcoal">Menyiapkan dashboard</h1>
            <p className="mt-4 text-sm text-charcoal/60">
              Sistem sedang memeriksa sesi login dan akses admin Anda.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!session || !adminProfile) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] bg-[linear-gradient(145deg,rgba(248,180,200,0.18),rgba(232,168,124,0.1))] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-600">Sweet Celebration</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-tight text-charcoal">
              Dashboard admin untuk melihat semua pesanan dan request custom cake.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-charcoal/70">
              Login menggunakan username dan password admin Supabase. Setelah masuk, Anda bisa melihat pesanan katalog dan custom cake tanpa backend service tambahan.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(248,180,200,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-charcoal/50">Catatan setup</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-charcoal/65">
                <li>Pastikan tabel <code>orders</code>, <code>custom_cake_requests</code>, dan <code>admin_users</code> sudah dibuat di Supabase.</li>
                <li>Buat bucket Storage bernama <code>custom-cake-designs</code> agar upload referensi desain bisa berhasil.</li>
                <li>Jalankan ulang SQL di <code>supabase/schema.sql</code> setelah update terbaru.</li>
              </ul>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/setup"
                  className="inline-flex items-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/85"
                >
                  Buat Akun Admin
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-pink-300 hover:bg-pink-light"
                >
                  Kembali ke website
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-pink-100 bg-white p-8 shadow-[0_24px_80px_rgba(232,168,124,0.16)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Login Admin</p>
            <h2 className="mt-4 font-serif text-4xl font-bold text-charcoal">Masuk ke dashboard</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/60">
              Username akan dicocokkan ke akun admin Supabase, lalu password diverifikasi oleh Supabase Auth.
            </p>

            {(authError || loginError) && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {authError || loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-charcoal">Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, username: event.target.value }))
                  }
                  placeholder="contoh: admin"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-charcoal">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Masukkan password admin"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full rounded-full bg-gradient-to-r from-pink-default to-rose px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:shadow-[0_14px_30px_rgba(232,168,124,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigningIn ? 'Memproses Login...' : 'Masuk'}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,200,0.34),_transparent_42%),linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[36px] border border-pink-100 bg-white/90 p-6 shadow-[0_24px_80px_rgba(232,168,124,0.14)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Admin Dashboard</p>
              <h1 className="mt-3 font-serif text-4xl font-bold text-charcoal">Pesanan Sweet Celebration</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-charcoal/60">
                Login sebagai <span className="font-semibold text-charcoal">{adminProfile.display_name}</span> ({adminProfile.username}). Dashboard ini menampilkan order katalog dan request custom cake secara realtime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-full border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-pink-300 hover:bg-pink-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRefreshing ? 'Memuat...' : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/85"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(248,180,200,0.18),rgba(255,255,255,0.9))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal/45">Total Data</p>
              <p className="mt-3 font-serif text-4xl font-bold text-charcoal">{filteredEntries.length}</p>
              <p className="mt-2 text-sm text-charcoal/60">{totalCustomers} pelanggan tercatat</p>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(232,168,124,0.18),rgba(255,255,255,0.9))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal/45">Custom Cake</p>
              <p className="mt-3 font-serif text-4xl font-bold text-charcoal">{customCakeCount}</p>
              <p className="mt-2 text-sm text-charcoal/60">Request custom di hasil pencarian</p>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(212,165,116,0.18),rgba(255,255,255,0.9))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal/45">Omzet Tercatat</p>
              <p className="mt-3 font-serif text-4xl font-bold text-charcoal">{formatPrice(totalRevenue)}</p>
              <p className="mt-2 text-sm text-charcoal/60">Dari order katalog yang tampil</p>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(255,240,245,0.72),rgba(255,255,255,0.9))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal/45">Update Terbaru</p>
              <p className="mt-3 text-lg font-semibold text-charcoal">{latestOrderDate}</p>
              <p className="mt-2 text-sm text-charcoal/60">Gabungan order dan custom cake</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-pink-100 bg-[#fffaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                Cari pesanan
              </label>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nama, nomor HP, item, custom cake, rasa, ukuran, atau kode"
                className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="text-sm text-charcoal/60">
              Menampilkan <span className="font-semibold text-charcoal">{filteredEntries.length}</span> dari{' '}
              <span className="font-semibold text-charcoal">{dashboardEntries.length}</span> data
            </div>
          </div>

          {ordersError && (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {ordersError}
            </div>
          )}

          <div className="mt-8 space-y-5">
            {filteredEntries.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-pink-200 bg-white px-6 py-14 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">Belum Ada Data</p>
                <h2 className="mt-4 font-serif text-3xl font-bold text-charcoal">Pesanan masih kosong</h2>
                <p className="mt-3 text-sm text-charcoal/60">
                  Setelah checkout website atau form custom cake tersimpan ke Supabase, daftar akan muncul di sini.
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <article
                  key={`${entry.recordType}-${entry.id}`}
                  className="rounded-[32px] border border-pink-100 bg-white p-6 shadow-[0_20px_60px_rgba(232,168,124,0.12)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">
                        {formatDashboardCode(entry.recordType, entry.id)}
                      </p>
                      <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">
                        {entry.customerName}
                      </h2>
                      <p className="mt-2 text-sm text-charcoal/60">
                        Dibuat pada {formatOrderDate(entry.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex w-fit rounded-full bg-pink-light px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-pink-700">
                        {entry.recordType === 'custom_cake' ? 'Custom Cake' : 'Order Katalog'}
                      </div>
                      <div className="inline-flex w-fit rounded-full bg-[#fff5ee] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/70">
                        {entry.status}
                      </div>
                    </div>
                  </div>

                  {entry.recordType === 'order' ? (
                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                      <div className="space-y-4 rounded-[28px] bg-[#fffaf8] p-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Kontak
                          </p>
                          <p className="mt-2 text-base font-semibold text-charcoal">
                            {entry.customerPhone}
                          </p>
                          <p className="mt-1 text-sm text-charcoal/60">
                            {entry.customerEmail || 'Email belum diisi.'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Alamat
                          </p>
                          <p className="mt-2 text-sm leading-7 text-charcoal/70">
                            {entry.customerAddress}
                          </p>
                          {entry.customerCoordinates && (
                            <p className="mt-2 text-xs font-medium text-charcoal/55">
                              Koordinat: {entry.customerCoordinates}
                            </p>
                          )}
                          {entry.customerLocationLink && (
                            <a
                              href={entry.customerLocationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-dark transition hover:border-pink-default hover:bg-pink-50"
                            >
                              Buka Maps
                            </a>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Catatan
                          </p>
                          <p className="mt-2 text-sm leading-7 text-charcoal/70">
                            {entry.customerNotes || 'Tidak ada catatan tambahan.'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-pink-100 p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Detail Item
                          </p>
                          <p className="text-sm font-semibold text-charcoal">
                            {entry.itemCount || 0} item
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          {entry.items.length > 0 ? (
                            entry.items.map((item, index) => (
                              <div
                                key={`${item.product_id || 'item'}-${item.size_label || 'size'}-${index}`}
                                className="rounded-2xl bg-[#fffaf8] px-4 py-3"
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <p className="font-semibold text-charcoal">{item.name}</p>
                                    <p className="text-sm text-charcoal/55">
                                      {item.size_label || 'Ukuran default'} x{item.quantity || 0}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-charcoal">
                                    {formatPrice(item.line_total || 0)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl bg-[#fffaf8] px-4 py-3 text-sm text-charcoal/60">
                              Detail item belum tersedia pada order ini.
                            </p>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-pink-100 pt-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal/45">
                            Total Bayar
                          </p>
                          <p className="font-serif text-3xl font-bold text-charcoal">
                            {formatPrice(entry.totalAmount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                      <div className="space-y-4 rounded-[28px] bg-[#fffaf8] p-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Kontak
                          </p>
                          <p className="mt-2 text-base font-semibold text-charcoal">
                            {entry.customerPhone}
                          </p>
                          <p className="mt-1 text-sm text-charcoal/60">
                            {entry.customerEmail || 'Email belum diisi.'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Alamat
                          </p>
                          <p className="mt-2 text-sm leading-7 text-charcoal/70">
                            {entry.customerAddress}
                          </p>
                          {entry.customerCoordinates && (
                            <p className="mt-2 text-xs font-medium text-charcoal/55">
                              Koordinat: {entry.customerCoordinates}
                            </p>
                          )}
                          {entry.customerLocationLink && (
                            <a
                              href={entry.customerLocationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-dark transition hover:border-pink-default hover:bg-pink-50"
                            >
                              Buka Maps
                            </a>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Rasa
                          </p>
                          <p className="mt-2 text-sm leading-7 text-charcoal/70">
                            {entry.flavorLabel}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Ukuran
                          </p>
                          <p className="mt-2 text-sm leading-7 text-charcoal/70">
                            {entry.sizeLabel} • {entry.servingEstimate}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Catatan
                          </p>
                          <p className="mt-2 text-sm leading-7 text-charcoal/70">
                            {entry.customerNotes || 'Tidak ada catatan tambahan.'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-pink-100 p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
                            Referensi Desain
                          </p>
                          <p className="text-sm font-semibold text-charcoal">
                            {entry.requestChannel}
                          </p>
                        </div>

                        {entry.designImageUrl ? (
                          <div className="mt-4">
                            <a
                              href={entry.designImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group block"
                            >
                              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#fffaf8]">
                                <Image
                                  src={entry.designImageUrl}
                                  alt={entry.designImageName || `Referensi desain ${entry.customerName}`}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 520px"
                                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                                />
                              </div>
                            </a>
                            <p className="mt-3 text-sm text-charcoal/60">
                              {entry.designImageName || 'Gambar referensi custom cake'}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-3xl border border-dashed border-pink-200 bg-[#fffaf8] px-4 py-12 text-center text-sm text-charcoal/60">
                            Pelanggan tidak mengunggah gambar referensi.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
