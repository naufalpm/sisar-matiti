"use server";

import { requireUser } from "@/lib/auth/user";
import { jalankan, type HasilAksi } from "@/lib/aksi";
import * as kelola from "@/lib/layanan/kelola";

export async function simpanKegiatanAksi(input: kelola.InputKegiatan): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.simpanKegiatan(user, input), input.id ? "Kegiatan diperbarui." : "Kegiatan dibuat.");
}

export async function hapusKegiatanAksi(id: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.hapusKegiatan(user, id), "Kegiatan dihapus (dinonaktifkan).");
}

export async function simpanSubAksi(input: {
  id?: number;
  kegiatanId: number;
  nama: string;
  mulai: string | null;
  selesai: string | null;
}): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.simpanSub(user, input), input.id ? "Sub-kegiatan diperbarui." : "Sub-kegiatan ditambahkan.");
}

export async function hapusSubAksi(id: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.hapusSub(user, id), "Sub-kegiatan dihapus.");
}

export async function simpanPekerjaanAksi(input: kelola.InputPekerjaan): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.simpanPekerjaan(user, input), input.id ? "Pekerjaan diperbarui." : "Pekerjaan ditambahkan.");
}

export async function hapusPekerjaanAksi(id: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.hapusPekerjaan(user, id), "Pekerjaan dihapus (dinonaktifkan).");
}

export async function tugaskanAksi(input: {
  pekerjaanId: number;
  pegawaiIds: number[];
  targets: kelola.TargetInput[];
}): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.tugaskan(user, input), "Pegawai ditugaskan.");
}

export async function ubahTargetAksi(penugasanId: number, targets: kelola.TargetInput[]): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.ubahTarget(user, penugasanId, targets), "Target diperbarui.");
}

export async function hapusPenugasanAksi(penugasanId: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.hapusPenugasan(user, penugasanId), "Penugasan dihapus.");
}

export async function setBobotAksi(pekerjaanId: number, bobot: number | null): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(() => kelola.setBobot(user, pekerjaanId, bobot), "Bobot disimpan.");
}
