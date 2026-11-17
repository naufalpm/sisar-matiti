"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NAMA_BULAN } from "@/lib/waktu";

export type HasilAksiClient = { ok: boolean; pesan?: string; id?: number };

/** Menjalankan server action dengan transition + toast. */
export function useAksi() {
  const [pending, start] = useTransition();
  const router = useRouter();
  function run(fn: () => Promise<HasilAksiClient>, opts?: { onOk?: (r: HasilAksiClient) => void; sukses?: string }) {
    start(async () => {
      const r = await fn();
      if (r.ok) {
        if (r.pesan || opts?.sukses) toast.success(r.pesan ?? opts?.sukses);
        opts?.onOk?.(r);
        router.refresh();
      } else {
        toast.error(r.pesan ?? "Gagal menyimpan.");
      }
    });
  }
  return { pending, run };
}

export function Spinner() {
  return <Loader2 className="size-4 animate-spin" aria-hidden />;
}

/** Pemilih bulan & tahun, menyimpan nilai di ?bulan=YYYY-MM. */
export function MonthPicker({ tahun, bulan, param = "bulan" }: { tahun: number; bulan: number; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  function go(y: number, m: number) {
    const q = new URLSearchParams(sp.toString());
    q.set(param, `${y}-${String(m).padStart(2, "0")}`);
    start(() => router.push(`${pathname}?${q.toString()}`));
  }
  const prev = bulan === 1 ? [tahun - 1, 12] : [tahun, bulan - 1];
  const next = bulan === 12 ? [tahun + 1, 1] : [tahun, bulan + 1];
  const thisYear = new Date().getFullYear();
  const years = Array.from(new Set([thisYear - 2, thisYear - 1, thisYear, thisYear + 1, tahun])).sort();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border bg-card p-1 shadow-xs" aria-busy={pending}>
      <Button variant="ghost" size="icon" aria-label="Bulan sebelumnya" onClick={() => go(prev[0], prev[1])}>
        <ChevronLeft />
      </Button>
      <label className="sr-only" htmlFor="pilih-bulan">
        Bulan
      </label>
      <select
        id="pilih-bulan"
        className="h-8 cursor-pointer rounded-md bg-transparent px-1 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        value={bulan}
        onChange={(e) => go(tahun, Number(e.target.value))}
      >
        {NAMA_BULAN.map((n, i) => (
          <option key={n} value={i + 1}>
            {n}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="pilih-tahun">
        Tahun
      </label>
      <select
        id="pilih-tahun"
        className="h-8 cursor-pointer rounded-md bg-transparent px-1 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        value={tahun}
        onChange={(e) => go(Number(e.target.value), bulan)}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <Button variant="ghost" size="icon" aria-label="Bulan berikutnya" onClick={() => go(next[0], next[1])}>
        {pending ? <Spinner /> : <ChevronRight />}
      </Button>
    </div>
  );
}

/** Dialog yang mewajibkan alasan (tolak / unapprove). */
export function AlasanDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = true,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: (alasan: string) => Promise<HasilAksiClient>;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState("");
  const { pending, run } = useAksi();
  const valid = alasan.trim().length >= 3;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="alasan">
            Alasan <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="alasan"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Tuliskan alasan yang jelas agar pegawai bisa memperbaiki."
            rows={4}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">Alasan akan terlihat oleh pegawai dan tercatat di riwayat.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!valid || pending}
            onClick={() =>
              run(() => onConfirm(alasan), {
                onOk: () => {
                  setOpen(false);
                  setAlasan("");
                },
              })
            }
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Dialog konfirmasi sederhana. */
export function KonfirmasiDialog({
  trigger,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  onConfirm,
  destructive,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<HasilAksiClient>;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAksi();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={() => run(onConfirm, { onOk: () => setOpen(false) })}
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
