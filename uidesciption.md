UI/UX Specification: SISAR MATITI Dashboard
Project Name: SISAR MATITI (Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring Aktivitas Terpadu Insan Teluk Bintuni)

Organization: BPS Kabupaten Teluk Bintuni

Design System: Tailwind CSS + shadcn/ui

UI Standard: Clean, high-density, professional executive interface (Zero AI Slop)

1. Design Principles & Anti-Slop Guidelines
Tampilan Padat & Fungsional: Mengutamakan keterbacaan data ringkas khas dasbor eksekutif.

Skema Warna Terukur: Dominasi warna netral (Slate/Zinc) dengan aksen biru/emerald untuk indikator statistik.

Kerapian Tipografi: Memakai hierarki teks yang jelas tanpa dekorasi visual berlebihan.

2. Layout Structure & Components Specification
A. Header Section
Title: SISAR MATITI (Bold, text-3xl, tracking-tight)

Subtitle: Sistem Informasi Statistik dan Aktualisasi Regional — BPS Kabupaten Teluk Bintuni

Primary Action: Button + Tambah Kegiatan (komponen Button dari shadcn/ui dengan varian primary).

B. Metric Summary Cards (3 Columns Grid)
Total Kegiatan 2026

Visual: Angka besar (contoh: 24).

Subtext: Rincian status (8 Selesai, 12 Berjalan, 4 Delayed).

Realisasi Kinerja

Visual: Angka persentase (contoh: 78.5%).

Subtext: Rata-rata ketercapaian kuantitatif seluruh pegawai.

Pegawai Aktif

Visual: Total pegawai (contoh: 18).

Subtext: BPS Kabupaten Teluk Bintuni.

C. Main Data Section: Monitoring Table
Komponen menggunakan Card, Table, Badge, Progress, dan Avatar dari shadcn/ui.

Kolom Tabel:

Nama Kegiatan / Survei: Teks tebal (contoh: Pemutakhiran Sensus Ekonomi 2026, Kecamatan Dalam Angka 2026, Sakernas).

Tim Penanggung Jawab: Nama tim/seksi (contoh: IPDS, Nerwilis, Statistik Sosial, Statistik Produksi, Statistik Distribusi, Subbagian Umum).

Tenggat Waktu (Due Date): Tanggal jelas (contoh: 15 Nov 2026).

Progres Realisasi: Visual Progress bar dengan label angka persentase di sampingnya.

Status Badge:

COMPLETED -> Badge Hijau (Success)

IN_PROGRESS -> Badge Biru (Secondary)

PLANNED -> Badge Outline

DELAYED -> Badge Merah (Destructive)

3. Prompt Execution Order for IDE AI
Toleransi pembuatan UI wajib mengikuti spesifikasi berikut:

Pasang struktur halaman di src/app/page.tsx menggunakan komponen bawaan shadcn/ui.

Sediakan modal interaktif (Dialog) saat tombol + Tambah Kegiatan diklik untuk input judul kegiatan, tim penanggung jawab, target waktu, dan target volume.

Sediakan tab filter sederhana (Tabs): Semua, Berjalan, Selesai, Delayed.