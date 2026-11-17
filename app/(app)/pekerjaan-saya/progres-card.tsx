"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, ChevronRight, Send, Save, MessageSquareWarning, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ApprovalBadge, BobotBadge, ProgressBar, StatusBadge, TerlambatBadge } from "@/components/sisar/status";
import { Spinner, useAksi } from "@/components/sisar/client";
import { simpanProgresAksi } from "@/app/actions/progres";
import type { StatusProgres } from "@/lib/capaian";
import { cn } from "@/lib/utils";

export type ProgresItem = {
  id: number;
  kegiatanId: number;
  kegiatanNama: string;
  subNama: string;
  timNama: string;
  pekerjaanNama: string;
  peran: string;
  satuan: string | null;
  targetKualitatif: string | null;
  deadline: string;
  deadlineLabel: string;
  sisaHari: number;
  bobot: number | null;
  target: number;
  realisasiDiajukan: number;
  realisasiDisetujui: number;
  progres: number;
  status: StatusProgres;
  jenisApproval: "normal" | "self" | null;
  diverifikasiKepala: boolean;
  catatan: string | null;
  alasanTolak: string | null;
  terlambat: boolean;
  terkunci: boolean;
};

function DeadlineInfo({ item }: { item: ProgresItem }) {
  const s = item.sisaHari;
  const teks =
    item.status === "selesai" ? item.deadlineLabel : s < 0 ? `lewat ${-s} hari` : s === 0 ? "hari ini" : `${s} hari lagi`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        item.status !== "selesai" && s < 0 && "text-danger",
        item.status !== "selesai" && s >= 0 && s <= 3 && "text-warning",
        (item.status === "selesai" || s > 3) && "text-muted-foreground",
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden />
      Deadline {item.deadlineLabel}
      {item.status !== "selesai" ? <span>· {teks}</span> : null}
    </span>
  );
}

export function ProgresCard({ item }: { item: ProgresItem }) {
  const tanpaAngka = !item.satuan;
  const [realisasi, setRealisasi] = useState<number>(item.realisasiDiajukan);
  const [catatan, setCatatan] = useState(item.catatan ?? "");
  const { pending, run } = useAksi();
  const [aksi, setAksi] = useState<"simpan" | "ajukan" | null>(null);
  const bisaEdit = item.status !== "selesai";

  function kirim(ajukan: boolean) {
    setAksi(ajukan ? "ajukan" : "simpan");
    run(() => simpanProgresAksi({ targetBulananId: item.id, realisasi, catatan: catatan || null, ajukan }));
  }

  return (
    <article className="rounded-2xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/kegiatan/${item.kegiatanId}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {item.kegiatanNama}
            <ChevronRight className="size-3" aria-hidden />
            <span className="text-muted-foreground">{item.subNama}</span>
          </Link>
          <h3 className="mt-0.5 text-base font-semibold">{item.pekerjaanNama}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {item.peran}
            </span>
            <DeadlineInfo item={item} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={item.status} />
          {item.terlambat ? <TerlambatBadge /> : null}
          <ApprovalBadge jenis={item.jenisApproval} diverifikasi={item.diverifikasiKepala} />
          <BobotBadge bobot={item.bobot} />
        </div>
      </div>

      {item.targetKualitatif ? (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Target kualitatif:</span> {item.targetKualitatif}
        </p>
      ) : null}

      <div className="mt-4 grid gap-1.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">
            Disetujui{" "}
            <b className="tabular text-foreground">
              {tanpaAngka ? (item.realisasiDisetujui >= 1 ? "Selesai" : "Belum") : `${item.realisasiDisetujui} / ${item.target} ${item.satuan}`}
            </b>
            {item.status === "diajukan" && !tanpaAngka ? (
              <span className="text-warning"> · diajukan {item.realisasiDiajukan}</span>
            ) : null}
          </span>
          <span className="tabular font-bold">{Math.round(item.progres)}%</span>
        </div>
        <ProgressBar value={item.progres} label={`Progres ${item.pekerjaanNama}`} />
      </div>

      {item.alasanTolak && item.status !== "diajukan" && item.status !== "selesai" ? (
        <div role="alert" className="mt-3 flex gap-2 rounded-xl border border-danger/20 bg-danger-soft p-3 text-sm">
          <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="font-semibold text-danger">Dikembalikan oleh atasan</p>
            <p className="text-foreground/80">{item.alasanTolak}</p>
          </div>
        </div>
      ) : null}

      {item.terkunci ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden />
          Capaian bulan ini sudah dikunci. Progres tetap bisa diajukan dan dicatat, tetapi tidak mengubah CKP.
        </p>
      ) : null}

      {bisaEdit ? (
        <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-start">
          {tanpaAngka ? (
            <div className="flex min-h-10 items-center gap-2.5">
              <Checkbox
                id={`selesai-${item.id}`}
                checked={realisasi >= 1}
                onCheckedChange={(v) => setRealisasi(v ? 1 : 0)}
                className="size-5"
              />
              <Label htmlFor={`selesai-${item.id}`} className="cursor-pointer">
                Pekerjaan sudah selesai
              </Label>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label htmlFor={`realisasi-${item.id}`}>Realisasi ({item.satuan})</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`realisasi-${item.id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={Number.isNaN(realisasi) ? "" : realisasi}
                  onChange={(e) => setRealisasi(e.target.valueAsNumber)}
                  className="tabular"
                />
                <span className="text-sm whitespace-nowrap text-muted-foreground">/ {item.target}</span>
              </div>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor={`catatan-${item.id}`}>
              Catatan <span className="font-normal text-muted-foreground">(opsional, mis. link bukti)</span>
            </Label>
            <Textarea
              id={`catatan-${item.id}`}
              rows={1}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="min-h-10"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
            <Button variant="outline" disabled={pending} onClick={() => kirim(false)}>
              {pending && aksi === "simpan" ? <Spinner /> : <Save />}
              Simpan draf
            </Button>
            <Button disabled={pending || !(realisasi > 0)} onClick={() => kirim(true)}>
              {pending && aksi === "ajukan" ? <Spinner /> : <Send />}
              {item.status === "diajukan" ? "Perbarui pengajuan" : tanpaAngka ? "Ajukan selesai" : "Ajukan progres"}
            </Button>
          </div>
        </div>
      ) : item.catatan ? (
        <p className="mt-3 text-sm break-words text-muted-foreground">
          <span className="font-medium text-foreground">Catatan:</span> {item.catatan}
        </p>
      ) : null}
    </article>
  );
}
