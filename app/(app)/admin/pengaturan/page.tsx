import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Gauge, Lock, ListChecks } from "lucide-react";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/user";
import { getAmbang } from "@/lib/layanan/rekap";
import { fmtWaktu, labelBulan } from "@/lib/waktu";
import { PERAN_PEKERJAAN, SATUAN_TARGET } from "@/lib/master";
import { PageHeader, SectionCard } from "@/components/sisar/ui";
import { AmbangForm } from "../admin-forms";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  await requireAdmin();
  const [ambang, kunci] = await Promise.all([
    getAmbang(),
    db.select().from(schema.kunciBulan).orderBy(desc(schema.kunciBulan.tahun), desc(schema.kunciBulan.bulan)).limit(24),
  ]);
  return (
    <>
      <PageHeader eyebrow="Admin" title="Pengaturan" description="Ambang capaian dan data master aplikasi." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Ambang capaian" description="Pegawai di bawah ambang masuk daftar perhatian Kepala" icon={Gauge} tone="green">
          <AmbangForm nilai={ambang} />
        </SectionCard>
        <SectionCard title="Bulan terkunci" description="Capaian dikunci otomatis tanggal 5 bulan berikutnya" icon={Lock} tone="slate">
          {kunci.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada bulan yang dikunci.</p>
          ) : (
            <ul className="grid gap-1.5 text-sm">
              {kunci.map((k) => (
                <li key={`${k.tahun}-${k.bulan}`} className="flex justify-between gap-3">
                  <span className="font-medium">{labelBulan(k.tahun, k.bulan)}</span>
                  <span className="text-xs text-muted-foreground">{fmtWaktu(k.lockedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard
          title="Daftar peran & satuan"
          description="Saran isian saat membuat pekerjaan. Pengelolaan lewat aplikasi menyusul (P1)."
          icon={ListChecks}
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Peran pekerjaan</p>
              <div className="flex flex-wrap gap-1.5">
                {PERAN_PEKERJAAN.map((p) => (
                  <span key={p} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Satuan target</p>
              <div className="flex flex-wrap gap-1.5">
                {SATUAN_TARGET.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
