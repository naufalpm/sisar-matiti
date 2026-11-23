import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Building2, Crown, GraduationCap, IdCard, UserRound, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { detailPegawai } from "@/lib/layanan/pegawai";
import { timKerjaPegawai } from "@/lib/data";
import { bulanIni } from "@/lib/waktu";
import { urlFoto } from "@/lib/foto";
import { fmtTanggal, hitungUsia } from "@/lib/waktu";
import { Button } from "@/components/ui/button";
import { Avatar, SectionCard } from "@/components/sisar/ui";
import { FotoPegawai, ProfilDialog } from "./forms";

export async function generateMetadata({ params }: PageProps<"/pegawai/[id]">): Promise<Metadata> {
  const p = await detailPegawai(Number((await params).id));
  return { title: p ? p.nama : "Pegawai" };
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words">{children ?? "—"}</dd>
    </div>
  );
}

export default async function DetailPegawaiPage({ params }: PageProps<"/pegawai/[id]">) {
  const user = await requireUser();
  const p = await detailPegawai(Number((await params).id));
  if (!p || (!p.aktif && !user.isAdmin)) notFound();

  const { tahun } = bulanIni();
  const timKerja = (await timKerjaPegawai(tahun)).get(p.id) ?? [];
  const usia = hitungUsia(p.tglLahir);
  const foto = urlFoto(p.foto);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/pegawai">
          <ArrowLeft />
          Daftar pegawai
        </Link>
      </Button>

      <section className="mb-6 flex flex-col gap-5 rounded-3xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <Avatar nama={p.nama} foto={foto} className="size-28 text-3xl ring-4 ring-primary/10" />
          {user.isAdmin ? <FotoPegawai id={p.id} nama={p.nama} adaFoto={!!p.foto} /> : null}
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-balance">{p.nama}</h1>
          <p className="mt-1 text-muted-foreground">{p.jabatan ?? "Jabatan belum diisi"}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {p.unitKerja ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-semibold text-info">
                <Building2 className="size-3.5" aria-hidden />
                {p.unitKerja}
              </span>
            ) : null}
            {p.golongan ? (
              <span className="rounded-full bg-violet-soft px-2.5 py-0.5 text-xs font-semibold text-violet">Gol. {p.golongan}</span>
            ) : null}
            {!p.aktif ? <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">Akun nonaktif</span> : null}
          </div>
        </div>
        {user.isAdmin ? (
          <div className="flex justify-center sm:self-start">
            <ProfilDialog
              initial={{
                id: p.id,
                nama: p.nama,
                nip: p.nip,
                nipLama: p.nipLama,
                jabatan: p.jabatan,
                unitKerja: p.unitKerja,
                golongan: p.golongan,
                tmtGolongan: p.tmtGolongan,
                pendidikan: p.pendidikan,
                tglLulus: p.tglLulus,
                jenisKelamin: p.jenisKelamin,
                tglLahir: p.tglLahir,
              }}
            />
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={`Tim kerja ${tahun}`}
          description={timKerja.length ? `${timKerja.length} tim` : undefined}
          icon={UsersRound}
          tone="orange"
          className="lg:col-span-2"
        >
          {timKerja.length ? (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {timKerja.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">Tim {t.nama}</span>
                    <span className="block text-xs text-muted-foreground">{t.jenis === "besar" ? "Tim besar" : "Tim kecil"}</span>
                  </span>
                  {t.ketua ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      <Crown className="size-3.5" aria-hidden />
                      Ketua
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Anggota</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum tergabung di tim mana pun tahun ini.</p>
          )}
        </SectionCard>

        <SectionCard title="Identitas" icon={IdCard}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="NIP">{p.nip ? <span className="tabular font-mono">{p.nip}</span> : null}</Info>
            <Info label="NIP lama">{p.nipLama ? <span className="tabular font-mono">{p.nipLama}</span> : null}</Info>
            <Info label="Jenis kelamin">{p.jenisKelamin === "L" ? "Laki-laki" : p.jenisKelamin === "P" ? "Perempuan" : null}</Info>
            <Info label="Tanggal lahir">
              {p.tglLahir ? `${fmtTanggal(p.tglLahir, true)}${usia !== null ? ` (${usia} tahun)` : ""}` : null}
            </Info>
          </dl>
        </SectionCard>

        <SectionCard title="Kepangkatan" icon={Award} tone="violet">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="Jabatan">{p.jabatan}</Info>
            <Info label="Unit kerja">{p.unitKerja}</Info>
            <Info label="Golongan">{p.golongan}</Info>
            <Info label="TMT golongan">{p.tmtGolongan ? fmtTanggal(p.tmtGolongan, true) : null}</Info>
          </dl>
        </SectionCard>

        <SectionCard title="Pendidikan" icon={GraduationCap} tone="green">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="Pendidikan terakhir (SK)">{p.pendidikan}</Info>
            <Info label="Tanggal lulus">{p.tglLulus ? fmtTanggal(p.tglLulus, true) : null}</Info>
          </dl>
        </SectionCard>

        <SectionCard title="Akun aplikasi" icon={UserRound} tone="slate">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="Username">
              <span className="font-mono">{p.username}</span>
            </Info>
            <Info label="Peran">
              {[p.isKepala && "Kepala", p.isAdmin && "Admin"].filter(Boolean).join(" · ") || "Pegawai"}
            </Info>
          </dl>
        </SectionCard>
      </div>
    </>
  );
}
