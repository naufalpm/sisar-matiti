"use server";

import { requireAdmin } from "@/lib/auth/user";
import { jalankan, type HasilAksi } from "@/lib/aksi";
import * as layanan from "@/lib/layanan/pegawai";

export async function simpanProfilAksi(input: layanan.InputProfil): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => layanan.simpanProfil(input), "Profil pegawai disimpan.");
}

export async function unggahFotoAksi(pegawaiId: number, fd: FormData): Promise<HasilAksi> {
  await requireAdmin();
  const file = fd.get("foto");
  if (!(file instanceof File)) return { ok: false, pesan: "Pilih file foto terlebih dahulu." };
  return jalankan(() => layanan.simpanFoto(pegawaiId, file), "Foto diperbarui.");
}

export async function hapusFotoAksi(pegawaiId: number): Promise<HasilAksi> {
  await requireAdmin();
  return jalankan(() => layanan.hapusFoto(pegawaiId), "Foto dihapus.");
}
