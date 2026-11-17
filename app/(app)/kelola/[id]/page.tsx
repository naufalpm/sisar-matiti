import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarClock, Eye, Layers, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { detailKegiatan, pegawaiAktif, timBesarPegawai } from "@/lib/data";
import { fmtPersen } from "@/lib/capaian";
import { daftarBulan, fmtTanggal, labelBulan } from "@/lib/waktu";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, PageHeader, SectionCard } from "@/components/sisar/ui";
import { BobotBadge, StatusBadge } from "@/components/sisar/status";
import { KegiatanDialog, PekerjaanDialog, SubDialog, TargetDialog, TugaskanDialog } from "../forms";
import { HapusButton } from "../hapus";

export const metadata: Metadata = { title: "Kelola Kegiatan" };

export default async function KelolaKegiatanPage({ params }: PageProps<"/kelola/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const k = await detailKegiatan(user, Number(id));
  if (!k) notFound();
  if (!k.akses.bisaKelola) redirect(`/kegiatan/${k.id}`);

  const [pegawai, timBesar] = await Promise.all([pegawaiAktif(), timBesarPegawai(Number(k.mulai.slice(0, 4)))]);
  const opsiPegawai = pegawai.map((p) => ({ id: p.id, nama: p.nama, info: timBesar.get(p.id) ? `Tim ${timBesar.get(p.id)}` : p.jabatan }));
  const tims = user.timDiketuai.map((t) => ({ id: t.id, nama: t.nama, info: `${t.tahun}` }));

  function bulanUntuk(deadline: string) {
    const akhir = deadline > k!.selesai ? deadline : k!.selesai;
    return daftarBulan(k!.mulai, akhir);
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
        <Link href="/kelola" className="hover:text-foreground hover:underline">
          Kelola Kegiatan
        </Link>{" "}
        / <span className="text-foreground">{k.nama}</span>
      </nav>
      <PageHeader
        eyebrow={`Tim ${k.timNama}`}
        title={k.nama}
        description={`${fmtTanggal(k.mulai)} – ${fmtTanggal(k.selesai)} · PJ ${k.pjNama ?? "belum ditunjuk"} · progres ${fmtPersen(k.progres)}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/kegiatan/${k.id}`}>
                <Eye />
                Lihat detail
              </Link>
            </Button>
            <KegiatanDialog
              tims={tims}
              pegawai={pegawai.map((p) => ({ id: p.id, nama: p.nama }))}
              initial={{ id: k.id, nama: k.nama, timId: k.timId, pjId: k.pjId, mulai: k.mulai, selesai: k.selesai, keterangan: k.keterangan }}
              trigger={
                <Button variant="outline">
                  <Pencil />
                  Ubah kegiatan
                </Button>
              }
            />
            <HapusButton jenis="kegiatan" id={k.id} nama={k.nama} besar />
          </>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Sub-kegiatan & pekerjaan</h2>
        <SubDialog kegiatanId={k.id} />
      </div>

      {k.struktur.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState title="Belum ada sub-kegiatan" description="Tambahkan sub-kegiatan seperti Pelatihan Petugas atau Pencacahan, lalu isi pekerjaannya." />
        </div>
      ) : (
        <div className="grid gap-6">
          {k.struktur.map((s) => (
            <SectionCard
              key={s.id}
              title={s.nama}
              description={s.mulai || s.selesai ? `${fmtTanggal(s.mulai)} – ${fmtTanggal(s.selesai)}` : "Periode mengikuti kegiatan"}
              icon={Layers}
              tone="orange"
              actions={
                <>
                  <SubDialog kegiatanId={k.id} initial={{ id: s.id, nama: s.nama, mulai: s.mulai, selesai: s.selesai }} />
                  <HapusButton jenis="sub" id={s.id} nama={s.nama} />
                </>
              }
              bodyClassName="p-0 sm:p-0"
            >
              <div className="divide-y">
                {s.pekerjaan.map((p) => {
                  const months = bulanUntuk(p.deadline);
                  return (
                    <div key={p.id} className="px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{p.nama}</h3>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="rounded-md bg-secondary px-1.5 py-0.5 font-semibold text-secondary-foreground">{p.peran}</span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="size-3.5" aria-hidden /> {fmtTanggal(p.deadline)}
                            </span>
                            <span>{p.satuan ? `Satuan: ${p.satuan}` : "Tanpa target angka"}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <BobotBadge bobot={p.bobot} />
                          <PekerjaanDialog
                            subKegiatanId={s.id}
                            initial={{ id: p.id, nama: p.nama, peran: p.peran, satuan: p.satuan, targetKualitatif: p.targetKualitatif, deadline: p.deadline }}
                          />
                          <HapusButton jenis="pekerjaan" id={p.id} nama={p.nama} />
                        </div>
                      </div>

                      <div className="mt-3 overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[560px] text-sm">
                          <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                            <tr>
                              <th className="px-3 py-2 font-semibold">Pegawai</th>
                              <th className="px-3 py-2 font-semibold">Target per bulan</th>
                              <th className="px-3 py-2 font-semibold">Status bulan terakhir</th>
                              <th className="px-3 py-2 text-right font-semibold">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {p.penugasan.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                                  Belum ada pegawai ditugaskan.
                                </td>
                              </tr>
                            ) : (
                              p.penugasan.map((a) => {
                                const last = a.targets.at(-1);
                                return (
                                  <tr key={a.id}>
                                    <td className="px-3 py-2">
                                      <span className="flex items-center gap-2">
                                        <Avatar nama={a.nama} className="size-7 text-[10px]" />
                                        <span className="font-medium">{a.nama}</span>
                                      </span>
                                    </td>
                                    <td className="tabular px-3 py-2 text-xs">
                                      {a.targets.map((t) => `${labelBulan(t.tahun, t.bulan, true)}: ${p.satuan ? t.target : "✓"}`).join(" · ") || "—"}
                                    </td>
                                    <td className="px-3 py-2">{last ? <StatusBadge status={last.status} /> : "—"}</td>
                                    <td className="px-3 py-2">
                                      <span className="flex justify-end gap-1">
                                        <TargetDialog
                                          penugasanId={a.id}
                                          pegawaiNama={a.nama}
                                          satuan={p.satuan}
                                          months={months}
                                          targets={a.targets.map((t) => ({ tahun: t.tahun, bulan: t.bulan, target: t.target }))}
                                        />
                                        <HapusButton jenis="penugasan" id={a.id} nama={`${a.nama} — ${p.nama}`} />
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3">
                        <TugaskanDialog
                          pekerjaan={{ id: p.id, nama: p.nama, satuan: p.satuan, deadline: p.deadline }}
                          months={months}
                          pegawai={opsiPegawai}
                          sudah={p.penugasan.map((a) => a.pegawaiId)}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="px-4 py-3 sm:px-5">
                  <PekerjaanDialog subKegiatanId={s.id} />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </>
  );
}
