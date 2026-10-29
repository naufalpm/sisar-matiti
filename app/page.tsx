"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  Gauge,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";


const activities = [
  {
    name: "Survei Sosial Ekonomi Nasional (Susenas)",
    team: "Statistik Sosial",
    owner: "Dwi Ayu Lestari",
    target: "35 / 50 Responden",
    quality: "Baik",
    deadline: "30 Jun 2026",
    status: "Tepat Waktu",
    weight: "2.5",
  },
  {
    name: "Pendataan Potensi Desa (Podes)",
    team: "Statistik Produksi",
    owner: "Budi Santoso",
    target: "128 / 128 Desa",
    quality: "Baik",
    deadline: "15 Jun 2026",
    status: "Tepat Waktu",
    weight: "3.0",
  },
  {
    name: "Sakernas Semester I 2026",
    team: "Statistik Sosial",
    owner: "Rina Kartika",
    target: "42 / 60 Blok",
    quality: "Cukup",
    deadline: "12 Jun 2026",
    status: "Terlambat",
    weight: "2.0",
  },
  {
    name: "Sensus Ekonomi: Listing Usaha",
    team: "Statistik Produksi",
    owner: "Andi Pratama",
    target: "86 / 100 Usaha",
    quality: "Baik",
    deadline: "28 Jul 2026",
    status: "Tepat Waktu",
    weight: "2.0",
  },
  {
    name: "Update Metadata Statistik Sektoral",
    team: "IPDS",
    owner: "Fajar Nugroho",
    target: "18 / 18 Dataset",
    quality: "Baik",
    deadline: "05 Agu 2026",
    status: "Tepat Waktu",
    weight: "1.5",
  },
  {
    name: "Survei Harga Konsumen (SHK)",
    team: "Statistik Distribusi",
    owner: "Siti Nurhaliza",
    target: "24 / 30 Komoditas",
    quality: "Cukup",
    deadline: "10 Jun 2026",
    status: "Terlambat",
    weight: "1.5",
  },
];

const staff = [
  { name: "Dwi Ayu Lestari", role: "Statistik Sosial", value: 8.6, color: "bg-[#0c6e9d]" },
  { name: "Budi Santoso", role: "Statistik Produksi", value: 7.8, color: "bg-[#1d8a75]" },
  { name: "Rina Kartika", role: "Statistik Sosial", value: 6.9, color: "bg-[#d78c32]" },
  { name: "Andi Pratama", role: "Statistik Produksi", value: 6.2, color: "bg-[#6486a7]" },
  { name: "Fajar Nugroho", role: "IPDS", value: 5.6, color: "bg-[#7d6ab2]" },
  { name: "Siti Nurhaliza", role: "Statistik Distribusi", value: 4.7, color: "bg-[#bd6380]" },
];


