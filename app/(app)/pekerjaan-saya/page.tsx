import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Gauge, Scale, Hourglass } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { penugasanSaya } from "@/lib/data";
import { getAmbang, rekapBulan } from "@/lib/layanan/rekap";
import { fmtPersen, hitungProgres } from "@/lib/capaian";
import { batasKunci, fmtTanggal, hariIni, labelBulan, parsePeriode, selisihHari, sudahTerkunci } from "@/lib/waktu";
import { MonthPicker } from "@/components/sisar/client";
import { EmptyState, PageHeader, StatCard } from "@/components/sisar/ui";
import { TerkunciBadge } from "@/components/sisar/status";
import { cn } from "@/lib/utils";
import { ProgresCard, type ProgresItem } from "./progres-card";

export const metadata: Metadata = { title: "Pekerjaan Saya" };

const FILTER = [
  { v: "semua", l: "Semua" },
  { v: "aktif", l: "Perlu dikerjakan" },
  { v: "diajukan", l: "Menunggu approval" },
  { v: "selesai", l: "Selesai" },
  { v: "terlambat", l: "Terlambat" },
] as const;

export default async function PekerjaanSayaPage({ searchParams }: PageProps<"/pekerjaan-saya">) {
  const user = await requireUser();
  if (user.isKepala) redirect("/dashboard");
  const sp = await searchParams;
  const { tahun, bulan } = parsePeriode(sp.bulan);
  const filter = typeof sp.status === "string" ? sp.status : "semua";

  const [rows, rekap, ambang] = await Promise.all([penugasanSaya(user.id, tahun, bulan), rekapBulan(tahun, bulan), getAmbang()]);
  const saya = rekap.data.get(user.id);
  const today = hariIni();

  const items: ProgresItem[] = rows.map((r) => ({
    id: r.id,
    kegiatanId: r.kegiatanId,
    kegiatanNama: r.kegiatanNama,
    subNama: r.subNama,
    timNama: r.timNama,
    pekerjaanNama: r.pekerjaanNama,
    peran: r.peran,
    satuan: r.satuan,
    targetKualitatif: r.targetKualitatif,
    deadline: r.deadline,
    deadlineLabel: fmtTanggal(r.deadline),
    sisaHari: selisihHari(today, r.deadline),
    bobot: r.bobot,
    target: r.target,
    realisasiDiajukan: r.realisasiDiajukan,
    realisasiDisetujui: r.realisasiDisetujui,
    progres: hitungProgres(r.realisasiDisetujui, r.target),
    status: r.status,
    jenisApproval: r.jenisApproval,
    diverifikasiKepala: r.diverifikasiKepala,
    catatan: r.catatan,
    alasanTolak: r.alasanTolak,
    terlambat: r.terlambat,
    terkunci: r.terkunci,
  }));

  const tampil = items.filter((i) => {
    switch (filter) {
      case "aktif":
        return i.status === "belum" || i.status === "dikerjakan";
      case "diajukan":
        return i.status === "diajukan";
      case "selesai":
        return i.status === "selesai";
      case "terlambat":
        return i.terlambat;
      default:
        return true;
    }
  });
  const menunggu = items.filter((i) => i.status === "diajukan").length;
  const kode = `${tahun}-${String(bulan).padStart(2, "0")}`;

  return (
    <>
      <PageHeader
        eyebrow="Pekerjaan Saya"
        title={`Penugasan ${labelBulan(tahun, bulan)}`}
        description={
          sudahTerkunci(tahun, bulan)
            ? "Capaian bulan ini sudah dikunci untuk CKP."
            : `Batas input & approval bulan ini: ${fmtTanggal(batasKunci(tahun, bulan), true)}.`
        }
        actions={
          <>
            {rekap.terkunci ? <TerkunciBadge /> : null}
            <MonthPicker tahun={tahun} bulan={bulan} />
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Capaian bulan ini"
          value={fmtPersen(saya?.capaian ?? null)}
          icon={Gauge}
          tone={saya?.capaian == null ? "slate" : saya.capaian >= ambang ? "green" : "red"}
          hint={`Ambang ${ambang}% · dasar CKP`}
        />
        <StatCard label="Total bobot" value={saya?.beban ?? 0} icon={Scale} tone="orange" hint="Beban kerja bulan ini" />
        <StatCard label="Penugasan" value={items.length} icon={ClipboardList} tone="blue" />
        <StatCard label="Menunggu approval" value={menunggu} icon={Hourglass} tone="amber" />
      </div>

      <nav aria-label="Filter status" className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {FILTER.map((f) => (
          <Link
            key={f.v}
            href={`/pekerjaan-saya?bulan=${kode}&status=${f.v}`}
            aria-current={filter === f.v ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
              filter === f.v ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {f.l}
          </Link>
        ))}
      </nav>

      {tampil.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            title={items.length === 0 ? "Belum ada penugasan bulan ini" : "Tidak ada pekerjaan dengan status ini"}
            description={
              items.length === 0
                ? "Penugasan muncul di sini setelah Ketua Tim menugaskan Anda ke sebuah pekerjaan."
                : "Coba pilih filter lain."
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {tampil.map((i) => (
            <ProgresCard key={i.id} item={i} />
          ))}
        </div>
      )}
    </>
  );
}
