import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { requireKepala } from "@/lib/auth/user";
import { daftarPekerjaanBobot } from "@/lib/data";
import { bulanIni, fmtTanggal } from "@/lib/waktu";
import { EmptyState, PageHeader, SectionCard } from "@/components/sisar/ui";
import { BobotBadge } from "@/components/sisar/status";
import { cn } from "@/lib/utils";
import { BobotInput } from "./bobot-input";

export const metadata: Metadata = { title: "Penetapan Bobot" };

export default async function BobotPage({ searchParams }: PageProps<"/dashboard/bobot">) {
  await requireKepala();
  const sp = await searchParams;
  const tahun = Number(sp.tahun) > 2000 ? Number(sp.tahun) : bulanIni().tahun;
  const semua = sp.tampil === "semua";
  const rows = await daftarPekerjaanBobot({ tahun, hanyaBelum: !semua });
  const belum = semua ? rows.filter((r) => r.bobot == null).length : rows.length;

  return (
    <>
      <PageHeader
        eyebrow="Kepala"
        title="Penetapan bobot pekerjaan"
        description="Skala 1–10. Bobot hanya dipakai untuk beban kerja, tidak memengaruhi rumus capaian."
        actions={
          <div className="flex gap-1 rounded-xl border bg-card p-1">
            {[
              { v: "belum", l: "Belum berbobot" },
              { v: "semua", l: "Semua pekerjaan" },
            ].map((t) => (
              <Link
                key={t.v}
                href={`/dashboard/bobot?tampil=${t.v}&tahun=${tahun}`}
                aria-current={(semua ? "semua" : "belum") === t.v ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-8 items-center rounded-lg px-3 text-sm font-semibold",
                  (semua ? "semua" : "belum") === t.v ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {t.l}
              </Link>
            ))}
          </div>
        }
      />
      <SectionCard
        title={semua ? `${rows.length} pekerjaan tahun ${tahun}` : `${belum} pekerjaan belum berbobot`}
        description="Pilih angka untuk menyimpan langsung"
        icon={Scale}
        tone="orange"
        bodyClassName="p-0 sm:p-0"
      >
        {rows.length === 0 ? (
          <EmptyState title="Semua pekerjaan sudah berbobot" description="Pekerjaan baru dari Ketua Tim akan muncul di sini." />
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{r.nama}</p>
                    <BobotBadge bobot={r.bobot} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Link href={`/kegiatan/${r.kegiatanId}`} className="text-primary hover:underline">
                      {r.kegiatanNama}
                    </Link>{" "}
                    · {r.subNama} · Tim {r.timNama} · {r.peran} · {r.jumlahPegawai} pegawai · deadline {fmtTanggal(r.deadline)}
                  </p>
                </div>
                <BobotInput pekerjaanId={r.id} bobot={r.bobot} nama={r.nama} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
