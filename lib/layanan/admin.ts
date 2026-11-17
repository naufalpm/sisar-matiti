import "server-only";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { hashPassword } from "@/lib/auth/password";
import { hapusSemuaSesiPegawai } from "@/lib/auth/session";
import { AksiError } from "./progres";

const USERNAME = /^[a-z0-9._-]{3,32}$/;

export async function simpanPegawai(input: {
  id?: number;
  username: string;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  isKepala: boolean;
  isAdmin: boolean;
  password?: string | null;
}) {
  const username = input.username.trim().toLowerCase();
  const nama = input.nama.trim();
  if (!USERNAME.test(username)) {
    throw new AksiError("Username 3–32 karakter: huruf kecil, angka, titik, minus, atau garis bawah.");
  }
  if (nama.length < 2) throw new AksiError("Nama wajib diisi.");
  const dup = await db.query.pegawai.findFirst({
    where: input.id
      ? and(eq(schema.pegawai.username, username), ne(schema.pegawai.id, input.id))
      : eq(schema.pegawai.username, username),
  });
  if (dup) throw new AksiError("Username sudah dipakai.");

  const nilai = {
    username,
    nama,
    nip: input.nip?.trim() || null,
    jabatan: input.jabatan?.trim() || null,
    isKepala: input.isKepala,
    isAdmin: input.isAdmin,
  };
  if (input.id) {
    await db.update(schema.pegawai).set(nilai).where(eq(schema.pegawai.id, input.id));
    return input.id;
  }
  const pw = input.password ?? "";
  if (pw.length < 8) throw new AksiError("Password awal minimal 8 karakter.");
  const [p] = await db
    .insert(schema.pegawai)
    .values({ ...nilai, passwordHash: await hashPassword(pw), harusGantiPassword: true })
    .returning({ id: schema.pegawai.id });
  return p.id;
}

export async function setAktifPegawai(adminId: number, pegawaiId: number, aktif: boolean) {
  if (adminId === pegawaiId && !aktif) throw new AksiError("Anda tidak dapat menonaktifkan akun sendiri.");
  await db.update(schema.pegawai).set({ aktif }).where(eq(schema.pegawai.id, pegawaiId));
  if (!aktif) await hapusSemuaSesiPegawai(pegawaiId);
}

export async function resetPassword(pegawaiId: number, passwordBaru: string) {
  if (passwordBaru.length < 8) throw new AksiError("Password minimal 8 karakter.");
  await db
    .update(schema.pegawai)
    .set({ passwordHash: await hashPassword(passwordBaru), harusGantiPassword: true })
    .where(eq(schema.pegawai.id, pegawaiId));
  await hapusSemuaSesiPegawai(pegawaiId);
}

/* ------------------------------------- Tim ------------------------------------- */

export async function simpanTim(input: {
  id?: number;
  nama: string;
  jenis: "besar" | "kecil";
  tahun: number;
  ketuaId: number | null;
}) {
  const nama = input.nama.trim();
  if (nama.length < 2) throw new AksiError("Nama tim wajib diisi.");
  if (!Number.isInteger(input.tahun) || input.tahun < 2020 || input.tahun > 2100) {
    throw new AksiError("Tahun tidak valid.");
  }
  const nilai = { nama, jenis: input.jenis, tahun: input.tahun, ketuaId: input.ketuaId };
  if (input.id) {
    const lama = await db.query.tim.findFirst({ where: eq(schema.tim.id, input.id) });
    if (!lama) throw new AksiError("Tim tidak ditemukan.");
    if (lama.jenis !== input.jenis || lama.tahun !== input.tahun) {
      const anggota = await db
        .select({ pegawaiId: schema.anggotaTim.pegawaiId })
        .from(schema.anggotaTim)
        .where(eq(schema.anggotaTim.timId, input.id));
      if (input.jenis === "besar") {
        await cekSatuTimBesar(anggota.map((a) => a.pegawaiId), input.tahun, input.id);
      }
    }
    await db.update(schema.tim).set(nilai).where(eq(schema.tim.id, input.id));
    return input.id;
  }
  const [t] = await db.insert(schema.tim).values(nilai).returning({ id: schema.tim.id });
  return t.id;
}

export async function setAktifTim(timId: number, aktif: boolean) {
  await db.update(schema.tim).set({ aktif }).where(eq(schema.tim.id, timId));
}

/** Setiap pegawai masuk tepat 1 tim besar per tahun. */
async function cekSatuTimBesar(pegawaiIds: number[], tahun: number, kecualiTimId: number) {
  if (pegawaiIds.length === 0) return;
  const bentrok = await db
    .select({ nama: schema.pegawai.nama, tim: schema.tim.nama })
    .from(schema.anggotaTim)
    .innerJoin(schema.tim, eq(schema.tim.id, schema.anggotaTim.timId))
    .innerJoin(schema.pegawai, eq(schema.pegawai.id, schema.anggotaTim.pegawaiId))
    .where(
      and(
        inArray(schema.anggotaTim.pegawaiId, pegawaiIds),
        eq(schema.tim.jenis, "besar"),
        eq(schema.tim.tahun, tahun),
        eq(schema.tim.aktif, true),
        ne(schema.tim.id, kecualiTimId),
      ),
    );
  if (bentrok.length) {
    const daftar = bentrok.map((b) => `${b.nama} (${b.tim})`).join(", ");
    throw new AksiError(`Pegawai sudah masuk tim besar lain di tahun ${tahun}: ${daftar}.`);
  }
}

export async function setAnggotaTim(timId: number, pegawaiIds: number[]) {
  const t = await db.query.tim.findFirst({ where: eq(schema.tim.id, timId) });
  if (!t) throw new AksiError("Tim tidak ditemukan.");
  const ids = [...new Set(pegawaiIds)];
  if (t.jenis === "besar") await cekSatuTimBesar(ids, t.tahun, t.id);
  await db.transaction(async (tx) => {
    await tx.delete(schema.anggotaTim).where(eq(schema.anggotaTim.timId, timId));
    if (ids.length) await tx.insert(schema.anggotaTim).values(ids.map((pegawaiId) => ({ timId, pegawaiId })));
  });
}

export async function setAmbang(nilai: number) {
  if (!Number.isFinite(nilai) || nilai <= 0 || nilai > 100) throw new AksiError("Ambang harus 1–100.");
  await db
    .insert(schema.pengaturan)
    .values({ kunci: "ambang_capaian", nilai: String(nilai) })
    .onConflictDoUpdate({ target: schema.pengaturan.kunci, set: { nilai: String(nilai) } });
}
