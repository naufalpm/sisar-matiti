"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  FolderTree,
  GitBranch,
  Layers,
  Menu,
  Plus,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Types & Data ─────────────────────────────────────────────────────────────

export type KegiatanStatus =
  | "Tepat Waktu"
  | "Mendekati Batas"
  | "Perlu Perhatian"
  | "Selesai";

export type PeranPetugas =
  | "Ketua Tim"
  | "PML"
  | "PPL"
  | "Pengolah Data"
  | "Panitia"
  | "Instruktur INDA"
  | "Peserta"
  | "Desain & Publikasi"
  | "Lainnya";

export type StatusTugas =
  | "Selesai"
  | "Berjalan"
  | "Mendekati Batas"
  | "Belum Mulai";

// Petugas yang ditugaskan (di level pekerjaan langsung maupun sub-pekerjaan)
export interface PetugasTugas {
  id: string;
  nama: string;
  nip: string;
  peran: string; // misal: "Peserta INDA", "Ketua Panitia", "Pencacah (PPL)", "Desain Cover", "Penyusun Tabel"
  foto?: string; // URL foto pegawai dari database pegawai
  target?: string;
  realisasi?: string;
  progress: number;
  statusTugas: StatusTugas;
  kontak?: string;
}

// Sub-pekerjaan (anak dari detail pekerjaan)
export interface SubPekerjaan {
  id: string;
  namaSubPekerjaan: string; // misal: "Panitia Pelatihan", "Peserta Pelatihan", "Desain Cover", "Penyusunan Tabel"
  deskripsi?: string;
  target?: string;
  realisasi?: string;
  progress: number;
  statusTugas: StatusTugas;
  petugas: PetugasTugas[];
}

// Detail Pekerjaan (Tahapan / Work Breakdown Structure)
export interface DetailPekerjaan {
  id: string;
  namaPekerjaan: string; // misal: "Pelatihan INDA", "Pelatihan Petugas / Peserta", "Pencacahan Lapangan", "Publikasi Hasil"
  kategoriTahapan?: string; // misal: "Tahap 1: Pelatihan & Persiapan", "Tahap 2: Lapangan", "Tahap 3: Diseminasi"
  deadline?: string;
  progress: number;
  statusTugas: StatusTugas;
  // Flag apakah memiliki sub-pekerjaan atau langsung ke petugas
  hasSubPekerjaan: boolean;
  subPekerjaan?: SubPekerjaan[];
  petugasLangsung?: PetugasTugas[];
}

export interface AnggotaKegiatan {
  id: string;
  nama: string;
  nip: string;
  peran: PeranPetugas;
  wilayahTugas?: string;
  target: string;
  realisasi: string;
  progress: number;
  statusTugas: StatusTugas;
  kontak: string;
}

export interface Kegiatan {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  timKerja: string;
  ketuaTim: {
    nama: string;
    nip: string;
    jabatan: string;
  };
  periode: string;
  deadline: string;
  dueDate: string;
  status: KegiatanStatus;
  kualitas: "Baik" | "Cukup" | "Sangat Baik";
  bobot: number;
  targetKuantitatif: string;
  realisasiKuantitatif: string;
  progressPersen: number;
  detailPekerjaan: DetailPekerjaan[];
  anggota: AnggotaKegiatan[];
}

// ── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_KEGIATAN_DATA: Kegiatan[] = [
  {
    id: "keg-sakernas",
    kode: "SKR-2026-I",
    nama: "Survei Angkatan Kerja Nasional (Sakernas) Semester I 2026",
    deskripsi:
      "Survei indikator ketenagakerjaan, tingkat pengangguran terbuka, dan partisipasi angkatan kerja di Kab. Teluk Bintuni.",
    timKerja: "Statistik Sosial",
    ketuaTim: {
      nama: "Rina Kartika, S.Si.",
      nip: "19900717 201212 2 001",
      jabatan: "Statistisi Ahli Pertama",
    },
    periode: "Februari - Juni 2026",
    deadline: "12 Jun 2026",
    dueDate: "2026-06-12",
    status: "Mendekati Batas",
    kualitas: "Cukup",
    bobot: 2.5,
    targetKuantitatif: "60 Blok Sensus (600 Rumah Tangga)",
    realisasiKuantitatif: "42 Blok Sensus (420 RT)",
    progressPersen: 70,
    detailPekerjaan: [
      {
        id: "task-skr-1",
        namaPekerjaan: "Pelatihan Instruktur Daerah (INDA)",
        kategoriTahapan: "Tahap 1: Pembekalan & Sertifikasi",
        deadline: "20 Feb 2026",
        progress: 100,
        statusTugas: "Selesai",
        hasSubPekerjaan: false,
        petugasLangsung: [
          {
            id: "pet-skr-1-1",
            nama: "Rina Kartika, S.Si.",
            nip: "19900717 201212 2 001",
            peran: "Peserta Pelatihan INDA",
            target: "1 Orang Lulus Sertifikasi INDA Sakernas Nasional",
            realisasi: "Lulus dengan Predikat Amat Baik (Skor 94)",
            progress: 100,
            statusTugas: "Selesai",
            kontak: "0812-3456-7003",
          },
        ],
      },
      {
        id: "task-skr-2",
        namaPekerjaan: "Pelatihan Petugas Lapangan (PML & PPL)",
        kategoriTahapan: "Tahap 1: Pembekalan & Sertifikasi",
        deadline: "05 Mar 2026",
        progress: 100,
        statusTugas: "Selesai",
        hasSubPekerjaan: true,
        subPekerjaan: [
          {
            id: "sub-skr-2-1",
            namaSubPekerjaan: "Panitia Pelatihan Petugas",
            deskripsi: "Penyelenggaraan kelas, logistik kit pelatihan, dan administrasi SPD peserta.",
            target: "Penyelenggaraan 3 hari pelatihan di Aula BPS Bintuni",
            realisasi: "Terlaksana lancar tanpa kendala sarana",
            progress: 100,
            statusTugas: "Selesai",
            petugas: [
              {
                id: "pet-skr-2-1-1",
                nama: "Budi Santoso, S.Tr.Stat.",
                nip: "19881105 201001 1 003",
                peran: "Ketua Panitia Pelatihan",
                target: "Koordinasi kelancaran kelas dan tata tertib 12 peserta",
                realisasi: "Selesai 100%",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7002",
              },
              {
                id: "pet-skr-2-1-2",
                nama: "Dwi Ayu Lestari, A.Md.",
                nip: "19860312 200903 2 005",
                peran: "Panitia Logistik & ATK",
                target: "Penyediaan modul pelatihan, tablet CAPI, dan kuesioner",
                realisasi: "Seluruh perlengkapan terdistribusi lengkap",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7001",
              },
            ],
          },
          {
            id: "sub-skr-2-2",
            namaSubPekerjaan: "Instruktur Daerah (INDA)",
            deskripsi: "Penyampaian materi konsep ketenagakerjaan, simulasi CAPI, dan roleplay wawancara.",
            target: "24 Jam Pelajaran (JP) Pengajaran Konsep Sakernas",
            realisasi: "24 JP selesai, post-test dilaksanakan",
            progress: 100,
            statusTugas: "Selesai",
            petugas: [
              {
                id: "pet-skr-2-2-1",
                nama: "Rina Kartika, S.Si.",
                nip: "19900717 201212 2 001",
                peran: "Instruktur Daerah (Pengajar)",
                target: "Pengajaran 24 JP materi Sakernas BPS",
                realisasi: "Nilai rata-rata post-test kelas 88.5",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7003",
              },
            ],
          },
          {
            id: "sub-skr-2-3",
            namaSubPekerjaan: "Peserta Pelatihan (PML & PPL)",
            deskripsi: "Mengikuti pembekalan, pemahaman buku pedoman, dan uji coba wawancara lapangan.",
            target: "Kelulusan evaluasi uji coba dengan nilai >= 80",
            realisasi: "Semua peserta dinyatakan siap terjun lapangan",
            progress: 100,
            statusTugas: "Selesai",
            petugas: [
              {
                id: "pet-skr-2-3-1",
                nama: "Rizal Hakim, S.Stat.",
                nip: "19950615 201803 1 001",
                peran: "Peserta Pelatihan (PPL)",
                target: "Menguasai instrumen CAPI & kuisioner Sakernas",
                realisasi: "Lulus evaluasi lapangan",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7007",
              },
              {
                id: "pet-skr-2-3-2",
                nama: "Anisa Rahmawati",
                nip: "19961210 202001 2 003",
                peran: "Peserta Pelatihan (PPL)",
                target: "Menguasai instrumen CAPI & kuisioner Sakernas",
                realisasi: "Lulus evaluasi lapangan",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7010",
              },
            ],
          },
        ],
      },
      {
        id: "task-skr-3",
        namaPekerjaan: "Pencacahan dan Pengawasan Lapangan",
        kategoriTahapan: "Tahap 2: Operasi Lapangan",
        deadline: "20 Mei 2026",
        progress: 72,
        statusTugas: "Berjalan",
        hasSubPekerjaan: true,
        subPekerjaan: [
          {
            id: "sub-skr-3-1",
            namaSubPekerjaan: "Pengawasan Lapangan (PML)",
            deskripsi: "Supervisi, re-interview sampel kontrol kualitas, dan verifikasi kewajaran data.",
            target: "Pemeriksaan 60 Blok Sensus",
            realisasi: "42 Blok Sensus diperiksa",
            progress: 70,
            statusTugas: "Berjalan",
            petugas: [
              {
                id: "pet-skr-3-1-1",
                nama: "Dwi Ayu Lestari, A.Md.",
                nip: "19860312 200903 2 005",
                peran: "PML (Pengawas Wilayah Bintuni)",
                target: "Supervisi 30 Blok Sensus",
                realisasi: "24 Blok selesai tervalidasi",
                progress: 80,
                statusTugas: "Berjalan",
                kontak: "0812-3456-7001",
              },
              {
                id: "pet-skr-3-1-2",
                nama: "Rina Kartika, S.Si.",
                nip: "19900717 201212 2 001",
                peran: "PML (Pengawas Wilayah Manimeri & Babo)",
                target: "Supervisi 30 Blok Sensus",
                realisasi: "18 Blok selesai tervalidasi",
                progress: 60,
                statusTugas: "Berjalan",
                kontak: "0812-3456-7003",
              },
            ],
          },
          {
            id: "sub-skr-3-2",
            namaSubPekerjaan: "Pencacahan Rumah Tangga (PPL)",
            deskripsi: "Wawancara langsung tatap muka dengan seluruh sampel rumah tangga terpilih.",
            target: "Pendataan 600 Rumah Tangga di 60 Blok Sensus",
            realisasi: "420 Rumah Tangga terdata",
            progress: 70,
            statusTugas: "Berjalan",
            petugas: [
              {
                id: "pet-skr-3-2-1",
                nama: "Rizal Hakim, S.Stat.",
                nip: "19950615 201803 1 001",
                peran: "PPL (Pencacah Blok 01-15)",
                target: "Pendataan 150 RT terpilih",
                realisasi: "120 RT terdata (80%)",
                progress: 80,
                statusTugas: "Berjalan",
                kontak: "0812-3456-7007",
              },
              {
                id: "pet-skr-3-2-2",
                nama: "Anisa Rahmawati",
                nip: "19961210 202001 2 003",
                peran: "PPL (Pencacah Blok 16-30)",
                target: "Pendataan 150 RT terpilih",
                realisasi: "60 RT terdata (40%)",
                progress: 40,
                statusTugas: "Mendekati Batas",
                kontak: "0812-3456-7010",
              },
            ],
          },
        ],
      },
      {
        id: "task-skr-4",
        namaPekerjaan: "Pengolahan & Validasi Data Web FASIH",
        kategoriTahapan: "Tahap 3: Pengolahan & Tabulasi",
        deadline: "05 Jun 2026",
        progress: 65,
        statusTugas: "Berjalan",
        hasSubPekerjaan: false,
        petugasLangsung: [
          {
            id: "pet-skr-4-1",
            nama: "Fajar Nugroho, S.Kom.",
            nip: "19921230 201503 1 004",
            peran: "Pengolah Data & Operator FASIH",
            target: "Validasi Rule Engine 60 Blok Sensus di Server FASIH",
            realisasi: "39 Blok Sensus 'Clean & Valid'",
            progress: 65,
            statusTugas: "Berjalan",
            kontak: "0812-3456-7005",
          },
        ],
      },
      {
        id: "task-skr-5",
        namaPekerjaan: "Publikasi dan Diseminasi Hasil Sakernas",
        kategoriTahapan: "Tahap 4: Diseminasi & Publikasi",
        deadline: "12 Jun 2026",
        progress: 55,
        statusTugas: "Berjalan",
        hasSubPekerjaan: true,
        subPekerjaan: [
          {
            id: "sub-skr-5-1",
            namaSubPekerjaan: "Desain Cover & Infografis Sosial Media",
            deskripsi: "Penyusunan tata letak sampul buku publikasi Sakernas dan 3 infografis ringkas BPS.",
            target: "1 Draf Cover Standar BPS + 3 Poster Infografis Instagram",
            realisasi: "Cover disetujui Kepala BPS, infografis dalam penyusunan",
            progress: 60,
            statusTugas: "Berjalan",
            petugas: [
              {
                id: "pet-skr-5-1-1",
                nama: "Fajar Nugroho, S.Kom.",
                nip: "19921230 201503 1 004",
                peran: "Desainer Cover & Visualisasi Media",
                target: "Desain visual cover dan tata letak halaman pembuka",
                realisasi: "Draf sampul selesai",
                progress: 60,
                statusTugas: "Berjalan",
                kontak: "0812-3456-7005",
              },
            ],
          },
          {
            id: "sub-skr-5-2",
            namaSubPekerjaan: "Penyusunan Tabel & Tabulasi BRS Ketenagakerjaan",
            deskripsi: "Penarikan tabulasi standar TPT, TPAK, dan struktur pekerja formal/informal Teluk Bintuni.",
            target: "18 Tabel Pokok Ketenagakerjaan + Draf Naskah BRS",
            realisasi: "9 Tabel tervalidasi dengan data provinsial",
            progress: 50,
            statusTugas: "Berjalan",
            petugas: [
              {
                id: "pet-skr-5-2-1",
                nama: "Siti Nurhaliza, S.Stat.",
                nip: "19890504 201404 2 007",
                peran: "Penyusun Tabel Statistik & Rilis BRS",
                target: "Penyusunan 18 tabel indikator ketenagakerjaan",
                realisasi: "9 Tabel selesai",
                progress: 50,
                statusTugas: "Berjalan",
                kontak: "0812-3456-7006",
              },
            ],
          },
        ],
      },
    ],
    anggota: [
      {
        id: "m-skr-1",
        nama: "Rina Kartika, S.Si.",
        nip: "19900717 201212 2 001",
        peran: "Ketua Tim",
        wilayahTugas: "Kab. Teluk Bintuni (All)",
        target: "Penanggung Jawab & INDA Sakernas 2026",
        realisasi: "Tahap pengawasan lapangan 70%",
        progress: 70,
        statusTugas: "Berjalan",
        kontak: "0812-3456-7003",
      },
      {
        id: "m-skr-2",
        nama: "Dwi Ayu Lestari, A.Md.",
        nip: "19860312 200903 2 005",
        peran: "PML",
        wilayahTugas: "Distrik Bintuni Kota & Aranday",
        target: "Supervisi Pemeriksaan 30 Blok",
        realisasi: "24 Blok selesai",
        progress: 80,
        statusTugas: "Berjalan",
        kontak: "0812-3456-7001",
      },
      {
        id: "m-skr-3",
        nama: "Rizal Hakim, S.Stat.",
        nip: "19950615 201803 1 001",
        peran: "PPL",
        wilayahTugas: "Blok Sampel Sakernas 01-15",
        target: "Pencacahan 15 Blok (150 RT)",
        realisasi: "12 Blok selesai",
        progress: 80,
        statusTugas: "Berjalan",
        kontak: "0812-3456-7007",
      },
      {
        id: "m-skr-4",
        nama: "Anisa Rahmawati",
        nip: "19961210 202001 2 003",
        peran: "PPL",
        wilayahTugas: "Blok Sampel Sakernas 16-30",
        target: "Pencacahan 15 Blok (150 RT)",
        realisasi: "6 Blok selesai",
        progress: 40,
        statusTugas: "Mendekati Batas",
        kontak: "0812-3456-7010",
      },
      {
        id: "m-skr-5",
        nama: "Fajar Nugroho, S.Kom.",
        nip: "19921230 201503 1 004",
        peran: "Pengolah Data",
        wilayahTugas: "Lab Pengolahan & Publikasi",
        target: "Validasi FASIH & Desain Cover Publikasi",
        realisasi: "Tahap entri & layout sampul",
        progress: 60,
        statusTugas: "Berjalan",
        kontak: "0812-3456-7005",
      },
      {
        id: "m-skr-6",
        nama: "Siti Nurhaliza, S.Stat.",
        nip: "19890504 201404 2 007",
        peran: "Pengolah Data",
        wilayahTugas: "Tim Kompilasi Neraca & Sosial",
        target: "Kompilasi 18 Tabel Rilis Sakernas",
        realisasi: "9 Tabel selesai",
        progress: 50,
        statusTugas: "Berjalan",
        kontak: "0812-3456-7006",
      },
    ],
  },
  {
    id: "keg-podes",
    kode: "PODES-2026",
    nama: "Pendataan Potensi Desa (Podes) 2026",
    deskripsi:
      "Sensus potensi dan infrastruktur seluruh desa/kelurahan di Teluk Bintuni.",
    timKerja: "Statistik Produksi",
    ketuaTim: {
      nama: "Budi Santoso, S.Tr.Stat.",
      nip: "19881105 201001 1 003",
      jabatan: "Statistisi Ahli Pertama",
    },
    periode: "Mei - Juni 2026",
    deadline: "15 Jun 2026",
    dueDate: "2026-06-15",
    status: "Selesai",
    kualitas: "Sangat Baik",
    bobot: 3.0,
    targetKuantitatif: "128 Desa / Kelurahan",
    realisasiKuantitatif: "128 Desa / Kelurahan (Lengkap)",
    progressPersen: 100,
    detailPekerjaan: [
      {
        id: "task-podes-1",
        namaPekerjaan: "Sosialisasi & Koordinasi Dinas PMD",
        kategoriTahapan: "Tahap 1: Persiapan OPD",
        deadline: "05 Mei 2026",
        progress: 100,
        statusTugas: "Selesai",
        hasSubPekerjaan: false,
        petugasLangsung: [
          {
            id: "pet-podes-1-1",
            nama: "Budi Santoso, S.Tr.Stat.",
            nip: "19881105 201001 1 003",
            peran: "Ketua Tim & Koordinator",
            target: "Koordinasi 24 Distrik & DPMD",
            realisasi: "Surat izin dan data dasar selesai",
            progress: 100,
            statusTugas: "Selesai",
            kontak: "0812-3456-7002",
          },
        ],
      },
      {
        id: "task-podes-2",
        namaPekerjaan: "Pendataan Kuesioner Podes Lapangan",
        kategoriTahapan: "Tahap 2: Pendataan Desa",
        deadline: "05 Jun 2026",
        progress: 100,
        statusTugas: "Selesai",
        hasSubPekerjaan: true,
        subPekerjaan: [
          {
            id: "sub-podes-2-1",
            namaSubPekerjaan: "Supervisi & Pemeriksaan Wilayah Pesisir",
            progress: 100,
            statusTugas: "Selesai",
            petugas: [
              {
                id: "pet-podes-2-1-1",
                nama: "Andi Pratama, S.E.",
                nip: "19870822 201101 1 002",
                peran: "PML",
                target: "64 Desa Pesisir",
                realisasi: "64 Desa selesai diperiksa",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7004",
              },
            ],
          },
          {
            id: "sub-podes-2-2",
            namaSubPekerjaan: "Pendataan Kuesioner Wilayah Pedalaman",
            progress: 100,
            statusTugas: "Selesai",
            petugas: [
              {
                id: "pet-podes-2-2-1",
                nama: "Rizal Hakim, S.Stat.",
                nip: "19950615 201803 1 001",
                peran: "PPL",
                target: "64 Desa Pedalaman",
                realisasi: "64 Desa tuntas terdata",
                progress: 100,
                statusTugas: "Selesai",
                kontak: "0812-3456-7007",
              },
            ],
          },
        ],
      },
    ],
    anggota: [
      {
        id: "m-podes-1",
        nama: "Budi Santoso, S.Tr.Stat.",
        nip: "19881105 201001 1 003",
        peran: "Ketua Tim",
        wilayahTugas: "Seluruh Distrik di Teluk Bintuni",
        target: "Koordinasi Podes 128 Desa",
        realisasi: "128 Desa selesai 100%",
        progress: 100,
        statusTugas: "Selesai",
        kontak: "0812-3456-7002",
      },
      {
        id: "m-podes-2",
        nama: "Andi Pratama, S.E.",
        nip: "19870822 201101 1 002",
        peran: "PML",
        wilayahTugas: "Wilayah Pantai & Pesisir (64 Desa)",
        target: "Supervisi Pemeriksaan 64 Desa",
        realisasi: "64 Desa diperiksa",
        progress: 100,
        statusTugas: "Selesai",
        kontak: "0812-3456-7004",
      },
      {
        id: "m-podes-3",
        nama: "Rizal Hakim, S.Stat.",
        nip: "19950615 201803 1 001",
        peran: "PPL",
        wilayahTugas: "Wilayah Pedalaman (64 Desa)",
        target: "Pendataan Kuesioner Podes 64 Desa",
        realisasi: "64 Desa terdata",
        progress: 100,
        statusTugas: "Selesai",
        kontak: "0812-3456-7007",
      },
    ],
  },
];

