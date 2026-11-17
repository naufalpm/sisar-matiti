import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, ne, or, sql, isNotNull, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import type { CurrentUser } from "@/lib/auth/user";
import { isTerlambat, type StatusProgres } from "@/lib/capaian";
import { akhirBulan, awalBulan, hariIni, tambahHari, sudahTerkunci } from "@/lib/waktu";

const { targetBulanan: tb, penugasan: pn, pekerjaan: pk, subKegiatan: sk, kegiatan: kg, tim, pegawai: pg } = schema;

const aktifSemua = and(eq(pn.aktif, true), eq(pk.aktif, true), eq(sk.aktif, true), eq(kg.aktif, true));

/** Kolom standar baris penugasan-bulanan. */
function kolomBaris() {
  return {
    id: tb.id,
    tahun: tb.tahun,
    bulan: tb.bulan,
    target: tb.target,
    realisasiDiajukan: tb.realisasiDiajukan,
    realisasiDisetujui: tb.realisasiDisetujui,
    realisasiTerkunci: tb.realisasiTerkunci,
    status: tb.status,
    jenisApproval: tb.jenisApproval,
    diverifikasiKepala: tb.diverifikasiKepala,
    catatan: tb.catatan,
    alasanTolak: tb.alasanTolak,
    diajukanAt: tb.diajukanAt,
    disetujuiAt: tb.disetujuiAt,
    penugasanId: pn.id,
    pegawaiId: pn.pegawaiId,
    pegawaiNama: pg.nama,
    pekerjaanId: pk.id,
    pekerjaanNama: pk.nama,
    peran: pk.peran,
    satuan: pk.satuan,
    targetKualitatif: pk.targetKualitatif,
    deadline: pk.deadline,
    bobot: pk.bobot,
    subId: sk.id,
    subNama: sk.nama,
    kegiatanId: kg.id,
    kegiatanNama: kg.nama,
    pjId: kg.pjId,
    timId: tim.id,
    timNama: tim.nama,
    ketuaId: tim.ketuaId,
  };
}

function queryBaris(where: SQL | undefined) {
  return db
    .select(kolomBaris())
    .from(tb)
    .innerJoin(pn, eq(pn.id, tb.penugasanId))
    .innerJoin(pg, eq(pg.id, pn.pegawaiId))
    .innerJoin(pk, eq(pk.id, pn.pekerjaanId))
    .innerJoin(sk, eq(sk.id, pk.subKegiatanId))
    .innerJoin(kg, eq(kg.id, sk.kegiatanId))
    .innerJoin(tim, eq(tim.id, kg.timId))
    .where(and(aktifSemua, where));
}

export type Baris = Awaited<ReturnType<typeof queryBaris>>[number] & {
  terlambat: boolean;
  terkunci: boolean;
};

function tandai<T extends { status: StatusProgres; deadline: string; disetujuiAt: Date | null; tahun: number; bulan: number }>(
  rows: T[],
): (T & { terlambat: boolean; terkunci: boolean })[] {
  const today = hariIni();
  return rows.map((r) => ({
    ...r,
    terlambat: isTerlambat({
      deadline: r.deadline,
      status: r.status,
      tanggalSelesai: r.disetujuiAt ? hariIni(r.disetujuiAt) : null,
      hariIni: today,
    }),
    terkunci: sudahTerkunci(r.tahun, r.bulan),
  }));
}

/* ------------------------------------ Pekerjaan Saya ------------------------------------ */

export async function penugasanSaya(pegawaiId: number, tahun: number, bulan: number) {
  const rows = await queryBaris(and(eq(pn.pegawaiId, pegawaiId), eq(tb.tahun, tahun), eq(tb.bulan, bulan))).orderBy(
    asc(pk.deadline),
    asc(kg.nama),
  );
  return tandai(rows);
}

/* ------------------------------------ Approval ------------------------------------ */

export async function antreanApproval(user: CurrentUser) {
  const rows = await queryBaris(
    and(eq(tb.status, "diajukan"), ne(pn.pegawaiId, user.id), or(eq(tim.ketuaId, user.id), eq(kg.pjId, user.id))),
  ).orderBy(asc(tb.diajukanAt));
  return tandai(rows);
}

/** Approval yang sudah diberikan di tim yang diketuai (untuk unapprove). */
export async function sudahDisetujuiTimSaya(user: CurrentUser, tahun: number, bulan: number) {
  const rows = await queryBaris(
    and(eq(tim.ketuaId, user.id), isNotNull(tb.jenisApproval), ne(tb.status, "diajukan"), eq(tb.tahun, tahun), eq(tb.bulan, bulan)),
  ).orderBy(desc(tb.disetujuiAt));
  return tandai(rows);
}

