# Setup Supabase

Panduan ini menyiapkan:

- login admin
- tabel `orders`
- tabel `custom_cake_requests`
- Storage bucket untuk gambar custom cake
- realtime untuk dashboard admin

## 1. Jalankan SQL schema

1. Buka `Supabase Dashboard`
2. Masuk ke `SQL Editor`
3. Copy isi file [schema.sql](./schema.sql)
4. Jalankan query tersebut

File ini akan membuat:

- `public.admin_users`
- `public.orders`
- `public.custom_cake_requests`
- policy RLS untuk admin dan pelanggan
- function bootstrap admin pertama
- policy upload untuk bucket `custom-cake-designs`

## 2. Buat bucket Storage

1. Buka `Storage`
2. Klik `New bucket`
3. Isi nama bucket: `custom-cake-designs`
4. Aktifkan `Public bucket`
5. Batasi file upload:
   - allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
   - max file size: `10 MB`
6. Simpan bucket

Catatan:

- aplikasi custom cake mengunggah gambar ke bucket ini
- karena halaman pelanggan berjalan langsung di browser, bucket dibuat public agar URL gambar bisa langsung disimpan dan ditampilkan di admin

## 3. Setup admin pertama

Ada dua opsi:

### Opsi A: lewat aplikasi

1. Jalankan website
2. Buka `/admin/setup`
3. Isi `username`, `email`, dan `password`
4. Submit form
5. Jika `Confirm email` aktif di Supabase Auth, verifikasi email dulu lalu login ke `/admin`

### Opsi B: manual lewat dashboard

1. Buka `Authentication > Users`
2. Buat user email/password baru
3. Ambil `user id`
4. Jalankan SQL:

```sql
insert into public.admin_users (id, username, email, display_name)
values (
  'UUID_DARI_AUTH_USERS',
  'admin',
  'admin@example.com',
  'Admin Toko'
);
```

## 4. Environment variable

Pastikan file `.env` berisi:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## 5. Aktifkan anonymous sign-in

1. Buka `Authentication`
2. Masuk ke `Sign In / Providers`
3. Aktifkan `Anonymous Sign-Ins`
4. Simpan perubahan

Catatan:

- halaman custom cake sekarang otomatis membuat sesi anonim untuk pelanggan baru
- pelanggan tidak perlu login manual
- admin yang sudah login tetap bisa memakai dashboard seperti biasa

## 6. Cara tes fitur custom cake

1. Buka `/custom-cake`
2. Isi form pelanggan
3. Upload gambar referensi
4. Submit
5. Pastikan:
   - gambar berhasil masuk ke bucket `custom-cake-designs`
   - row baru masuk ke tabel `public.custom_cake_requests`
   - data muncul di `/admin`

## Referensi resmi

- Supabase Storage bucket creation: https://supabase.com/docs/guides/storage/buckets/creating-buckets
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Storage upload: https://supabase.com/docs/reference/javascript/v1/storage-from-upload
- Supabase public file URLs: https://supabase.com/docs/guides/storage/serving/downloads
