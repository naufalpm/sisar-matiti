"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Layers,
  Menu,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types
export interface ActivityItem {
  id: string;
  name: string;
  team:
    | "Statistik Sosial"
    | "Statistik Produksi"
    | "Statistik Distribusi"
    | "Nerwilis"
    | "IPDS"
    | "Subbagian Umum";
  owner: string;
  targetCurrent: number;
  targetTotal: number;
  unit: string;
  quality: "Baik" | "Cukup" | "Sangat Baik";
  deadline: string;
  dueDate: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED" | "DELAYED";
  weight: number;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    name: "Survei Sosial Ekonomi Nasional (Susenas)",
    team: "Statistik Sosial",
    owner: "Dwi Ayu Lestari, A.Md.",
    targetCurrent: 35,
    targetTotal: 50,
    unit: "Responden",
    quality: "Baik",
    deadline: "30 Jun 2026",
    dueDate: "2026-06-30",
    status: "IN_PROGRESS",
    weight: 2.5,
  },
  {
    id: "act-2",
    name: "Pendataan Potensi Desa (Podes)",
    team: "Statistik Produksi",
    owner: "Budi Santoso, S.Tr.Stat.",
    targetCurrent: 128,
    targetTotal: 128,
    unit: "Desa",
    quality: "Sangat Baik",
    deadline: "15 Jun 2026",
    dueDate: "2026-06-15",
    status: "COMPLETED",
    weight: 3.0,
  },
  {
    id: "act-3",
    name: "Sakernas Semester I 2026",
    team: "Statistik Sosial",
    owner: "Rina Kartika, S.Si.",
    targetCurrent: 42,
    targetTotal: 60,
    unit: "Blok Sensus",
    quality: "Cukup",
    deadline: "12 Jun 2026",
    dueDate: "2026-06-12",
    status: "DELAYED",
    weight: 2.0,
  },
  {
    id: "act-4",
    name: "Sensus Ekonomi: Listing Usaha Regional",
    team: "Statistik Produksi",
    owner: "Andi Pratama, S.E.",
    targetCurrent: 86,
    targetTotal: 100,
    unit: "Usaha",
    quality: "Baik",
    deadline: "28 Jul 2026",
    dueDate: "2026-07-28",
    status: "IN_PROGRESS",
    weight: 2.5,
  },
  {
    id: "act-5",
    name: "Penyusunan Metadata & Standar Data Statistik",
    team: "IPDS",
    owner: "Fajar Nugroho, S.Kom.",
    targetCurrent: 18,
    targetTotal: 18,
    unit: "Dataset",
    quality: "Sangat Baik",
    deadline: "05 Agu 2026",
    dueDate: "2026-08-05",
    status: "COMPLETED",
    weight: 1.5,
  },
  {
    id: "act-6",
    name: "Survei Harga Konsumen Pasar Sentral Bintuni",
    team: "Statistik Distribusi",
    owner: "Siti Nurhaliza, S.Stat.",
    targetCurrent: 24,
    targetTotal: 30,
    unit: "Komoditas",
    quality: "Cukup",
    deadline: "10 Jun 2026",
    dueDate: "2026-06-10",
    status: "DELAYED",
    weight: 1.5,
  },
  {
    id: "act-7",
    name: "Penyusunan Publikasi Kabupaten Teluk Bintuni Dalam Angka 2026",
    team: "IPDS",
    owner: "Fajar Nugroho, S.Kom.",
    targetCurrent: 14,
    targetTotal: 14,
    unit: "Bab Publikasi",
    quality: "Sangat Baik",
    deadline: "28 Feb 2026",
    dueDate: "2026-02-28",
    status: "COMPLETED",
    weight: 3.5,
  },
  {
    id: "act-8",
    name: "Penghitungan Produk Domestik Regional Bruto (PDRB)",
    team: "Nerwilis",
    owner: "Hendrik Wambrauw, M.E.",
    targetCurrent: 12,
    targetTotal: 17,
    unit: "Sektor Lapangan Usaha",
    quality: "Baik",
    deadline: "15 Agu 2026",
    dueDate: "2026-08-15",
    status: "IN_PROGRESS",
    weight: 3.0,
  },
];

