import "server-only";
import { and, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { hariIni, sudahTerkunci, tambahHari, fmtTanggal, labelBulan } from "@/lib/waktu";
import { agregasi, barisBulan } from "./rekap";
import { kirimNotif, type NotifBaru } from "./notifikasi";

/** Kunci semua bulan yang sudah lewat tanggal 5 bulan berikutnya dan belum dikunci. */
export async function kunciBulanJatuhTempo(now = new Date()) {
  const periode = await db
    .selectDistinct({ tahun: schema.targetBulanan.tahun, bulan: schema.targetBulanan.bulan })
    .from(schema.targetBulanan);
  const sudah = await db.select().from(schema.kunciBulan);
  const dikunci: string[] = [];

  for (const p of periode) {
    if (!sudahTerkunci(p.tahun, p.bulan, now)) continue;
    if (sudah.some((s) => s.tahun === p.tahun && s.bulan === p.bulan)) continue;

    await db.transaction(async (tx) => {
      const ins = await tx
        .insert(schema.kunciBulan)
        .values({ tahun: p.tahun, bulan: p.bulan })
        .onConflictDoNothing()
        .returning();
      if (ins.length === 0) return; // proses lain sudah mengunci

      await tx
        .update(schema.targetBulanan)
        .set({ realisasiTerkunci: sql`${schema.targetBulanan.realisasiDisetujui}` })
        .where(and(eq(schema.targetBulanan.tahun, p.tahun), eq(schema.targetBulanan.bulan, p.bulan)));

      const rekap = agregasi(await barisBulan(tx, p.tahun, p.bulan));
      const rows = [...rekap.values()].map((r) => ({
        pegawaiId: r.pegawaiId,
        tahun: p.tahun,
        bulan: p.bulan,
        capaian: Math.round((r.capaian ?? 0) * 100),
        jumlahPenugasan: r.jumlahPenugasan,
        beban: r.beban,
      }));
      if (rows.length) await tx.insert(schema.capaianSnapshot).values(rows).onConflictDoNothing();
    });
    dikunci.push(labelBulan(p.tahun, p.bulan));
  }
  return dikunci;
}

/** Notifikasi H-3 deadline (pegawai) dan lewat deadline (Kepala & Ketua Tim). */
export async function notifDeadline(now = new Date()) {
  const today = hariIni(now);
  const h3 = tambahHari(today, 3);

  const belumSelesai = await db
    .select({
      penugasanId: schema.penugasan.id,
      pegawaiId: schema.penugasan.pegawaiId,
      pekerjaanId: schema.pekerjaan.id,
      pekerjaanNama: schema.pekerjaan.nama,
      deadline: schema.pekerjaan.deadline,
      kegiatanId: schema.kegiatan.id,
      kegiatanNama: schema.kegiatan.nama,
      ketuaId: schema.tim.ketuaId,
    })
    .from(schema.targetBulanan)
    .innerJoin(schema.penugasan, eq(schema.penugasan.id, schema.targetBulanan.penugasanId))
    .innerJoin(schema.pekerjaan, eq(schema.pekerjaan.id, schema.penugasan.pekerjaanId))
    .innerJoin(schema.subKegiatan, eq(schema.subKegiatan.id, schema.pekerjaan.subKegiatanId))
    .innerJoin(schema.kegiatan, eq(schema.kegiatan.id, schema.subKegiatan.kegiatanId))
    .innerJoin(schema.tim, eq(schema.tim.id, schema.kegiatan.timId))
    .where(
      and(
        ne(schema.targetBulanan.status, "selesai"),
        eq(schema.penugasan.aktif, true),
        eq(schema.pekerjaan.aktif, true),
        eq(schema.subKegiatan.aktif, true),
        eq(schema.kegiatan.aktif, true),
        lte(schema.pekerjaan.deadline, h3),
        gte(schema.pekerjaan.deadline, tambahHari(today, -30)),
      ),
    );

  const notif: NotifBaru[] = [];
  const sudahPenugasan = new Set<number>();
  const lewat = new Map<number, (typeof belumSelesai)[number] & { jumlah: Set<number> }>();

  for (const r of belumSelesai) {
    if (r.deadline >= today && !sudahPenugasan.has(r.penugasanId)) {
      sudahPenugasan.add(r.penugasanId);
      notif.push({
        pegawaiId: r.pegawaiId,
        jenis: "deadline_h3",
        judul: "Deadline segera tiba",
        pesan: `${r.pekerjaanNama} — ${r.kegiatanNama}, deadline ${fmtTanggal(r.deadline)}`,
        link: "/pekerjaan-saya",
        dedupKey: `h3:${r.penugasanId}:${r.deadline}`,
      });
    }
    if (r.deadline < today) {
      const g = lewat.get(r.pekerjaanId) ?? { ...r, jumlah: new Set<number>() };
      g.jumlah.add(r.pegawaiId);
      lewat.set(r.pekerjaanId, g);
    }
  }

  if (lewat.size) {
    const kepala = await db
      .select({ id: schema.pegawai.id })
      .from(schema.pegawai)
      .where(and(eq(schema.pegawai.isKepala, true), eq(schema.pegawai.aktif, true)));
    for (const g of lewat.values()) {
      const penerima = new Set<number>(kepala.map((k) => k.id));
      if (g.ketuaId) penerima.add(g.ketuaId);
      for (const pid of penerima) {
        notif.push({
          pegawaiId: pid,
          jenis: "lewat_deadline",
          judul: "Pekerjaan lewat deadline",
          pesan: `${g.pekerjaanNama} — ${g.kegiatanNama} (deadline ${fmtTanggal(g.deadline)}), ${g.jumlah.size} pegawai belum selesai`,
          link: `/kegiatan/${g.kegiatanId}`,
          dedupKey: `lewat:${g.pekerjaanId}:${g.deadline}:${pid}`,
        });
      }
    }
  }

  return kirimNotif(db, notif);
}

export async function jalankanJobHarian(now = new Date()) {
  const dikunci = await kunciBulanJatuhTempo(now);
  const notif = await notifDeadline(now);
  await db
    .insert(schema.pengaturan)
    .values({ kunci: "job_terakhir", nilai: hariIni(now) })
    .onConflictDoUpdate({ target: schema.pengaturan.kunci, set: { nilai: hariIni(now) } });
  return { dikunci, notif };
}

/** Dijalankan oportunistik saat aplikasi dibuka: maksimal sekali per hari. */
export async function jalankanJobJikaPerlu() {
  const r = await db.query.pengaturan.findFirst({ where: eq(schema.pengaturan.kunci, "job_terakhir") });
  if (r?.nilai === hariIni()) return null;
  return jalankanJobHarian();
}

