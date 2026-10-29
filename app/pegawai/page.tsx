"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Mail,
  Menu,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";

// ── Data ────────────────────────────────────────────────────────────────────

type Status = "Aktif" | "Cuti" | "Non-Aktif";

interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  seksi: string;
  golongan: string;
  email: string;
  telepon: string;
  status: Status;
  bebanKerja: number;
  inisial: string;
  warna: string;
}

const PEGAWAI_DATA: Pegawai[] = [
  { id: "1", nip: "19860312 200903 2 005", nama: "Dwi Ayu Lestari", jabatan: "Statistisi Ahli Muda", seksi: "Statistik Sosial", golongan: "III/c", email: "d.ayu@bps.go.id", telepon: "081234567001", status: "Aktif", bebanKerja: 8.6, inisial: "DA", warna: "bg-[#0c6e9d]" },
  { id: "2", nip: "19881105 201001 1 003", nama: "Budi Santoso", jabatan: "Statistisi Ahli Pertama", seksi: "Statistik Produksi", golongan: "III/b", email: "b.santoso@bps.go.id", telepon: "081234567002", status: "Aktif", bebanKerja: 7.8, inisial: "BS", warna: "bg-[#1d8a75]" },
  { id: "3", nip: "19900717 201212 2 001", nama: "Rina Kartika", jabatan: "Statistisi Ahli Pertama", seksi: "Statistik Sosial", golongan: "III/b", email: "r.kartika@bps.go.id", telepon: "081234567003", status: "Aktif", bebanKerja: 6.9, inisial: "RK", warna: "bg-[#d78c32]" },
  { id: "4", nip: "19870822 201101 1 002", nama: "Andi Pratama", jabatan: "Statistisi Ahli Muda", seksi: "Statistik Produksi", golongan: "III/c", email: "a.pratama@bps.go.id", telepon: "081234567004", status: "Aktif", bebanKerja: 6.2, inisial: "AP", warna: "bg-[#6486a7]" },
  { id: "5", nip: "19921230 201503 1 004", nama: "Fajar Nugroho", jabatan: "Pranata Komputer Pertama", seksi: "IPDS", golongan: "III/a", email: "f.nugroho@bps.go.id", telepon: "081234567005", status: "Aktif", bebanKerja: 5.6, inisial: "FN", warna: "bg-[#7d6ab2]" },
  { id: "6", nip: "19890504 201404 2 007", nama: "Siti Nurhaliza", jabatan: "Statistisi Terampil", seksi: "Statistik Distribusi", golongan: "II/d", email: "s.nurhaliza@bps.go.id", telepon: "081234567006", status: "Cuti", bebanKerja: 4.7, inisial: "SN", warna: "bg-[#bd6380]" },
  { id: "7", nip: "19950615 201803 1 001", nama: "Rizal Hakim", jabatan: "Statistisi Terampil", seksi: "Nerwilis", golongan: "II/c", email: "r.hakim@bps.go.id", telepon: "081234567007", status: "Aktif", bebanKerja: 3.5, inisial: "RH", warna: "bg-[#5b8a5e]" },
  { id: "8", nip: "19831128 200604 2 002", nama: "Sri Wahyuni", jabatan: "Kepala Subbagian Umum", seksi: "Subbagian Umum", golongan: "III/d", email: "s.wahyuni@bps.go.id", telepon: "081234567008", status: "Aktif", bebanKerja: 4.2, inisial: "SW", warna: "bg-[#8a6040]" },
  { id: "9", nip: "19780902 200003 1 001", nama: "Dr. Hendra Kusuma", jabatan: "Kepala BPS Kabupaten", seksi: "Pimpinan", golongan: "IV/b", email: "h.kusuma@bps.go.id", telepon: "081234567009", status: "Aktif", bebanKerja: 2.0, inisial: "HK", warna: "bg-[#003b70]" },
  { id: "10", nip: "19961210 202001 2 003", nama: "Anisa Rahmawati", jabatan: "Staf Administrasi", seksi: "Subbagian Umum", golongan: "II/b", email: "a.rahmawati@bps.go.id", telepon: "081234567010", status: "Non-Aktif", bebanKerja: 0, inisial: "AR", warna: "bg-[#9e7bb5]" },
];

