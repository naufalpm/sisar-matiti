import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Scale,
  XCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import {
  jumlahBelumBerbobot,
  jumlahMenungguApproval,
  penugasanSaya,
} from "@/lib/data";
import { getAmbang, rekapBulan } from "@/lib/layanan/rekap";
import { fmtPersen, hitungProgres } from "@/lib/capaian";
import {
  fmtTanggal,
  hariIni,
  labelBulan,
  bulanIni,
  selisihHari,
  tambahHari,
} from "@/lib/waktu";
import { Button } from "@/components/ui/button";
import { EmptyState, HeroHeader, SectionCard } from "@/components/sisar/ui";
import {
  ProgressBar,
  StatusBadge,
  TerlambatBadge,
} from "@/components/sisar/status";

function sapaan() {
  const jam = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jayapura",
    }).format(new Date()),
  );
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function BerandaPage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const sp = await searchParams;
  const baruMasuk = sp.masuk === "1";
  const { tahun, bulan } = bulanIni();
  const today = hariIni();

  const [rows, rekap, ambang, menungguSaya, belumBerbobot] = await Promise.all([
    user.isKepala ? Promise.resolve([]) : penugasanSaya(user.id, tahun, bulan),
    rekapBulan(tahun, bulan),
    getAmbang(),
    user.isKetuaTim || user.isPJ
      ? jumlahMenungguApproval(user)
      : Promise.resolve(0),
    user.isKepala ? jumlahBelumBerbobot() : Promise.resolve(0),
  ]);
  const saya = rekap.data.get(user.id);
  const batasMinggu = tambahHari(today, 7);
  const deadlineMinggu = rows.filter(
    (r) =>
      r.status !== "selesai" &&
      r.deadline >= today &&
      r.deadline <= batasMinggu,
  );
  const ditolak = rows.filter(
    (r) => r.alasanTolak && (r.status === "dikerjakan" || r.status === "belum"),
  );
  const perluDikerjakan = rows
    .filter((r) => r.status !== "selesai")
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  const ringkasan: string[] = [];
  if (deadlineMinggu.length)
    ringkasan.push(`${deadlineMinggu.length} pekerjaan deadline minggu ini`);
  if (ditolak.length) ringkasan.push(`${ditolak.length} ditolak`);
  if (menungguSaya)
    ringkasan.push(`${menungguSaya} pengajuan menunggu approval Anda`);
  if (belumBerbobot)
    ringkasan.push(`${belumBerbobot} pekerjaan belum berbobot`);
  const namaDepan = user.nama.split(" ")[0];

  return (
    <>
      <HeroHeader
        title={`${sapaan()}, ${namaDepan}!`}
        description={
          ringkasan.length
            ? `${baruMasuk ? "Ringkasan untuk Anda: " : ""}${ringkasan.join(", ")}.`
            : "Tidak ada hal mendesak hari ini. Tetap semangat!"
        }
        actions={
          user.isKepala || user.isAdmin ? (
            <Button
              asChild
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                Buka Dashboard Kepala
              </Link>
            </Button>
          ) : null
        }
      >
        {user.isKepala ? null : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                Icon: Gauge,
                l: `Capaian ${labelBulan(tahun, bulan, true)}`,
                v: fmtPersen(saya?.capaian ?? null),
                warn: saya?.capaian != null && saya.capaian < ambang,
              },
              { Icon: Scale, l: "Total bobot", v: String(saya?.beban ?? 0) },
              {
                Icon: CalendarClock,
                l: "Deadline ≤ 7 hari",
                v: String(deadlineMinggu.length),
              },
              { Icon: XCircle, l: "Ditolak", v: String(ditolak.length) },
            ].map(({ Icon, l, v, warn }) => (
              <div
                key={l}
                className="rounded-2xl bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur-sm"
              >
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <Icon className="size-3.5" aria-hidden />
                  {l}
                </p>
                <p className="tabular mt-0.5 text-2xl font-bold">
                  {v}
                  {warn ? (
                    <span className="ml-1.5 align-middle text-xs font-semibold text-[oklch(0.85_0.12_60)]">
                      di bawah ambang
                    </span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        )}
      </HeroHeader>

      <div
        className={
          user.isKepala ? "grid gap-6" : "grid gap-6 lg:grid-cols-[1.4fr_1fr]"
        }
      >
        {user.isKepala ? null : (
          <SectionCard
            title="Perlu dikerjakan"
            description="Urut berdasarkan deadline terdekat"
            icon={ClipboardList}
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/pekerjaan-saya">
                  Semua <ArrowRight />
                </Link>
              </Button>
            }
            bodyClassName="p-0 sm:p-0"
          >
            {perluDikerjakan.length === 0 ? (
              <EmptyState
                compact
                title="Semua pekerjaan bulan ini sudah selesai"
              />
            ) : (
              <ul className="divide-y">
                {perluDikerjakan.map((r) => {
                  const sisa = selisihHari(today, r.deadline);
                  return (
                    <li key={r.id}>
                      <Link
                        href="/pekerjaan-saya"
                        className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/60 sm:px-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {r.pekerjaanNama}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {r.kegiatanNama} · {r.peran}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {r.terlambat ? <TerlambatBadge /> : null}
                            <StatusBadge status={r.status} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProgressBar
                            value={hitungProgres(
                              r.realisasiDisetujui,
                              r.target,
                            )}
                            className="flex-1"
                          />
                          <span
                            className={`text-xs whitespace-nowrap ${sisa < 0 ? "text-danger" : sisa <= 3 ? "text-warning" : "text-muted-foreground"}`}
                          >
                            {fmtTanggal(r.deadline)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        )}

        <div className="grid content-start gap-6">
          {ditolak.length ? (
            <SectionCard title="Dikembalikan atasan" icon={XCircle} tone="red">
              <ul className="grid gap-3">
                {ditolak.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl bg-danger-soft p-3 text-sm"
                  >
                    <p className="font-semibold">{r.pekerjaanNama}</p>
                    <p className="text-foreground/80">{r.alasanTolak}</p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}
          {menungguSaya || belumBerbobot ? (
            <SectionCard
              title="Tindakan untuk Anda"
              icon={CheckSquare}
              tone="amber"
            >
              <div className="grid gap-2">
                {menungguSaya ? (
                  <Button asChild variant="outline" className="justify-between">
                    <Link href="/approval">
                      {menungguSaya} pengajuan menunggu approval <ArrowRight />
                    </Link>
                  </Button>
                ) : null}
                {belumBerbobot ? (
                  <Button asChild variant="outline" className="justify-between">
                    <Link href="/dashboard/bobot">
                      {belumBerbobot} pekerjaan belum berbobot <ArrowRight />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </SectionCard>
          ) : null}
          {user.isKepala ? null : (
            <SectionCard title="Tentang capaian" icon={Gauge} tone="green">
              <p className="text-sm text-muted-foreground">
                Capaian bulanan = rata-rata progres seluruh penugasan Anda bulan
                ini. Hanya realisasi yang sudah di-approve yang dihitung.
                Capaian dikunci tanggal 5 bulan berikutnya dan dipakai sebagai
                dasar CKP.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
}
