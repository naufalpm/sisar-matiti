"use server";

import { requireUser } from "@/lib/auth/user";
import { jalankan, type HasilAksi } from "@/lib/aksi";
import * as progres from "@/lib/layanan/progres";

export async function simpanProgresAksi(input: {
  targetBulananId: number;
  realisasi: number;
  catatan: string | null;
  ajukan: boolean;
}): Promise<HasilAksi> {
  const user = await requireUser();
  let self = false;
  const r = await jalankan(async () => {
    self = (await progres.isiProgres(user, input)).selfApproved;
  });
  if (r.ok) {
    r.pesan = !input.ajukan
      ? "Progres disimpan."
      : self
        ? "Progres sah (self-approved sebagai Ketua Tim)."
        : "Pekerjaan diajukan. Menunggu approval.";
  }
  return r;
}

export async function approveAksi(targetBulananId: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => progres.approve(user, targetBulananId), "Pekerjaan di-approve.");
}

export async function approveBanyakAksi(ids: number[]): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(async () => {
    for (const id of ids) await progres.approve(user, id);
  }, `${ids.length} pekerjaan di-approve.`);
}

export async function tolakAksi(targetBulananId: number, alasan: string): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => progres.tolak(user, targetBulananId, alasan), "Pengajuan ditolak.");
}

export async function unapproveAksi(targetBulananId: number, alasan: string): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => progres.unapprove(user, targetBulananId, alasan), "Approval dibatalkan.");
}

export async function verifikasiAksi(targetBulananId: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => progres.verifikasiKepala(user, targetBulananId), "Diverifikasi Kepala.");
}
