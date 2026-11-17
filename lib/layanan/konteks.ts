import "server-only";
import { eq } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";
import type { CurrentUser } from "@/lib/auth/user";

/** Konteks lengkap satu baris target bulanan (untuk otorisasi & notifikasi). */
export async function konteksTargetBulanan(tx: Tx | typeof db, targetBulananId: number) {
  const [r] = await tx
    .select({
      tb: schema.targetBulanan,
      penugasan: schema.penugasan,
      pekerjaan: schema.pekerjaan,
      sub: schema.subKegiatan,
      kegiatan: schema.kegiatan,
      tim: schema.tim,
    })
    .from(schema.targetBulanan)
    .innerJoin(schema.penugasan, eq(schema.penugasan.id, schema.targetBulanan.penugasanId))
    .innerJoin(schema.pekerjaan, eq(schema.pekerjaan.id, schema.penugasan.pekerjaanId))
    .innerJoin(schema.subKegiatan, eq(schema.subKegiatan.id, schema.pekerjaan.subKegiatanId))
    .innerJoin(schema.kegiatan, eq(schema.kegiatan.id, schema.subKegiatan.kegiatanId))
    .innerJoin(schema.tim, eq(schema.tim.id, schema.kegiatan.timId))
    .where(eq(schema.targetBulanan.id, targetBulananId))
    .for("update", { of: schema.targetBulanan });
  if (!r) return null;
  const aktif = r.penugasan.aktif && r.pekerjaan.aktif && r.sub.aktif && r.kegiatan.aktif;
  return { ...r, aktif };
}

export type KonteksTB = NonNullable<Awaited<ReturnType<typeof konteksTargetBulanan>>>;

/** Ketua tim pemilik kegiatan. */
export function isKetuaPemilik(u: Pick<CurrentUser, "id">, k: { tim: { ketuaId: number | null } }) {
  return k.tim.ketuaId === u.id;
}

/** Ketua Tim pemilik kegiatan atau PJ Kegiatan boleh approve/tolak, kecuali pekerjaannya sendiri. */
export function bisaApprove(
  u: Pick<CurrentUser, "id">,
  k: { tim: { ketuaId: number | null }; kegiatan: { pjId: number | null }; penugasan: { pegawaiId: number } },
) {
  if (k.penugasan.pegawaiId === u.id) return false;
  return k.tim.ketuaId === u.id || k.kegiatan.pjId === u.id;
}

/** Hanya Ketua Tim pemilik kegiatan yang boleh unapprove. */
export function bisaUnapprove(
  u: Pick<CurrentUser, "id">,
  k: { tim: { ketuaId: number | null } },
) {
  return k.tim.ketuaId === u.id;
}

/** Ketua Tim boleh membuat/mengubah kegiatan hanya di timnya sendiri. */
export function bisaKelolaTim(u: Pick<CurrentUser, "timDiketuai">, timId: number) {
  return u.timDiketuai.some((t) => t.id === timId);
}
