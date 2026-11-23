import "server-only";
import { and, asc, eq, isNotNull, ne, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { FOTO_MAKS_BYTE, hapusFileFoto, kenaliGambar, simpanFileFoto } from "@/lib/foto";
import { AksiError } from "./progres";

/**
 * Direktori pegawai: akun aktif. Akun admin teknis tanpa NIP (dari `npm run admin:buat`)
 * tidak ditampilkan karena bukan pegawai.
 */
export function daftarPegawai() {
  return db
    .select()
    .from(schema.pegawai)
    .where(and(eq(schema.pegawai.aktif, true), or(isNotNull(schema.pegawai.nip), eq(schema.pegawai.isAdmin, false))))
    .orderBy(asc(schema.pegawai.nama));
}

export async function detailPegawai(id: number) {
  if (!Number.isInteger(id)) return null;
  const p = await db.query.pegawai.findFirst({ where: eq(schema.pegawai.id, id) });
  return p ?? null;
}

const TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
const tanggalAtauNull = (v: string | null, label: string) => {
  const s = v?.trim();
  if (!s) return null;
  if (!TANGGAL.test(s) || Number.isNaN(Date.parse(`${s}T00:00:00Z`))) throw new AksiError(`${label} tidak valid.`);
  return s;
};
const teksAtauNull = (v: string | null) => v?.replace(/\s+/g, " ").trim() || null;

export type InputProfil = {
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

export async function simpanProfil(input: InputProfil) {
  const nama = input.nama.trim();
  if (nama.length < 2) throw new AksiError("Nama wajib diisi.");
  const nip = input.nip?.trim() || null;
  if (nip && !/^\d{18}$/.test(nip)) throw new AksiError("NIP harus 18 digit angka.");
  const nipLama = input.nipLama?.trim() || null;
  if (nipLama && !/^\d{9}$/.test(nipLama)) throw new AksiError("NIP lama harus 9 digit angka.");
  if (input.jenisKelamin && input.jenisKelamin !== "L" && input.jenisKelamin !== "P") {
    throw new AksiError("Jenis kelamin tidak valid.");
  }
  if (nip) {
    const dup = await db.query.pegawai.findFirst({
      where: and(eq(schema.pegawai.nip, nip), ne(schema.pegawai.id, input.id)),
    });
    if (dup) throw new AksiError(`NIP sudah dipakai ${dup.nama}.`);
  }
  const hasil = await db
    .update(schema.pegawai)
    .set({
      nama,
      nip,
      nipLama,
      jabatan: teksAtauNull(input.jabatan),
      unitKerja: teksAtauNull(input.unitKerja),
      golongan: teksAtauNull(input.golongan),
      tmtGolongan: tanggalAtauNull(input.tmtGolongan, "TMT golongan"),
      pendidikan: teksAtauNull(input.pendidikan),
      tglLulus: tanggalAtauNull(input.tglLulus, "Tanggal lulus"),
      jenisKelamin: input.jenisKelamin,
      tglLahir: tanggalAtauNull(input.tglLahir, "Tanggal lahir"),
    })
    .where(eq(schema.pegawai.id, input.id))
    .returning({ id: schema.pegawai.id });
  if (!hasil.length) throw new AksiError("Pegawai tidak ditemukan.");
  return input.id;
}

export async function simpanFoto(pegawaiId: number, file: File) {
  const p = await detailPegawai(pegawaiId);
  if (!p) throw new AksiError("Pegawai tidak ditemukan.");
  if (file.size === 0) throw new AksiError("Pilih file foto terlebih dahulu.");
  if (file.size > FOTO_MAKS_BYTE) throw new AksiError("Ukuran foto maksimal 2 MB.");
  const isi = new Uint8Array(await file.arrayBuffer());
  const ext = kenaliGambar(isi);
  if (!ext) throw new AksiError("Format foto harus JPG, PNG, atau WebP.");
  const nama = await simpanFileFoto(pegawaiId, isi, ext);
  await db.update(schema.pegawai).set({ foto: nama }).where(eq(schema.pegawai.id, pegawaiId));
  await hapusFileFoto(p.foto);
  return pegawaiId;
}

export async function hapusFoto(pegawaiId: number) {
  const p = await detailPegawai(pegawaiId);
  if (!p) throw new AksiError("Pegawai tidak ditemukan.");
  await db.update(schema.pegawai).set({ foto: null }).where(eq(schema.pegawai.id, pegawaiId));
  await hapusFileFoto(p.foto);
}
