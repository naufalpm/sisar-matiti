import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, History, Layers, Pencil, UserRound, Users, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { detailKegiatan } from "@/lib/data";
import { fmtPersen, hitungProgres } from "@/lib/capaian";
import { fmtTanggal, fmtWaktu, labelBulan } from "@/lib/waktu";
import { Button } from "@/components/ui/button";
import { urlFoto } from "@/lib/foto";
import { Avatar, EmptyState, HeroHeader, SectionCard } from "@/components/sisar/ui";
import { ApprovalBadge, BobotBadge, ProgressBar, StatusBadge, TerlambatBadge } from "@/components/sisar/status";

export const metadata: Metadata = { title: "Detail Kegiatan" };

const LABEL_AKSI: Record<string, string> = {
  ditugaskan: "menugaskan",
  target_diubah: "mengubah target",
  progres_diisi: "mengisi progres",
  diajukan: "mengajukan",
  disetujui: "meng-approve",
  ditolak: "menolak",
  unapprove: "membatalkan approval",
  self_approve: "self-approve",
  verifikasi_kepala: "memverifikasi (Kepala)",
  penugasan_dihapus: "menghapus penugasan",
};

const WARNA_AKSI: Record<string, string> = {
  disetujui: "bg-success",
  self_approve: "bg-violet",
  verifikasi_kepala: "bg-violet",
  ditolak: "bg-danger",
  unapprove: "bg-danger",
  diajukan: "bg-warning",
};