const SEKSI_OPTIONS = ["Semua Seksi", "Statistik Sosial", "Statistik Produksi", "Statistik Distribusi", "IPDS", "Nerwilis", "Subbagian Umum", "Pimpinan"];
const STATUS_OPTIONS: ("Semua" | Status)[] = ["Semua", "Aktif", "Cuti", "Non-Aktif"];

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: Status }) {
  const cfg = {
    Aktif: "bg-[#e3f5ed] text-[#24815b]",
    Cuti: "bg-[#fff4dd] text-[#9b6f22]",
    "Non-Aktif": "bg-[#f5e3e3] text-[#9b2222]",
  };
  const dot = {
    Aktif: "bg-[#42b982]",
    Cuti: "bg-[#e5a52b]",
    "Non-Aktif": "bg-[#e06666]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${cfg[status]}`}>
      <span className={`size-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function BebanBar({ value }: { value: number }) {
  const pct = Math.min((value / 10) * 100, 100);
  const color = value >= 7 ? "bg-[#e77575]" : value >= 5 ? "bg-[#e5a52b]" : "bg-[#54bd8b]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#edf1f4]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-[#526b7f] tabular-nums">{value > 0 ? value.toFixed(1) : "—"}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PegawaiPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [seksiFilter, setSeksiFilter] = useState("Semua Seksi");
  const [statusFilter, setStatusFilter] = useState<"Semua" | Status>("Semua");

  const filtered = useMemo(() => {
    return PEGAWAI_DATA.filter((p) => {
      const matchQuery = [p.nama, p.nip, p.jabatan, p.seksi, p.email].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchSeksi = seksiFilter === "Semua Seksi" || p.seksi === seksiFilter;
      const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
      return matchQuery && matchSeksi && matchStatus;
    });
  }, [query, seksiFilter, statusFilter]);

  const totalAktif = PEGAWAI_DATA.filter((p) => p.status === "Aktif").length;
  const totalCuti = PEGAWAI_DATA.filter((p) => p.status === "Cuti").length;
  const totalNonAktif = PEGAWAI_DATA.filter((p) => p.status === "Non-Aktif").length;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#19344d]">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="min-w-0 flex-1">
          {/* ── Header ── */}
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
                  Selasa, 28 Oktober 2026
                </div>
                <h1 className="mt-0.5 text-[18px] font-bold tracking-[-0.02em] text-[#19344d]">
                  Daftar Pegawai
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
                <div className="flex size-8 items-center justify-center rounded-full bg-[#f1c27d] text-[10px] font-bold text-[#704111]">AR</div>
                <span className="text-[12px] font-semibold text-[#4e667a]">Naufal</span>
                <ChevronDown className="size-3.5 text-[#97a5b1]" />
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-8 lg:px-10 lg:py-7">
            {/* ── Page Title + Action ── */}
            <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <div>
                <h2 className="text-[24px] font-bold tracking-[-0.04em] text-[#19344d]">
                  Manajemen Pegawai
                </h2>
                <p className="mt-1 text-[13px] text-[#7d8d9e]">
                  Data seluruh pegawai BPS Kabupaten Teluk Bintuni.
                </p>
              </div>
              <button
                id="btn-tambah-pegawai"
                className="flex h-10 w-fit items-center gap-2 rounded-lg bg-[#e5a52b] px-4 text-[12px] font-semibold text-[#19344d] shadow-sm shadow-[#e5a52b]/20 hover:bg-[#d9951e] transition-colors"
              >
                <Plus className="size-4" /> Tambah Pegawai
              </button>
            </div>

            {/* ── Stat Cards ── */}
            <section
              aria-label="Ringkasan pegawai"
              className="mb-6 grid gap-4 sm:grid-cols-3"
            >
              {/* Total */}
              <div className="rounded-2xl border border-[#e6ebf1] bg-white p-5 shadow-[0_2px_10px_rgba(32,63,92,0.03)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 text-[12px] font-medium text-[#718096]">Total Pegawai</div>
                    <div className="text-[26px] font-bold tracking-tight text-[#19344d]">{PEGAWAI_DATA.length}</div>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#e7f0f7] text-[#12628e]">
                    <Users className="size-[18px]" />
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#8492a3]">BPS Kabupaten Teluk Bintuni</div>
              </div>

              {/* Aktif */}
              <div className="rounded-2xl border border-[#e6ebf1] bg-white p-5 shadow-[0_2px_10px_rgba(32,63,92,0.03)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 text-[12px] font-medium text-[#718096]">Pegawai Aktif</div>
                    <div className="text-[26px] font-bold tracking-tight text-[#19344d]">{totalAktif}</div>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#e8f6ee] text-[#29966f]">
                    <UserCheck className="size-[18px]" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8492a3]">
                  <span className="font-semibold text-[#29966f]">{totalCuti} Cuti</span>
                  <span className="text-[#c7d0d7]">•</span>
                  <span className="font-semibold text-[#d25656]">{totalNonAktif} Non-Aktif</span>
                </div>
              </div>

              {/* Beban rata-rata */}
              <div className="rounded-2xl border border-[#e6ebf1] bg-white p-5 shadow-[0_2px_10px_rgba(32,63,92,0.03)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 text-[12px] font-medium text-[#718096]">Rata-rata Beban Kerja</div>
                    <div className="text-[26px] font-bold tracking-tight text-[#19344d]">
                      {(PEGAWAI_DATA.filter((p) => p.bebanKerja > 0).reduce((s, p) => s + p.bebanKerja, 0) / PEGAWAI_DATA.filter((p) => p.bebanKerja > 0).length).toFixed(1)}
                    </div>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#fff2da] text-[#cb8b20]">
                    <MoreHorizontal className="size-[18px]" />
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#8492a3]">Indeks bobot kerja per pegawai</div>
              </div>
            </section>

            {/* ── Table Card ── */}
            <div className="rounded-2xl border border-[#e6ebf1] bg-white shadow-[0_2px_10px_rgba(32,63,92,0.03)]">
              {/* Toolbar */}
              <div className="flex flex-col gap-3 border-b border-[#edf0f3] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                {/* Search */}
                <label className="relative flex-1">
                  <span className="sr-only">Cari pegawai</span>
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8fa0ae]" />
                  <input
                    id="search-pegawai"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari nama, NIP, jabatan..."
                    className="h-9 w-full rounded-lg border border-[#dfe6ed] bg-[#f8fafc] pl-9 pr-3 text-[12px] outline-none placeholder:text-[#a5b1bc] focus:border-[#4380a8] focus:bg-white"
                  />
                </label>

                {/* Filter Seksi */}
                <select
                  id="filter-seksi"
                  value={seksiFilter}
                  onChange={(e) => setSeksiFilter(e.target.value)}
                  className="h-9 rounded-lg border border-[#dfe6ed] bg-white px-3 text-[12px] text-[#516a7e] outline-none focus:border-[#4380a8]"
                >
                  {SEKSI_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>

                {/* Filter Status */}
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                        statusFilter === s
                          ? "bg-[#003b70] text-white"
                          : "bg-[#f1f5f8] text-[#5e7a8c] hover:bg-[#e4ecf2]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div className="border-b border-[#f0f3f5] px-6 py-2.5 text-[11px] text-[#8a9aaa]">
                Menampilkan <strong className="text-[#4b6478]">{filtered.length}</strong> dari {PEGAWAI_DATA.length} pegawai
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#96a4b0]">
                      <th className="px-6 py-3.5">Pegawai</th>
                      <th className="px-4 py-3.5">NIP</th>
                      <th className="px-4 py-3.5">Seksi / Unit</th>
                      <th className="px-4 py-3.5">Golongan</th>
                      <th className="px-4 py-3.5">Kontak</th>
                      <th className="px-4 py-3.5">Beban Kerja</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-14 text-center text-sm text-[#8b9aa8]">
                          Tidak ada pegawai yang cocok dengan filter ini.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-[#f0f3f5] hover:bg-[#fbfcfd] transition-colors"
                        >
                          {/* Nama + Jabatan */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${p.warna} text-[11px] font-bold text-white`}>
                                {p.inisial}
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-[#304c62]">{p.nama}</div>
                                <div className="mt-0.5 text-[11px] text-[#8a9aaa]">{p.jabatan}</div>
                              </div>
                            </div>
                          </td>

                          {/* NIP */}
                          <td className="px-4 py-4 font-mono text-[11px] text-[#6f8393]">
                            {p.nip}
                          </td>

                          {/* Seksi */}
                          <td className="px-4 py-4">
                            <span className="inline-block rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] font-medium text-[#4b6478]">
                              {p.seksi}
                            </span>
                          </td>

                          {/* Golongan */}
                          <td className="px-4 py-4 text-[12px] font-bold text-[#526b7f]">
                            {p.golongan}
                          </td>

                          {/* Kontak */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#6f8393]">
                              <Mail className="size-3 shrink-0 text-[#9aabb8]" />
                              <span className="truncate max-w-[130px]">{p.email}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6f8393]">
                              <Phone className="size-3 shrink-0 text-[#9aabb8]" />
                              {p.telepon}
                            </div>
                          </td>

                          {/* Beban Kerja */}
                          <td className="px-4 py-4">
                            <BebanBar value={p.bebanKerja} />
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <StatusPill status={p.status} />
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <button
                              aria-label={`Menu untuk ${p.nama}`}
                              className="text-[#9aa9b5] hover:text-[#12628e] transition-colors"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="border-t border-[#f0f3f5] px-6 py-3 text-[10px] text-[#9aa8b3]">
                Data pegawai per Oktober 2026 · Sumber: Sistem Kepegawaian Internal BPS
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
