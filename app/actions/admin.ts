"use server";

import { requireAdmin } from "@/lib/auth/user";
import { jalankan, type HasilAksi } from "@/lib/aksi";
import * as admin from "@/lib/layanan/admin";

export async function simpanPegawaiAksi(input: Parameters<typeof admin.simpanPegawai>[0]): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => admin.simpanPegawai(input), input.id ? "Data pegawai diperbarui." : "Akun pegawai dibuat.");
}

export async function setAktifPegawaiAksi(pegawaiId: number, aktif: boolean): Promise<HasilAksi> {
  const u = await requireAdmin();
  return jalankan(() => admin.setAktifPegawai(u.id, pegawaiId, aktif), aktif ? "Akun diaktifkan." : "Akun dinonaktifkan.");
}

export async function resetPasswordAksi(pegawaiId: number, password: string): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => admin.resetPassword(pegawaiId, password), "Password direset. Pegawai wajib menggantinya saat login.");
}

export async function simpanTimAksi(input: Parameters<typeof admin.simpanTim>[0]): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => admin.simpanTim(input), input.id ? "Tim diperbarui." : "Tim dibuat.");
}

export async function setAktifTimAksi(timId: number, aktif: boolean): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => admin.setAktifTim(timId, aktif), aktif ? "Tim diaktifkan." : "Tim dinonaktifkan.");
}

export async function setAnggotaTimAksi(timId: number, pegawaiIds: number[]): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => admin.setAnggotaTim(timId, pegawaiIds), "Anggota tim disimpan.");
}

export async function setAmbangAksi(nilai: number): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => admin.setAmbang(nilai), "Ambang capaian disimpan.");
}
