import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";

export type NotifBaru = {
  pegawaiId: number;
  jenis:
    | "ditugaskan"
    | "ditolak"
    | "unapprove"
    | "deadline_h3"
    | "menunggu_approval"
    | "lewat_deadline"
    | "belum_berbobot";
  judul: string;
  pesan?: string;
  link?: string;
  dedupKey?: string;
};

/** Menyimpan notifikasi in-app. Notifikasi dengan dedupKey yang sama diabaikan. */
export async function kirimNotif(tx: Tx | typeof db, items: NotifBaru[]): Promise<number> {
  if (items.length === 0) return 0;
  const r = await tx
    .insert(schema.notifikasi)
    .values(items.map((i) => ({ ...i, pesan: i.pesan ?? null, link: i.link ?? null, dedupKey: i.dedupKey ?? null })))
    .onConflictDoNothing({ target: schema.notifikasi.dedupKey })
    .returning({ id: schema.notifikasi.id });
  return r.length;
}

export async function jumlahBelumDibaca(pegawaiId: number) {
  const [r] = await db
    .select({ n: count() })
    .from(schema.notifikasi)
    .where(and(eq(schema.notifikasi.pegawaiId, pegawaiId), eq(schema.notifikasi.dibaca, false)));
  return r?.n ?? 0;
}

export async function daftarNotif(pegawaiId: number, limit = 50) {
  return db
    .select()
    .from(schema.notifikasi)
    .where(eq(schema.notifikasi.pegawaiId, pegawaiId))
    .orderBy(desc(schema.notifikasi.createdAt))
    .limit(limit);
}