/** Pekerjaan Ketua Tim yang di-self-approve, untuk verifikasi Kepala. */
export async function selfApproved(tahun: number, bulan: number) {
  const rows = await queryBaris(and(eq(tb.jenisApproval, "self"), eq(tb.tahun, tahun), eq(tb.bulan, bulan))).orderBy(
    asc(tb.diverifikasiKepala),
    desc(tb.disetujuiAt),
  );
  return tandai(rows);
}

/* ------------------------------------ Kegiatan ------------------------------------ */

/** Progres kegiatan: rata-rata progres seluruh target bulanan aktif (approved only). */
const progresKegiatanSql = sql<number | null>`(
  select avg(least(t.realisasi_disetujui::float / nullif(t.target, 0), 1)) * 100
  from target_bulanan t
  join penugasan p on p.id = t.penugasan_id and p.aktif
  join pekerjaan k on k.id = p.pekerjaan_id and k.aktif
  join sub_kegiatan s on s.id = k.sub_kegiatan_id and s.aktif
  where s.kegiatan_id = ${kg.id}
)`;

const pjAlias = alias(pg, "pj");

/** Kegiatan yang boleh dilihat pengguna (PRD §3). */
export async function kegiatanTerlihat(user: CurrentUser, opts: { tahun?: number; hanyaMilikTim?: boolean } = {}) {
  const filters: (SQL | undefined)[] = [eq(kg.aktif, true)];
  if (opts.tahun) {
    filters.push(lte(kg.mulai, `${opts.tahun}-12-31`), gte(kg.selesai, `${opts.tahun}-01-01`));
  }
  const timIds = user.timDiketuai.map((t) => t.id);
  if (opts.hanyaMilikTim) {
    if (timIds.length === 0) return [];
    filters.push(inArray(kg.timId, timIds));
  } else if (!(user.isKepala || user.isAdmin)) {
    const ikut = sql`exists (
      select 1 from penugasan p
      join pekerjaan k on k.id = p.pekerjaan_id and k.aktif
      join sub_kegiatan s on s.id = k.sub_kegiatan_id and s.aktif
      where s.kegiatan_id = ${kg.id} and p.pegawai_id = ${user.id} and p.aktif
    )`;
    filters.push(or(ikut, eq(kg.pjId, user.id), timIds.length ? inArray(kg.timId, timIds) : undefined));
  }

  const rows = await db
    .select({
      id: kg.id,
      nama: kg.nama,
      mulai: kg.mulai,
      selesai: kg.selesai,
      keterangan: kg.keterangan,
      timId: tim.id,
      timNama: tim.nama,
      timJenis: tim.jenis,
      pjId: kg.pjId,
      pjNama: pjAlias.nama,
      progres: progresKegiatanSql,
      jumlahPekerjaan: sql<number>`(
        select count(*)::int from pekerjaan k join sub_kegiatan s on s.id = k.sub_kegiatan_id and s.aktif
        where s.kegiatan_id = ${kg.id} and k.aktif
      )`,
    })
    .from(kg)
    .innerJoin(tim, eq(tim.id, kg.timId))
    .leftJoin(pjAlias, eq(pjAlias.id, kg.pjId))
    .where(and(...filters))
    .orderBy(asc(kg.mulai), asc(kg.nama));
  return rows.map((r) => ({ ...r, progres: r.progres == null ? null : Number(r.progres) }));
}

export type PeranDiKegiatan = "kepala" | "admin" | "ketua" | "pj" | "anggota";

