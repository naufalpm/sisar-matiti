import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Hourglass, CheckCircle2, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { antreanApproval, selfApproved, sudahDisetujuiTimSaya, type Baris } from "@/lib/data";
import { hitungProgres } from "@/lib/capaian";
import { fmtTanggal, fmtWaktu, labelBulan, parsePeriode } from "@/lib/waktu";
import { MonthPicker } from "@/components/sisar/client";
import { PageHeader, SectionCard } from "@/components/sisar/ui";
import { urlFoto } from "@/lib/foto";
import { cn } from "@/lib/utils";
import { AntreanList, DisetujuiList, SelfApprovedList, type ApprovalRow } from "./approval-list";

export const metadata: Metadata = { title: "Approval" };

function toRow(r: Baris, userId: number): ApprovalRow {
  return {
    id: r.id,
    pegawaiNama: r.pegawaiNama,
    pegawaiFoto: urlFoto(r.pegawaiFoto),
    pekerjaanNama: r.pekerjaanNama,
    peran: r.peran,
    kegiatanId: r.kegiatanId,
    kegiatanNama: r.kegiatanNama,
    subNama: r.subNama,
    periode: labelBulan(r.tahun, r.bulan, true),
    deadlineLabel: fmtTanggal(r.deadline),
    satuan: r.satuan,
    target: r.target,
    realisasiDiajukan: r.realisasiDiajukan,
    realisasiDisetujui: r.realisasiDisetujui,
    progresDiajukan: hitungProgres(r.realisasiDiajukan, r.target),
    progresDisetujui: hitungProgres(r.realisasiDisetujui, r.target),
    status: r.status,
    jenisApproval: r.jenisApproval,
    diverifikasiKepala: r.diverifikasiKepala,
    catatan: r.catatan,
    terlambat: r.terlambat,
    terkunci: r.terkunci,
    diajukanLabel: fmtWaktu(r.diajukanAt),
    disetujuiLabel: fmtWaktu(r.disetujuiAt),
    bobot: r.bobot,
    bisaUnapprove: r.ketuaId === userId,
  };
}

export default async function ApprovalPage({ searchParams }: PageProps<"/approval">) {
  const user = await requireUser();
  if (!user.isKetuaTim && !user.isPJ && !user.isKepala) redirect("/terlarang");
  const sp = await searchParams;
  const { tahun, bulan } = parsePeriode(sp.bulan);
  const kode = `${tahun}-${String(bulan).padStart(2, "0")}`;

  const tabs = [
    ...(user.isKetuaTim || user.isPJ ? [{ v: "antrean", l: "Menunggu keputusan", Icon: Hourglass }] : []),
    ...(user.isKetuaTim ? [{ v: "disetujui", l: "Sudah di-approve", Icon: CheckCircle2 }] : []),
    ...(user.isKepala ? [{ v: "self", l: "Self-approved Ketua Tim", Icon: ShieldCheck }] : []),
  ];
  const tab = tabs.find((t) => t.v === sp.tab)?.v ?? tabs[0]?.v;

  const [antrean, disetujui, self] = await Promise.all([
    tab === "antrean" ? antreanApproval(user) : Promise.resolve([]),
    tab === "disetujui" ? sudahDisetujuiTimSaya(user, tahun, bulan) : Promise.resolve([]),
    tab === "self" ? selfApproved(tahun, bulan) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Approval"
        title="Antrean approval"
        description="Progres baru sah dan dihitung ke capaian setelah di-approve Ketua Tim pemilik kegiatan atau PJ Kegiatan."
        actions={tab !== "antrean" ? <MonthPicker tahun={tahun} bulan={bulan} /> : null}
      />
      <nav aria-label="Jenis approval" className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => (
          <Link
            key={t.v}
            href={`/approval?tab=${t.v}&bulan=${kode}`}
            aria-current={tab === t.v ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
              tab === t.v ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            <t.Icon className="size-4" aria-hidden />
            {t.l}
          </Link>
        ))}
      </nav>

      {tab === "antrean" ? (
        <SectionCard
          title={`${antrean.length} pengajuan menunggu`}
          description="Dari kegiatan di tim Anda atau kegiatan yang Anda pegang sebagai PJ"
          icon={Hourglass}
          tone="amber"
          bodyClassName="p-0 sm:p-0"
        >
          <AntreanList rows={antrean.map((r) => toRow(r, user.id))} />
        </SectionCard>
      ) : null}
      {tab === "disetujui" ? (
        <SectionCard
          title={`Approval di tim Anda — ${labelBulan(tahun, bulan)}`}
          description="Hanya Ketua Tim yang dapat membatalkan approval (unapprove) dengan alasan."
          icon={CheckCircle2}
          tone="green"
          bodyClassName="p-0 sm:p-0"
        >
          <DisetujuiList rows={disetujui.map((r) => toRow(r, user.id))} />
        </SectionCard>
      ) : null}
      {tab === "self" ? (
        <SectionCard
          title={`Pekerjaan Ketua Tim yang di-self-approve — ${labelBulan(tahun, bulan)}`}
          description="Progres sudah sah. Verifikasi Kepala bersifat opsional dan mengubah tanda menjadi Diverifikasi Kepala."
          icon={ShieldCheck}
          tone="violet"
          bodyClassName="p-0 sm:p-0"
        >
          <SelfApprovedList rows={self.map((r) => toRow(r, user.id))} />
        </SectionCard>
      ) : null}
    </>
  );
}
