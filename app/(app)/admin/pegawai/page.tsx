import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Users } from "lucide-react";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/user";
import { urlFoto } from "@/lib/foto";
import { timBesarPegawai } from "@/lib/data";
import { bulanIni } from "@/lib/waktu";
import { Avatar, PageHeader, SectionCard } from "@/components/sisar/ui";
import { cn } from "@/lib/utils";
import { AktifToggle, PegawaiDialog, ResetPasswordDialog } from "../admin-forms";

export const metadata: Metadata = { title: "Kelola Pegawai" };

export default async function AdminPegawaiPage() {
  const admin = await requireAdmin();
  const [rows, timBesar] = await Promise.all([
    db.select().from(schema.pegawai).orderBy(asc(schema.pegawai.nama)),
    timBesarPegawai(bulanIni().tahun),
  ]);
  const aktif = rows.filter((r) => r.aktif).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Akun pegawai"
        description={`${aktif} akun aktif dari ${rows.length}. Akun dinonaktifkan tidak bisa login, tetapi datanya tetap tersimpan.`}
        actions={<PegawaiDialog />}
      />
      <SectionCard title="Daftar pegawai" icon={Users} bodyClassName="p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold sm:px-5">Pegawai</th>
                <th className="px-3 py-2 font-semibold">Username</th>
                <th className="px-3 py-2 font-semibold">Tim besar {bulanIni().tahun}</th>
                <th className="px-3 py-2 font-semibold">Peran</th>
                <th className="px-4 py-2 text-right font-semibold sm:px-5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p.id} className={cn(!p.aktif && "bg-muted/40 text-muted-foreground")}>
                  <td className="px-4 py-2.5 sm:px-5">
                    <span className="flex items-center gap-2.5">
                      <Avatar nama={p.nama} foto={urlFoto(p.foto)} className={cn(!p.aktif && "opacity-50")} />
                      <span className="min-w-0">
                        <Link href={`/pegawai/${p.id}`} className="block truncate font-medium hover:text-primary hover:underline">{p.nama}</Link>
                        <span className="block truncate text-xs text-muted-foreground">{p.jabatan ?? "—"}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{p.username}</td>
                  <td className="px-3 py-2.5 text-xs">{timBesar.get(p.id) ?? <span className="text-warning">Belum ada</span>}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap gap-1">
                      {p.isKepala ? <span className="rounded-full bg-violet-soft px-2 py-0.5 text-xs font-semibold text-violet">Kepala</span> : null}
                      {p.isAdmin ? <span className="rounded-full bg-info-soft px-2 py-0.5 text-xs font-semibold text-info">Admin</span> : null}
                      {!p.aktif ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">Nonaktif</span> : null}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 sm:px-5">
                    <span className="flex justify-end gap-1">
                      <PegawaiDialog
                        initial={{ id: p.id, username: p.username, nama: p.nama, nip: p.nip, jabatan: p.jabatan, isKepala: p.isKepala, isAdmin: p.isAdmin }}
                      />
                      <ResetPasswordDialog id={p.id} nama={p.nama} />
                      {p.id !== admin.id ? <AktifToggle id={p.id} nama={p.nama} aktif={p.aktif} jenis="pegawai" /> : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