/** Detail kegiatan lengkap beserta hak akses pengguna. null bila tidak boleh dilihat. */
export async function detailKegiatan(user: CurrentUser, kegiatanId: number) {
  const [k] = await db
    .select({
      kegiatan: kg,
      timNama: tim.nama,
      timJenis: tim.jenis,
      ketuaId: tim.ketuaId,
      pjNama: pjAlias.nama,
      progres: progresKegiatanSql,
    })
    .from(kg)
    .innerJoin(tim, eq(tim.id, kg.timId))
    .leftJoin(pjAlias, eq(pjAlias.id, kg.pjId))
    .where(and(eq(kg.id, kegiatanId), eq(kg.aktif, true)));
  if (!k) return null;

  const isKetua = k.ketuaId === user.id;
  const isPj = k.kegiatan.pjId === user.id;
  const ikut = await db
    .select({ id: pn.id })
    .from(pn)
    .innerJoin(pk, eq(pk.id, pn.pekerjaanId))
    .innerJoin(sk, eq(sk.id, pk.subKegiatanId))
    .where(and(eq(sk.kegiatanId, kegiatanId), eq(pn.pegawaiId, user.id), eq(pn.aktif, true), eq(pk.aktif, true)))
    .limit(1);
  const bolehLihat = user.isKepala || user.isAdmin || isKetua || isPj || ikut.length > 0;
  if (!bolehLihat) return null;
  /** Pegawai biasa tidak melihat capaian pribadi rekan. */
  const lihatProgresSemua = user.isKepala || user.isAdmin || isKetua || isPj;

  const subs = await db
    .select()
    .from(sk)
    .where(and(eq(sk.kegiatanId, kegiatanId), eq(sk.aktif, true)))
    .orderBy(asc(sk.mulai), asc(sk.id));
  const pekerjaanRows = subs.length
    ? await db
        .select()
        .from(pk)
        .where(and(inArray(pk.subKegiatanId, subs.map((s) => s.id)), eq(pk.aktif, true)))
        .orderBy(asc(pk.deadline), asc(pk.id))
    : [];
  const penugasanRows = pekerjaanRows.length
    ? await db
        .select({ id: pn.id, pekerjaanId: pn.pekerjaanId, pegawaiId: pn.pegawaiId, nama: pg.nama })
        .from(pn)
        .innerJoin(pg, eq(pg.id, pn.pegawaiId))
        .where(and(inArray(pn.pekerjaanId, pekerjaanRows.map((p) => p.id)), eq(pn.aktif, true)))
        .orderBy(asc(pg.nama))
    : [];
  const targetRows = penugasanRows.length
    ? await db
        .select()
        .from(tb)
        .where(inArray(tb.penugasanId, penugasanRows.map((p) => p.id)))
        .orderBy(asc(tb.tahun), asc(tb.bulan))
    : [];

  const oleh = alias(pg, "oleh");
  const riwayatRows = penugasanRows.length
    ? await db
        .select({
          id: schema.riwayat.id,
          aksi: schema.riwayat.aksi,
          alasan: schema.riwayat.alasan,
          detail: schema.riwayat.detail,
          createdAt: schema.riwayat.createdAt,
          olehNama: oleh.nama,
          pegawaiNama: pg.nama,
          pegawaiId: pn.pegawaiId,
          pekerjaanNama: pk.nama,
        })
        .from(schema.riwayat)
        .innerJoin(pn, eq(pn.id, schema.riwayat.penugasanId))
        .innerJoin(pg, eq(pg.id, pn.pegawaiId))
        .innerJoin(pk, eq(pk.id, pn.pekerjaanId))
        .innerJoin(oleh, eq(oleh.id, schema.riwayat.olehId))
        .where(inArray(schema.riwayat.penugasanId, penugasanRows.map((p) => p.id)))
        .orderBy(desc(schema.riwayat.createdAt))
        .limit(100)
    : [];

  const today = hariIni();
  const struktur = subs.map((s) => ({
    ...s,
    pekerjaan: pekerjaanRows
      .filter((p) => p.subKegiatanId === s.id)
      .map((p) => ({
        ...p,
        penugasan: penugasanRows
          .filter((a) => a.pekerjaanId === p.id)
          .map((a) => {
            const targets = targetRows
              .filter((t) => t.penugasanId === a.id)
              .map((t) => ({
                ...t,
                terlambat: isTerlambat({
                  deadline: p.deadline,
                  status: t.status,
                  tanggalSelesai: t.disetujuiAt ? hariIni(t.disetujuiAt) : null,
                  hariIni: today,
                }),
              }));
            const totalTarget = targets.reduce((s2, t) => s2 + t.target, 0);
            const totalDisetujui = targets.reduce((s2, t) => s2 + Math.min(t.realisasiDisetujui, t.target), 0);
            const tampil = lihatProgresSemua || a.pegawaiId === user.id;
            return {
              ...a,
              tampil,
              targets: tampil ? targets : [],
              totalTarget,
              totalDisetujui: tampil ? totalDisetujui : null,
              progres: tampil && totalTarget > 0 ? (totalDisetujui / totalTarget) * 100 : null,
              terlambat: tampil ? targets.some((t) => t.terlambat) : false,
              selesai: targets.length > 0 && targets.every((t) => t.status === "selesai"),
            };
          }),
      })),
  }));

  return {
    ...k.kegiatan,
    timNama: k.timNama,
    timJenis: k.timJenis,
    ketuaId: k.ketuaId,
    pjNama: k.pjNama,
    progres: k.progres == null ? null : Number(k.progres),
    struktur,
    riwayat: lihatProgresSemua ? riwayatRows : riwayatRows.filter((r) => r.pegawaiId === user.id),
    akses: { isKetua, isPj, lihatProgresSemua, bisaKelola: user.timDiketuai.some((t) => t.id === k.kegiatan.timId) },
  };
}

/* ------------------------------------ Dashboard Kepala ------------------------------------ */