export default async function DetailKegiatanPage({ params }: PageProps<"/kegiatan/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const k = await detailKegiatan(user, Number(id));
  if (!k) notFound();

  const jumlahOrang = new Set(k.struktur.flatMap((s) => s.pekerjaan.flatMap((p) => p.penugasan.map((a) => a.pegawaiId)))).size;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
        <Link href="/kegiatan" className="hover:text-foreground hover:underline">
          Kegiatan
        </Link>{" "}
        / <span className="text-foreground">{k.nama}</span>
      </nav>
      <HeroHeader
        title={k.nama}
        description={k.keterangan ?? undefined}
        actions={
          k.akses.bisaKelola ? (
            <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href={`/kelola/${k.id}`}>
                <Pencil />
                Kelola kegiatan
              </Link>
            </Button>
          ) : null
        }
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              Tim {k.timNama}
            </span>
            <span className="flex items-center gap-1.5">
              <UserRound className="size-4" aria-hidden />
              PJ: {k.pjNama ?? "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarRange className="size-4" aria-hidden />
              {fmtTanggal(k.mulai)} – {fmtTanggal(k.selesai)}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-4" aria-hidden />
              {k.struktur.length} sub-kegiatan · {jumlahOrang} pegawai
            </span>
          </div>
          <div className="min-w-48 rounded-2xl bg-white/12 p-3 ring-1 ring-white/20">
            <p className="text-xs text-white/80">Progres kegiatan</p>
            <p className="tabular text-2xl font-bold">{fmtPersen(k.progres)}</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, k.progres ?? 0)}%` }} />
            </div>
          </div>
        </div>
      </HeroHeader>

      {!k.akses.lihatProgresSemua ? (
        <p className="mb-4 rounded-xl border bg-info-soft px-4 py-3 text-sm text-info">
          Anda melihat rekan yang terlibat di kegiatan ini. Progres dan capaian pribadi rekan tidak ditampilkan.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid content-start gap-6">
          {k.struktur.length === 0 ? (
            <div className="rounded-2xl border bg-card">
              <EmptyState title="Belum ada sub-kegiatan" description="Ketua Tim dapat menambahkan sub-kegiatan dan pekerjaan dari menu Kelola Kegiatan." />
            </div>
          ) : null}
          {k.struktur.map((s) => (
            <SectionCard
              key={s.id}
              title={s.nama}
              description={s.mulai || s.selesai ? `${fmtTanggal(s.mulai)} – ${fmtTanggal(s.selesai)}` : undefined}
              icon={Layers}
              tone="orange"
              bodyClassName="p-0 sm:p-0"
            >
              {s.pekerjaan.length === 0 ? (
                <EmptyState compact title="Belum ada pekerjaan" />
              ) : (
                <div className="divide-y">
                  {s.pekerjaan.map((p) => (
                    <div key={p.id} className="px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{p.nama}</h3>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="rounded-md bg-secondary px-1.5 py-0.5 font-semibold text-secondary-foreground">{p.peran}</span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="size-3.5" aria-hidden />
                              Deadline {fmtTanggal(p.deadline)}
                            </span>
                            <span>Target: {p.satuan ? `kuantitatif (${p.satuan})` : "1 kegiatan (selesai/belum)"}</span>
                          </p>
                          {p.targetKualitatif ? (
                            <p className="mt-1 text-xs text-muted-foreground">Kualitatif: {p.targetKualitatif}</p>
                          ) : null}
                        </div>
                        <BobotBadge bobot={p.bobot} />
                      </div>
                      {p.penugasan.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">Belum ada pegawai yang ditugaskan.</p>
                      ) : (
                        <ul className="mt-3 grid gap-2">
                          {p.penugasan.map((a) => (
                            <li key={a.id} className="rounded-xl border bg-background/60 p-3">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <Avatar nama={a.nama} foto={urlFoto(a.foto)} className="size-7 text-[10px]" />
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                  {a.nama}
                                  {a.pegawaiId === user.id ? <span className="ml-1 text-xs text-primary">(Anda)</span> : null}
                                </span>
                                {a.tampil ? (
                                  <span className="flex items-center gap-2">
                                    {a.terlambat ? <TerlambatBadge /> : null}
                                    <span className="tabular text-sm font-bold">{fmtPersen(a.progres)}</span>
                                  </span>
                                ) : null}
                              </div>
                              {a.tampil && a.targets.length ? (
                                <div className="mt-2.5 grid gap-2 sm:pl-9">
                                  {a.targets.map((t) => (
                                    <div key={t.id} className="grid gap-1 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-3">
                                      <span className="text-xs font-semibold text-muted-foreground">{labelBulan(t.tahun, t.bulan, true)}</span>
                                      <div className="flex items-center gap-2">
                                        <ProgressBar value={hitungProgres(t.realisasiDisetujui, t.target)} className="flex-1" />
                                        <span className="tabular w-20 text-right text-xs text-muted-foreground">
                                          {p.satuan ? `${t.realisasiDisetujui}/${t.target}` : t.realisasiDisetujui >= 1 ? "Selesai" : "Belum"}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        <StatusBadge status={t.status} />
                                        <ApprovalBadge jenis={t.jenisApproval} diverifikasi={t.diverifikasiKepala} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          ))}
        </div>

        <SectionCard
          title="Riwayat perubahan & approval"
          description={k.akses.lihatProgresSemua ? "100 aktivitas terakhir" : "Aktivitas penugasan Anda"}
          icon={History}
          tone="violet"
          className="self-start xl:sticky xl:top-20"
        >
          {k.riwayat.length === 0 ? (
            <EmptyState compact title="Belum ada riwayat" />
          ) : (
            <ol className="relative grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
              {k.riwayat.map((r) => {
                const d = (r.detail ?? {}) as { bulan?: number; tahun?: number; realisasi?: number; target?: number };
                return (
                  <li key={r.id} className="flex gap-3">
                    <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${WARNA_AKSI[r.aksi] ?? "bg-info"}`} aria-hidden />
                    <div className="min-w-0 text-sm">
                      <p>
                        <b>{r.olehNama}</b> {LABEL_AKSI[r.aksi] ?? r.aksi}{" "}
                        <span className="text-muted-foreground">
                          {r.olehNama === r.pegawaiNama ? "" : `${r.pegawaiNama} · `}
                          {r.pekerjaanNama}
                          {d.bulan && d.tahun ? ` (${labelBulan(d.tahun, d.bulan, true)})` : ""}
                          {d.realisasi != null && d.target != null ? ` — ${d.realisasi}/${d.target}` : ""}
                        </span>
                      </p>
                      {r.alasan ? <p className="mt-0.5 rounded-md bg-muted px-2 py-1 text-xs">Alasan: {r.alasan}</p> : null}
                      <p className="mt-0.5 text-xs text-muted-foreground">{fmtWaktu(r.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </SectionCard>
      </div>
    </>
  );
}
