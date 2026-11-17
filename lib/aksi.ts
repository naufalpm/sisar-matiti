import "server-only";
import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AksiError } from "@/lib/layanan/progres";

export type HasilAksi = { ok: true; pesan?: string; id?: number } | { ok: false; pesan: string };

/** Menjalankan aksi dan mengubah error menjadi pesan yang aman ditampilkan. */
export async function jalankan(fn: () => Promise<unknown>, pesanSukses?: string): Promise<HasilAksi> {
  try {
    const r = await fn();
    revalidatePath("/", "layout");
    return { ok: true, pesan: pesanSukses, id: typeof r === "number" ? r : undefined };
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof AksiError) return { ok: false, pesan: e.message };
    console.error(e);
    return { ok: false, pesan: "Terjadi kesalahan pada server. Coba lagi beberapa saat lagi." };
  }
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function strOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key).trim();
  return v ? v : null;
}

export function int(fd: FormData, key: string): number {
  const n = Number(str(fd, key));
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

export function intOrNull(fd: FormData, key: string): number | null {
  const v = str(fd, key).trim();
  if (!v || v === "none") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