export async function ringkasanBulan(tahun: number, bulan: number) {
  const awal = awalBulan(tahun, bulan);
  const akhir = akhirBulan(tahun, bulan);
  const [kegiatanAktif] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(kg)
    .where(and(eq(kg.aktif, true), lte(kg.mulai, akhir), gte(kg.selesai, awal)));

  const rows = tandai(await queryBaris(and(eq(tb.tahun, tahun), eq(tb.bulan, bulan))));
  return {
    kegiatanAktif: kegiatanAktif?.n ?? 0,
    total: rows.length,
    selesai: rows.filter((r) => r.status === "selesai").length,
    berjalan: rows.filter((r) => r.status === "belum" || r.status === "dikerjakan").length,
    menunggu: rows.filter((r) => r.status === "diajukan").length,
    terlambat: rows.filter((r) => r.terlambat).length,
    rows,
  };
}

export async function deadlineMendatang(hari = 7) {
  const today = hariIni();
  const rows = await queryBaris(
    and(ne(tb.status, "selesai"), gte(pk.deadline, today), lte(pk.deadline, tambahHari(today, hari))),
  ).orderBy(asc(pk.deadline), asc(pg.nama));
  // Satu baris per penugasan (bisa ada beberapa bulan).
  const seen = new Set<number>();
  return tandai(rows).filter((r) => (seen.has(r.penugasanId) ? false : (seen.add(r.penugasanId), true)));
}

export async function pegawaiAktif() {
  return db
    .select({ id: pg.id, nama: pg.nama, jabatan: pg.jabatan, username: pg.username })
    .from(pg)
    .where(eq(pg.aktif, true))
    .orderBy(asc(pg.nama));
}

/** Tim besar setiap pegawai di tahun tertentu. */
export async function timBesarPegawai(tahun: number) {
  const rows = await db
    .select({ pegawaiId: schema.anggotaTim.pegawaiId, timNama: tim.nama })
    .from(schema.anggotaTim)
    .innerJoin(tim, eq(tim.id, schema.anggotaTim.timId))
    .where(and(eq(tim.tahun, tahun), eq(tim.jenis, "besar"), eq(tim.aktif, true)));
  return new Map(rows.map((r) => [r.pegawaiId, r.timNama]));
}

export async function daftarPekerjaanBobot(opts: { tahun: number; hanyaBelum?: boolean }) {
  return db
    .select({
      id: pk.id,
      nama: pk.nama,
      peran: pk.peran,
      deadline: pk.deadline,
      bobot: pk.bobot,
      satuan: pk.satuan,
      subNama: sk.nama,
      kegiatanId: kg.id,
      kegiatanNama: kg.nama,
      timNama: tim.nama,
      jumlahPegawai: sql<number>`(select count(*)::int from penugasan p where p.pekerjaan_id = ${pk.id} and p.aktif)`,
    })
    .from(pk)
    .innerJoin(sk, eq(sk.id, pk.subKegiatanId))
    .innerJoin(kg, eq(kg.id, sk.kegiatanId))
    .innerJoin(tim, eq(tim.id, kg.timId))
    .where(
      and(
        eq(pk.aktif, true),
        eq(sk.aktif, true),
        eq(kg.aktif, true),
        lte(kg.mulai, `${opts.tahun}-12-31`),
        gte(kg.selesai, `${opts.tahun}-01-01`),
        opts.hanyaBelum ? sql`${pk.bobot} is null` : undefined,
      ),
    )
    .orderBy(sql`${pk.bobot} is not null`, asc(pk.deadline), asc(pk.id));
}

export async function jumlahBelumBerbobot() {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(pk)
    .innerJoin(sk, eq(sk.id, pk.subKegiatanId))
    .innerJoin(kg, eq(kg.id, sk.kegiatanId))
    .where(and(eq(pk.aktif, true), eq(sk.aktif, true), eq(kg.aktif, true), sql`${pk.bobot} is null`));
  return r?.n ?? 0;
}

export async function jumlahMenungguApproval(user: CurrentUser) {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tb)
    .innerJoin(pn, eq(pn.id, tb.penugasanId))
    .innerJoin(pk, eq(pk.id, pn.pekerjaanId))
    .innerJoin(sk, eq(sk.id, pk.subKegiatanId))
    .innerJoin(kg, eq(kg.id, sk.kegiatanId))
    .innerJoin(tim, eq(tim.id, kg.timId))
    .where(
      and(
        aktifSemua,
        eq(tb.status, "diajukan"),
        ne(pn.pegawaiId, user.id),
        or(eq(tim.ketuaId, user.id), eq(kg.pjId, user.id)),
      ),
    );
  return r?.n ?? 0;
}
