import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { bacaSesi } from "./session";

export type CurrentUser = {
  id: number;
  nama: string;
  username: string;
  jabatan: string | null;
  /** Nama file foto (pakai urlFoto untuk URL-nya). */
  foto: string | null;
  isKepala: boolean;
  isAdmin: boolean;
  harusGantiPassword: boolean;
  /** Tim (semua tahun, aktif) yang diketuai pengguna. */
  timDiketuai: { id: number; nama: string; tahun: number; jenis: "besar" | "kecil" }[];
  isKetuaTim: boolean;
  /** Ada kegiatan aktif yang PJ-nya pengguna. */
  isPJ: boolean;
};

/** Data Access Layer: membaca sesi dan peran pengguna. Di-cache per request. */
export const getUser = cache(async (): Promise<CurrentUser | null> => {
  const id = await bacaSesi();
  if (!id) return null;
  const p = await db.query.pegawai.findFirst({ where: eq(schema.pegawai.id, id) });
  if (!p || !p.aktif) return null;

  const timDiketuai = await db
    .select({ id: schema.tim.id, nama: schema.tim.nama, tahun: schema.tim.tahun, jenis: schema.tim.jenis })
    .from(schema.tim)
    .where(and(eq(schema.tim.ketuaId, id), eq(schema.tim.aktif, true)));

  const pj = await db
    .select({ id: schema.kegiatan.id })
    .from(schema.kegiatan)
    .where(and(eq(schema.kegiatan.pjId, id), eq(schema.kegiatan.aktif, true)))
    .limit(1);

  return {
    id: p.id,
    nama: p.nama,
    username: p.username,
    jabatan: p.jabatan,
    foto: p.foto,
    isKepala: p.isKepala,
    isAdmin: p.isAdmin,
    harusGantiPassword: p.harusGantiPassword,
    timDiketuai,
    isKetuaTim: timDiketuai.length > 0,
    isPJ: pj.length > 0,
  };
});

/** Wajib login; redirect ke /login bila belum. */
export async function requireUser(): Promise<CurrentUser> {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (!u.isAdmin) redirect("/terlarang");
  return u;
}

export async function requireKepala() {
  const u = await requireUser();
  if (!u.isKepala) redirect("/terlarang");
  return u;
}

/** Kepala & Admin boleh melihat capaian semua pegawai. */
export function bisaLihatSemua(u: CurrentUser) {
  return u.isKepala || u.isAdmin;
}
