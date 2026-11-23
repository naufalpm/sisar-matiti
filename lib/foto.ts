import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/** Folder foto pegawai. Di Docker dipasang sebagai volume (lihat docker-compose.yml). */
export const UPLOAD_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads"),
);
/** Lokasi file foto — hanya diakses saat runtime, jadi dikecualikan dari file tracing Turbopack. */
const lokasi = (nama: string) => path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, nama);
export const FOTO_MAKS_BYTE = 2 * 1024 * 1024;

const JENIS = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
type Ekstensi = keyof typeof JENIS;

/** Nama file foto yang sah: `<id pegawai>-<acak>.<ext>` — mencegah path traversal. */
export const NAMA_FOTO = /^\d+-[a-f0-9]{12}\.(jpg|png|webp)$/;

/** Kenali format dari isi file (magic bytes), bukan dari nama/MIME kiriman browser. */
export function kenaliGambar(b: Uint8Array): Ekstensi | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "png";
  if (
    b.length >= 12 &&
    String.fromCharCode(...b.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.subarray(8, 12)) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function simpanFileFoto(pegawaiId: number, isi: Uint8Array, ext: Ekstensi) {
  await mkdir(/*turbopackIgnore: true*/ UPLOAD_DIR, { recursive: true });
  const nama = `${pegawaiId}-${randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(lokasi(nama), isi);
  return nama;
}

export async function hapusFileFoto(nama: string | null | undefined) {
  if (!nama || !NAMA_FOTO.test(nama)) return;
  await unlink(lokasi(nama)).catch(() => {});
}

export async function bacaFileFoto(nama: string) {
  if (!NAMA_FOTO.test(nama)) return null;
  try {
    const isi = await readFile(lokasi(nama));
    return { isi, contentType: JENIS[nama.split(".").pop() as Ekstensi] };
  } catch {
    return null;
  }
}

export const urlFoto = (nama: string | null | undefined) => (nama ? `/api/foto/${nama}` : null);
