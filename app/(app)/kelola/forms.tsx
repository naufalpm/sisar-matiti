"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Search, UserPlus, Target } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Spinner, useAksi } from "@/components/sisar/client";
import {
  simpanKegiatanAksi,
  simpanPekerjaanAksi,
  simpanSubAksi,
  tugaskanAksi,
  ubahTargetAksi,
} from "@/app/actions/kelola";
import { PERAN_PEKERJAAN, SATUAN_TARGET } from "@/lib/master";
import { NAMA_BULAN_PENDEK } from "@/lib/waktu";

export type Opsi = { id: number; nama: string; info?: string | null };
export type Bulan = { tahun: number; bulan: number };

function Field({ label, htmlFor, children, hint, wajib }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string; wajib?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {wajib ? <span className="text-danger">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* --------------------------------- Kegiatan --------------------------------- */

export function KegiatanDialog({
  tims,
  pegawai,
  initial,
  trigger,
  onCreated,
}: {
  tims: Opsi[];
  pegawai: Opsi[];
  initial?: { id: number; nama: string; timId: number; pjId: number | null; mulai: string; selesai: string; keterangan: string | null };
  trigger?: React.ReactNode;
  onCreated?: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(() => ({
    nama: initial?.nama ?? "",
    timId: String(initial?.timId ?? tims[0]?.id ?? ""),
    pjId: initial?.pjId ? String(initial.pjId) : "none",
    mulai: initial?.mulai ?? "",
    selesai: initial?.selesai ?? "",
    keterangan: initial?.keterangan ?? "",
  }));
  const { pending, run } = useAksi();
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus />
            Buat kegiatan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Ubah kegiatan" : "Buat kegiatan baru"}</DialogTitle>
          <DialogDescription>Kegiatan hanya dapat dibuat di tim yang Anda ketuai.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () =>
                simpanKegiatanAksi({
                  id: initial?.id,
                  nama: f.nama,
                  timId: Number(f.timId),
                  pjId: f.pjId === "none" ? null : Number(f.pjId),
                  mulai: f.mulai,
                  selesai: f.selesai,
                  keterangan: f.keterangan || null,
                }),
              {
                onOk: (r) => {
                  setOpen(false);
                  if (!initial && r.id) onCreated?.(r.id);
                },
              },
            );
          }}
        >
          <Field label="Nama kegiatan" htmlFor="k-nama" wajib>
            <Input id="k-nama" value={f.nama} onChange={(e) => set("nama")(e.target.value)} placeholder="mis. Sakernas" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tim pemilik" htmlFor="k-tim" wajib>
              <Select value={f.timId} onValueChange={set("timId")}>
                <SelectTrigger id="k-tim" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tims.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nama}
                      {t.info ? ` (${t.info})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="PJ Kegiatan" htmlFor="k-pj" hint="Boleh pegawai dari tim mana pun">
              <Select value={f.pjId} onValueChange={set("pjId")}>
                <SelectTrigger id="k-pj" className="w-full">
                  <SelectValue placeholder="Pilih PJ" />
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
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mulai" htmlFor="k-mulai" wajib>
              <Input id="k-mulai" type="date" value={f.mulai} onChange={(e) => set("mulai")(e.target.value)} required />
            </Field>
            <Field label="Selesai" htmlFor="k-selesai" wajib>
              <Input id="k-selesai" type="date" value={f.selesai} min={f.mulai} onChange={(e) => set("selesai")(e.target.value)} required />
            </Field>
          </div>
          <Field label="Keterangan" htmlFor="k-ket">
            <Textarea id="k-ket" rows={3} value={f.keterangan} onChange={(e) => set("keterangan")(e.target.value)} />
          </Field>
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

/** Tombol buat kegiatan yang langsung membuka halaman kelola kegiatan baru. */
export function BuatKegiatan({ tims, pegawai }: { tims: Opsi[]; pegawai: Opsi[] }) {
  const router = useRouter();
  return <KegiatanDialog tims={tims} pegawai={pegawai} onCreated={(id) => router.push(`/kelola/${id}`)} />;
}

/* ------------------------------- Sub-kegiatan ------------------------------- */

export function SubDialog({
  kegiatanId,
  initial,
}: {
  kegiatanId: number;
  initial?: { id: number; nama: string; mulai: string | null; selesai: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [mulai, setMulai] = useState(initial?.mulai ?? "");
  const [selesai, setSelesai] = useState(initial?.selesai ?? "");
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${initial.nama}`}>
            <Pencil />
          </Button>
        ) : (
          <Button variant="outline">
            <Plus />
            Tambah sub-kegiatan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Ubah sub-kegiatan" : "Tambah sub-kegiatan"}</DialogTitle>
          <DialogDescription>Contoh: Pelatihan Petugas, Pencacahan, Pengolahan.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => simpanSubAksi({ id: initial?.id, kegiatanId, nama, mulai: mulai || null, selesai: selesai || null }),
              {
                onOk: () => {
                  setOpen(false);
                  if (!initial) {
                    setNama("");
                    setMulai("");
                    setSelesai("");
                  }
                },
              },
            );
          }}
        >
          <Field label="Nama sub-kegiatan" htmlFor="s-nama" wajib>
            <Input id="s-nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mulai" htmlFor="s-mulai">
              <Input id="s-mulai" type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} />
            </Field>
            <Field label="Selesai" htmlFor="s-selesai">
              <Input id="s-selesai" type="date" value={selesai} min={mulai} onChange={(e) => setSelesai(e.target.value)} />
            </Field>
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

