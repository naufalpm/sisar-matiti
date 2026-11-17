import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { UsersRound } from "lucide-react";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/user";
import { pegawaiAktif } from "@/lib/data";
import { bulanIni } from "@/lib/waktu";
import { EmptyState, PageHeader, SectionCard } from "@/components/sisar/ui";
import { cn } from "@/lib/utils";
import { AktifToggle, AnggotaDialog, TimDialog } from "../admin-forms";

export const metadata: Metadata = { title: "Kelola Tim" };

export default async function AdminTimPage({ searchParams }: PageProps<"/admin/tim">) {
  await requireAdmin();
  const sp = await searchParams;
  const tahunIni = bulanIni().tahun;
  const tahun = Number(sp.tahun) > 2000 ? Number(sp.tahun) : tahunIni;

  const [tims, anggota, pegawai] = await Promise.all([
    db
      .select({ tim: schema.tim, ketuaNama: schema.pegawai.nama })
      .from(schema.tim)
      .leftJoin(schema.pegawai, eq(schema.pegawai.id, schema.tim.ketuaId))
      .where(eq(schema.tim.tahun, tahun))
      .orderBy(asc(schema.tim.jenis), desc(schema.tim.aktif), asc(schema.tim.nama)),
    db.select().from(schema.anggotaTim),
    pegawaiAktif(),
  ]);
  const opsi = pegawai.map((p) => ({ id: p.id, nama: p.nama, info: p.jabatan }));

  // Pegawai aktif yang belum punya tim besar di tahun ini.
  const timBesarIds = new Set(tims.filter((t) => t.tim.jenis === "besar" && t.tim.aktif).map((t) => t.tim.id));
  const punyaTimBesar = new Set(anggota.filter((a) => timBesarIds.has(a.timId)).map((a) => a.pegawaiId));
  const tanpaTim = pegawai.filter((p) => !punyaTimBesar.has(p.id));

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title={`Tim tahun ${tahun}`}
        description="Struktur tim bisa berubah tiap tahun. Ketua tim berhak membuat kegiatan di timnya."
        actions={
          <>
            <div className="flex gap-1 rounded-xl border bg-card p-1">
              {[tahunIni - 1, tahunIni, tahunIni + 1].map((y) => (
                <Link
                  key={y}
                  href={`/admin/tim?tahun=${y}`}
                  className={cn("inline-flex min-h-8 items-center rounded-lg px-3 text-sm font-semibold", y === tahun ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
                >
                  {y}
                </Link>
              ))}
            </div>
            <TimDialog pegawai={opsi} tahunDefault={tahun} />
          </>
        }
      />

      {tanpaTim.length ? (
        <p className="mb-4 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
          <b>{tanpaTim.length} pegawai belum masuk tim besar {tahun}:</b> {tanpaTim.map((p) => p.nama).join(", ")}.
        </p>
      ) : null}

      <SectionCard title={`${tims.length} tim`} icon={UsersRound} bodyClassName="p-0 sm:p-0">
        {tims.length === 0 ? (
          <EmptyState title={`Belum ada tim untuk ${tahun}`} description="Tambahkan tim besar dan tim kecil untuk tahun ini." />
        ) : (
          <ul className="divide-y">
            {tims.map(({ tim, ketuaNama }) => {
              const ids = anggota.filter((a) => a.timId === tim.id).map((a) => a.pegawaiId);
              return (
                <li key={tim.id} className={cn("flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5", !tim.aktif && "opacity-60")}>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {tim.nama}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          tim.jenis === "besar" ? "bg-info-soft text-info" : "bg-brand-green-soft text-success",
                        )}
                      >
                        Tim {tim.jenis}
                      </span>
                      {!tim.aktif ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">Nonaktif</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">Ketua: {ketuaNama ?? "belum ditunjuk"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <AnggotaDialog timId={tim.id} nama={tim.nama} pegawai={opsi} anggota={ids} />
                    <TimDialog
                      pegawai={opsi}
                      tahunDefault={tahun}
                      initial={{ id: tim.id, nama: tim.nama, jenis: tim.jenis, tahun: tim.tahun, ketuaId: tim.ketuaId }}
                    />
                    <AktifToggle id={tim.id} nama={tim.nama} aktif={tim.aktif} jenis="tim" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
