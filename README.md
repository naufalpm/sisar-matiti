# Sisar Matiti

Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring Aktivitas Terpadu Insan Teluk Bintuni — BPS Kabupaten Teluk Bintuni.

Aplikasi web untuk memantau kegiatan, progres, deadline, beban kerja, dan capaian bulanan pegawai (dasar pengisian CKP). Spesifikasi lengkap: [PRD Sisar Matiti.md](PRD%20Sisar%20Matiti.md).

## Teknologi

- Next.js 16 (App Router, Server Actions) + React 19 + TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS 4 + shadcn/ui (Radix), font Plus Jakarta Sans
- Login lokal (argon2id, sesi di database, cookie httpOnly)

## Menjalankan di lokal

```bash
npm install
docker run -d --name sisar-pg -e POSTGRES_USER=sisar -e POSTGRES_PASSWORD=sisar \
  -e POSTGRES_DB=sisar_matiti -p 5433:5432 postgres:17-alpine
cp .env.example .env          # sesuaikan DATABASE_URL bila perlu
npm run db:migrate
npm run db:seed               # data contoh 28 pegawai (password: sisar12345)
npm run dev
```

Akun contoh: `kepala`, `admin`, `agus` (Ketua Tim Sosial), `dewi` (PJ Sakernas & Ketua Tim ZI), `hendra` (pegawai).

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` / `build` / `start` | Development, build produksi, jalankan build |
| `npm test` | Unit test rumus + tes integrasi alur approval (butuh DB `sisar_test`) |
| `npm run db:generate` | Buat migrasi baru dari `db/schema.ts` |
| `npm run db:migrate` | Terapkan migrasi |
| `npm run db:seed [-- --reset]` | Isi data contoh (dev saja) |
| `npm run admin:buat -- <user> "<Nama>" <password>` | Buat akun Admin pertama (produksi) |
| `npm run job:harian` | Jalankan job harian (kunci bulan + notifikasi deadline) |

Tes integrasi memakai database terpisah:

```bash
docker exec sisar-pg psql -U sisar -d sisar_matiti -c "create database sisar_test"
DATABASE_URL=postgres://sisar:sisar@localhost:5433/sisar_test npm run db:migrate
npm test
```

## Struktur

```
app/
  login/                 Halaman & aksi login
  (app)/                 Halaman setelah login (layout sidebar)
    page.tsx             Beranda + ringkasan setelah login
    dashboard/           Dashboard Kepala, penetapan bobot
    pekerjaan-saya/      Isi progres & ajukan
    kegiatan/            Daftar & detail kegiatan (+ riwayat)
    kelola/              Kelola kegiatan/sub/pekerjaan/penugasan (Ketua Tim)
    approval/            Antrean approval, unapprove, verifikasi Kepala
    notifikasi/ akun/    Notifikasi in-app, ganti password
    admin/               Pegawai, tim, pengaturan (Admin)
  actions/               Server Actions (tipis, memanggil lib/layanan)
  api/cron/harian/       Endpoint job harian
lib/
  capaian.ts waktu.ts    Rumus capaian/beban & utilitas tanggal WIT (fungsi murni)
  auth/                  Sesi, password, Data Access Layer (getUser/requireUser)
  layanan/               Logika bisnis: progres/approval, kelola, admin, rekap, job
  data.ts                Query untuk halaman
db/schema.ts             Skema database
components/sisar/        Komponen UI aplikasi; components/ui = shadcn
tests/                   Vitest
```

## Aturan bisnis utama

- Hierarki: Tim → Kegiatan → Sub-kegiatan → Pekerjaan → Penugasan per pegawai → Target per bulan.
- Approval berlaku **per penugasan per bulan**. Progres sebagian boleh diajukan berkali-kali; yang dihitung hanya realisasi yang sudah di-approve.
- Yang meng-approve: Ketua Tim pemilik kegiatan atau PJ Kegiatan (bukan untuk pekerjaannya sendiri). Unapprove hanya Ketua Tim. Pekerjaan Ketua Tim di kegiatan timnya → self-approve, Kepala dapat memverifikasi.
- Capaian bulan *m* = rata-rata `min(realisasi disetujui / target, 1)` seluruh penugasan bulan *m*. Bobot (1–10, ditetapkan Kepala) hanya untuk beban kerja.
- Capaian bulan *m* dikunci setelah tanggal 5 bulan berikutnya (WIT): snapshot disimpan di `capaian_snapshot`; approval sesudahnya tetap dicatat tetapi tidak mengubah CKP.
- Hapus kegiatan/sub/pekerjaan/penugasan = soft delete.

## Deploy

Lihat [docs/DEPLOY.md](docs/DEPLOY.md).

## Aset

`public/logo-bps.svg` saat ini **placeholder**. Ganti dengan file logo resmi BPS (nama file sama, atau ubah referensinya di `components/sisar/nav.tsx` dan `app/login/page.tsx`).
