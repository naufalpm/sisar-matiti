"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Award,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Mail,
  Menu,
  Phone,
  Plus,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Types & Initial Data ─────────────────────────────────────────────────────

type StatusPegawai = "Aktif" | "Cuti" | "Non-Aktif";

interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  seksi: string;
  golongan: string;
  email: string;
  telepon: string;
  status: StatusPegawai;
  bebanKerja: number;
  inisial: string;
  warna: string;
  assignedActivitiesCount: number;
}

const INITIAL_PEGAWAI: Pegawai[] = [
  {
    id: "1",
    nip: "19860312 200903 2 005",
    nama: "Dwi Ayu Lestari, A.Md.",
    jabatan: "Statistisi Ahli Muda",
    seksi: "Statistik Sosial",
    golongan: "III/c",
    email: "d.ayu@bps.go.id",
    telepon: "0812-3456-7001",
    status: "Aktif",
    bebanKerja: 8.6,
    inisial: "DA",
    warna: "bg-[#0d73a5]",
    assignedActivitiesCount: 4,
  },
  {
    id: "2",
    nip: "19881105 201001 1 003",
    nama: "Budi Santoso, S.Tr.Stat.",
    jabatan: "Statistisi Ahli Pertama",
    seksi: "Statistik Produksi",
    golongan: "III/b",
    email: "b.santoso@bps.go.id",
    telepon: "0812-3456-7002",
    status: "Aktif",
    bebanKerja: 7.8,
    inisial: "BS",
    warna: "bg-[#059669]",
    assignedActivitiesCount: 4,
  },
  {
    id: "3",
    nip: "19900717 201212 2 001",
    nama: "Rina Kartika, S.Si.",
    jabatan: "Statistisi Ahli Pertama",
    seksi: "Statistik Sosial",
    golongan: "III/b",
    email: "r.kartika@bps.go.id",
    telepon: "0812-3456-7003",
    status: "Aktif",
    bebanKerja: 6.9,
    inisial: "RK",
    warna: "bg-[#d97706]",
    assignedActivitiesCount: 3,
  },
  {
    id: "4",
    nip: "19870822 201101 1 002",
    nama: "Andi Pratama, S.E.",
    jabatan: "Statistisi Ahli Muda",
    seksi: "Statistik Produksi",
    golongan: "III/c",
    email: "a.pratama@bps.go.id",
    telepon: "0812-3456-7004",
    status: "Aktif",
    bebanKerja: 6.2,
    inisial: "AP",
    warna: "bg-[#2563eb]",
    assignedActivitiesCount: 3,
  },
  {
    id: "5",
    nip: "19921230 201503 1 004",
    nama: "Fajar Nugroho, S.Kom.",
    jabatan: "Pranata Komputer Pertama",
    seksi: "IPDS",
    golongan: "III/a",
    email: "f.nugroho@bps.go.id",
    telepon: "0812-3456-7005",
    status: "Aktif",
    bebanKerja: 5.6,
    inisial: "FN",
    warna: "bg-[#7c3aed]",
    assignedActivitiesCount: 2,
  },
  {
    id: "6",
    nip: "19890504 201404 2 007",
    nama: "Siti Nurhaliza, S.Stat.",
    jabatan: "Statistisi Terampil",
    seksi: "Statistik Distribusi",
    golongan: "II/d",
    email: "s.nurhaliza@bps.go.id",
    telepon: "0812-3456-7006",
    status: "Cuti",
    bebanKerja: 4.7,
    inisial: "SN",
    warna: "bg-[#db2777]",
    assignedActivitiesCount: 2,
  },
  {
    id: "7",
    nip: "19950615 201803 1 001",
    nama: "Rizal Hakim, S.Stat.",
    jabatan: "Statistisi Terampil",
    seksi: "Nerwilis",
    golongan: "II/c",
    email: "r.hakim@bps.go.id",
    telepon: "0812-3456-7007",
    status: "Aktif",
    bebanKerja: 3.5,
    inisial: "RH",
    warna: "bg-[#059669]",
    assignedActivitiesCount: 2,
  },
  {
    id: "8",
    nip: "19831128 200604 2 002",
    nama: "Sri Wahyuni, S.Sos.",
    jabatan: "Kepala Subbagian Umum",
    seksi: "Subbagian Umum",
    golongan: "III/d",
    email: "s.wahyuni@bps.go.id",
    telepon: "0812-3456-7008",
    status: "Aktif",
    bebanKerja: 4.2,
    inisial: "SW",
    warna: "bg-[#ea580c]",
    assignedActivitiesCount: 1,
  },
  {
    id: "9",
    nip: "19780512 200112 1 002",
    nama: "Naufal, S.Si., M.T.",
    jabatan: "Kepala BPS Kabupaten",
    seksi: "Pimpinan",
    golongan: "IV/b",
    email: "naufal@bps.go.id",
    telepon: "0812-3456-7009",
    status: "Aktif",
    bebanKerja: 2.0,
    inisial: "NP",
    warna: "bg-[#003b70]",
    assignedActivitiesCount: 1,
  },
  {
    id: "10",
    nip: "19961210 202001 2 003",
    nama: "Anisa Rahmawati, A.P.Kb.",
    jabatan: "Staf Administrasi & Pengolah Data",
    seksi: "Subbagian Umum",
    golongan: "II/b",
    email: "a.rahmawati@bps.go.id",
    telepon: "0812-3456-7010",
    status: "Non-Aktif",
    bebanKerja: 0.0,
    inisial: "AR",
    warna: "bg-[#64748b]",
    assignedActivitiesCount: 0,
  },
];

