"use client";

import { useRef, useState } from "react";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KonfirmasiDialog, Spinner, useAksi } from "@/components/sisar/client";
import { hapusFotoAksi, simpanProfilAksi, unggahFotoAksi } from "@/app/actions/pegawai";

export type ProfilForm = {
  id: number;
  nama: string;
  nip: string | null;
  nipLama: string | null;
  jabatan: string | null;
  unitKerja: string | null;
  golongan: string | null;
  tmtGolongan: string | null;
  pendidikan: string | null;
  tglLulus: string | null;
  jenisKelamin: "L" | "P" | null;
  tglLahir: string | null;
};

type Teks = Exclude<keyof ProfilForm, "id" | "jenisKelamin">;

const FIELD: { key: Teks; label: string; type?: "date"; numeric?: boolean; lebar?: boolean }[] = [
  { key: "nama", label: "Nama lengkap (dengan gelar)", lebar: true },
  { key: "nip", label: "NIP (18 digit)", numeric: true },
  { key: "nipLama", label: "NIP lama (9 digit)", numeric: true },
  { key: "jabatan", label: "Jabatan" },
  { key: "unitKerja", label: "Unit kerja" },
  { key: "golongan", label: "Golongan" },
  { key: "tmtGolongan", label: "TMT golongan", type: "date" },
  { key: "pendidikan", label: "Pendidikan (SK)" },
  { key: "tglLulus", label: "Tanggal lulus", type: "date" },
  { key: "tglLahir", label: "Tanggal lahir", type: "date" },
];

const TANPA = "none";

export function ProfilDialog({ initial }: { initial: ProfilForm }) {
  const [open, setOpen] = useState(false);
  const awal = () => ({
    ...(Object.fromEntries(FIELD.map((f) => [f.key, initial[f.key] ?? ""])) as Record<Teks, string>),
    jenisKelamin: initial.jenisKelamin ?? TANPA,
  });
  const [f, setF] = useState(awal);
  const { pending, run } = useAksi();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setF(awal());
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil />
          Ubah profil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ubah profil pegawai</DialogTitle>
          <DialogDescription>Username, password, dan peran diatur di menu Admin → Pegawai.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const v = (k: Teks) => f[k].trim() || null;
            run(
              () =>
                simpanProfilAksi({
                  id: initial.id,
                  nama: f.nama,
                  nip: v("nip"),
                  nipLama: v("nipLama"),
                  jabatan: v("jabatan"),
                  unitKerja: v("unitKerja"),
                  golongan: v("golongan"),
                  tmtGolongan: v("tmtGolongan"),
                  pendidikan: v("pendidikan"),
                  tglLulus: v("tglLulus"),
                  jenisKelamin: f.jenisKelamin === TANPA ? null : (f.jenisKelamin as "L" | "P"),
                  tglLahir: v("tglLahir"),
                }),
              { onOk: () => setOpen(false) },
            );
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELD.map((fd) => (
              <div key={fd.key} className={fd.lebar ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
                <Label htmlFor={`pf-${fd.key}`}>{fd.label}</Label>
                <Input
                  id={`pf-${fd.key}`}
                  type={fd.type ?? "text"}
                  inputMode={fd.numeric ? "numeric" : undefined}
                  value={f[fd.key]}
                  required={fd.key === "nama"}
                  onChange={(e) => setF({ ...f, [fd.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="grid gap-1.5">
              <Label htmlFor="pf-jk">Jenis kelamin</Label>
              <Select value={f.jenisKelamin} onValueChange={(jk) => setF({ ...f, jenisKelamin: jk })}>
                <SelectTrigger id="pf-jk" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TANPA}>Belum diisi</SelectItem>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const MAKS = 2 * 1024 * 1024;

export function FotoPegawai({ id, nama, adaFoto }: { id: number; nama: string; adaFoto: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const { pending, run } = useAksi();
  return (
    <div className="flex items-center gap-1">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`Pilih foto ${nama}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > MAKS) {
            toast.error("Ukuran foto maksimal 2 MB.");
            return;
          }
          const fd = new FormData();
          fd.set("foto", file);
          run(() => unggahFotoAksi(id, fd));
        }}
      />
      <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => input.current?.click()}>
        {pending ? <Spinner /> : <Camera />}
        {adaFoto ? "Ganti foto" : "Unggah foto"}
      </Button>
      {adaFoto ? (
        <KonfirmasiDialog
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Hapus foto">
              <Trash2 />
            </Button>
          }
          title="Hapus foto?"
          description={`Foto ${nama} akan dihapus dan diganti avatar inisial.`}
          confirmLabel="Hapus foto"
          destructive
          onConfirm={() => hapusFotoAksi(id)}
        />
      ) : null}
    </div>
  );
}
