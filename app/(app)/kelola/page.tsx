import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, FolderCog } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { kegiatanTerlihat, pegawaiAktif } from "@/lib/data";
import { fmtPersen } from "@/lib/capaian";
import { fmtTanggal } from "@/lib/waktu";
import { EmptyState, PageHeader, SectionCard } from "@/components/sisar/ui";
import { ProgressBar } from "@/components/sisar/status";
import { BuatKegiatan } from "./forms";

export const metadata: Metadata = { title: "Kelola Kegiatan" };

export default async function KelolaPage() {
  const user = await requireUser();
  if (!user.isKetuaTim) redirect("/terlarang");
  const [rows, pegawai] = await Promise.all([kegiatanTerlihat(user, { hanyaMilikTim: true }), pegawaiAktif()]);
  const tims = user.timDiketuai
    .slice()
    .sort((a, b) => b.tahun - a.tahun)
    .map((t) => ({ id: t.id, nama: t.nama, info: `${t.jenis === "besar" ? "Tim besar" : "Tim kecil"} ${t.tahun}` }));

  const perTim = tims.map((t) => ({ ...t, kegiatan: rows.filter((r) => r.timId === t.id) }));

  return (
    <>
      <PageHeader
        eyebrow="Ketua Tim"
        title="Kelola kegiatan"
        description="Buat dan atur kegiatan, sub-kegiatan, pekerjaan, serta penugasan di tim yang Anda ketuai."
        actions={<BuatKegiatan tims={tims} pegawai={pegawai.map((p) => ({ id: p.id, nama: p.nama }))} />}
      />
      <div className="grid gap-6">
        {perTim.map((t) => (
          <SectionCard key={t.id} title={`Tim ${t.nama}`} description={t.info} icon={FolderCog} bodyClassName="p-0 sm:p-0">
            {t.kegiatan.length === 0 ? (
              <EmptyState compact title="Belum ada kegiatan di tim ini" description="Klik Buat kegiatan untuk memulai." />
            ) : (
              <ul className="divide-y">
                {t.kegiatan.map((k) => (
                  <li key={k.id}>
                    <Link href={`/kelola/${k.id}`} className="grid gap-2 px-4 py-3.5 transition-colors hover:bg-muted/60 sm:grid-cols-[1fr_200px_auto] sm:items-center sm:px-5">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{k.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmtTanggal(k.mulai)} – {fmtTanggal(k.selesai)} · PJ {k.pjNama ?? "—"} · {k.jumlahPekerjaan} pekerjaan
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={k.progres} className="flex-1" />
                        <span className="tabular w-12 text-right text-xs font-bold">{fmtPersen(k.progres, 0)}</span>
                      </div>
                      <ChevronRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        ))}
      </div>
    </>
  );
}