const STAFF_MEMBERS = [
  {
    name: "Dwi Ayu Lestari, A.Md.",
    role: "Statistik Sosial",
    score: 8.6,
    activitiesCount: 4,
    capacity: "Tinggi",
    color: "bg-[#0d73a5]",
  },
  {
    name: "Budi Santoso, S.Tr.Stat.",
    role: "Statistik Produksi",
    score: 7.8,
    activitiesCount: 4,
    capacity: "Ideal",
    color: "bg-[#059669]",
  },
  {
    name: "Rina Kartika, S.Si.",
    role: "Statistik Sosial",
    score: 6.9,
    activitiesCount: 3,
    capacity: "Ideal",
    color: "bg-[#d97706]",
  },
  {
    name: "Andi Pratama, S.E.",
    role: "Statistik Produksi",
    score: 6.2,
    activitiesCount: 3,
    capacity: "Ideal",
    color: "bg-[#2563eb]",
  },
  {
    name: "Fajar Nugroho, S.Kom.",
    role: "IPDS",
    score: 5.6,
    activitiesCount: 2,
    capacity: "Ideal",
    color: "bg-[#7c3aed]",
  },
  {
    name: "Siti Nurhaliza, S.Stat.",
    role: "Statistik Distribusi",
    score: 4.7,
    activitiesCount: 2,
    capacity: "Tersedia",
    color: "bg-[#db2777]",
  },
];