/* --------------------------------- Pekerjaan --------------------------------- */

export function PekerjaanDialog({
  subKegiatanId,
  initial,
}: {
  subKegiatanId: number;
  initial?: {
    id: number;
    nama: string;
    peran: string;
    satuan: string | null;
    targetKualitatif: string | null;
    deadline: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(() => ({
    nama: initial?.nama ?? "",
    peran: initial?.peran ?? "",
    angka: initial ? !!initial.satuan : true,
    satuan: initial?.satuan ?? "",
    kualitatif: initial?.targetKualitatif ?? "",
    deadline: initial?.deadline ?? "",
  }));
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${initial.nama}`}>
            <Pencil />
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            <Plus />
            Tambah pekerjaan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Ubah pekerjaan" : "Tambah pekerjaan"}</DialogTitle>
          <DialogDescription>Bobot ditetapkan oleh Kepala. Pekerjaan baru bertanda Belum berbobot.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () =>
                simpanPekerjaanAksi({
                  id: initial?.id,
                  subKegiatanId,
                  nama: f.nama,
                  peran: f.peran,
                  satuan: f.angka ? f.satuan || null : null,
                  targetKualitatif: f.kualitatif || null,
                  deadline: f.deadline,
                }),
              { onOk: () => setOpen(false) },
            );
          }}
        >
          <Field label="Nama pekerjaan" htmlFor="p-nama" wajib>
            <Input id="p-nama" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="mis. Pencacahan rumah tangga" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peran" htmlFor="p-peran" wajib hint="Pilih dari daftar atau ketik sendiri">
              <Input id="p-peran" list="daftar-peran" value={f.peran} onChange={(e) => setF({ ...f, peran: e.target.value })} required />
              <datalist id="daftar-peran">
                {PERAN_PEKERJAAN.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
            <Field label="Deadline" htmlFor="p-deadline" wajib>
              <Input id="p-deadline" type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} required />
            </Field>
          </div>
          <div className="grid gap-3 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="p-angka" className="cursor-pointer">
                Target kuantitatif (angka)
              </Label>
              <Switch id="p-angka" checked={f.angka} onCheckedChange={(v) => setF({ ...f, angka: v })} />
            </div>
            {f.angka ? (
              <Field label="Satuan" htmlFor="p-satuan" wajib>
                <Input id="p-satuan" list="daftar-satuan" value={f.satuan} onChange={(e) => setF({ ...f, satuan: e.target.value })} required placeholder="mis. dokumen" />
                <datalist id="daftar-satuan">
                  {SATUAN_TARGET.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tanpa target angka (mis. panitia): target 1 kegiatan, progres 0% atau 100%.
              </p>
            )}
          </div>
          <Field label="Target kualitatif" htmlFor="p-kual" hint="Keterangan saja, tidak dinilai">
            <Textarea id="p-kual" rows={2} value={f.kualitatif} onChange={(e) => setF({ ...f, kualitatif: e.target.value })} />
          </Field>
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

/* --------------------------- Target per bulan grid --------------------------- */

function TargetGrid({
  months,
  values,
  onChange,
  tanpaAngka,
  satuan,
}: {
  months: Bulan[];
  values: Record<string, number>;
  onChange: (key: string, v: number) => void;
  tanpaAngka: boolean;
  satuan: string | null;
}) {
  const total = Object.values(values).reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {months.map((m) => {
          const key = `${m.tahun}-${m.bulan}`;
          return tanpaAngka ? (
            <label key={key} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
              <Checkbox checked={(values[key] ?? 0) > 0} onCheckedChange={(v) => onChange(key, v ? 1 : 0)} />
              {NAMA_BULAN_PENDEK[m.bulan - 1]} {String(m.tahun).slice(2)}
            </label>
          ) : (
            <div key={key} className="grid gap-1">
              <Label htmlFor={`t-${key}`} className="text-xs text-muted-foreground">
                {NAMA_BULAN_PENDEK[m.bulan - 1]} {m.tahun}
              </Label>
              <Input
                id={`t-${key}`}
                type="number"
                inputMode="numeric"
                min={0}
                className="tabular"
                value={values[key] ? values[key] : ""}
                placeholder="0"
                onChange={(e) => onChange(key, e.target.valueAsNumber || 0)}
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {tanpaAngka
          ? "Centang bulan tempat pekerjaan ini dihitung (biasanya bulan deadline)."
          : `Total target: ${total} ${satuan ?? ""}. Kosongkan bulan yang tidak ada targetnya.`}
      </p>
    </div>
  );
}

function keTargets(values: Record<string, number>) {
  return Object.entries(values)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => {
      const [tahun, bulan] = k.split("-").map(Number);
      return { tahun, bulan, target: v };
    });
}

/* --------------------------------- Tugaskan --------------------------------- */

export function TugaskanDialog({
  pekerjaan,
  months,
  pegawai,
  sudah,
}: {
  pekerjaan: { id: number; nama: string; satuan: string | null; deadline: string };
  months: Bulan[];
  pegawai: Opsi[];
  sudah: number[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pilih, setPilih] = useState<number[]>([]);
  const tanpaAngka = !pekerjaan.satuan;
  const defaultKey = (() => {
    const [y, m] = pekerjaan.deadline.split("-").map(Number);
    return `${y}-${m}`;
  })();
  const [values, setValues] = useState<Record<string, number>>(() => (tanpaAngka ? { [defaultKey]: 1 } : {}));
  const { pending, run } = useAksi();
  const daftar = useMemo(
    () =>
      pegawai.filter(
        (p) => !sudah.includes(p.id) && (p.nama.toLowerCase().includes(q.toLowerCase()) || (p.info ?? "").toLowerCase().includes(q.toLowerCase())),
      ),
    [pegawai, sudah, q],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus />
          Tugaskan pegawai
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tugaskan pegawai</DialogTitle>
          <DialogDescription>
            {pekerjaan.nama}. Pegawai dari tim mana pun boleh ditugaskan. Target per bulan berlaku untuk semua pegawai terpilih.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[65vh] gap-5 overflow-y-auto pr-1">
          <div className="grid gap-2">
            <Label htmlFor="cari-pegawai">Pilih pegawai ({pilih.length} dipilih)</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="cari-pegawai" className="pl-9" placeholder="Cari nama atau tim…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <ul className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border p-1.5 sm:grid-cols-2">
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
              {daftar.length === 0 ? <li className="p-3 text-sm text-muted-foreground">Tidak ada pegawai yang cocok.</li> : null}
            </ul>
          </div>
          <div className="grid gap-2">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Target className="size-4 text-primary" aria-hidden />
              Target per bulan {pekerjaan.satuan ? `(${pekerjaan.satuan})` : ""}
            </p>
            <TargetGrid
              months={months}
              values={values}
              tanpaAngka={tanpaAngka}
              satuan={pekerjaan.satuan}
              onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={pending || pilih.length === 0 || keTargets(values).length === 0}
            onClick={() =>
              run(() => tugaskanAksi({ pekerjaanId: pekerjaan.id, pegawaiIds: pilih, targets: keTargets(values) }), {
                onOk: () => {
                  setOpen(false);
                  setPilih([]);
                },
              })
            }
          >
            {pending ? <Spinner /> : <UserPlus />}
            Tugaskan {pilih.length ? `(${pilih.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TargetDialog({
  penugasanId,
  pegawaiNama,
  satuan,
  months,
  targets,
}: {
  penugasanId: number;
  pegawaiNama: string;
  satuan: string | null;
  months: Bulan[];
  targets: { tahun: number; bulan: number; target: number }[];
}) {
  const [open, setOpen] = useState(false);
  const allMonths = useMemo(() => {
    const m = [...months];
    for (const t of targets) if (!m.some((x) => x.tahun === t.tahun && x.bulan === t.bulan)) m.push(t);
    return m.sort((a, b) => a.tahun - b.tahun || a.bulan - b.bulan);
  }, [months, targets]);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(targets.map((t) => [`${t.tahun}-${t.bulan}`, t.target])),
  );
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Ubah target ${pegawaiNama}`}>
          <Target />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Target per bulan — {pegawaiNama}</DialogTitle>
          <DialogDescription>Bulan yang sudah ada progres diajukan/disetujui tidak bisa dikosongkan.</DialogDescription>
        </DialogHeader>
        <TargetGrid
          months={allMonths}
          values={values}
          tanpaAngka={!satuan}
          satuan={satuan}
          onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={pending || keTargets(values).length === 0}
            onClick={() => run(() => ubahTargetAksi(penugasanId, keTargets(values)), { onOk: () => setOpen(false) })}
          >
            {pending ? <Spinner /> : null}
            Simpan target
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