const SEKSI_OPTIONS = [
  "Semua Seksi",
  "Statistik Sosial",
  "Statistik Produksi",
  "Statistik Distribusi",
  "IPDS",
  "Nerwilis",
  "Subbagian Umum",
  "Pimpinan",
];

const GOLONGAN_OPTIONS = [
  "II/a",
  "II/b",
  "II/c",
  "II/d",
  "III/a",
  "III/b",
  "III/c",
  "III/d",
  "IV/a",
  "IV/b",
];

// ── Badges ───────────────────────────────────────────────────────────────────

function StatusBadgePegawai({ status }: { status: StatusPegawai }) {
  if (status === "Aktif") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold text-[11px] hover:bg-emerald-100">
        <CheckCircle2 className="size-3 text-emerald-600" />
        <span>Aktif</span>
      </Badge>
    );
  }
  if (status === "Cuti") {
    return (
      <Badge className="bg-amber-50 text-amber-800 border-amber-200/80 font-semibold text-[11px] hover:bg-amber-100">
        <AlertCircle className="size-3 text-amber-600" />
        <span>Cuti</span>
      </Badge>
    );
  }
  return (
    <Badge className="bg-rose-50 text-rose-700 border-rose-200/80 font-semibold text-[11px] hover:bg-rose-100">
      <X className="size-3 text-rose-600" />
      <span>Non-Aktif</span>
    </Badge>
  );
}

