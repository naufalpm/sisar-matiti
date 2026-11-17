"use client";

import { useRouter } from "next/navigation";
import { Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KonfirmasiDialog } from "@/components/sisar/client";
import { hapusKegiatanAksi, hapusPekerjaanAksi, hapusPenugasanAksi, hapusSubAksi } from "@/app/actions/kelola";

type Jenis = "kegiatan" | "sub" | "pekerjaan" | "penugasan";

const LABEL: Record<Jenis, string> = {
  kegiatan: "kegiatan",
  sub: "sub-kegiatan",
  pekerjaan: "pekerjaan",
  penugasan: "penugasan",
};

export function HapusButton({ jenis, id, nama, besar }: { jenis: Jenis; id: number; nama: string; besar?: boolean }) {
  const router = useRouter();
  const aksi = {
    kegiatan: hapusKegiatanAksi,
    sub: hapusSubAksi,
    pekerjaan: hapusPekerjaanAksi,
    penugasan: hapusPenugasanAksi,
  }[jenis];
  const Icon = jenis === "penugasan" ? UserMinus : Trash2;
  return (
    <KonfirmasiDialog
      destructive
      trigger={
        besar ? (
          <Button variant="destructive">
            <Icon />
            Hapus {LABEL[jenis]}
          </Button>
        ) : (
          <Button variant="ghost" size="icon-sm" className="text-danger hover:bg-danger-soft hover:text-danger" aria-label={`Hapus ${LABEL[jenis]} ${nama}`}>
            <Icon />
          </Button>
        )
      }
      title={`Hapus ${LABEL[jenis]}?`}
      description={
        <>
          <b>{nama}</b> akan dinonaktifkan (soft delete). Riwayat dan capaian bulan yang sudah dikunci tetap utuh, tetapi
          pekerjaan ini tidak lagi dihitung untuk bulan yang belum dikunci.
        </>
      }
      confirmLabel="Hapus"
      onConfirm={async () => {
        const r = await aksi(id);
        if (r.ok && jenis === "kegiatan") router.push("/kelola");
        return r;
      }}
    />
  );
}
