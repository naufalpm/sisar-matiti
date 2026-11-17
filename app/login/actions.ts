"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { cekPassword } from "@/lib/auth/password";
import { buatSesi, hapusSesi } from "@/lib/auth/session";

export type LoginState = { pesan?: string; username?: string };

// Pembatas percobaan login sederhana di memori (per username).
const percobaan = new Map<string, { n: number; sampai: number }>();

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const username = String(fd.get("username") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");
  if (!username || !password) return { pesan: "Isi username dan password.", username };

  const p = percobaan.get(username);
  if (p && p.n >= 5 && p.sampai > Date.now()) {
    return { pesan: "Terlalu banyak percobaan. Coba lagi dalam 5 menit.", username };
  }

  const user = await db.query.pegawai.findFirst({ where: eq(schema.pegawai.username, username) });
  const ok = user && user.aktif && (await cekPassword(user.passwordHash, password));
  if (!ok) {
    const cur = p && p.sampai > Date.now() ? p : { n: 0, sampai: Date.now() + 5 * 60_000 };
    percobaan.set(username, { n: cur.n + 1, sampai: cur.sampai });
    return { pesan: "Username atau password salah, atau akun dinonaktifkan.", username };
  }
  percobaan.delete(username);
  await buatSesi(user.id);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/?masuk=1");
}

export async function logout() {
  await hapusSesi();
  redirect("/login");
}
