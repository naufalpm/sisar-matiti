"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock,
  Filter,
  Layers,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";

// ── Types & Data ─────────────────────────────────────────────────────────────

type KegiatanStatus =
  | "Tepat Waktu"
  | "Mendekati Batas"
  | "Perlu Perhatian"
  | "Selesai";

type PeranPetugas = "Ketua Tim" | "PML" | "PPL" | "Pengolah Data";

type StatusTugas = "Selesai" | "Berjalan" | "Mendekati Batas" | "Belum Mulai";

interface AnggotaKegiatan {
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

interface Kegiatan {
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
  status: KegiatanStatus;
  kualitas: "Baik" | "Cukup" | "Kurang";
  bobot: number;
  targetKuantitatif: string;
  realisasiKuantitatif: string;
  progressPersen: number;
  anggota: AnggotaKegiatan[];
}

const KEGIATAN_DATA: Kegiatan[] = [
  {
    id: "keg-1",
    kode: "SSN-2026",
    nama: "Survei Sosial Ekonomi Nasional (Susenas)",
    deskripsi: "Pengumpulan data sosial, ketahanan pangan, dan pengeluaran rumah tangga di Teluk Bintuni.",
    timKerja: "Statistik Sosial",
    ketuaTim: {
      nama: "Dwi Ayu Lestari",
      nip: "19860312 200903 2 005",
      jabatan: "Statistisi Ahli Muda",
    },
    periode: "Maret - Juni 2026",
    deadline: "30 Jun 2026",
    status: "Tepat Waktu",
    kualitas: "Baik",
    bobot: 2.5,
    targetKuantitatif: "50 Blok Sensus (500 RT)",
    realisasiKuantitatif: "35 Blok Sensus (350 RT)",
    progressPersen: 70,
    anggota: [
      {
        id: "m-1-1",
        nama: "Dwi Ayu Lestari",
        nip: "19860312 200903 2 005",
        peran: "Ketua Tim",
        wilayahTugas: "Kab. Teluk Bintuni (All Sector)",
        target: "Manajemen & Koordinasi 50 Blok Sensus",
        realisasi: "35 Blok Sensus selesai",
        progress: 70,
        statusTugas: "Berjalan",
        kontak: "081234567001",
      },
      {
        id: "m-1-2",
        nama: "Rina Kartika",
        nip: "19900717 201212 2 001",
        peran: "PML",
        wilayahTugas: "Distrik Bintuni & Distrik Manimeri",
        target: "Pengawasan 25 Blok Sensus (250 RT)",
        realisasi: "18 Blok Sensus tersupervisi",
        progress: 72,
        statusTugas: "Berjalan",
        kontak: "081234567003",
      },
      {
        id: "m-1-3",
        nama: "Siti Nurhaliza",
        nip: "19890504 201404 2 007",
        peran: "PML",
        wilayahTugas: "Distrik Babo & Distrik Aroba",
        target: "Pengawasan 25 Blok Sensus (250 RT)",
        realisasi: "17 Blok Sensus tersupervisi",
        progress: 68,
        statusTugas: "Berjalan",
        kontak: "081234567006",
      },
      {
        id: "m-1-4",
        nama: "Rizal Hakim",
        nip: "19950615 201803 1 001",
        peran: "PPL",
        wilayahTugas: "Blok 001B - 012B (Bintuni Barat)",
        target: "Pendataan Lapangan 125 RT",
        realisasi: "95 RT terdata",
        progress: 76,
        statusTugas: "Berjalan",
        kontak: "081234567007",
      },
      {
        id: "m-1-5",
        nama: "Anisa Rahmawati",
        nip: "19961210 202001 2 003",
        peran: "PPL",
        wilayahTugas: "Blok 013B - 025B (Manimeri)",
        target: "Pendataan Lapangan 125 RT",
        realisasi: "85 RT terdata",
        progress: 68,
        statusTugas: "Berjalan",
        kontak: "081234567010",
      },
      {
        id: "m-1-6",
        nama: "Fajar Nugroho",
        nip: "19921230 201503 1 004",
        peran: "Pengolah Data",
        wilayahTugas: "Kantor BPS (Lab Pengolahan)",
        target: "Validasi & Entri 500 Dokumen VSEN26",
        realisasi: "310 Dokumen tervalidasi",
        progress: 62,
        statusTugas: "Berjalan",
        kontak: "081234567005",
      },
    ],
  },
  {
    id: "keg-2",
    kode: "PODES-2026",
    nama: "Pendataan Potensi Desa (Podes)",
    deskripsi: "Sensus potensi dan infrastruktur seluruh desa/kelurahan di Teluk Bintuni.",
    timKerja: "Statistik Produksi",
    ketuaTim: {
      nama: "Budi Santoso",
      nip: "19881105 201001 1 003",
      jabatan: "Statistisi Ahli Pertama",
    },
    periode: "Mei - Juni 2026",
    deadline: "15 Jun 2026",
    status: "Tepat Waktu",
    kualitas: "Baik",
    bobot: 3.0,
    targetKuantitatif: "128 Desa / Kelurahan",
    realisasiKuantitatif: "128 Desa / Kelurahan (Lengkap)",
    progressPersen: 100,
    anggota: [
      {
        id: "m-2-1",
        nama: "Budi Santoso",
        nip: "19881105 201001 1 003",
        peran: "Ketua Tim",
        wilayahTugas: "Seluruh Distrik di Teluk Bintuni",
        target: "Koordinasi Podes 128 Desa",
        realisasi: "128 Desa selesai 100%",
        progress: 100,
        statusTugas: "Selesai",
        kontak: "081234567002",
      },
      {
        id: "m-2-2",
        nama: "Andi Pratama",
        nip: "19870822 201101 1 002",
        peran: "PML",
        wilayahTugas: "Wilayah Pantai & Pesisir (64 Desa)",
        target: "Supervisi Pemeriksaan 64 Desa",
        realisasi: "64 Desa diperiksa",
        progress: 100,
        statusTugas: "Selesai",
        kontak: "081234567004",
      },
      {
        id: "m-2-3",
        nama: "Rizal Hakim",
        nip: "19950615 201803 1 001",
        peran: "PPL",
        wilayahTugas: "Wilayah Pedalaman (64 Desa)",
        target: "Pendataan Kuesioner Podes 64 Desa",
        realisasi: "64 Desa terdata",
        progress: 100,
        statusTugas: "Selesai",
        kontak: "081234567007",
      },
    ],
  },
  {
    id: "keg-3",
    kode: "SKR-2026-I",
    nama: "Sakernas Semester I 2026",
    deskripsi: "Survei indikator ketenagakerjaan, tingkat pengangguran terbuka, dan partisipasi angkatan kerja.",
    timKerja: "Statistik Sosial",
    ketuaTim: {
      nama: "Rina Kartika",
      nip: "19900717 201212 2 001",
      jabatan: "Statistisi Ahli Pertama",
    },
    periode: "Februari - Juni 2026",
    deadline: "12 Jun 2026",
    status: "Tepat Waktu",
    kualitas: "Cukup",
    bobot: 2.0,
    targetKuantitatif: "60 Blok Sensus",
    realisasiKuantitatif: "42 Blok Sensus",
    progressPersen: 70,
    anggota: [
      {
        id: "m-3-1",
        nama: "Rina Kartika",
        nip: "19900717 201212 2 001",
        peran: "Ketua Tim",
        wilayahTugas: "Kab. Teluk Bintuni",
        target: "Pengawalan Target Sakernas Semester I",
        realisasi: "42 Blok tercapai",
        progress: 70,
        statusTugas: "Berjalan",
        kontak: "081234567003",
      },
      {
        id: "m-3-2",
        nama: "Dwi Ayu Lestari",
        nip: "19860312 200903 2 005",
        peran: "PML",
        wilayahTugas: "Distrik Bintuni Kota & Aranday",
        target: "Supervisi Pemeriksaan 30 Blok",
        realisasi: "24 Blok selesai",
        progress: 80,
        statusTugas: "Berjalan",
        kontak: "081234567001",
      },
      {
        id: "m-3-3",
        nama: "Rizal Hakim",
        nip: "19950615 201803 1 001",
        peran: "PPL",
        wilayahTugas: "Blok Sampel Sakernas 01-15",
        target: "Pencacahan 15 Blok (150 RT)",
        realisasi: "12 Blok selesai",
        progress: 80,
        statusTugas: "Berjalan",
        kontak: "081234567007",
      },
      {
        id: "m-3-4",
        nama: "Anisa Rahmawati",
        nip: "19961210 202001 2 003",
        peran: "PPL",
        wilayahTugas: "Blok Sampel Sakernas 16-30",
        target: "Pencacahan 15 Blok (150 RT)",
        realisasi: "6 Blok selesai",
        progress: 40,
        statusTugas: "Mendekati Batas",
        kontak: "081234567010",
      },
    ],
  },
  {
    id: "keg-4",
    kode: "SBH-2026",
    nama: "Survei Biaya Hidup (SBH) 2026",
    deskripsi: "Pencatatan pola konsumsi rumah tangga bulanan sebagai dasar pembobotan diagram timbang IHK.",
    timKerja: "Statistik Distribusi",
    ketuaTim: {
      nama: "Siti Nurhaliza",
      nip: "19890504 201404 2 007",
      jabatan: "Statistisi Terampil",
    },
    periode: "Januari - Desember 2026",
    deadline: "20 Jun 2026",
    status: "Mendekati Batas",
    kualitas: "Baik",
    bobot: 1.5,
    targetKuantitatif: "80 Buku Catatan",
    realisasiKuantitatif: "45 Buku Catatan",
    progressPersen: 56,
    anggota: [
      {
        id: "m-4-1",
        nama: "Siti Nurhaliza",
        nip: "19890504 201404 2 007",
        peran: "Ketua Tim",
        wilayahTugas: "Zona Urban Teluk Bintuni",
        target: "Pengelolaan SBH Putaran Triwulan II",
        realisasi: "45 Buku terkumpul",
        progress: 56,
        statusTugas: "Mendekati Batas",
        kontak: "081234567006",
      },
      {
        id: "m-4-2",
        nama: "Andi Pratama",
        nip: "19870822 201101 1 002",
        peran: "PML",
        wilayahTugas: "Kawasan Pasar & Pertokoan",
        target: "Pemeriksaan Buku Catatan Rumah Tangga",
        realisasi: "45 dari 80 buku diperiksa",
        progress: 56,
        statusTugas: "Mendekati Batas",
        kontak: "081234567004",
      },
      {
        id: "m-4-3",
        nama: "Rizal Hakim",
        nip: "19950615 201803 1 001",
        peran: "PPL",
        wilayahTugas: "Responden Terpilih RT 01-40",
        target: "Pendampingan Pengisian Buku 40 RT",
        realisasi: "25 RT selesai",
        progress: 62,
        statusTugas: "Berjalan",
        kontak: "081234567007",
      },
    ],
  },
  {
    id: "keg-5",
    kode: "IPDS-SEKTORAL",
    nama: "Kompilasi Data Statistik Sektoral (DDA)",
    deskripsi: "Pengumpulan dan validasi data sekunder dari OPD/dinas untuk penyusunan Daerah Dalam Angka.",
    timKerja: "IPDS",
    ketuaTim: {
      nama: "Fajar Nugroho",
      nip: "19921230 201503 1 004",
      jabatan: "Pranata Komputer Pertama",
    },
    periode: "April - Juli 2026",
    deadline: "05 Jul 2026",
    status: "Tepat Waktu",
    kualitas: "Baik",
    bobot: 1.8,
    targetKuantitatif: "45 Dinas / Instansi OPD",
    realisasiKuantitatif: "38 Dinas / Instansi OPD",
    progressPersen: 84,
    anggota: [
      {
        id: "m-5-1",
        nama: "Fajar Nugroho",
        nip: "19921230 201503 1 004",
        peran: "Ketua Tim",
        wilayahTugas: "Seluruh OPD Kab. Teluk Bintuni",
        target: "Koordinasi Pengumpulan Data DDA 2026",
        realisasi: "38 Dinas terkumpul",
        progress: 84,
        statusTugas: "Berjalan",
        kontak: "081234567005",
      },
      {
        id: "m-5-2",
        nama: "Budi Santoso",
        nip: "19881105 201001 1 003",
        peran: "PML",
        wilayahTugas: "Klaster Dinas Ekonomi & Pertanian",
        target: "Verifikasi Tabulasi Data Sektoral",
        realisasi: "20 Tabel diverifikasi",
        progress: 90,
        statusTugas: "Berjalan",
        kontak: "081234567002",
      },
      {
        id: "m-5-3",
        nama: "Anisa Rahmawati",
        nip: "19961210 202001 2 003",
        peran: "Pengolah Data",
        wilayahTugas: "Sekretariat Pengolahan IPDS",
        target: "Input & Layouting Buku DDA",
        realisasi: "7 Bab tersusun",
        progress: 75,
        statusTugas: "Berjalan",
        kontak: "081234567010",
      },
    ],
  },
  {
    id: "keg-6",
    kode: "PDRB-TW-II",
    nama: "Penyusunan PDRB Triwulanan II 2026",
    deskripsi: "Perhitungan produk domestik regional bruto menurut lapangan usaha dan pengeluaran.",
    timKerja: "Nerwilis",
    ketuaTim: {
      nama: "Dr. Hendra Kusuma",
      nip: "19780902 200003 1 001",
      jabatan: "Kepala BPS Kabupaten",
    },
    periode: "Juni - Juli 2026",
    deadline: "25 Jul 2026",
    status: "Tepat Waktu",
    kualitas: "Baik",
    bobot: 2.0,
    targetKuantitatif: "17 Sektor Lapangan Usaha",
    realisasiKuantitatif: "10 Sektor Tervalidasi",
    progressPersen: 58,
    anggota: [
      {
        id: "m-6-1",
        nama: "Dr. Hendra Kusuma",
        nip: "19780902 200003 1 001",
        peran: "Ketua Tim",
        wilayahTugas: "Konsolidasi Tim Neraca",
        target: "Rilis Berita Resmi Statistik PDRB TW II",
        realisasi: "Tahap kompilasi data",
        progress: 58,
        statusTugas: "Berjalan",
        kontak: "081234567009",
      },
      {
        id: "m-6-2",
        nama: "Rizal Hakim",
        nip: "19950615 201803 1 001",
        peran: "PML",
        wilayahTugas: "Sektor Industri, Migas, dan Pertambangan",
        target: "Konfirmasi Data Produksi Migas & Industri",
        realisasi: "8 Perusahaan tervalidasi",
        progress: 65,
        statusTugas: "Berjalan",
        kontak: "081234567007",
      },
      {
        id: "m-6-3",
        nama: "Andi Pratama",
        nip: "19870822 201101 1 002",
        peran: "Pengolah Data",
        wilayahTugas: "Rekonsiliasi Neraca Wilayah",
        target: "Perhitungan Tabel I-O & Supply-Use",
        realisasi: "Draf awal selesai",
        progress: 55,
        statusTugas: "Berjalan",
        kontak: "081234567004",
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
];

const STATUS_OPTIONS: ("Semua" | KegiatanStatus)[] = [
  "Semua",
  "Tepat Waktu",
  "Mendekati Batas",
  "Perlu Perhatian",
  "Selesai",
];

const PERAN_OPTIONS: ("Semua Peran" | PeranPetugas)[] = [
  "Semua Peran",
  "Ketua Tim",
  "PML",
  "PPL",
  "Pengolah Data",
];

// ── Badges & Sub-components ──────────────────────────────────────────────────

function StatusKegiatanBadge({ status }: { status: KegiatanStatus }) {
  const styles: Record<KegiatanStatus, string> = {
    "Tepat Waktu": "bg-[#e3f5ed] text-[#24815b] border-[#c0ebd8]",
    "Mendekati Batas": "bg-[#fff4dd] text-[#9b6f22] border-[#fae2b1]",
    "Perlu Perhatian": "bg-[#fdecec] text-[#c0392b] border-[#f9c8c8]",
    Selesai: "bg-[#e8f1fb] text-[#12628e] border-[#cbe1f7]",
  };

  const dots: Record<KegiatanStatus, string> = {
    "Tepat Waktu": "bg-[#34a853]",
    "Mendekati Batas": "bg-[#fbbc05]",
    "Perlu Perhatian": "bg-[#ea4335]",
    Selesai: "bg-[#12628e]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}
    >
      <span className={`size-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function PeranBadge({ peran }: { peran: PeranPetugas }) {
  const styles: Record<PeranPetugas, string> = {
    "Ketua Tim": "bg-[#003b70] text-white",
    PML: "bg-[#0c6e9d] text-white",
    PPL: "bg-[#e7a72d] text-[#19344d] font-bold",
    "Pengolah Data": "bg-[#7d6ab2] text-white",
  };

  const labelPrefix: Record<PeranPetugas, string> = {
    "Ketua Tim": "Ketua Tim",
    PML: "PML (Pengawas)",
    PPL: "PPL (Pendata)",
    "Pengolah Data": "Pengolah",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[peran]}`}
    >
      {labelPrefix[peran]}
    </span>
  );
}

function StatusTugasBadge({ status }: { status: StatusTugas }) {
  const styles: Record<StatusTugas, string> = {
    Selesai: "text-[#24815b] bg-[#e3f5ed]",
    Berjalan: "text-[#12628e] bg-[#e8f1fb]",
    "Mendekati Batas": "text-[#9b6f22] bg-[#fff4dd]",
    "Belum Mulai": "text-[#647b8d] bg-[#f0f3f5]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function KegiatanPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTim, setSelectedTim] = useState("Semua Tim");
  const [selectedStatus, setSelectedStatus] = useState<"Semua" | KegiatanStatus>(
    "Semua"
  );
  const [selectedPeran, setSelectedPeran] = useState<
    "Semua Peran" | PeranPetugas
  >("Semua Peran");

  // Expanded items (default: all expanded or first 3)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "keg-1": true,
    "keg-2": true,
    "keg-3": true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    KEGIATAN_DATA.forEach((k) => (all[k.id] = true));
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Filter logic
  const filteredKegiatan = useMemo(() => {
    return KEGIATAN_DATA.filter((keg) => {
      const matchTim = selectedTim === "Semua Tim" || keg.timKerja === selectedTim;
      const matchStatus =
        selectedStatus === "Semua" || keg.status === selectedStatus;

      // Filter query matches: nama kegiatan, kode, ketua tim, nama anggota
      const queryLower = searchQuery.toLowerCase();
      const inKegiatan =
        keg.nama.toLowerCase().includes(queryLower) ||
        keg.kode.toLowerCase().includes(queryLower) ||
        keg.ketuaTim.nama.toLowerCase().includes(queryLower);

      const inAnggota = keg.anggota.some(
        (a) =>
          a.nama.toLowerCase().includes(queryLower) ||
          a.nip.includes(queryLower) ||
          (a.wilayahTugas && a.wilayahTugas.toLowerCase().includes(queryLower))
      );

      const matchQuery = !searchQuery || inKegiatan || inAnggota;

      // Filter peran
      const matchPeran =
        selectedPeran === "Semua Peran" ||
        keg.anggota.some((a) => a.peran === selectedPeran);

      return matchTim && matchStatus && matchQuery && matchPeran;
    });
  }, [searchQuery, selectedTim, selectedStatus, selectedPeran]);

  // Aggregate stats
  const totalKegiatan = KEGIATAN_DATA.length;
  const tepatWaktuCount = KEGIATAN_DATA.filter(
    (k) => k.status === "Tepat Waktu"
  ).length;
  const mendekatiBatasCount = KEGIATAN_DATA.filter(
    (k) => k.status === "Mendekati Batas"
  ).length;

  const totalPetugasUnik = useMemo(() => {
    const names = new Set<string>();
    KEGIATAN_DATA.forEach((k) => {
      k.anggota.forEach((a) => names.add(a.nama));
    });
    return names.size;
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#19344d]">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="min-w-0 flex-1">
          {/* ── Top Header ── */}
          <header className="flex h-[76px] items-center justify-between border-b border-[#e8edf2] bg-white px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka menu"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <div className="text-[11px] font-medium text-[#91a0b0]">
                  Rabu, 29 Oktober 2026 • Monitoring Lapangan
                </div>
                <h1 className="mt-0.5 text-[18px] font-bold tracking-[-0.02em] text-[#19344d]">
                  Kegiatan dan Survei
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Bantuan"
                className="hidden size-9 items-center justify-center rounded-full text-[#7890a3] hover:bg-[#f1f5f8] sm:flex"
              >
                <CircleHelp className="size-[18px]" />
              </button>
              <button
                aria-label="Notifikasi"
                className="relative flex size-9 items-center justify-center rounded-full text-[#7890a3] hover:bg-[#f1f5f8]"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#e16b6b]" />
              </button>
              <div className="hidden h-7 w-px bg-[#e5ebf0] sm:block" />
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#f1c27d] text-[13px] font-bold text-[#704111]">
                  N
                </div>
                <div className="text-left">
                  <div className="text-[12px] font-bold leading-4 text-[#19344d]">
                    Naufal P. M.
                  </div>
                  <div className="text-[10px] text-[#8ea0b0]">Kepala BPS</div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-8 lg:p-10">
            {/* ── Ringkasan Metrik ── */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#e8edf2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-[#8a9baa]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Total Kegiatan & Survei
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#e7f0f7] text-[#12628e]">
                    <Layers className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[26px] font-black tracking-tight text-[#19344d]">
                    {totalKegiatan}
                  </span>
                  <span className="text-[11px] font-medium text-[#7d91a3]">
                    Kegiatan Aktif
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#698296]">
                  Tersebar di 5 seksi / tim kerja BPS
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8edf2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-[#8a9baa]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Tepat Waktu
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#e3f5ed] text-[#24815b]">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[26px] font-black tracking-tight text-[#24815b]">
                    {tepatWaktuCount}
                  </span>
                  <span className="text-[11px] font-medium text-[#7d91a3]">
                    Kegiatan On-Track
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#24815b]">
                  {Math.round((tepatWaktuCount / totalKegiatan) * 100)}% sesuai jadwal pelaksanaan
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8edf2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-[#8a9baa]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Perlu Perhatian
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#fff4dd] text-[#9b6f22]">
                    <AlertTriangle className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[26px] font-black tracking-tight text-[#9b6f22]">
                    {mendekatiBatasCount}
                  </span>
                  <span className="text-[11px] font-medium text-[#7d91a3]">
                    Mendekati Batas
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#9b6f22]">
                  Butuh akselerasi supervisi & pencacahan
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8edf2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-[#8a9baa]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Petugas Terlibat
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#eef2f6] text-[#003b70]">
                    <Users className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[26px] font-black tracking-tight text-[#003b70]">
                    {totalPetugasUnik}
                  </span>
                  <span className="text-[11px] font-medium text-[#7d91a3]">
                    Pegawai Aktif
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#698296]">
                  Ketua Tim, PML, PPL & Pengolah
                </div>
              </div>
            </div>

            {/* ── Toolbar: Search & Filter Bar ── */}
            <div className="mb-6 rounded-2xl border border-[#e8edf2] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9aa9b5]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kegiatan, kode survei, ketua tim, atau nama anggota tim..."
                    className="h-10 w-full rounded-xl border border-[#dfe5eb] bg-[#fbfcfd] pl-10 pr-4 text-[13px] text-[#19344d] outline-none transition placeholder:text-[#9aa9b5] focus:border-[#12628e] focus:bg-white focus:ring-2 focus:ring-[#12628e]/10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa9b5] hover:text-[#19344d]"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Filter Tim Kerja */}
                  <select
                    value={selectedTim}
                    onChange={(e) => setSelectedTim(e.target.value)}
                    aria-label="Filter Tim Kerja"
                    className="h-10 rounded-xl border border-[#dfe5eb] bg-[#fbfcfd] px-3 text-[12px] font-medium text-[#465d70] outline-none hover:bg-white focus:border-[#12628e]"
                  >
                    {TIM_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  {/* Filter Status Kegiatan */}
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as "Semua" | KegiatanStatus)
                    }
                    aria-label="Filter Status Kegiatan"
                    className="h-10 rounded-xl border border-[#dfe5eb] bg-[#fbfcfd] px-3 text-[12px] font-medium text-[#465d70] outline-none hover:bg-white focus:border-[#12628e]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        Status: {s}
                      </option>
                    ))}
                  </select>

                  {/* Filter Peran Anggota */}
                  <select
                    value={selectedPeran}
                    onChange={(e) =>
                      setSelectedPeran(
                        e.target.value as "Semua Peran" | PeranPetugas
                      )
                    }
                    aria-label="Filter Peran Anggota"
                    className="h-10 rounded-xl border border-[#dfe5eb] bg-[#fbfcfd] px-3 text-[12px] font-medium text-[#465d70] outline-none hover:bg-white focus:border-[#12628e]"
                  >
                    {PERAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        Peran: {p}
                      </option>
                    ))}
                  </select>

                  {/* Expand / Collapse All buttons */}
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      onClick={expandAll}
                      className="h-10 rounded-xl border border-[#dfe5eb] bg-white px-3 text-[11px] font-semibold text-[#5a7183] hover:bg-[#f4f7f9]"
                    >
                      Buka Semua
                    </button>
                    <button
                      onClick={collapseAll}
                      className="h-10 rounded-xl border border-[#dfe5eb] bg-white px-3 text-[11px] font-semibold text-[#5a7183] hover:bg-[#f4f7f9]"
                    >
                      Tutup Semua
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Petunjuk / Info Banner Peran ── */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d8e6f3] bg-[#f0f6fb] px-4 py-3 text-[12px] text-[#2c5270]">
              <div className="flex items-center gap-2 font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#003b70] text-[10px] font-bold text-white">
                  i
                </span>
                <span>
                  <strong>Struktur Penugasan:</strong> Ketua Tim memimpin kegiatan. PML (Pengawas Lapangan) memeriksa kualitas data, dan PPL (Pendata Lapangan) bertugas mencacah responden.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#003b70] px-2 py-0.5 text-[10px] font-semibold text-white">
                  Ketua Tim
                </span>
                <span className="rounded-md bg-[#0c6e9d] px-2 py-0.5 text-[10px] font-semibold text-white">
                  PML
                </span>
                <span className="rounded-md bg-[#e7a72d] px-2 py-0.5 text-[10px] font-bold text-[#19344d]">
                  PPL
                </span>
                <span className="rounded-md bg-[#7d6ab2] px-2 py-0.5 text-[10px] font-semibold text-white">
                  Pengolah Data
                </span>
              </div>
            </div>

            {/* ── Daftar Kegiatan & Survei ── */}
            <div className="flex flex-col gap-5">
              {filteredKegiatan.map((keg) => {
                const isExpanded = !!expandedIds[keg.id];
                const pmlList = keg.anggota.filter((a) => a.peran === "PML");
                const pplList = keg.anggota.filter((a) => a.peran === "PPL");

                // Filter anggota displayed if selectedPeran is active
                const displayedAnggota =
                  selectedPeran === "Semua Peran"
                    ? keg.anggota
                    : keg.anggota.filter((a) => a.peran === selectedPeran);

                return (
                  <div
                    key={keg.id}
                    className="overflow-hidden rounded-2xl border border-[#e8edf2] bg-white shadow-sm transition hover:border-[#ccdbe8]"
                  >
                    {/* Header Card Kegiatan */}
                    <div className="border-b border-[#f0f3f6] p-5 sm:p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Judul & Detail Kegiatan */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="rounded-md bg-[#f0f4f8] px-2.5 py-1 text-[11px] font-bold text-[#3d5a73]">
                              {keg.kode}
                            </span>
                            <span className="rounded-md bg-[#eaf1f8] px-2.5 py-1 text-[11px] font-semibold text-[#12628e]">
                              {keg.timKerja}
                            </span>
                            <StatusKegiatanBadge status={keg.status} />
                            <span className="text-[11px] text-[#8fa0af]">
                              Bobot: <strong className="text-[#3b5468]">{keg.bobot.toFixed(1)}</strong>
                            </span>
                          </div>

                          <h2 className="mt-2 text-[16px] font-bold text-[#19344d]">
                            {keg.nama}
                          </h2>
                          <p className="mt-1 text-[12px] leading-relaxed text-[#687e8f]">
                            {keg.deskripsi}
                          </p>

                          {/* Quick Info Grid */}
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {/* Ketua Tim */}
                            <div className="rounded-xl bg-[#f8fafc] p-2.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa8b5]">
                                Ketua Tim (PJ)
                              </div>
                              <div className="mt-0.5 text-[12px] font-bold text-[#19344d]">
                                {keg.ketuaTim.nama}
                              </div>
                              <div className="text-[10px] text-[#7d92a3]">
                                {keg.ketuaTim.jabatan}
                              </div>
                            </div>

                            {/* Target Kuantitatif */}
                            <div className="rounded-xl bg-[#f8fafc] p-2.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa8b5]">
                                Target Kuantitatif
                              </div>
                              <div className="mt-0.5 text-[12px] font-bold text-[#19344d]">
                                {keg.targetKuantitatif}
                              </div>
                              <div className="text-[10px] text-[#24815b]">
                                Capaian: {keg.realisasiKuantitatif}
                              </div>
                            </div>

                            {/* Periode & Deadline */}
                            <div className="rounded-xl bg-[#f8fafc] p-2.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa8b5]">
                                Batas Waktu
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-[#19344d]">
                                <Calendar className="size-3.5 text-[#12628e]" />
                                {keg.deadline}
                              </div>
                              <div className="text-[10px] text-[#7d92a3]">
                                Periode: {keg.periode}
                              </div>
                            </div>

                            {/* Komposisi Tim */}
                            <div className="rounded-xl bg-[#f8fafc] p-2.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa8b5]">
                                Komposisi Lapangan
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#3b5468]">
                                <span className="rounded bg-[#0c6e9d]/10 px-1.5 py-0.5 text-[10px] text-[#0c6e9d]">
                                  {pmlList.length} PML
                                </span>
                                <span className="rounded bg-[#e7a72d]/15 px-1.5 py-0.5 text-[10px] text-[#9b6f22]">
                                  {pplList.length} PPL
                                </span>
                                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                                  {keg.anggota.length} Total
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar & Toggle Button */}
                        <div className="flex flex-col items-end justify-between gap-4 lg:w-[240px]">
                          <div className="w-full rounded-xl bg-[#f8fafc] p-3 text-right">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[#7c90a1]">
                                Progres Keseluruhan
                              </span>
                              <span className="font-bold text-[#19344d]">
                                {keg.progressPersen}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e8edf2]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  keg.progressPersen >= 100
                                    ? "bg-[#24815b]"
                                    : keg.progressPersen >= 60
                                    ? "bg-[#12628e]"
                                    : "bg-[#e5a52b]"
                                }`}
                                style={{ width: `${keg.progressPersen}%` }}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => toggleExpand(keg.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe5eb] bg-[#fbfcfd] px-4 py-2.5 text-[12px] font-bold text-[#003b70] transition hover:bg-[#eef4f9] hover:border-[#b8cfdf]"
                          >
                            <span>
                              {isExpanded
                                ? "Sembunyikan Rincian Tim"
                                : `Lihat Rincian Tim & Peran (${keg.anggota.length})`}
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

                    {/* ── Detail Anggota & Peran (Collapsible) ── */}
                    {isExpanded && (
                      <div className="bg-[#fafbfd] px-5 py-4 sm:px-6">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-[#003b70]" />
                            <span className="text-[12px] font-bold text-[#304c62]">
                              Daftar Petugas & Target Individu: {keg.nama}
                            </span>
                            <span className="rounded-full bg-[#e2ecf5] px-2 py-0.5 text-[10px] font-bold text-[#12628e]">
                              {displayedAnggota.length} Petugas
                            </span>
                          </div>
                          <span className="text-[11px] text-[#8699a9]">
                            Ketua Tim mengawasi seluruh PML dan PPL
                          </span>
                        </div>

                        {/* Tabel Detail Anggota */}
                        <div className="overflow-x-auto rounded-xl border border-[#e6ebf0] bg-white shadow-sm">
                          <table className="w-full min-w-[760px] text-left">
                            <thead>
                              <tr className="border-b border-[#edf1f4] bg-[#f8fafc] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8fa0af]">
                                <th className="px-4 py-3">Nama Pegawai & NIP</th>
                                <th className="px-4 py-3">Peran dalam Kegiatan</th>
                                <th className="px-4 py-3">Wilayah / Sampel Tugas</th>
                                <th className="px-4 py-3">Target Individu</th>
                                <th className="px-4 py-3">Realisasi & Progres</th>
                                <th className="px-4 py-3">Status Tugas</th>
                                <th className="px-4 py-3">Kontak</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f4f7] text-[12px]">
                              {displayedAnggota.map((ang) => (
                                <tr
                                  key={ang.id}
                                  className="hover:bg-[#fbfcfd]"
                                >
                                  {/* Nama & NIP */}
                                  <td className="px-4 py-3.5">
                                    <div className="font-bold text-[#19344d]">
                                      {ang.nama}
                                    </div>
                                    <div className="text-[10px] text-[#8fa0af]">
                                      NIP. {ang.nip}
                                    </div>
                                  </td>

                                  {/* Peran */}
                                  <td className="px-4 py-3.5">
                                    <PeranBadge peran={ang.peran} />
                                  </td>

                                  {/* Wilayah / Sampel */}
                                  <td className="px-4 py-3.5 text-[11px] text-[#4d6679]">
                                    {ang.wilayahTugas || "Seluruh Wilayah"}
                                  </td>

                                  {/* Target Individu */}
                                  <td className="px-4 py-3.5">
                                    <div className="font-medium text-[#2d4659]">
                                      {ang.target}
                                    </div>
                                  </td>

                                  {/* Realisasi & Progres */}
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e8edf2]">
                                        <div
                                          className={`h-full rounded-full ${
                                            ang.progress >= 100
                                              ? "bg-[#24815b]"
                                              : ang.progress >= 60
                                              ? "bg-[#12628e]"
                                              : "bg-[#e5a52b]"
                                          }`}
                                          style={{ width: `${ang.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-[11px] font-bold text-[#455f72] tabular-nums">
                                        {ang.progress}%
                                      </span>
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-[#8fa0af]">
                                      {ang.realisasi}
                                    </div>
                                  </td>

                                  {/* Status Tugas */}
                                  <td className="px-4 py-3.5">
                                    <StatusTugasBadge status={ang.statusTugas} />
                                  </td>

                                  {/* Kontak */}
                                  <td className="px-4 py-3.5 text-[11px] text-[#6b8294]">
                                    {ang.kontak}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredKegiatan.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#dfe5eb] bg-white p-12 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f4f7f9] text-[#8fa0af]">
                    <Search className="size-6" />
                  </div>
                  <h3 className="mt-3 text-[14px] font-bold text-[#19344d]">
                    Kegiatan tidak ditemukan
                  </h3>
                  <p className="mt-1 text-[12px] text-[#8a9caa]">
                    Tidak ada kegiatan yang cocok dengan kata kunci & filter yang dipilih.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTim("Semua Tim");
                      setSelectedStatus("Semua");
                      setSelectedPeran("Semua Peran");
                    }}
                    className="mt-4 rounded-xl bg-[#003b70] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#002f5a]"
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
