import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, FolderKanban, UserRound, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { kegiatanTerlihat } from "@/lib/data";
import { fmtPersen } from "@/lib/capaian";
import { bulanIni, fmtTanggal, hariIni } from "@/lib/waktu";
import { EmptyState, PageHeader } from "@/components/sisar/ui";
import { ProgressBar } from "@/components/sisar/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Kegiatan" };

export default async function KegiatanPage({ searchParams }: PageProps<"/kegiatan">) {
  const user = await requireUser();
  const sp = await searchParams;
  const tahunIni = bulanIni().tahun;
  const tahun = Number(sp.tahun) > 2000 ? Number(sp.tahun) : tahunIni;
  const rows = await kegiatanTerlihat(user, { tahun });
  const today = hariIni();
  const semua = user.isKepala || user.isAdmin;

  return (
    <>
      <PageHeader
        eyebrow={semua ? "Semua kegiatan kantor" : "Kegiatan yang Saya Ikuti"}
        title={`Kegiatan ${tahun}`}
        description={
          semua
            ? "Seluruh kegiatan dalam tahun berjalan beserta tim, PJ, periode, dan progresnya."
            : "Kegiatan tempat Anda punya penugasan, menjadi PJ, atau yang dimiliki tim Anda."
        }
        actions={
          <div className="flex gap-1 rounded-xl border bg-card p-1">
            {[tahunIni - 1, tahunIni, tahunIni + 1].map((y) => (
              <Link
                key={y}
                href={`/kegiatan?tahun=${y}`}
                aria-current={y === tahun ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-8 items-center rounded-lg px-3 text-sm font-semibold",
                  y === tahun ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {y}
              </Link>
            ))}
          </div>
        }
      />
      {rows.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState title="Belum ada kegiatan" description="Kegiatan muncul setelah Ketua Tim membuatnya dan menugaskan pegawai." />
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((k) => {
            const berjalan = k.mulai <= today && k.selesai >= today;
            const selesai = k.selesai < today;
            return (
              <li key={k.id}>
                <Link
                  href={`/kegiatan/${k.id}`}
                  className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-info-soft text-info">
                      <FolderKanban className="size-5" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        berjalan ? "bg-success-soft text-success" : selesai ? "bg-muted text-muted-foreground" : "bg-info-soft text-info",
                      )}
                    >
                      {berjalan ? "Berjalan" : selesai ? "Selesai" : "Akan datang"}
                    </span>
                  </div>
                  <h2 className="mt-3 font-semibold text-balance group-hover:text-primary">{k.nama}</h2>
                  <p className="text-xs text-muted-foreground">
                    Tim {k.timNama} · {k.jumlahPekerjaan} pekerjaan
                  </p>
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarRange className="size-3.5" aria-hidden />
                      {fmtTanggal(k.mulai)} – {fmtTanggal(k.selesai)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserRound className="size-3.5" aria-hidden />
                      PJ: {k.pjNama ?? "—"}
                    </span>
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progres (disetujui)</span>
                      <span className="tabular font-bold">{fmtPersen(k.progres)}</span>
                    </div>
                    <ProgressBar value={k.progres} />
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Lihat detail <ChevronRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
