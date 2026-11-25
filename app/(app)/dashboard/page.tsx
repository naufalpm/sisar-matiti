import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Hourglass,
  Loader,
  Scale,
  TrendingDown,
} from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { deadlineMendatang, jumlahBelumBerbobot, kegiatanTerlihat, pegawaiAktif, ringkasanBulan, timBesarPegawai } from "@/lib/data";
import { getAmbang, rekapBulan } from "@/lib/layanan/rekap";
import { fmtPersen } from "@/lib/capaian";
import { fmtTanggal, hariIni, labelBulan, parsePeriode, selisihHari } from "@/lib/waktu";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/sisar/client";
import { Avatar, EmptyState, PageHeader, SectionCard, StatCard } from "@/components/sisar/ui";
import { urlFoto } from "@/lib/foto";
import { ProgressBar, TerkunciBadge } from "@/components/sisar/status";

export const metadata: Metadata = { title: "Dashboard Kepala" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  if (!user.isKepala && !user.isAdmin) redirect("/terlarang");
  const sp = await searchParams;
  const { tahun, bulan } = parsePeriode(sp.bulan);

  const [ringkas, rekap, ambang, kegiatan, deadline, pegawai, timBesar, belumBerbobot] = await Promise.all([
    ringkasanBulan(tahun, bulan),
    rekapBulan(tahun, bulan),
    getAmbang(),
    kegiatanTerlihat(user, { tahun }),
    deadlineMendatang(7),
    pegawaiAktif(),
    timBesarPegawai(tahun),
    jumlahBelumBerbobot(),
  ]);

  const namaPegawai = new Map(pegawai.map((p) => [p.id, p.nama]));
  const fotoPegawai = new Map(pegawai.map((p) => [p.id, urlFoto(p.foto)]));
  const rekapList = [...rekap.data.values()].filter((r) => namaPegawai.has(r.pegawaiId));
  const bawahAmbang = rekapList
    .filter((r) => r.capaian != null && r.capaian < ambang)
    .sort((a, b) => (a.capaian ?? 0) - (b.capaian ?? 0));
  const beban = rekapList.slice().sort((a, b) => b.beban - a.beban || b.jumlahPenugasan - a.jumlahPenugasan);
  const maxBeban = Math.max(1, ...beban.map((b) => b.beban));
  const today = hariIni();

  return (
    <>
      <PageHeader
        eyebrow="Dashboard Kepala"
        title={`Ringkasan ${labelBulan(tahun, bulan)}`}
        description="Pantau progres, deadline, beban kerja, dan capaian bulanan seluruh pegawai."
        actions={
          <>
            {rekap.terkunci ? <TerkunciBadge /> : null}
            <MonthPicker tahun={tahun} bulan={bulan} />
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Kegiatan aktif" value={ringkas.kegiatanAktif} icon={FolderKanban} tone="blue" href="/kegiatan" />
        <StatCard label="Pekerjaan selesai" value={ringkas.selesai} icon={CheckCircle2} tone="green" hint={`dari ${ringkas.total} penugasan`} />
        <StatCard label="Berjalan" value={ringkas.berjalan} icon={Loader} tone="violet" />
        <StatCard label="Menunggu approval" value={ringkas.menunggu} icon={Hourglass} tone="amber" />
        <StatCard label="Terlambat" value={ringkas.terlambat} icon={AlertTriangle} tone="red" />
      </div>

      {belumBerbobot > 0 && user.isKepala ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-orange/30 bg-brand-orange-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm">
            <Scale className="size-5 shrink-0 text-[oklch(0.55_0.15_50)]" aria-hidden />
            <span>
              <b>{belumBerbobot} pekerjaan belum berbobot</b> — belum dihitung ke beban kerja.
            </span>
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/bobot">
              Tetapkan bobot <ArrowRight />
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Pegawai di bawah ambang"
          description={`Capaian ${labelBulan(tahun, bulan, true)} < ${ambang}% — daftar perhatian`}
          icon={TrendingDown}
          tone="red"
          bodyClassName="p-0 sm:p-0"
        >
          {bawahAmbang.length === 0 ? (
            <EmptyState compact title="Semua pegawai mencapai ambang" description="Tidak ada pegawai dengan capaian di bawah ambang bulan ini." />
          ) : (
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-semibold sm:px-5">Pegawai</th>
                    <th className="px-3 py-2 font-semibold">Capaian</th>
                    <th className="px-4 py-2 text-right font-semibold sm:px-5">Pekerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bawahAmbang.map((r) => (
                    <tr key={r.pegawaiId}>
                      <td className="px-4 py-2.5 sm:px-5">
                        <span className="flex items-center gap-2">
                          <Avatar nama={namaPegawai.get(r.pegawaiId)!} foto={fotoPegawai.get(r.pegawaiId)} className="size-7 text-[10px]" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{namaPegawai.get(r.pegawaiId)}</span>
                            <span className="block truncate text-xs text-muted-foreground">Tim {timBesar.get(r.pegawaiId) ?? "—"}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex min-w-32 items-center gap-2">
                          <ProgressBar value={r.capaian} ambang={ambang} className="flex-1" />
                          <span className="tabular w-12 text-right font-bold text-danger">{fmtPersen(r.capaian, 0)}</span>
                        </div>
                      </td>
                      <td className="tabular px-4 py-2.5 text-right sm:px-5">{r.jumlahPenugasan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Deadline 7 hari ke depan"
          description="Pekerjaan yang belum selesai"
          icon={CalendarClock}
          tone="amber"
          bodyClassName="p-0 sm:p-0"
        >
          {deadline.length === 0 ? (
            <EmptyState compact title="Tidak ada deadline dalam 7 hari" />
          ) : (
            <ul className="max-h-96 divide-y overflow-y-auto">
              {deadline.map((d) => {
                const sisa = selisihHari(today, d.deadline);
                return (
                  <li key={d.penugasanId} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                    <span
                      className={`tabular flex w-12 shrink-0 flex-col items-center rounded-lg py-1 text-center ${sisa <= 2 ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}
                    >
                      <span className="text-sm leading-none font-bold">{sisa === 0 ? "Hari" : sisa}</span>
                      <span className="text-[10px]">{sisa === 0 ? "ini" : "hari"}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.pekerjaanNama}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {d.pegawaiNama} · Tim {d.timNama} · {fmtTanggal(d.deadline)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Peta beban kerja"
          description={`Total bobot per pegawai — ${labelBulan(tahun, bulan, true)}, tertinggi di atas`}
          icon={Scale}
          tone="orange"
        >
          {beban.length === 0 ? (
            <EmptyState compact title="Belum ada penugasan di bulan ini" />
          ) : (
            <>
              <ol className="grid max-h-[28rem] gap-2.5 overflow-y-auto pr-1" aria-label="Beban kerja per pegawai">
                {beban.map((b) => (
                  <li
                    key={b.pegawaiId}
                    className="group grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 rounded-lg px-1 py-0.5 hover:bg-muted/60"
                    title={`${namaPegawai.get(b.pegawaiId)}: bobot ${b.beban}, ${b.jumlahPenugasan} pekerjaan${b.belumBerbobot ? `, ${b.belumBerbobot} belum berbobot` : ""}, capaian ${fmtPersen(b.capaian, 0)}`}
                  >
                    <span className="truncate text-sm">{namaPegawai.get(b.pegawaiId)}</span>
                    <span className="h-3 rounded-r bg-muted/50">
                      <span
                        className="block h-full rounded-r bg-primary transition-[width] duration-500 group-hover:bg-primary/85"
                        style={{ width: `${(b.beban / maxBeban) * 100}%` }}
                      />
                    </span>
                    <span className="tabular w-16 text-right text-xs">
                      <b className="text-sm">{b.beban}</b>
                      <span className="text-muted-foreground"> · {b.jumlahPenugasan}p</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Angka: total bobot · jumlah pekerjaan (p). Pekerjaan belum berbobot tidak dihitung.
              </p>
            </>
          )}
        </SectionCard>

        <SectionCard
          title={`Kegiatan ${tahun}`}
          description="Seluruh kegiatan tahun berjalan"
          icon={FolderKanban}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href={`/kegiatan?tahun=${tahun}`}>
                Semua <ArrowRight />
              </Link>
            </Button>
          }
          bodyClassName="p-0 sm:p-0"
        >
          {kegiatan.length === 0 ? (
            <EmptyState compact title="Belum ada kegiatan" />
          ) : (
            <ul className="max-h-[28rem] divide-y overflow-y-auto">
              {kegiatan.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/kegiatan/${k.id}`}
                    className="grid gap-2 px-4 py-3 transition-colors hover:bg-muted/60 sm:grid-cols-[1fr_9rem] sm:items-center sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-primary">{k.nama}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Tim {k.timNama} · PJ {k.pjNama ?? "—"} · {fmtTanggal(k.mulai)} – {fmtTanggal(k.selesai)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={k.progres} className="flex-1" />
                      <span className="tabular w-10 text-right text-xs font-bold">{fmtPersen(k.progres, 0)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