const TIM_OPTIONS = [
  "Semua Tim",
  "Statistik Sosial",
  "Statistik Produksi",
  "Statistik Distribusi",
  "IPDS",
  "Nerwilis",
  "Subbagian Umum",
];

const STATUS_OPTIONS: ("Semua" | KegiatanStatus)[] = [
  "Semua",
  "Tepat Waktu",
  "Mendekati Batas",
  "Perlu Perhatian",
  "Selesai",
];

// ── Badges Sub-components ────────────────────────────────────────────────────

function StatusKegiatanBadge({ status }: { status: KegiatanStatus }) {
  if (status === "Selesai") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold text-[11px] hover:bg-emerald-100 flex items-center gap-1">
        <CheckCircle2 className="size-3 text-emerald-600" />
        <span>Selesai</span>
      </Badge>
    );
  }
  if (status === "Tepat Waktu") {
    return (
      <Badge className="bg-blue-50 text-blue-700 border-blue-200/80 font-semibold text-[11px] hover:bg-blue-100 flex items-center gap-1">
        <Clock className="size-3 text-blue-600" />
        <span>Tepat Waktu</span>
      </Badge>
    );
  }
  if (status === "Mendekati Batas") {
    return (
      <Badge className="bg-amber-50 text-amber-800 border-amber-200/80 font-semibold text-[11px] hover:bg-amber-100 flex items-center gap-1">
        <Clock className="size-3 text-amber-600" />
        <span>Mendekati Batas</span>
      </Badge>
    );
  }
  return (
    <Badge className="bg-rose-50 text-rose-700 border-rose-200/80 font-semibold text-[11px] hover:bg-rose-100 flex items-center gap-1">
      <AlertTriangle className="size-3 text-rose-600" />
      <span>Perlu Perhatian</span>
    </Badge>
  );
}

