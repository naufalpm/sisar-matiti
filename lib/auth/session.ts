import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { db, schema } from "@/db";

export const SESSION_COOKIE = "sm_session";
const DURASI_INGAT_MS = 1000 * 60 * 60 * 24 * 30; // "Ingat saya": 30 hari
const DURASI_SESI_MS = 1000 * 60 * 60 * 12; // tanpa "Ingat saya": 12 jam, cookie hilang saat browser ditutup

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function buatSesi(pegawaiId: number, ingat = true) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (ingat ? DURASI_INGAT_MS : DURASI_SESI_MS));
  await db.insert(schema.sesi).values({ id: hashToken(token), pegawaiId, expiresAt });
  // Bersihkan sesi kedaluwarsa secara oportunistik.
  await db.delete(schema.sesi).where(lt(schema.sesi.expiresAt, new Date()));
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    // Tanpa "Ingat saya" cookie dibuat sebagai session cookie (tanpa expires).
    ...(ingat ? { expires: expiresAt } : {}),
  });
}

/** Mengembalikan pegawaiId dari cookie sesi yang valid, atau null. */
export async function bacaSesi(): Promise<number | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await db.query.sesi.findFirst({ where: eq(schema.sesi.id, hashToken(token)) });
  if (!row || row.expiresAt < new Date()) return null;
  return row.pegawaiId;
}

export async function hapusSesi() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sesi).where(eq(schema.sesi.id, hashToken(token)));
  jar.delete(SESSION_COOKIE);
}

export async function hapusSemuaSesiPegawai(pegawaiId: number) {
  await db.delete(schema.sesi).where(eq(schema.sesi.pegawaiId, pegawaiId));
}