const TEAMS_LIST = [
  "Semua Tim",
  "Statistik Sosial",
  "Statistik Produksi",
  "Statistik Distribusi",
  "Nerwilis",
  "IPDS",
  "Subbagian Umum",
] as const;

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activitiesList, setActivitiesList] =
    useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"activities" | "workload">(
    "activities"
  );
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "IN_PROGRESS" | "COMPLETED" | "DELAYED"
  >("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("Semua Tim");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "deadline">("deadline");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new activity
  const [formData, setFormData] = useState({
    name: "",
    team: "Statistik Sosial" as ActivityItem["team"],
    owner: "",
    targetCurrent: 0,
    targetTotal: 100,
    unit: "Dokumen",
    quality: "Baik" as ActivityItem["quality"],
    deadline: "",
    status: "IN_PROGRESS" as ActivityItem["status"],
    weight: 2.0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = activitiesList.length;
    const completed = activitiesList.filter((a) => a.status === "COMPLETED").length;
    const inProgress = activitiesList.filter((a) => a.status === "IN_PROGRESS").length;
    const delayed = activitiesList.filter((a) => a.status === "DELAYED").length;

    const totalPercentage =
      activitiesList.reduce((acc, a) => {
        const pct = a.targetTotal > 0 ? (a.targetCurrent / a.targetTotal) * 100 : 0;
        return acc + Math.min(100, pct);
      }, 0) / (total || 1);

    const totalWeight = activitiesList.reduce((acc, a) => acc + a.weight, 0);

    return {
      total,
      completed,
      inProgress,
      delayed,
      avgProgress: totalPercentage.toFixed(1),
      totalWeight: totalWeight.toFixed(1),
      staffCount: STAFF_MEMBERS.length,
    };
  }, [activitiesList]);

  // Filtered & Sorted Activities
  const filteredActivities = useMemo(() => {
    return activitiesList
      .filter((item) => {
        // Status filter
        if (statusFilter !== "ALL" && item.status !== statusFilter) {
          return false;
        }
        // Team filter
        if (selectedTeam !== "Semua Tim" && item.team !== selectedTeam) {
          return false;
        }
        // Query search
        if (searchQuery.trim()) {
          const match =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.team.toLowerCase().includes(searchQuery.toLowerCase());
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortBy === "progress") {
          const pctA = (a.targetCurrent / a.targetTotal) * 100;
          const pctB = (b.targetCurrent / b.targetTotal) * 100;
          return sortOrder === "asc" ? pctA - pctB : pctB - pctA;
        }
        // deadline
        return sortOrder === "asc"
          ? a.dueDate.localeCompare(b.dueDate)
          : b.dueDate.localeCompare(a.dueDate);
      });
  }, [activitiesList, statusFilter, selectedTeam, searchQuery, sortBy, sortOrder]);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      name: formData.name,
      team: formData.team,
      owner: formData.owner || "Pegawai Pelaksana",
      targetCurrent: Number(formData.targetCurrent) || 0,
      targetTotal: Number(formData.targetTotal) || 1,
      unit: formData.unit || "Target",
      quality: formData.quality,
      deadline: formData.deadline || "31 Des 2026",
      dueDate: formData.deadline || "2026-12-31",
      status: formData.status,
      weight: Number(formData.weight) || 1.5,
    };

    setActivitiesList((prev) => [newActivity, ...prev]);
    setIsModalOpen(false);
    showToast(`Kegiatan "${formData.name}" berhasil ditambahkan.`);

    // Reset
    setFormData({
      name: "",
      team: "Statistik Sosial",
      owner: "",
      targetCurrent: 0,
      targetTotal: 100,
      unit: "Dokumen",
      quality: "Baik",
      deadline: "",
      status: "IN_PROGRESS",
      weight: 2.0,
    });
  };

  const handleExportData = () => {
    const headers = [
      "Nama Kegiatan",
      "Tim",
      "Penanggung Jawab",
      "Realisasi",
      "Target",
      "Satuan",
      "Deadline",
      "Status",
      "Bobot",
    ];
    const rows = activitiesList.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.team}"`,
      `"${a.owner}"`,
      a.targetCurrent,
      a.targetTotal,
      `"${a.unit}"`,
      `"${a.deadline}"`,
      a.status,
      a.weight,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SISAR_MATITI_Monitoring_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data monitoring kegiatan berhasil diekspor ke CSV.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased font-sans">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

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
                  Dashboard Monitoring &amp; Akuntabilitas
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tahun Anggaran 2026</span>
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

          {/* ── MAIN DASHBOARD VIEW ── */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1">
            {/* Header Greeting & Action Toolbar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Ringkasan Kinerja Regional
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Supervisi progres pelaksanaan survei, sensus, dan penugasan pegawai
                  secara presisi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
                >
                  <Download className="size-3.5 text-slate-500" />
                  <span>Unduh Data CSV</span>
                </button>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 px-4 rounded-xl bg-[#003b70] hover:bg-[#002c54] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="size-4" />
                  <span>+ Tambah Kegiatan</span>
                </Button>
              </div>
            </div>

            {/* ── KPI METRICS CARDS (Zero AI Slop - High Data Density) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1: Total Kegiatan */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Total Kegiatan 2026</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-[#003b70]">
                      <Layers className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {metrics.total}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">Survei / Tugas</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {metrics.completed} Selesai
                    </span>
                    <span className="text-blue-700 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-blue-500" />
                      {metrics.inProgress} Berjalan
                    </span>
                    <span className="text-rose-700 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-rose-500" />
                      {metrics.delayed} Delayed
                    </span>
                  </div>
                  {/* Micro Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${(metrics.completed / (metrics.total || 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${(metrics.inProgress / (metrics.total || 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${(metrics.delayed / (metrics.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Rata-Rata Realisasi Kinerja */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Realisasi Kinerja</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {metrics.avgProgress}%
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-0.5">
                      +4.2% MoM
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                    <span>Ketercapaian Kuantitatif Output</span>
                    <span className="font-semibold text-slate-700">Target 80%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Number(metrics.avgProgress))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Pegawai Aktif */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Pegawai Aktif</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Users className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {metrics.staffCount}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Insan BPS Bintuni
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Total Bobot Kerja:</span>
                  <span className="font-bold text-slate-800">
                    {metrics.totalWeight} Poin
                  </span>
                </div>
              </div>

              {/* Card 4: Indeks Kualitas Supervisi */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-amber-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                    <span>Indeks Kualitas &amp; Mutu</span>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Award className="size-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      4.6
                    </span>
                    <span className="text-xs text-slate-600 font-medium">/ 5.0 (Tinggi)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Standar Data Statistik:</span>
                  <span className="font-bold text-emerald-700">100% Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* ── MAIN CONTENT CONTAINER ── */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* Top View Selector & Search Controls */}
              <div className="border-b border-slate-200/80 p-4 sm:p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white">
                {/* View Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 w-fit text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("activities")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "activities"
                        ? "bg-white text-[#003b70] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Monitoring Kegiatan ({activitiesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("workload")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "workload"
                        ? "bg-white text-[#003b70] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Distribusi Beban Kerja
                  </button>
                </div>

                {/* Filters */}
                {activeTab === "activities" && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative min-w-[200px] sm:min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari survei, seksi, nama..."
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none placeholder:text-slate-600 focus:border-[#003b70] focus:ring-2 focus:ring-[#003b70]/20 transition"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Team Filter Dropdown */}
                    <div className="relative">
                      <select
                        aria-label="Filter berdasarkan Tim Kerja"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="h-9 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                      >
                        {TEAMS_LIST.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort Order Selector */}
                    <div className="relative">
                      <select
                        aria-label="Urutkan data kegiatan"
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split("-") as [
                            "name" | "progress" | "deadline",
                            "asc" | "desc",
                          ];
                          setSortBy(field);
                          setSortOrder(order);
                        }}
                        className="h-9 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70] transition appearance-none cursor-pointer"
                      >
                        <option value="deadline-asc">Deadline Terdekat</option>
                        <option value="deadline-desc">Deadline Terjauh</option>
                        <option value="progress-desc">Progres Tertinggi</option>
                        <option value="progress-asc">Progres Terendah</option>
                        <option value="name-asc">Nama (A-Z)</option>
                      </select>
                      <ArrowUpDown className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Segment Filters Bar */}
              {activeTab === "activities" && (
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-slate-600 font-semibold mr-1 text-[11px] uppercase tracking-wider">
                    Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      statusFilter === "ALL"
                        ? "bg-[#003b70] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Semua ({metrics.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("IN_PROGRESS")}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      statusFilter === "IN_PROGRESS"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    Berjalan ({metrics.inProgress})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("COMPLETED")}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      statusFilter === "COMPLETED"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    Selesai ({metrics.completed})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("DELAYED")}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      statusFilter === "DELAYED"
                        ? "bg-rose-600 text-white"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    }`}
                  >
                    Delayed ({metrics.delayed})
                  </button>
                </div>
              )}

              {/* ── TAB 1: DATA TABLE ── */}
              {activeTab === "activities" ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 pl-6 pr-4">Nama Kegiatan / Survei</th>
                        <th className="py-3.5 px-4">Tim Kerja</th>
                        <th className="py-3.5 px-4">Penanggung Jawab</th>
                        <th className="py-3.5 px-4">Tenggat Waktu</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Progres Realisasi</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Mutu</th>
                        <th className="py-3.5 pr-6 pl-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredActivities.map((item) => {
                        const progressPercent = Math.min(
                          100,
                          Math.round(
                            (item.targetCurrent / (item.targetTotal || 1)) * 100
                          )
                        );

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                            onClick={() => setSelectedActivity(item)}
                          >
                            {/* Title & Info */}
                            <td className="py-4 pl-6 pr-4">
                              <div className="font-semibold text-slate-900 group-hover:text-[#003b70] transition-colors leading-snug">
                                {item.name}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-600">
                                Bobot Kegiatan:{" "}
                                <span className="font-semibold text-slate-700">
                                  {item.weight}
                                </span>
                              </div>
                            </td>

                            {/* Team */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                                {item.team}
                              </span>
                            </td>

                            {/* Owner */}
                            <td className="py-4 px-4">
                              <div className="font-medium text-slate-800">
                                {item.owner}
                              </div>
                              <div className="text-[10px] text-slate-600">
                                Ketua Tim / Pelaksana
                              </div>
                            </td>

                            {/* Due Date */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                <Calendar className="size-3.5 text-slate-600" />
                                <span>{item.deadline}</span>
                              </div>
                            </td>

                            {/* Progress Bar & Target */}
                            <td className="py-4 px-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-800">
                                    {progressPercent}%
                                  </span>
                                  <span className="text-slate-600">
                                    {item.targetCurrent} / {item.targetTotal}{" "}
                                    {item.unit}
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      item.status === "COMPLETED"
                                        ? "bg-emerald-500"
                                        : item.status === "DELAYED"
                                        ? "bg-rose-500"
                                        : "bg-[#0d73a5]"
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              {item.status === "COMPLETED" && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold text-[11px] hover:bg-emerald-100">
                                  <CheckCircle2 className="size-3 text-emerald-600" />
                                  <span>Selesai</span>
                                </Badge>
                              )}
                              {item.status === "IN_PROGRESS" && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200/80 font-semibold text-[11px] hover:bg-blue-100">
                                  <Clock className="size-3 text-blue-600" />
                                  <span>Berjalan</span>
                                </Badge>
                              )}
                              {item.status === "DELAYED" && (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-200/80 font-semibold text-[11px] hover:bg-rose-100">
                                  <AlertCircle className="size-3 text-rose-600" />
                                  <span>Delayed</span>
                                </Badge>
                              )}
                              {item.status === "PLANNED" && (
                                <Badge
                                  variant="outline"
                                  className="text-slate-600 border-slate-300 font-medium text-[11px]"
                                >
                                  Direncanakan
                                </Badge>
                              )}
                            </td>

                            {/* Quality */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  item.quality === "Sangat Baik"
                                    ? "bg-emerald-100/70 text-emerald-800"
                                    : item.quality === "Baik"
                                    ? "bg-blue-100/70 text-blue-800"
                                    : "bg-amber-100/70 text-amber-800"
                                }`}
                              >
                                {item.quality}
                              </span>
                            </td>

                            {/* Action Button */}
                            <td className="py-4 pr-6 pl-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedActivity(item);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                aria-label="Lihat rincian kegiatan"
                              >
                                <Eye className="size-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredActivities.length === 0 && (
                    <div className="py-16 text-center text-slate-600">
                      <Layers className="size-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        Tidak ada kegiatan yang cocok
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Coba ubah kata kunci pencarian atau sesuaikan filter status.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("ALL");
                          setSelectedTeam("Semua Tim");
                        }}
                        className="mt-3 text-xs text-[#003b70] font-semibold hover:underline cursor-pointer"
                      >
                        Reset Semua Filter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── TAB 2: DISTRIBUSI BEBAN KERJA ── */
                <div className="p-6 grid gap-8 lg:grid-cols-12 items-start">
                  {/* Left Column: Staff Bar Visualizer */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Alokasi Beban per Pegawai BPS Bintuni
                        </h3>
                        <p className="text-xs text-slate-600">
                          Berdasarkan akumulasi bobot kegiatan aktif yang dibebankan.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        6 Penanggung Jawab
                      </span>
                    </div>

                    <div className="space-y-4 pt-1">
                      {STAFF_MEMBERS.map((staff) => {
                        const scorePercent = (staff.score / 10) * 100;
                        return (
                          <div
                            key={staff.name}
                            className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div>
                                <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                  {staff.name}
                                </span>
                                <span className="ml-2 text-xs text-slate-600">
                                  • {staff.role}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    staff.capacity === "Tinggi"
                                      ? "bg-rose-100 text-rose-800"
                                      : staff.capacity === "Ideal"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {staff.capacity}
                                </span>
                                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                  {staff.score}
                                </span>
                              </div>
                            </div>

                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${staff.color}`}
                                style={{ width: `${scorePercent}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-600">
                              <span>Menangani {staff.activitiesCount} kegiatan</span>
                              <span>Kapasitas beban: {scorePercent.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: AI / Algorithmic Distribution Insight */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                        <Sparkles className="size-4 text-[#d97706]" />
                        <span>Analisis Distribusi Beban Kerja</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Beban tertinggi saat ini berada pada{" "}
                        <strong className="text-slate-900">
                          Dwi Ayu Lestari, A.Md.
                        </strong>{" "}
                        dengan akumulasi 8.6 poin (Statistik Sosial), mendekati batas
                        ambang maksimum (9.0).
                      </p>
                      <div className="p-3 rounded-xl bg-white border border-blue-200/80 text-xs text-slate-800 space-y-1.5">
                        <div className="font-semibold text-[#003b70] flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          Rekomendasi Manajerial:
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Disarankan meredistribusi tugas verifikasi atau pendampingan
                          lapangan ke staf seksi <strong>IPDS</strong> atau{" "}
                          <strong>Statistik Distribusi</strong> yang memiliki kapasitas
                          tersedia (skor di bawah 5.5).
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 p-5 space-y-3 bg-white">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <span>Standar Indeks Beban Kerja BPS</span>
                        <span className="text-[10px] text-slate-600">Perka BPS 2026</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="text-emerald-800 font-medium">Beban Ideal (4.0 - 7.5)</span>
                          <span className="font-bold text-emerald-800">67% Pegawai</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                          <span className="text-amber-800 font-medium">Beban Ringan (&lt; 4.0)</span>
                          <span className="font-bold text-amber-800">17% Pegawai</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100">
                          <span className="text-rose-800 font-medium">Beban Tinggi (&gt; 7.5)</span>
                          <span className="font-bold text-rose-800">16% Pegawai</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL: + TAMBAH KEGIATAN ── */}
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
                    Tambah Kegiatan / Survei Baru
                  </h3>
                  <p className="text-xs text-slate-600">
                    Input rincian target statistik SISAR MATITI 2026
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
              {/* Judul Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="title" className="font-semibold text-slate-700">
                  Nama Kegiatan / Survei *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="Contoh: Survei Angkatan Kerja Nasional (Sakernas) 2026"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-9 rounded-xl border-slate-200 text-xs"
                />
              </div>

              {/* Tim Penanggung Jawab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="team" className="font-semibold text-slate-700">
                    Tim Penanggung Jawab *
                  </Label>
                  <select
                    id="team"
                    value={formData.team}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        team: e.target.value as ActivityItem["team"],
                      })
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70]"
                  >
                    <option value="Statistik Sosial">Statistik Sosial</option>
                    <option value="Statistik Produksi">Statistik Produksi</option>
                    <option value="Statistik Distribusi">Statistik Distribusi</option>
                    <option value="Nerwilis">Nerwilis</option>
                    <option value="IPDS">IPDS</option>
                    <option value="Subbagian Umum">Subbagian Umum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="owner" className="font-semibold text-slate-700">
                    Penanggung Jawab / Katim
                  </Label>
                  <Input
                    id="owner"
                    placeholder="Contoh: Dwi Ayu Lestari, A.Md."
                    value={formData.owner}
                    onChange={(e) =>
                      setFormData({ ...formData, owner: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Target Kuantitatif */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="current" className="font-semibold text-slate-700">
                    Realisasi Awal
                  </Label>
                  <Input
                    id="current"
                    type="number"
                    min="0"
                    value={formData.targetCurrent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetCurrent: Number(e.target.value),
                      })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="total" className="font-semibold text-slate-700">
                    Total Target *
                  </Label>
                  <Input
                    id="total"
                    type="number"
                    min="1"
                    required
                    value={formData.targetTotal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetTotal: Number(e.target.value),
                      })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="unit" className="font-semibold text-slate-700">
                    Satuan Target
                  </Label>
                  <Input
                    id="unit"
                    placeholder="Responden, Desa..."
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Deadline & Bobot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="deadline" className="font-semibold text-slate-700">
                    Tenggat Waktu (Due Date) *
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
                  <Label htmlFor="weight" className="font-semibold text-slate-700">
                    Bobot Beban Kerja (1.0 - 5.0)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    min="1.0"
                    max="5.0"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: Number(e.target.value),
                      })
                    }
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label htmlFor="status" className="font-semibold text-slate-700">
                  Status Pelaksanaan
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ActivityItem["status"],
                    })
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#003b70]"
                >
                  <option value="IN_PROGRESS">Sedang Berjalan (IN_PROGRESS)</option>
                  <option value="COMPLETED">Selesai (COMPLETED)</option>
                  <option value="PLANNED">Direncanakan (PLANNED)</option>
                  <option value="DELAYED">Terlambat / Tertunda (DELAYED)</option>
                </select>
              </div>

              {/* Action Buttons */}
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
                  Simpan Kegiatan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RINCIAN DETAIL KEGIATAN ── */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedActivity.team}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {selectedActivity.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Penanggung Jawab</span>
                <span className="font-semibold text-slate-900">
                  {selectedActivity.owner}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Tenggat Waktu</span>
                <span className="font-semibold text-slate-900">
                  {selectedActivity.deadline}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Realisasi Output</span>
                <span className="font-bold text-slate-900">
                  {selectedActivity.targetCurrent} / {selectedActivity.targetTotal}{" "}
                  {selectedActivity.unit} (
                  {Math.round(
                    (selectedActivity.targetCurrent /
                      (selectedActivity.targetTotal || 1)) *
                      100
                  )}
                  %)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Status Capaian</span>
                <span className="font-semibold">{selectedActivity.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Bobot Beban Kerja</span>
                <span className="font-bold text-blue-700">
                  {selectedActivity.weight} Poin
                </span>
              </div>
            </div>

            {/* Quick Action: Mark as Complete */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              {selectedActivity.status !== "COMPLETED" ? (
                <Button
                  type="button"
                  onClick={() => {
                    setActivitiesList((prev) =>
                      prev.map((a) =>
                        a.id === selectedActivity.id
                          ? {
                              ...a,
                              status: "COMPLETED",
                              targetCurrent: a.targetTotal,
                            }
                          : a
                      )
                    );
                    setSelectedActivity(null);
                    showToast(
                      `Kegiatan "${selectedActivity.name}" ditandai selesai!`
                    );
                  }}
                  className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer font-medium"
                >
                  <CheckCircle2 className="size-3.5 mr-1" /> Tandai Selesai
                </Button>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Kegiatan Sudah Selesai
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedActivity(null)}
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
