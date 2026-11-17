"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, X, Undo2, BadgeCheck, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlasanDialog, Spinner, useAksi } from "@/components/sisar/client";
import { ApprovalBadge, ProgressBar, StatusBadge, TerlambatBadge, BobotBadge } from "@/components/sisar/status";
import { Avatar, EmptyState } from "@/components/sisar/ui";
import { approveAksi, approveBanyakAksi, tolakAksi, unapproveAksi, verifikasiAksi } from "@/app/actions/progres";
import type { StatusProgres } from "@/lib/capaian";

export type ApprovalRow = {
  id: number;
  pegawaiNama: string;
  pekerjaanNama: string;
  peran: string;
  kegiatanId: number;
  kegiatanNama: string;
  subNama: string;
  periode: string;
  deadlineLabel: string;
  satuan: string | null;
  target: number;
  realisasiDiajukan: number;
  realisasiDisetujui: number;
  progresDiajukan: number;
  progresDisetujui: number;
  status: StatusProgres;
  jenisApproval: "normal" | "self" | null;
  diverifikasiKepala: boolean;
  catatan: string | null;
  terlambat: boolean;
  terkunci: boolean;
  diajukanLabel: string;
  disetujuiLabel: string;
  bobot: number | null;
  bisaUnapprove: boolean;
};

function Info({ r, mode }: { r: ApprovalRow; mode: "antrean" | "disetujui" | "self" }) {
  const tanpaAngka = !r.satuan;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2.5">
        <Avatar nama={r.pegawaiNama} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{r.pegawaiNama}</p>
          <p className="truncate text-xs text-muted-foreground">
            {mode === "antrean" ? `Diajukan ${r.diajukanLabel}` : `Disetujui ${r.disetujuiLabel}`} · {r.periode}
          </p>
        </div>
      </div>
      <p className="mt-2.5 font-medium">{r.pekerjaanNama}</p>
      <p className="text-xs text-muted-foreground">
        <Link href={`/kegiatan/${r.kegiatanId}`} className="text-primary hover:underline">
          {r.kegiatanNama}
        </Link>{" "}
        · {r.subNama} · {r.peran} · deadline {r.deadlineLabel}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusBadge status={r.status} />
        {r.terlambat ? <TerlambatBadge /> : null}
        <ApprovalBadge jenis={r.jenisApproval} diverifikasi={r.diverifikasiKepala} />
        <BobotBadge bobot={r.bobot} />
      </div>
      <div className="mt-3 grid max-w-md gap-1">
        <p className="text-sm">
          {tanpaAngka ? (
            mode === "antrean" ? (
              <>Diajukan sebagai <b>selesai</b></>
            ) : (
              <>Selesai</>
            )
          ) : mode === "antrean" ? (
            <>
              Diajukan <b className="tabular">{r.realisasiDiajukan}</b> / {r.target} {r.satuan}
              {r.realisasiDisetujui > 0 ? (
                <span className="text-muted-foreground"> (sebelumnya disetujui {r.realisasiDisetujui})</span>
              ) : null}
            </>
          ) : (
            <>
              Disetujui <b className="tabular">{r.realisasiDisetujui}</b> / {r.target} {r.satuan}
            </>
          )}
          <span className="tabular ml-2 font-bold">
            {Math.round(mode === "antrean" ? r.progresDiajukan : r.progresDisetujui)}%
          </span>
        </p>
        <ProgressBar value={mode === "antrean" ? r.progresDiajukan : r.progresDisetujui} />
      </div>
      {r.catatan ? (
        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm break-words">
          <span className="font-medium">Catatan pegawai:</span> {r.catatan}
        </p>
      ) : null}
      {r.terkunci ? (
        <p className="mt-2 text-xs text-muted-foreground">Bulan {r.periode} sudah dikunci — keputusan tidak mengubah CKP.</p>
      ) : null}
    </div>
  );
}