function BebanKerjaBar({ value }: { value: number }) {
  const percent = Math.min((value / 10) * 100, 100);
  const color =
    value >= 7.5
      ? "bg-rose-500"
      : value >= 5.0
      ? "bg-amber-500"
      : value > 0
      ? "bg-emerald-500"
      : "bg-slate-300";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-800 tabular-nums">
        {value > 0 ? value.toFixed(1) : "0.0"}
      </span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PegawaiPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(INITIAL_PEGAWAI);

  const [query, setQuery] = useState("");
  const [seksiFilter, setSeksiFilter] = useState("Semua Seksi");
  const [statusFilter, setStatusFilter] = useState<"Semua" | StatusPegawai>(
    "Semua"
  );
  const [sortBy, setSortBy] = useState<"beban" | "nama" | "golongan">("beban");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new staff
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    jabatan: "Statistisi Ahli Pertama",
    seksi: "Statistik Sosial",
    golongan: "III/a",
    email: "",
    telepon: "",
    status: "Aktif" as StatusPegawai,
    bebanKerja: 3.0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = pegawaiList.length;
    const aktif = pegawaiList.filter((p) => p.status === "Aktif").length;
    const cuti = pegawaiList.filter((p) => p.status === "Cuti").length;
    const nonAktif = pegawaiList.filter((p) => p.status === "Non-Aktif").length;

    const aktifList = pegawaiList.filter((p) => p.status === "Aktif");
    const avgBeban =
      aktifList.reduce((acc, p) => acc + p.bebanKerja, 0) / (aktifList.length || 1);

    const availableCount = aktifList.filter((p) => p.bebanKerja < 5.0).length;

    return {
      total,
      aktif,
      cuti,
      nonAktif,
      avgBeban: avgBeban.toFixed(1),
      availableCount,
    };
  }, [pegawaiList]);

  // Filtered & Sorted
  const filteredPegawai = useMemo(() => {
    return pegawaiList
      .filter((p) => {
        const matchQuery = [p.nama, p.nip, p.jabatan, p.seksi, p.email]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchSeksi =
          seksiFilter === "Semua Seksi" || p.seksi === seksiFilter;
        const matchStatus =
          statusFilter === "Semua" || p.status === statusFilter;
        return matchQuery && matchSeksi && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "beban") {
          return sortOrder === "asc"
            ? a.bebanKerja - b.bebanKerja
            : b.bebanKerja - a.bebanKerja;
        }
        if (sortBy === "nama") {
          return sortOrder === "asc"
            ? a.nama.localeCompare(b.nama)
            : b.nama.localeCompare(a.nama);
        }
        // golongan
        return sortOrder === "asc"
          ? a.golongan.localeCompare(b.golongan)
          : b.golongan.localeCompare(a.golongan);
      });
  }, [pegawaiList, query, seksiFilter, statusFilter, sortBy, sortOrder]);

  const handleCreatePegawai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nip.trim()) return;

    const names = formData.nama.split(" ");
    const inisial =
      names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0].slice(0, 2).toUpperCase();

    const colors = [
      "bg-[#0d73a5]",
      "bg-[#059669]",
      "bg-[#d97706]",
      "bg-[#7c3aed]",
      "bg-[#2563eb]",
      "bg-[#ea580c]",
    ];
    const warna = colors[Math.floor(Math.random() * colors.length)];

    const newPegawai: Pegawai = {
      id: `peg-${Date.now()}`,
      nama: formData.nama,
      nip: formData.nip,
      jabatan: formData.jabatan,
      seksi: formData.seksi,
      golongan: formData.golongan,
      email: formData.email || `${formData.nama.toLowerCase().replace(/\s+/g, ".")}@bps.go.id`,
      telepon: formData.telepon || "0812-3456-7890",
      status: formData.status,
      bebanKerja: Number(formData.bebanKerja) || 2.0,
      inisial,
      warna,
      assignedActivitiesCount: 1,
    };

    setPegawaiList((prev) => [newPegawai, ...prev]);
    setIsModalOpen(false);
    showToast(`Data pegawai "${formData.nama}" berhasil ditambahkan.`);

    setFormData({
      nama: "",
      nip: "",
      jabatan: "Statistisi Ahli Pertama",
      seksi: "Statistik Sosial",
      golongan: "III/a",
      email: "",
      telepon: "",
      status: "Aktif",
      bebanKerja: 3.0,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Nama Pegawai",
      "NIP",
      "Jabatan",
      "Seksi/Unit",
      "Golongan",
      "Email",
      "Telepon",
      "Status",
      "Beban Kerja",
    ];
    const rows = pegawaiList.map((p) => [
      `"${p.nama.replace(/"/g, '""')}"`,
      `"${p.nip}"`,
      `"${p.jabatan}"`,
      `"${p.seksi}"`,
      `"${p.golongan}"`,
      `"${p.email}"`,
      `"${p.telepon}"`,
      p.status,
      p.bebanKerja,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SISAR_MATITI_Daftar_Pegawai_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data pegawai berhasil diekspor ke CSV.");
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
                  Manajemen Pegawai &amp; Sumber Daya
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{metrics.aktif} Pegawai Aktif</span>
              </div>

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

          {/* ── MAIN CONTENT ── */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1">
            {/* Header Greeting & Action Bar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Data Pegawai BPS Teluk Bintuni
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Kelola struktur penugasan, data kontak kedinasan, dan status beban
                  kerja seluruh pegawai.
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
                  <span>+ Tambah Pegawai</span>
                </Button>
              </div>
            </div>

            {/* ── KPI METRICS CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Total Pegawai */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Total Pegawai</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-[#003b70]">
                      <Users className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {metrics.total}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">Orang</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  BPS Kabupaten Teluk Bintuni (2026)
                </div>
              </div>

              {/* Status Kepegawaian */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Status Kepegawaian</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <UserCheck className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-700">
                      {metrics.aktif}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Aktif ({Math.round((metrics.aktif / (metrics.total || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-amber-700 font-medium">{metrics.cuti} Cuti</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-700 font-medium">
                    {metrics.nonAktif} Non-Aktif
                  </span>
                </div>
              </div>

              {/* Rata-rata Beban Kerja */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Rata-Rata Beban Kerja</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Briefcase className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {metrics.avgBeban}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">/ 10.0 Poin</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-medium">
                  Taraf beban kantor dalam rentang ideal (4.0 - 7.5)
                </div>
              </div>

              {/* Kapasitas Penugasan Tersedia */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-amber-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Kapasitas Tersedia</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Award className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-amber-700">
                      {metrics.availableCount}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">Pegawai Siap</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  Dapat dialokasikan untuk survei tambahan TW IV
                </div>
              </div>
            </div>

            {/* ── TABLE CONTAINER WITH SEARCH & FILTERS ── */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* Filter Toolbar */}
              <div className="border-b border-slate-200/80 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari nama pegawai, NIP, seksi, jabatan..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#003b70] focus:bg-white focus:ring-2 focus:ring-[#003b70]/20 transition"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Seksi Filter */}
                  <div className="relative">
                    <select
                      value={seksiFilter}
                      onChange={(e) => setSeksiFilter(e.target.value)}
                      aria-label="Filter Seksi Kerja"
                      className="h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                    >
                      {SEKSI_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                    {(["Semua", "Aktif", "Cuti", "Non-Aktif"] as const).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            statusFilter === st
                              ? "bg-[#003b70] text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>

                  {/* Sort Order Selector */}
                  <div className="relative">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [f, o] = e.target.value.split("-") as [
                          "beban" | "nama" | "golongan",
                          "asc" | "desc",
                        ];
                        setSortBy(f);
                        setSortOrder(o);
                      }}
                      aria-label="Urutkan Pegawai"
                      className="h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                    >
                      <option value="beban-desc">Beban Tertinggi</option>
                      <option value="beban-asc">Beban Terendah</option>
                      <option value="nama-asc">Nama (A-Z)</option>
                      <option value="golongan-desc">Golongan Tertinggi</option>
                    </select>
                    <ArrowUpDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Counter Indicator */}
              <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Menampilkan <strong className="text-slate-800">{filteredPegawai.length}</strong> dari {pegawaiList.length} pegawai
                </span>
                <span>BPS Kabupaten Teluk Bintuni</span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 pl-6 pr-4">Pegawai</th>
                      <th className="py-3.5 px-4">NIP</th>
                      <th className="py-3.5 px-4">Seksi / Unit</th>
                      <th className="py-3.5 px-4">Golongan</th>
                      <th className="py-3.5 px-4">Kontak Dinas</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Indeks Beban Kerja</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 pr-6 pl-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPegawai.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedPegawai(p)}
                      >
                        {/* Nama & Avatar */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${p.warna} text-xs font-bold text-white shadow-xs`}
                            >
                              {p.inisial}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-[#003b70] transition-colors">
                                {p.nama}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {p.jabatan}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* NIP */}
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {p.nip}
                        </td>

                        {/* Seksi */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200/60">
                            {p.seksi}
                          </span>
                        </td>

                        {/* Golongan */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {p.golongan}
                          </span>
                        </td>

                        {/* Kontak */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-[11px]">
                            <a
                              href={`mailto:${p.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-[#003b70] hover:underline"
                            >
                              <Mail className="size-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{p.email}</span>
                            </a>
                            <a
                              href={`tel:${p.telepon}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-[#003b70] font-mono"
                            >
                              <Phone className="size-3 text-slate-400 shrink-0" />
                              <span>{p.telepon}</span>
                            </a>
                          </div>
                        </td>

                        {/* Beban Kerja */}
                        <td className="py-4 px-4">
                          <BebanKerjaBar value={p.bebanKerja} />
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {p.assignedActivitiesCount} kegiatan aktif
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadgePegawai status={p.status} />
                        </td>

                        {/* Action View */}
                        <td className="py-4 pr-6 pl-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPegawai(p);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            aria-label="Lihat profil detail"
                          >
                            <Eye className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredPegawai.length === 0 && (
                  <div className="py-16 text-center text-slate-500">
                    <Users className="size-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      Pegawai tidak ditemukan
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tidak ada pegawai yang sesuai dengan filter atau kata kunci saat ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSeksiFilter("Semua Seksi");
                        setStatusFilter("Semua");
                      }}
                      className="mt-3 text-xs text-[#003b70] font-semibold hover:underline cursor-pointer"
                    >
                      Reset Filter Pencarian
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL: + TAMBAH PEGAWAI ── */}
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
                    Tambah Pegawai Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input data personil BPS Kabupaten Teluk Bintuni
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

            <form onSubmit={handleCreatePegawai} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label htmlFor="nama" className="font-semibold text-slate-700">
                  Nama Lengkap beserta Gelar *
                </Label>
                <Input
                  id="nama"
                  required
                  placeholder="Contoh: Dwi Ayu Lestari, A.Md."
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="h-9 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="nip" className="font-semibold text-slate-700">
                    NIP Pegawai (18 Digit) *
                  </Label>
                  <Input
                    id="nip"
                    required
                    placeholder="Contoh: 19860312 200903 2 005"
                    value={formData.nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nip: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="golongan" className="font-semibold text-slate-700">
                    Pangkat / Golongan *
                  </Label>
                  <select
                    id="golongan"
                    value={formData.golongan}
                    onChange={(e) =>
                      setFormData({ ...formData, golongan: e.target.value })
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70]"
                  >
                    {GOLONGAN_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="jabatan" className="font-semibold text-slate-700">
                    Jabatan Fungsional / Struktural *
                  </Label>
                  <Input
                    id="jabatan"
                    required
                    placeholder="Contoh: Statistisi Ahli Muda"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="seksi" className="font-semibold text-slate-700">
                    Seksi / Unit Kerja *
                  </Label>
                  <select
                    id="seksi"
                    value={formData.seksi}
                    onChange={(e) =>
                      setFormData({ ...formData, seksi: e.target.value })
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70]"
                  >
                    <option value="Statistik Sosial">Statistik Sosial</option>
                    <option value="Statistik Produksi">Statistik Produksi</option>
                    <option value="Statistik Distribusi">Statistik Distribusi</option>
                    <option value="IPDS">IPDS</option>
                    <option value="Nerwilis">Nerwilis</option>
                    <option value="Subbagian Umum">Subbagian Umum</option>
                    <option value="Pimpinan">Pimpinan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="font-semibold text-slate-700">
                    Email Dinas BPS
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@bps.go.id"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="telepon" className="font-semibold text-slate-700">
                    No. WhatsApp / HP
                  </Label>
                  <Input
                    id="telepon"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.telepon}
                    onChange={(e) =>
                      setFormData({ ...formData, telepon: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="status" className="font-semibold text-slate-700">
                    Status Kepegawaian
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StatusPegawai,
                      })
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="beban" className="font-semibold text-slate-700">
                    Beban Kerja Awal (0.0 - 10.0)
                  </Label>
                  <Input
                    id="beban"
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={formData.bebanKerja}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bebanKerja: Number(e.target.value),
                      })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
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
                  Simpan Pegawai
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DETAIL PROFIL PEGAWAI ── */}
      {selectedPegawai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${selectedPegawai.warna} text-sm font-bold text-white shadow-xs`}
                >
                  {selectedPegawai.inisial}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {selectedPegawai.nama}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    NIP. {selectedPegawai.nip}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPegawai(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Jabatan</span>
                <span className="font-semibold text-slate-900">
                  {selectedPegawai.jabatan}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Seksi / Unit Kerja</span>
                <span className="font-semibold text-slate-900">
                  {selectedPegawai.seksi}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Pangkat / Golongan</span>
                <span className="font-bold text-slate-800">
                  {selectedPegawai.golongan}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email Resmi</span>
                <a
                  href={`mailto:${selectedPegawai.email}`}
                  className="font-medium text-[#003b70] hover:underline"
                >
                  {selectedPegawai.email}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Telepon / WhatsApp</span>
                <a
                  href={`tel:${selectedPegawai.telepon}`}
                  className="font-mono font-medium text-slate-800 hover:underline"
                >
                  {selectedPegawai.telepon}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 items-center">
                <span className="text-slate-500">Beban Kerja Saat Ini</span>
                <div className="flex items-center gap-2">
                  <BebanKerjaBar value={selectedPegawai.bebanKerja} />
                  <span className="font-bold text-slate-900">
                    ({selectedPegawai.assignedActivitiesCount} Kegiatan)
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500">Status Kepegawaian</span>
                <StatusBadgePegawai status={selectedPegawai.status} />
              </div>
            </div>

            {/* Quick Status Toggle */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => {
                  const nextStatus: StatusPegawai =
                    selectedPegawai.status === "Aktif"
                      ? "Cuti"
                      : selectedPegawai.status === "Cuti"
                      ? "Non-Aktif"
                      : "Aktif";

                  setPegawaiList((prev) =>
                    prev.map((p) =>
                      p.id === selectedPegawai.id
                        ? { ...p, status: nextStatus }
                        : p
                    )
                  );
                  setSelectedPegawai((prev) =>
                    prev ? { ...prev, status: nextStatus } : null
                  );
                  showToast(
                    `Status ${selectedPegawai.nama} diubah menjadi "${nextStatus}".`
                  );
                }}
                className="h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs cursor-pointer font-medium"
              >
                Ubah Status: {selectedPegawai.status} &rarr;
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPegawai(null)}
                className="h-8 rounded-lg text-xs cursor-pointer"
              >
                Tutup
              </Button>
            </div>
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