function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  children,
  accent,
}: {
  title: string;
  value: string;
  detail: React.ReactNode;
  icon: typeof Activity;
  children?: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e6ebf1] bg-white p-5 shadow-[0_2px_10px_rgba(32,63,92,0.03)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-3 text-[12px] font-medium text-[#718096]">
            {title}
          </div>
          <div className="text-[26px] font-bold tracking-[-0.03em] text-[#19344d]">
            {value}
          </div>
        </div>
        <div
          className={`flex size-9 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon className="size-[18px]" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8492a3]">
        {detail}
      </div>
      {children}
    </div>
  );
}

function QualityBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ${
        value === "Baik"
          ? "bg-[#e3f5ed] text-[#24815b]"
          : "bg-[#fff1d7] text-[#b67715]"
      }`}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
        value === "Tepat Waktu"
          ? "bg-[#e3f5ed] text-[#24815b]"
          : "bg-[#ffebeb] text-[#c84c4c]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          value === "Tepat Waktu" ? "bg-[#42b982]" : "bg-[#e06666]"
        }`}
      />
      {value}
    </span>
  );
}

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"activities" | "workload">(
    "activities"
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      activities.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#19344d]">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

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
                  Selasa, 28 Oktober 2026
                </div>
                <h1 className="mt-0.5 text-[18px] font-bold tracking-[-0.02em] text-[#19344d]">
                  Ringkasan Eksekutif
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
                <div className="flex size-8 items-center justify-center rounded-full bg-[#f1c27d] text-[10px] font-bold text-[#704111]">
                  AR
                </div>
                <span className="text-[12px] font-semibold text-[#4e667a]">
                  Naufal
                </span>
                <ChevronDown className="size-3.5 text-[#97a5b1]" />
              </div>
            </div>
          </header>

          {/* ── Main Content ── */}
          <div className="p-5 sm:p-8 lg:px-10 lg:py-7">
            {/* Welcome + Toolbar */}
            <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <h2 className="text-[24px] font-bold tracking-[-0.04em] text-[#19344d]">
                  Selamat datang, Pak Naufal
                </h2>
                <p className="mt-1 text-[13px] text-[#7d8d9e]">
                  Pantau progres kegiatan dan beban kerja kantor secara
                  menyeluruh.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <label className="relative">
                  <span className="sr-only">Cari kegiatan</span>
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8fa0ae]" />
                  <input
                    id="search-kegiatan"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari kegiatan..."
                    className="h-10 w-full rounded-lg border border-[#dfe6ed] bg-white pl-9 pr-3 text-[12px] outline-none placeholder:text-[#a5b1bc] focus:border-[#4380a8] sm:w-[190px]"
                  />
                </label>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfe6ed] bg-white px-3 text-[12px] font-medium text-[#516a7e]">
                  <CalendarDays className="size-4 text-[#7290a6]" /> 2026{" "}
                  <ChevronDown className="size-3.5 text-[#9aabb8]" />
                </button>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfe6ed] bg-white px-3 text-[12px] font-medium text-[#516a7e]">
                  <SlidersHorizontal className="size-4 text-[#7290a6]" /> Semua
                  Tim <ChevronDown className="size-3.5 text-[#9aabb8]" />
                </button>
                <button
                  id="btn-kegiatan-baru"
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#e5a52b] px-4 text-[12px] font-semibold text-[#19344d] shadow-sm shadow-[#e5a52b]/20 hover:bg-[#d9951e]"
                >
                  <Plus className="size-4" /> Kegiatan Baru
                </button>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            <section
              aria-label="Ringkasan statistik"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StatCard
                title="Total Kegiatan / Survei"
                value="24"
                accent="bg-[#e7f0f7] text-[#12628e]"
                icon={ClipboardList}
                detail={
                  <>
                    <span className="font-semibold text-[#3186ad]">
                      +3 kegiatan
                    </span>{" "}
                    dari tahun lalu
                  </>
                }
              >
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-[#8b9aa8]">
                    <span>Progress keseluruhan</span>
                    <b className="text-[#637789]">68%</b>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#e8eef3]">
                    <div className="h-full w-[68%] rounded-full bg-[#2583ad]" />
                  </div>
                </div>
              </StatCard>

              <StatCard
                title="Status Capaian Waktu"
                value="19 / 5"
                accent="bg-[#e8f6ee] text-[#29966f]"
                icon={Activity}
                detail={
                  <>
                    <span className="font-semibold text-[#29966f]">
                      On-track
                    </span>
                    <span className="text-[#c7d0d7]">•</span>
                    <span className="font-semibold text-[#d25656]">
                      5 Terlambat
                    </span>
                  </>
                }
              >
                <div className="mt-3 flex gap-1">
                  <div className="h-1.5 flex-[19] rounded-full bg-[#54bd8b]" />
                  <div className="h-1.5 flex-[5] rounded-full bg-[#e77575]" />
                </div>
              </StatCard>

              <StatCard
                title="Rata-rata Kualitas"
                value="Baik"
                accent="bg-[#fff2da] text-[#cb8b20]"
                icon={Gauge}
                detail={
                  <>
                    <span>Skor rata-rata</span>
                    <span className="font-semibold text-[#bd7d17]">
                      4.2 / 5.0
                    </span>
                  </>
                }
              >
                <div className="mt-3 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 flex-1 rounded-full ${
                        n < 5 ? "bg-[#e5a52b]" : "bg-[#e8edf1]"
                      }`}
                    />
                  ))}
                </div>
              </StatCard>

              <StatCard
                title="Total Beban Kerja"
                value="38.6"
                accent="bg-[#eeeafd] text-[#7665b4]"
                icon={BarChart3}
                detail={
                  <>
                    <span>Indeks bobot pekerjaan</span>
                    <span className="font-semibold text-[#7665b4]">+8.4%</span>
                  </>
                }
              >
                <div className="mt-3 flex items-end gap-1">
                  <div className="h-2 w-1.5 rounded-sm bg-[#c9c2ec]" />
                  <div className="h-3.5 w-1.5 rounded-sm bg-[#aaa0dc]" />
                  <div className="h-2.5 w-1.5 rounded-sm bg-[#9689cf]" />
                  <div className="h-5 w-1.5 rounded-sm bg-[#7665b4]" />
                  <div className="h-4 w-1.5 rounded-sm bg-[#8879c4]" />
                  <div className="h-6 w-1.5 rounded-sm bg-[#7665b4]" />
                  <div className="h-7 w-1.5 rounded-sm bg-[#6452aa]" />
                </div>
              </StatCard>
            </section>

            {/* ── Main Table Section ── */}
            <section className="mt-7 rounded-2xl border border-[#e6ebf1] bg-white shadow-[0_2px_10px_rgba(32,63,92,0.03)]">
              {/* Table Header + Tabs */}
              <div className="flex flex-col gap-4 border-b border-[#edf0f3] px-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-[15px] font-bold text-[#19344d]">
                    Monitoring Kegiatan &amp; Beban Kerja
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8a9aaa]">
                    Data diperbarui terakhir pada 28 Oktober 2026, 08:45 WIB
                  </p>
                </div>
                <div className="flex gap-5">
                  <button
                    id="tab-monitoring-kegiatan"
                    onClick={() => setActiveTab("activities")}
                    className={`border-b-2 pb-3 text-[12px] font-semibold ${
                      activeTab === "activities"
                        ? "border-[#12628e] text-[#12628e]"
                        : "border-transparent text-[#92a0ad]"
                    }`}
                  >
                    Monitoring Kegiatan
                  </button>
                  <button
                    id="tab-beban-kerja"
                    onClick={() => setActiveTab("workload")}
                    className={`border-b-2 pb-3 text-[12px] font-semibold ${
                      activeTab === "workload"
                        ? "border-[#12628e] text-[#12628e]"
                        : "border-transparent text-[#92a0ad]"
                    }`}
                  >
                    Distribusi Beban Kerja
                  </button>
                </div>
              </div>

              {/* Tab: Monitoring Kegiatan */}
              {activeTab === "activities" ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-[#edf0f3] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#96a4b0]">
                        <th className="px-6 py-4">Nama Kegiatan / Survei</th>
                        <th className="px-4 py-4">Tim Kerja</th>
                        <th className="px-4 py-4">Penanggung Jawab</th>
                        <th className="px-4 py-4">Target Kuantitatif</th>
                        <th className="px-4 py-4">Kualitas</th>
                        <th className="px-4 py-4">Deadline</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Bobot</th>
                        <th className="px-5 py-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr
                          key={item.name}
                          className="border-b border-[#f0f3f5] last:border-0 hover:bg-[#fbfcfd]"
                        >
                          <td className="max-w-[225px] px-6 py-4 text-[12px] font-semibold leading-5 text-[#304c62]">
                            {item.name}
                          </td>
                          <td className="px-4 py-4 text-[11px] text-[#6f8393]">
                            {item.team}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-[11px] font-medium text-[#4b6478]">
                              {item.owner}
                            </div>
                            <div className="mt-0.5 text-[10px] text-[#a0adb8]">
                              Ketua Tim
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[11px] text-[#60788a]">
                            {item.target}
                          </td>
                          <td className="px-4 py-4">
                            <QualityBadge value={item.quality} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#60788a]">
                            {item.deadline}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge value={item.status} />
                          </td>
                          <td className="px-4 py-4 text-[12px] font-bold text-[#526b7f]">
                            {item.weight}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              aria-label={`Detail ${item.name}`}
                              className="text-[#9aa9b5] hover:text-[#12628e]"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="p-12 text-center text-sm text-[#8b9aa8]">
                      Kegiatan tidak ditemukan.
                    </div>
                  )}
                </div>
              ) : (
                /* Tab: Distribusi Beban Kerja */
                <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_1fr]">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-bold text-[#304c62]">
                          Beban kerja per pegawai
                        </div>
                        <div className="mt-1 text-[11px] text-[#8a9aaa]">
                          Akumulasi bobot seluruh kegiatan aktif
                        </div>
                      </div>
                      <span className="rounded-md bg-[#e7f0f7] px-2 py-1 text-[10px] font-semibold text-[#12628e]">
                        6 pegawai
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {staff.map((person) => (
                        <div key={person.name}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <div>
                              <span className="text-[12px] font-semibold text-[#496277]">
                                {person.name}
                              </span>
                              <span className="ml-2 text-[10px] text-[#9aa8b3]">
                                {person.role}
                              </span>
                            </div>
                            <span className="text-[12px] font-bold text-[#526b7f]">
                              {person.value}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#edf1f4]">
                            <div
                              className={`h-full rounded-full ${person.color}`}
                              style={{
                                width: `${(person.value / 10) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-h-[220px] flex-col justify-center rounded-xl bg-[#f8fafc] p-5">
                    <div className="mb-4 flex items-center gap-2 text-[12px] font-bold text-[#304c62]">
                      <Users className="size-4 text-[#12628e]" /> Insight
                      distribusi
                    </div>
                    <p className="text-[13px] leading-6 text-[#647b8d]">
                      Beban kerja tertinggi berada pada{" "}
                      <strong className="text-[#304c62]">
                        Dwi Ayu Lestari
                      </strong>{" "}
                      dengan 8.6 poin. Distribusi masih dalam batas sehat,
                      namun perlu perhatian pada selisih 3.9 poin dengan beban
                      terendah.
                    </p>
                    <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#fff4dd] p-3 text-[11px] text-[#9b6f22]">
                      <AlertTriangle className="size-4 shrink-0" />
                      Pertimbangkan redistribusi 1 kegiatan ke tim IPDS.
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between px-1 text-[10px] text-[#9aa8b3]">
              <span>
                <FileText className="mr-1 inline size-3.5" /> Sumber data:
                Sistem Internal BPS Kabupaten Teluk Bintuni
              </span>
              <span className="hidden sm:inline">Versi aplikasi 1.4.2</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