export function AntreanList({ rows }: { rows: ApprovalRow[] }) {
  const [pilih, setPilih] = useState<number[]>([]);
  const { pending, run } = useAksi();
  const [aktifId, setAktifId] = useState<number | null>(null);

  if (rows.length === 0) {
    return <EmptyState title="Tidak ada pengajuan yang menunggu" description="Semua pengajuan sudah diputuskan. Kerja bagus!" />;
  }
  const semua = pilih.length === rows.length;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5">
        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={semua} onCheckedChange={(v) => setPilih(v ? rows.map((r) => r.id) : [])} aria-label="Pilih semua" />
          Pilih semua
        </label>
        <Button
          size="sm"
          disabled={pilih.length === 0 || pending}
          onClick={() => run(() => approveBanyakAksi(pilih), { onOk: () => setPilih([]) })}
        >
          {pending && aktifId == null ? <Spinner /> : <CheckCheck />}
          Approve terpilih ({pilih.length})
        </Button>
      </div>
      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.id} className="flex gap-3 px-4 py-4 sm:px-5">
            <Checkbox
              className="mt-2.5"
              checked={pilih.includes(r.id)}
              onCheckedChange={(v) => setPilih((p) => (v ? [...p, r.id] : p.filter((x) => x !== r.id)))}
              aria-label={`Pilih pengajuan ${r.pegawaiNama}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-start">
              <Info r={r} mode="antrean" />
              <div className="flex shrink-0 gap-2 md:flex-col">
                <Button
                  disabled={pending}
                  onClick={() => {
                    setAktifId(r.id);
                    run(() => approveAksi(r.id), { onOk: () => setAktifId(null) });
                  }}
                  className="bg-success hover:bg-success/90"
                >
                  {pending && aktifId === r.id ? <Spinner /> : <Check />}
                  Approve
                </Button>
                <AlasanDialog
                  trigger={
                    <Button variant="destructive" disabled={pending}>
                      <X />
                      Tolak
                    </Button>
                  }
                  title="Tolak pengajuan"
                  description={`${r.pegawaiNama} — ${r.pekerjaanNama}. Status akan kembali ke Dikerjakan.`}
                  confirmLabel="Tolak pengajuan"
                  onConfirm={(alasan) => tolakAksi(r.id, alasan)}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DisetujuiList({ rows }: { rows: ApprovalRow[] }) {
  if (rows.length === 0) return <EmptyState compact title="Belum ada pekerjaan yang di-approve di bulan ini" />;
  return (
    <ul className="divide-y">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:px-5 md:flex-row md:items-start">
          <Info r={r} mode="disetujui" />
          {r.bisaUnapprove ? (
            <AlasanDialog
              trigger={
                <Button variant="outline" className="shrink-0">
                  <Undo2 />
                  Unapprove
                </Button>
              }
              title="Batalkan approval"
              description={`${r.pegawaiNama} — ${r.pekerjaanNama}. Realisasi disetujui kembali ke nilai sebelumnya dan status menjadi Dikerjakan.`}
              confirmLabel="Unapprove"
              onConfirm={(alasan) => unapproveAksi(r.id, alasan)}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function SelfApprovedList({ rows }: { rows: ApprovalRow[] }) {
  const { pending, run } = useAksi();
  const [aktif, setAktif] = useState<number | null>(null);
  if (rows.length === 0) return <EmptyState compact title="Tidak ada pekerjaan self-approved di bulan ini" />;
  return (
    <ul className="divide-y">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:px-5 md:flex-row md:items-start">
          <Info r={r} mode="self" />
          {!r.diverifikasiKepala ? (
            <Button
              className="shrink-0"
              disabled={pending}
              onClick={() => {
                setAktif(r.id);
                run(() => verifikasiAksi(r.id));
              }}
            >
              {pending && aktif === r.id ? <Spinner /> : <BadgeCheck />}
              Verifikasi
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
