import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";
import { hitungBeban, hitungCapaian, realisasiUntukCapaian } from "@/lib/capaian";

export type RekapPegawai = {
  pegawaiId: number;
  capaian: number | null;
  jumlahPenugasan: number;
  beban: number;
  belumBerbobot: number;
};

/** Baris penugasan aktif yang punya target di bulan m. */
export async function barisBulan(tx: Tx | typeof db, tahun: number, bulan: number) {
  return tx
    .select({
      tbId: schema.targetBulanan.id,
      pegawaiId: schema.penugasan.pegawaiId,
      target: schema.targetBulanan.target,
      realisasiDisetujui: schema.targetBulanan.realisasiDisetujui,
      realisasiTerkunci: schema.targetBulanan.realisasiTerkunci,
      bobot: schema.pekerjaan.bobot,
    })
    .from(schema.targetBulanan)
    .innerJoin(schema.penugasan, eq(schema.penugasan.id, schema.targetBulanan.penugasanId))
    .innerJoin(schema.pekerjaan, eq(schema.pekerjaan.id, schema.penugasan.pekerjaanId))
    .innerJoin(schema.subKegiatan, eq(schema.subKegiatan.id, schema.pekerjaan.subKegiatanId))
    .innerJoin(schema.kegiatan, eq(schema.kegiatan.id, schema.subKegiatan.kegiatanId))
    .where(
      and(
        eq(schema.targetBulanan.tahun, tahun),
        eq(schema.targetBulanan.bulan, bulan),
        eq(schema.penugasan.aktif, true),
        eq(schema.pekerjaan.aktif, true),
        eq(schema.subKegiatan.aktif, true),
        eq(schema.kegiatan.aktif, true),
      ),
    );
}

export function agregasi(rows: Awaited<ReturnType<typeof barisBulan>>): Map<number, RekapPegawai> {
  const per = new Map<number, typeof rows>();
  for (const r of rows) {
    const arr = per.get(r.pegawaiId) ?? [];
    arr.push(r);
    per.set(r.pegawaiId, arr);
  }
  const out = new Map<number, RekapPegawai>();
  for (const [pegawaiId, arr] of per) {
    out.set(pegawaiId, {
      pegawaiId,
      capaian: hitungCapaian(arr.map((r) => ({ realisasi: realisasiUntukCapaian(r), target: r.target }))),
      jumlahPenugasan: arr.length,
      beban: hitungBeban(arr),
      belumBerbobot: arr.filter((r) => r.bobot == null).length,
    });
  }
  return out;
}

export async function bulanTerkunci(tahun: number, bulan: number) {
  const r = await db.query.kunciBulan.findFirst({
    where: and(eq(schema.kunciBulan.tahun, tahun), eq(schema.kunciBulan.bulan, bulan)),
  });
  return r ?? null;
}

/**
 * Rekap capaian & beban seluruh pegawai di bulan m.
 * Bulan yang sudah dikunci memakai snapshot (angka CKP final).
 */
export async function rekapBulan(tahun: number, bulan: number): Promise<{
  terkunci: boolean;
  data: Map<number, RekapPegawai>;
}> {
  const kunci = await bulanTerkunci(tahun, bulan);
  if (kunci) {
    const snaps = await db
      .select()
      .from(schema.capaianSnapshot)
      .where(and(eq(schema.capaianSnapshot.tahun, tahun), eq(schema.capaianSnapshot.bulan, bulan)));
    const live = agregasi(await barisBulan(db, tahun, bulan));
    const data = new Map<number, RekapPegawai>();
    for (const s of snaps) {
      data.set(s.pegawaiId, {
        pegawaiId: s.pegawaiId,
        capaian: s.jumlahPenugasan > 0 ? s.capaian / 100 : null,
        jumlahPenugasan: s.jumlahPenugasan,
        beban: s.beban,
        belumBerbobot: live.get(s.pegawaiId)?.belumBerbobot ?? 0,
      });
    }
    return { terkunci: true, data };
  }
  return { terkunci: false, data: agregasi(await barisBulan(db, tahun, bulan)) };
}

export async function getAmbang(): Promise<number> {
  const r = await db.query.pengaturan.findFirst({ where: eq(schema.pengaturan.kunci, "ambang_capaian") });
  const v = Number(r?.nilai);
  return Number.isFinite(v) && v > 0 ? v : 90;
}
