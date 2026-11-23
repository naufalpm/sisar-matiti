import type { Metadata } from "next";
import { Contact } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { daftarPegawai } from "@/lib/layanan/pegawai";
import { urlFoto } from "@/lib/foto";
import { timKerjaPegawai } from "@/lib/data";
import { bulanIni } from "@/lib/waktu";
import { EmptyState, PageHeader, SectionCard } from "@/components/sisar/ui";
import { TabelPegawai } from "./tabel";

export const metadata: Metadata = { title: "Daftar Pegawai" };

export default async function DaftarPegawaiPage() {
  await requireUser();
  const { tahun } = bulanIni();
  const [rows, timKerja] = await Promise.all([daftarPegawai(), timKerjaPegawai(tahun)]);
  const lk = rows.filter((r) => r.jenisKelamin === "L").length;
  const pr = rows.filter((r) => r.jenisKelamin === "P").length;

  return (
    <>
      <PageHeader
        title="Daftar Pegawai"
        description={
          rows.length
            ? `${rows.length} pegawai BPS Kabupaten Teluk Bintuni${lk + pr ? ` · ${lk} laki-laki, ${pr} perempuan` : ""}.`
            : undefined
        }
      />
      <SectionCard title="Pegawai" description={`Tim kerja tahun ${tahun}`} icon={Contact} bodyClassName="p-0 sm:p-0">
        {rows.length === 0 ? (
          <EmptyState title="Belum ada data pegawai" description="Admin dapat mengimpor data kepegawaian terlebih dahulu." />
        ) : (
          <TabelPegawai
            rows={rows.map((r) => ({
              id: r.id,
              nama: r.nama,
              nip: r.nip,
              jabatan: r.jabatan,
              tim: (timKerja.get(r.id) ?? []).map((t) => ({ id: t.id, nama: t.nama, ketua: t.ketua })),
              golongan: r.golongan,
              pendidikan: r.pendidikan,
              foto: urlFoto(r.foto),
            }))}
          />
        )}
      </SectionCard>
    </>
  );
}