function StatusTugasBadge({ status }: { status: StatusTugas }) {
  const styles: Record<StatusTugas, string> = {
    Selesai: "text-emerald-700 bg-emerald-50 border-emerald-200",
    Berjalan: "text-blue-700 bg-blue-50 border-blue-200",
    "Mendekati Batas": "text-amber-800 bg-amber-50 border-amber-200",
    "Belum Mulai": "text-slate-600 bg-slate-100 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ── Detail & Sub-Pekerjaan Renderers ──────────────────────────────────────────

interface WorkBreakdownProps {
  kegiatan: Kegiatan;
}

function KegiatanWorkBreakdown({ kegiatan }: WorkBreakdownProps) {
  // State untuk expand/collapse masing-masing tahapan pekerjaan
  const [collapsedTasks, setCollapsedTasks] = useState<Record<string, boolean>>(
    {}
  );

  const toggleTaskCollapse = (taskId: string) => {
    setCollapsedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const tasks = kegiatan.detailPekerjaan || [];

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
        Belum ada rincian detail pekerjaan untuk kegiatan ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend / Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <FolderTree className="size-4 text-[#003b70]" />
          <span>Rincian Pekerjaan ({tasks.length} Tahapan)</span>
        </div>
      </div>

      {/* List Detail Pekerjaan */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const isTaskCollapsed = !!collapsedTasks[task.id];

          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition"
            >
              {/* Task Header */}
              <div
                onClick={() => toggleTaskCollapse(task.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 sm:px-4 cursor-pointer hover:bg-slate-100/70 transition border-b border-slate-100"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs shadow-2xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {task.namaPekerjaan}
                      </h4>
                    </div>
                    {task.deadline && (
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        <span>Tenggat: {task.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress & Status */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 sm:w-24 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          task.progress >= 100
                            ? "bg-emerald-500"
                            : task.progress >= 60
                            ? "bg-[#0d73a5]"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 min-w-[32px] text-right">
                      {task.progress}%
                    </span>
                  </div>

                  <StatusTugasBadge status={task.statusTugas} />

                  <button
                    type="button"
                    aria-label="Toggle rincian pekerjaan"
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {isTaskCollapsed ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Task Body */}
              {!isTaskCollapsed && (
                <div className="p-3.5 sm:p-4 space-y-3 bg-white">
                  {/* KASUS A: Memiliki Sub-Pekerjaan (Bertingkat) */}
                  {task.hasSubPekerjaan && task.subPekerjaan && task.subPekerjaan.length > 0 ? (
                    <div className="space-y-3 pl-1 sm:pl-3 border-l-2 border-blue-200 ml-2">
                      {task.subPekerjaan.map((sub, sIdx) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:p-3.5 shadow-2xs space-y-2.5"
                        >
                          {/* Sub Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="flex size-5 items-center justify-center rounded-md bg-[#003b70] text-[10px] font-bold text-white">
                                {idx + 1}.{sIdx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900">
                                {sub.namaSubPekerjaan}
                              </h5>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <StatusTugasBadge status={sub.statusTugas} />
                            </div>
                          </div>

                          {/* Petugas di dalam Sub-Pekerjaan */}
                          <div className="space-y-1.5 pt-0.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <Users className="size-3 text-[#003b70]" />
                              <span>Petugas:</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {sub.petugas.map((pet) => (
                                <div
                                  key={pet.id}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 sm:p-3 hover:border-blue-300 transition shadow-2xs"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Space Foto Pegawai (dari database pegawai) */}
                                    <div className="relative size-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                      {pet.foto ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                          src={pet.foto}
                                          alt={pet.nama}
                                          className="size-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex size-full items-center justify-center bg-blue-50 text-[#003b70] font-bold text-xs">
                                          {pet.nama
                                            .split(" ")
                                            .map((n) => n[0])
                                            .filter((c) => /[A-Za-z]/.test(c))
                                            .slice(0, 2)
                                            .join("") || (
                                            <User className="size-4 text-slate-400" />
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Informasi Pokok Pegawai */}
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                      <div className="text-xs font-bold text-slate-900 truncate">
                                        {pet.nama}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono truncate">
                                        NIP. {pet.nip}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status & Progress */}
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    <StatusTugasBadge status={pet.statusTugas} />
                                    <div className="text-[11px] font-bold text-slate-700">
                                      {pet.progress}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* KASUS B: Petugas Langsung */
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {task.petugasLangsung?.map((pet) => (
                          <div
                            key={pet.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 sm:p-3 hover:border-blue-300 transition shadow-2xs"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Space Foto Pegawai (dari database pegawai) */}
                              <div className="relative size-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {pet.foto ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={pet.foto}
                                    alt={pet.nama}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center bg-blue-50 text-[#003b70] font-bold text-xs">
                                    {pet.nama
                                      .split(" ")
                                      .map((n) => n[0])
                                      .filter((c) => /[A-Za-z]/.test(c))
                                      .slice(0, 2)
                                      .join("") || (
                                      <User className="size-4 text-slate-400" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Informasi Pokok Pegawai */}
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {pet.nama}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono truncate">
                                  NIP. {pet.nip}
                                </div>
                              </div>
                            </div>

                            {/* Status & Progress */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <StatusTugasBadge status={pet.statusTugas} />
                              <div className="text-[11px] font-bold text-slate-700">
                                {pet.progress}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function KegiatanPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activitiesList, setActivitiesList] = useState<Kegiatan[]>(
    INITIAL_KEGIATAN_DATA
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTim, setSelectedTim] = useState("Semua Tim");
  const [selectedStatus, setSelectedStatus] = useState<"Semua" | KegiatanStatus>(
    "Semua"
  );
  const [sortBy, setSortBy] = useState<"deadline" | "progress" | "name">(
    "deadline"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Expanded items (default buka kegiatan Sakernas)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "keg-sakernas": true,
    "keg-podes": false,
  });

  // Mode Tampilan per Kegiatan: 'wbs' (Rincian Pekerjaan) atau 'anggota' (Daftar Ringkas Pegawai)
  const [viewModes, setViewModes] = useState<Record<string, "wbs" | "anggota">>({
    "keg-sakernas": "wbs",
    "keg-podes": "wbs",
  });

  // Modal & Toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Activity Form State
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    timKerja: "Statistik Sosial",
    deskripsi: "",
    ketuaTimNama: "",
    targetKuantitatif: "100 Satuan",
    deadline: "",
    bobot: 2.0,
    status: "Tepat Waktu" as KegiatanStatus,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    activitiesList.forEach((k) => (all[k.id] = true));
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const setCardViewMode = (kegId: string, mode: "wbs" | "anggota") => {
    setViewModes((prev) => ({ ...prev, [kegId]: mode }));
  };

  // Filter & Sort Logic
  const filteredKegiatan = useMemo(() => {
    return activitiesList
      .filter((keg) => {
        const matchTim =
          selectedTim === "Semua Tim" || keg.timKerja === selectedTim;
        const matchStatus =
          selectedStatus === "Semua" || keg.status === selectedStatus;

        const queryLower = searchQuery.toLowerCase();
        const inKegiatan =
          keg.nama.toLowerCase().includes(queryLower) ||
          keg.kode.toLowerCase().includes(queryLower) ||
          keg.ketuaTim.nama.toLowerCase().includes(queryLower);

        // Search juga di rincian pekerjaan & sub-pekerjaan
        const inTasks = keg.detailPekerjaan.some((t) => {
          if (t.namaPekerjaan.toLowerCase().includes(queryLower)) return true;
          if (
            t.subPekerjaan?.some(
              (s) =>
                s.namaSubPekerjaan.toLowerCase().includes(queryLower) ||
                s.petugas.some((p) => p.nama.toLowerCase().includes(queryLower))
            )
          ) {
            return true;
          }
          if (
            t.petugasLangsung?.some((p) =>
              p.nama.toLowerCase().includes(queryLower)
            )
          ) {
            return true;
          }
          return false;
        });

        const inAnggota = keg.anggota.some(
          (a) =>
            a.nama.toLowerCase().includes(queryLower) ||
            a.nip.includes(queryLower)
        );

        const matchQuery = !searchQuery || inKegiatan || inTasks || inAnggota;

        return matchTim && matchStatus && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.nama.localeCompare(b.nama)
            : b.nama.localeCompare(a.nama);
        }
        if (sortBy === "progress") {
          return sortOrder === "asc"
            ? a.progressPersen - b.progressPersen
            : b.progressPersen - a.progressPersen;
        }
        return sortOrder === "asc"
          ? a.dueDate.localeCompare(b.dueDate)
          : b.dueDate.localeCompare(a.dueDate);
      });
  }, [
    activitiesList,
    searchQuery,
    selectedTim,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  // Aggregate stats
  const totalKegiatan = activitiesList.length;
  const tepatWaktuCount = activitiesList.filter(
    (k) => k.status === "Tepat Waktu"
  ).length;
  const selesaiCount = activitiesList.filter((k) => k.status === "Selesai").length;
  const perhatianCount = activitiesList.filter(
    (k) => k.status === "Perlu Perhatian" || k.status === "Mendekati Batas"
  ).length;

  const totalPetugasUnik = useMemo(() => {
    const names = new Set<string>();
    activitiesList.forEach((k) => {
      k.anggota.forEach((a) => names.add(a.nama));
      k.detailPekerjaan?.forEach((t) => {
        t.petugasLangsung?.forEach((p) => names.add(p.nama));
        t.subPekerjaan?.forEach((s) =>
          s.petugas.forEach((p) => names.add(p.nama))
        );
      });
    });
    return names.size;
  }, [activitiesList]);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    const newKeg: Kegiatan = {
      id: `keg-${Date.now()}`,
      kode:
        formData.kode ||
        `KEG-${Math.floor(100 + Math.random() * 900)}-2026`,
      nama: formData.nama,
      deskripsi:
        formData.deskripsi ||
        "Aktivitas pendataan dan verifikasi lapangan statistik daerah.",
      timKerja: formData.timKerja,
      ketuaTim: {
        nama: formData.ketuaTimNama || "Dwi Ayu Lestari, A.Md.",
        nip: "19860312 200903 2 005",
        jabatan: "Statistisi Penanggung Jawab",
      },
      periode: "Tahun Anggaran 2026",
      deadline: formData.deadline || "31 Des 2026",
      dueDate: formData.deadline || "2026-12-31",
      status: formData.status,
      kualitas: "Baik",
      bobot: Number(formData.bobot) || 2.0,
      targetKuantitatif: formData.targetKuantitatif,
      realisasiKuantitatif: "0 Satuan (Baru)",
      progressPersen: 0,
      detailPekerjaan: [
        {
          id: `task-new-1-${Date.now()}`,
          namaPekerjaan: "Persiapan & Pelatihan Petugas",
          kategoriTahapan: "Tahap 1: Persiapan",
          progress: 0,
          statusTugas: "Belum Mulai",
          hasSubPekerjaan: true,
          subPekerjaan: [
            {
              id: `sub-new-1-1-${Date.now()}`,
              namaSubPekerjaan: "Panitia Pelatihan",
              deskripsi: "Administrasi dan akomodasi kegiatan",
              progress: 0,
              statusTugas: "Belum Mulai",
              petugas: [
                {
                  id: `pet-new-1-${Date.now()}`,
                  nama: formData.ketuaTimNama || "Dwi Ayu Lestari, A.Md.",
                  nip: "19860312 200903 2 005",
                  peran: "Penanggung Jawab",
                  target: "Kelancaran persiapan pelatihan",
                  realisasi: "Draf administrasi",
                  progress: 0,
                  statusTugas: "Belum Mulai",
                  kontak: "0812-3456-7890",
                },
              ],
            },
          ],
        },
        {
          id: `task-new-2-${Date.now()}`,
          namaPekerjaan: "Pelaksanaan Pencacahan Lapangan",
          kategoriTahapan: "Tahap 2: Lapangan",
          progress: 0,
          statusTugas: "Belum Mulai",
          hasSubPekerjaan: false,
          petugasLangsung: [
            {
              id: `pet-new-2-${Date.now()}`,
              nama: "Petugas Ditunjuk",
              nip: "19950615 201803 1 001",
              peran: "PPL Lapangan",
              target: formData.targetKuantitatif,
              realisasi: "Persiapan penugasan",
              progress: 0,
              statusTugas: "Belum Mulai",
              kontak: "0812-3456-7890",
            },
          ],
        },
      ],
      anggota: [
        {
          id: `m-new-${Date.now()}`,
          nama: formData.ketuaTimNama || "Dwi Ayu Lestari, A.Md.",
          nip: "19860312 200903 2 005",
          peran: "Ketua Tim",
          wilayahTugas: "Teluk Bintuni",
          target: formData.targetKuantitatif,
          realisasi: "Persiapan Pelaksanaan",
          progress: 0,
          statusTugas: "Belum Mulai",
          kontak: "0812-3456-7890",
        },
      ],
    };

    setActivitiesList((prev) => [newKeg, ...prev]);
    setExpandedIds((prev) => ({ ...prev, [newKeg.id]: true }));
    setIsModalOpen(false);
    showToast(`Kegiatan "${formData.nama}" berhasil ditambahkan.`);

    setFormData({
      nama: "",
      kode: "",
      timKerja: "Statistik Sosial",
      deskripsi: "",
      ketuaTimNama: "",
      targetKuantitatif: "100 Satuan",
      deadline: "",
      bobot: 2.0,
      status: "Tepat Waktu",
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Kode",
      "Nama Kegiatan",
      "Tim Kerja",
      "Ketua Tim",
      "Deadline",
      "Progres (%)",
      "Status",
      "Bobot",
      "Jumlah Tahapan Pekerjaan",
    ];

    const rows = activitiesList.map((k) => [
      `"${k.kode}"`,
      `"${k.nama.replace(/"/g, '""')}"`,
      `"${k.timKerja}"`,
      `"${k.ketuaTim.nama}"`,
      `"${k.deadline}"`,
      k.progressPersen,
      `"${k.status}"`,
      k.bobot,
      k.detailPekerjaan?.length || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SISAR_MATITI_Kegiatan_WBS_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data kegiatan dan struktur pekerjaan berhasil diekspor ke CSV.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased font-sans">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="min-w-0 flex-1 flex flex-col">
          {/* ── TOP EXECUTIVE BAR ── */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white/95 px-5 sm:px-8 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka navigasi menu"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <span>SISAR MATITI</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-[#003b70]">BPS Teluk Bintuni</span>
                </div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Manajemen Kegiatan &amp; Struktur Pekerjaan
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              <button
                type="button"
                aria-label="Notifikasi"
                className="relative flex size-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              >
                <Bell className="size-[18px]" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-2.5 pl-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#003b70] text-xs font-bold text-white shadow-sm">
                  NP
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold text-slate-800">
                    Naufal, S.Si., M.T.
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    Kepala BPS
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ── MAIN CONTENT AREA ── */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1">
            {/* Header Greeting & Action Bar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Kegiatan dan Rincian Penugasan
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Pantau detail tahapan pekerjaan per kegiatan (Pelatihan INDA, Pelatihan Peserta, Publikasi, dsb.) beserta pembagian sub-pekerjaan dan penanggung jawabnya.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
                >
                  <Download className="size-3.5 text-slate-500" />
                  <span>Unduh CSV</span>
                </button>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 px-4 rounded-xl bg-[#003b70] hover:bg-[#002c54] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="size-4" />
                  <span>+ Tambah Kegiatan Baru</span>
                </Button>
              </div>

            </div>

            {/* ── KPI METRICS CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Total Kegiatan</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-[#003b70]">
                    <Layers className="size-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {totalKegiatan}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">Survei &amp; Sensus</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Selesai &amp; Tepat Waktu</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-emerald-700">
                    {tepatWaktuCount + selesaiCount}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    ({Math.round(((tepatWaktuCount + selesaiCount) / (totalKegiatan || 1)) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-amber-300 transition-all">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Perlu Perhatian</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <AlertTriangle className="size-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-amber-700">
                    {perhatianCount}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">Kegiatan Kritis</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Petugas Terlibat</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Users className="size-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {totalPetugasUnik}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">Pegawai Terbagi di Sub-Tugas</span>
                </div>
              </div>
            </div>

            {/* ── SEARCH & FILTER CONTROLS ── */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kegiatan, pekerjaan (contoh: Pelatihan INDA, Publikasi), atau nama petugas (Rina, Budi, Fajar)..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#003b70] focus:bg-white focus:ring-2 focus:ring-[#003b70]/20 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Selects */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Tim */}
                  <div className="relative">
                    <select
                      value={selectedTim}
                      onChange={(e) => setSelectedTim(e.target.value)}
                      aria-label="Filter berdasarkan Tim Kerja"
                      className="h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                    >
                      {TIM_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Status */}
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as "Semua" | KegiatanStatus)
                      }
                      aria-label="Filter Status"
                      className="h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          Status: {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split("-") as [
                          "deadline" | "progress" | "name",
                          "asc" | "desc",
                        ];
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                      aria-label="Urutkan"
                      className="h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                    >
                      <option value="deadline-asc">Batas Waktu Terdekat</option>
                      <option value="deadline-desc">Batas Waktu Terjauh</option>
                      <option value="progress-desc">Progres Tertinggi</option>
                      <option value="progress-asc">Progres Terendah</option>
                      <option value="name-asc">Nama Kegiatan (A-Z)</option>
                    </select>
                    <ArrowUpDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Expand / Collapse All buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={expandAll}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Buka Semua
                    </button>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Tutup Semua
                    </button>
                  </div>
                </div>
              </div>

              
            </div>

            {/* ── ACTIVITIES ACCORDION LIST ── */}
            <div className="space-y-4">
              {filteredKegiatan.map((keg) => {
                const isExpanded = !!expandedIds[keg.id];
                const currentViewMode = viewModes[keg.id] || "wbs";
                const totalTahapan = keg.detailPekerjaan?.length || 0;

                return (
                  <div
                    key={keg.id}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-slate-300"
                  >
                    {/* Header Card Kegiatan */}
                    <div className="p-5 sm:p-6 border-b border-slate-100">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Judul & Detail */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200/60 font-mono">
                              {keg.kode}
                            </span>
                            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
                              {keg.timKerja}
                            </span>
                            <StatusKegiatanBadge status={keg.status} />
                            <span className="text-[11px] text-slate-500 font-medium ml-1">
                              Bobot:{" "}
                              <strong className="text-slate-800">
                                {keg.bobot.toFixed(1)}
                              </strong>
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            {keg.nama}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                            {keg.deskripsi}
                          </p>

                          {/* Quick Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Penanggung Jawab (PJ)
                              </div>
                              <div className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                                {keg.ketuaTim.nama}
                              </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Target Volume
                              </div>
                              <div className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                                {keg.targetKuantitatif}
                              </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Batas Waktu
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                <Calendar className="size-3.5 text-[#003b70]" />
                                <span>{keg.deadline}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar & Toggle Button */}
                        <div className="flex flex-col items-end justify-between gap-3 lg:w-[260px] pt-1">
                          <div className="w-full rounded-xl bg-slate-50 p-3 border border-slate-100">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-slate-600">
                                Progres Keseluruhan
                              </span>
                              <span className="font-bold text-slate-900 text-sm">
                                {keg.progressPersen}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  keg.progressPersen >= 100
                                    ? "bg-emerald-500"
                                    : keg.progressPersen >= 60
                                    ? "bg-[#0d73a5]"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${keg.progressPersen}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpand(keg.id)}
                            className="flex w-full items-center justify-center gap-2 h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#003b70] hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                          >
                            <span>
                              {isExpanded
                                ? "Sembunyikan Rincian Pekerjaan"
                                : `Lihat Rincian Pekerjaan (${totalTahapan} Tahapan)`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── EXPANDED SECTION ── */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 p-4 sm:p-6 border-t border-slate-100 space-y-4">
                        {/* Tab Switcher antara WBS dan Ringkasan Pegawai */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setCardViewMode(keg.id, "wbs")}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                                currentViewMode === "wbs"
                                  ? "bg-white text-[#003b70] shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <GitBranch className="size-3.5" />
                              <span>Rincian Pekerjaan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCardViewMode(keg.id, "anggota")}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                                currentViewMode === "anggota"
                                  ? "bg-white text-[#003b70] shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <Users className="size-3.5" />
                              <span>Rekap Pegawai &amp; Wilayah ({keg.anggota.length})</span>
                            </button>
                          </div>
                        </div>

                        {/* MODE 1: Work Breakdown Structure (DETAIL PEKERJAAN & SUB-PEKERJAAN) */}
                        {currentViewMode === "wbs" && (
                          <KegiatanWorkBreakdown kegiatan={keg} />
                        )}

                        {/* MODE 2: REKAPITULASI ANGGOTA */}
                        {currentViewMode === "anggota" && (
                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                            <table className="w-full min-w-[760px] text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                  <th className="px-4 py-3">Nama Pegawai &amp; NIP</th>
                                  <th className="px-4 py-3">Peran Penugasan</th>
                                  <th className="px-4 py-3">Wilayah / Sampel</th>
                                  <th className="px-4 py-3">Target Individu</th>
                                  <th className="px-4 py-3 min-w-[140px]">Realisasi</th>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3">Kontak</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {keg.anggota.map((ang) => (
                                  <tr
                                    key={ang.id}
                                    className="hover:bg-slate-50/70 transition"
                                  >
                                    <td className="px-4 py-3.5">
                                      <div className="font-bold text-slate-900">
                                        {ang.nama}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono">
                                        NIP. {ang.nip}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <span className="inline-block rounded-md bg-[#003b70] px-2 py-0.5 text-[10px] font-semibold text-white">
                                        {ang.peran}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[11px] text-slate-600">
                                      {ang.wilayahTugas || "Kab. Teluk Bintuni"}
                                    </td>
                                    <td className="px-4 py-3.5 font-medium text-slate-800">
                                      {ang.target}
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                          <div
                                            className={`h-full rounded-full ${
                                              ang.progress >= 100
                                                ? "bg-emerald-500"
                                                : ang.progress >= 60
                                                ? "bg-[#0d73a5]"
                                                : "bg-amber-500"
                                            }`}
                                            style={{ width: `${ang.progress}%` }}
                                          />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700">
                                          {ang.progress}%
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">
                                        {ang.realisasi}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                      <StatusTugasBadge status={ang.statusTugas} />
                                    </td>
                                    <td className="px-4 py-3.5 text-[11px] text-slate-600 font-mono">
                                      {ang.kontak}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredKegiatan.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search className="size-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    Kegiatan tidak ditemukan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Tidak ada kegiatan atau rincian pekerjaan yang cocok dengan kriteria pencarian saat ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTim("Semua Tim");
                      setSelectedStatus("Semua");
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#003b70] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002f5a] cursor-pointer"
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL: + TAMBAH KEGIATAN BARU ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#003b70]">
                  <Plus className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Tambah Kegiatan &amp; Survei Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input rincian target penugasan BPS Kabupaten Teluk Bintuni
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label htmlFor="nama" className="font-semibold text-slate-700">
                  Nama Kegiatan / Survei *
                </Label>
                <Input
                  id="nama"
                  required
                  placeholder="Contoh: Survei Angkatan Kerja Nasional (Sakernas) 2026"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="h-9 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="kode" className="font-semibold text-slate-700">
                    Kode Singkatan Survei
                  </Label>
                  <Input
                    id="kode"
                    placeholder="Contoh: SKR-2026"
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="tim" className="font-semibold text-slate-700">
                    Tim / Seksi Kerja *
                  </Label>
                  <select
                    id="tim"
                    value={formData.timKerja}
                    onChange={(e) =>
                      setFormData({ ...formData, timKerja: e.target.value })
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70]"
                  >
                    <option value="Statistik Sosial">Statistik Sosial</option>
                    <option value="Statistik Produksi">Statistik Produksi</option>
                    <option value="Statistik Distribusi">Statistik Distribusi</option>
                    <option value="IPDS">IPDS</option>
                    <option value="Nerwilis">Nerwilis</option>
                    <option value="Subbagian Umum">Subbagian Umum</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="deskripsi" className="font-semibold text-slate-700">
                  Deskripsi / Ruang Lingkup Kegiatan
                </Label>
                <Input
                  id="deskripsi"
                  placeholder="Penjelasan ringkas tentang kegiatan survei lapangan..."
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="h-9 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ketua" className="font-semibold text-slate-700">
                    Penanggung Jawab (Ketua Tim) *
                  </Label>
                  <Input
                    id="ketua"
                    required
                    placeholder="Nama lengkap Penanggung Jawab"
                    value={formData.ketuaTimNama}
                    onChange={(e) =>
                      setFormData({ ...formData, ketuaTimNama: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="target" className="font-semibold text-slate-700">
                    Target Kuantitatif *
                  </Label>
                  <Input
                    id="target"
                    required
                    placeholder="Contoh: 60 Blok Sensus"
                    value={formData.targetKuantitatif}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetKuantitatif: e.target.value,
                      })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="deadline" className="font-semibold text-slate-700">
                    Batas Waktu (Due Date) *
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bobot" className="font-semibold text-slate-700">
                    Bobot Kegiatan (1.0 - 5.0)
                  </Label>
                  <Input
                    id="bobot"
                    type="number"
                    step="0.5"
                    min="1.0"
                    max="5.0"
                    value={formData.bobot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bobot: Number(e.target.value),
                      })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 text-[11px] text-slate-600">
                <strong>Catatan:</strong> Struktur tahapan detail pekerjaan (Persiapan, Pelatihan INDA, Pelatihan Petugas, Lapangan, dan Publikasi) akan otomatis disiapkan untuk dapat disesuaikan pembagian sub-tugasnya.
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 rounded-xl px-4 text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="h-9 rounded-xl px-4 bg-[#003b70] hover:bg-[#002c54] text-white text-xs cursor-pointer font-semibold shadow-sm"
                >
                  Simpan Kegiatan Baru
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-xl animate-fadeIn border border-slate-700">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
