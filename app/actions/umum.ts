"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/user";
import { jalankan, type HasilAksi } from "@/lib/aksi";
import { cekPassword, hashPassword } from "@/lib/auth/password";
import { AksiError } from "@/lib/layanan/progres";

export async function tandaiDibacaAksi(id?: number): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(async () => {
    await db
      .update(schema.notifikasi)
      .set({ dibaca: true })
      .where(
        id
          ? and(eq(schema.notifikasi.id, id), eq(schema.notifikasi.pegawaiId, user.id))
          : eq(schema.notifikasi.pegawaiId, user.id),
      );
  });
}

export async function gantiPasswordAksi(lama: string, baru: string, ulang: string): Promise<HasilAksi> {
  const user = await requireUser();
  return jalankan(async () => {
    if (baru.length < 8) throw new AksiError("Password baru minimal 8 karakter.");
    if (baru !== ulang) throw new AksiError("Konfirmasi password tidak sama.");
    const p = await db.query.pegawai.findFirst({ where: eq(schema.pegawai.id, user.id) });
    if (!p || !(await cekPassword(p.passwordHash, lama))) throw new AksiError("Password lama salah.");
    await db
      .update(schema.pegawai)
      .set({ passwordHash: await hashPassword(baru), harusGantiPassword: false })
      .where(eq(schema.pegawai.id, user.id));
  }, "Password berhasil diganti.");
}
