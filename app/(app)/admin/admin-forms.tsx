"use client";

import { useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Power, Search, Users } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KonfirmasiDialog, Spinner, useAksi } from "@/components/sisar/client";
import {
  resetPasswordAksi,
  setAktifPegawaiAksi,
  setAktifTimAksi,
  setAmbangAksi,
  setAnggotaTimAksi,
  simpanPegawaiAksi,
  simpanTimAksi,
} from "@/app/actions/admin";

/* ---------------------------------- Pegawai ---------------------------------- */

export type PegawaiForm = {
  id: number;
  username: string;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  isKepala: boolean;
  isAdmin: boolean;
};

export function PegawaiDialog({ initial }: { initial?: PegawaiForm }) {
  const [open, setOpen] = useState(false);
  const kosong = { username: "", nama: "", nip: "", jabatan: "", isKepala: false, isAdmin: false, password: "" };
  const [f, setF] = useState(() =>
    initial ? { ...initial, nip: initial.nip ?? "", jabatan: initial.jabatan ?? "", password: "" } : kosong,
  );
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${initial.nama}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            Tambah pegawai
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Ubah data pegawai" : "Buat akun pegawai"}</DialogTitle>
          <DialogDescription>
            Peran Ketua Tim diatur di menu Tim, peran PJ diatur Ketua Tim pada kegiatan.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () =>
                simpanPegawaiAksi({
                  id: initial?.id,
                  username: f.username,
                  nama: f.nama,
                  nip: f.nip || null,
                  jabatan: f.jabatan || null,
                  isKepala: f.isKepala,
                  isAdmin: f.isAdmin,
                  password: initial ? undefined : f.password,
                }),
              {
                onOk: () => {
                  setOpen(false);
                  if (!initial) setF(kosong);
                },
              },
            );
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="pg-nama">Nama lengkap</Label>
              <Input id="pg-nama" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pg-user">Username</Label>
              <Input
                id="pg-user"
                value={f.username}
                autoCapitalize="none"
                onChange={(e) => setF({ ...f, username: e.target.value.toLowerCase() })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pg-nip">NIP</Label>
              <Input id="pg-nip" inputMode="numeric" value={f.nip} onChange={(e) => setF({ ...f, nip: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pg-jab">Jabatan</Label>
              <Input id="pg-jab" value={f.jabatan} onChange={(e) => setF({ ...f, jabatan: e.target.value })} />
            </div>
          </div>
          {!initial ? (
            <div className="grid gap-1.5">
              <Label htmlFor="pg-pw">Password awal</Label>
              <Input id="pg-pw" type="text" minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
              <p className="text-xs text-muted-foreground">Minimal 8 karakter. Pegawai akan diminta menggantinya.</p>
            </div>
          ) : null}
          <div className="grid gap-2 rounded-xl border p-3">
            <label className="flex min-h-9 cursor-pointer items-center justify-between gap-3 text-sm">
              Kepala BPS Kabupaten
              <Switch checked={f.isKepala} onCheckedChange={(v) => setF({ ...f, isKepala: v })} />
            </label>
            <label className="flex min-h-9 cursor-pointer items-center justify-between gap-3 text-sm">
              Admin (Tim IPDS)
              <Switch checked={f.isAdmin} onCheckedChange={(v) => setF({ ...f, isAdmin: v })} />
            </label>
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

export function ResetPasswordDialog({ id, nama }: { id: number; nama: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Reset password ${nama}`}>
          <KeyRound />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password — {nama}</DialogTitle>
          <DialogDescription>Semua sesi login pegawai akan diakhiri.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="rp">Password baru</Label>
          <Input id="rp" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button disabled={pending || pw.length < 8} onClick={() => run(() => resetPasswordAksi(id, pw), { onOk: () => { setOpen(false); setPw(""); } })}>
            {pending ? <Spinner /> : null}
            Reset password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AktifToggle({ id, nama, aktif, jenis }: { id: number; nama: string; aktif: boolean; jenis: "pegawai" | "tim" }) {
  const fn = jenis === "pegawai" ? setAktifPegawaiAksi : setAktifTimAksi;
  return (
    <KonfirmasiDialog
      destructive={aktif}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`${aktif ? "Nonaktifkan" : "Aktifkan"} ${nama}`} className={aktif ? "text-danger hover:text-danger" : "text-success hover:text-success"}>
          <Power />
        </Button>
      }
      title={`${aktif ? "Nonaktifkan" : "Aktifkan"} ${nama}?`}
      description={
        jenis === "pegawai"
          ? aktif
            ? "Pegawai tidak bisa login, tetapi datanya tetap tersimpan."
            : "Pegawai dapat login kembali."
          : aktif
            ? "Tim tidak lagi dipakai untuk menentukan Ketua Tim."
            : "Tim diaktifkan kembali."
      }
      confirmLabel={aktif ? "Nonaktifkan" : "Aktifkan"}
      onConfirm={() => fn(id, !aktif)}
    />
  );
}

/* ------------------------------------ Tim ------------------------------------ */

export type Opsi = { id: number; nama: string; info?: string | null };

export function TimDialog({
  pegawai,
  tahunDefault,
  initial,
}: {
  pegawai: Opsi[];
  tahunDefault: number;
  initial?: { id: number; nama: string; jenis: "besar" | "kecil"; tahun: number; ketuaId: number | null };
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(() => ({
    nama: initial?.nama ?? "",
    jenis: initial?.jenis ?? "besar",
    tahun: String(initial?.tahun ?? tahunDefault),
    ketuaId: initial?.ketuaId ? String(initial.ketuaId) : "none",
  }));
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Ubah tim ${initial.nama}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            Tambah tim
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Ubah tim" : "Tambah tim"}</DialogTitle>
          <DialogDescription>Setiap pegawai masuk tepat 1 tim besar per tahun, dan boleh ikut beberapa tim kecil.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () =>
                simpanTimAksi({
                  id: initial?.id,
                  nama: f.nama,
                  jenis: f.jenis as "besar" | "kecil",
                  tahun: Number(f.tahun),
                  ketuaId: f.ketuaId === "none" ? null : Number(f.ketuaId),
                }),
              { onOk: () => setOpen(false) },
            );
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="tim-nama">Nama tim</Label>
            <Input id="tim-nama" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="tim-jenis">Jenis</Label>
              <Select value={f.jenis} onValueChange={(v) => setF({ ...f, jenis: v as "besar" | "kecil" })}>
                <SelectTrigger id="tim-jenis" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="besar">Tim besar</SelectItem>
                  <SelectItem value="kecil">Tim kecil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tim-tahun">Tahun</Label>
              <Input id="tim-tahun" type="number" value={f.tahun} onChange={(e) => setF({ ...f, tahun: e.target.value })} required />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tim-ketua">Ketua tim</Label>
            <Select value={f.ketuaId} onValueChange={(v) => setF({ ...f, ketuaId: v })}>
              <SelectTrigger id="tim-ketua" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Belum ditunjuk —</SelectItem>
                {pegawai.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export function AnggotaDialog({ timId, nama, pegawai, anggota }: { timId: number; nama: string; pegawai: Opsi[]; anggota: number[] }) {
  const [open, setOpen] = useState(false);
  const [pilih, setPilih] = useState<number[]>(anggota);
  const [q, setQ] = useState("");
  const { pending, run } = useAksi();
  const daftar = useMemo(() => pegawai.filter((p) => p.nama.toLowerCase().includes(q.toLowerCase())), [pegawai, q]);
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setPilih(anggota);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users />
          Anggota ({anggota.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Anggota tim {nama}</DialogTitle>
          <DialogDescription>{pilih.length} pegawai dipilih.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-9" placeholder="Cari pegawai…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari pegawai" />
        </div>
        <ul className="grid max-h-80 gap-1 overflow-y-auto rounded-xl border p-1.5">
          {daftar.map((p) => (
            <li key={p.id}>
              <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 hover:bg-muted has-[[data-state=checked]]:bg-accent">
                <Checkbox
                  checked={pilih.includes(p.id)}
                  onCheckedChange={(v) => setPilih((s) => (v ? [...s, p.id] : s.filter((x) => x !== p.id)))}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.nama}</span>
                  {p.info ? <span className="block truncate text-xs text-muted-foreground">{p.info}</span> : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button disabled={pending} onClick={() => run(() => setAnggotaTimAksi(timId, pilih), { onOk: () => setOpen(false) })}>
            {pending ? <Spinner /> : null}
            Simpan anggota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Pengaturan --------------------------------- */

export function AmbangForm({ nilai }: { nilai: number }) {
  const [v, setV] = useState(String(nilai));
  const { pending, run } = useAksi();
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => setAmbangAksi(Number(v)));
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="ambang">Ambang capaian (%)</Label>
        <Input id="ambang" type="number" min={1} max={100} value={v} onChange={(e) => setV(e.target.value)} className="tabular w-32" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : null}
        Simpan
      </Button>
    </form>
  );
}
