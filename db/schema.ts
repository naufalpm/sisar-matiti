import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  boolean,
  date,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/* ------------------------------------------------------------------ */
/* Pegawai & sesi                                                     */
/* ------------------------------------------------------------------ */

export const pegawai = pgTable("pegawai", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  nama: text("nama").notNull(),
  nip: text("nip"),
  jabatan: text("jabatan"),
  passwordHash: text("password_hash").notNull(),
  isKepala: boolean("is_kepala").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  aktif: boolean("aktif").notNull().default(true),
  harusGantiPassword: boolean("harus_ganti_password").notNull().default(true),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const sesi = pgTable(
  "sesi",
  {
    id: text("id").primaryKey(), // sha256 dari token cookie
    pegawaiId: integer("pegawai_id")
      .notNull()
      .references(() => pegawai.id, { onDelete: "cascade" }),
    expiresAt: ts("expires_at").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("sesi_pegawai_idx").on(t.pegawaiId)],
);

/* ------------------------------------------------------------------ */
/* Tim                                                                */
/* ------------------------------------------------------------------ */

export const jenisTimEnum = pgEnum("jenis_tim", ["besar", "kecil"]);

export const tim = pgTable("tim", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  jenis: jenisTimEnum("jenis").notNull(),
  tahun: integer("tahun").notNull(),
  ketuaId: integer("ketua_id").references(() => pegawai.id),
  aktif: boolean("aktif").notNull().default(true),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const anggotaTim = pgTable(
  "anggota_tim",
  {
    timId: integer("tim_id")
      .notNull()
      .references(() => tim.id, { onDelete: "cascade" }),
    pegawaiId: integer("pegawai_id")
      .notNull()
      .references(() => pegawai.id),
  },
  (t) => [primaryKey({ columns: [t.timId, t.pegawaiId] })],
);

/* ------------------------------------------------------------------ */
/* Kegiatan → Sub-kegiatan → Pekerjaan → Penugasan → Target bulanan   */
/* ------------------------------------------------------------------ */

export const kegiatan = pgTable(
  "kegiatan",
  {
    id: serial("id").primaryKey(),
    nama: text("nama").notNull(),
    timId: integer("tim_id")
      .notNull()
      .references(() => tim.id),
    pjId: integer("pj_id").references(() => pegawai.id),
    mulai: date("mulai", { mode: "string" }).notNull(),
    selesai: date("selesai", { mode: "string" }).notNull(),
    keterangan: text("keterangan"),
    aktif: boolean("aktif").notNull().default(true),
    createdBy: integer("created_by").references(() => pegawai.id),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("kegiatan_tim_idx").on(t.timId)],
);

export const subKegiatan = pgTable(
  "sub_kegiatan",
  {
    id: serial("id").primaryKey(),
    kegiatanId: integer("kegiatan_id")
      .notNull()
      .references(() => kegiatan.id),
    nama: text("nama").notNull(),
    mulai: date("mulai", { mode: "string" }),
    selesai: date("selesai", { mode: "string" }),
    aktif: boolean("aktif").notNull().default(true),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("sub_kegiatan_kegiatan_idx").on(t.kegiatanId)],
);

export const pekerjaan = pgTable(
  "pekerjaan",
  {
    id: serial("id").primaryKey(),
    subKegiatanId: integer("sub_kegiatan_id")
      .notNull()
      .references(() => subKegiatan.id),
    nama: text("nama").notNull(),
    peran: text("peran").notNull(),
    /** null = pekerjaan tanpa target angka (target 1 kegiatan, 0%/100%) */
    satuan: text("satuan"),
    targetKualitatif: text("target_kualitatif"),
    deadline: date("deadline", { mode: "string" }).notNull(),
    /** Skala 1–10, ditetapkan Kepala. null = Belum berbobot */
    bobot: integer("bobot"),
    bobotOleh: integer("bobot_oleh").references(() => pegawai.id),
    bobotAt: ts("bobot_at"),
    aktif: boolean("aktif").notNull().default(true),
    createdBy: integer("created_by").references(() => pegawai.id),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("pekerjaan_sub_idx").on(t.subKegiatanId)],
);

export const penugasan = pgTable(
  "penugasan",
  {
    id: serial("id").primaryKey(),
    pekerjaanId: integer("pekerjaan_id")
      .notNull()
      .references(() => pekerjaan.id),
    pegawaiId: integer("pegawai_id")
      .notNull()
      .references(() => pegawai.id),
    aktif: boolean("aktif").notNull().default(true),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("penugasan_pekerjaan_pegawai_uq").on(t.pekerjaanId, t.pegawaiId),
    index("penugasan_pegawai_idx").on(t.pegawaiId),
  ],
);

export const statusProgresEnum = pgEnum("status_progres", [
  "belum", // Belum mulai
  "dikerjakan", // Ada progres, belum diajukan / ditolak / di-unapprove
  "diajukan", // Menunggu approval
  "selesai", // Disetujui dan realisasi ≥ target
]);

export const jenisApprovalEnum = pgEnum("jenis_approval", ["normal", "self"]);

/**
 * Satu baris per penugasan per bulan. Approval berlaku per bulan.
 * Progres sebagian boleh diajukan; yang dihitung hanya realisasi_disetujui.
 */
export const targetBulanan = pgTable(
  "target_bulanan",
  {
    id: serial("id").primaryKey(),
    penugasanId: integer("penugasan_id")
      .notNull()
      .references(() => penugasan.id, { onDelete: "cascade" }),
    tahun: integer("tahun").notNull(),
    bulan: integer("bulan").notNull(), // 1–12
    target: integer("target").notNull(),
    realisasiDiajukan: integer("realisasi_diajukan").notNull().default(0),
    realisasiDisetujui: integer("realisasi_disetujui").notNull().default(0),
    /** Nilai disetujui sebelum approval terakhir — dipakai saat unapprove. */
    realisasiDisetujuiSebelumnya: integer("realisasi_disetujui_sebelumnya").notNull().default(0),
    /** Realisasi disetujui saat bulan dikunci (tgl 5 bulan berikutnya). */
    realisasiTerkunci: integer("realisasi_terkunci"),
    status: statusProgresEnum("status").notNull().default("belum"),
    jenisApproval: jenisApprovalEnum("jenis_approval"),
    diverifikasiKepala: boolean("diverifikasi_kepala").notNull().default(false),
    catatan: text("catatan"),
    alasanTolak: text("alasan_tolak"),
    diajukanAt: ts("diajukan_at"),
    disetujuiAt: ts("disetujui_at"),
    disetujuiOleh: integer("disetujui_oleh").references(() => pegawai.id),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("target_bulanan_uq").on(t.penugasanId, t.tahun, t.bulan),
    index("target_bulanan_periode_idx").on(t.tahun, t.bulan),
    index("target_bulanan_status_idx").on(t.status),
  ],
);

/* ------------------------------------------------------------------ */
/* Riwayat, notifikasi, pengaturan, kunci bulan                       */
/* ------------------------------------------------------------------ */

export const aksiRiwayatEnum = pgEnum("aksi_riwayat", [
  "ditugaskan",
  "target_diubah",
  "progres_diisi",
  "diajukan",
  "disetujui",
  "ditolak",
  "unapprove",
  "self_approve",
  "verifikasi_kepala",
  "penugasan_dihapus",
]);

export const riwayat = pgTable(
  "riwayat",
  {
    id: serial("id").primaryKey(),
    penugasanId: integer("penugasan_id")
      .notNull()
      .references(() => penugasan.id, { onDelete: "cascade" }),
    targetBulananId: integer("target_bulanan_id").references(() => targetBulanan.id, {
      onDelete: "set null",
    }),
    aksi: aksiRiwayatEnum("aksi").notNull(),
    olehId: integer("oleh_id")
      .notNull()
      .references(() => pegawai.id),
    alasan: text("alasan"),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("riwayat_penugasan_idx").on(t.penugasanId)],
);

export const notifikasi = pgTable(
  "notifikasi",
  {
    id: serial("id").primaryKey(),
    pegawaiId: integer("pegawai_id")
      .notNull()
      .references(() => pegawai.id),
    jenis: text("jenis").notNull(),
    judul: text("judul").notNull(),
    pesan: text("pesan"),
    link: text("link"),
    /** Kunci unik untuk notifikasi terjadwal agar tidak terkirim dua kali. */
    dedupKey: text("dedup_key").unique(),
    dibaca: boolean("dibaca").notNull().default(false),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifikasi_pegawai_idx").on(t.pegawaiId, t.dibaca)],
);

export const pengaturan = pgTable("pengaturan", {
  kunci: text("kunci").primaryKey(),
  nilai: text("nilai").notNull(),
});

export const kunciBulan = pgTable(
  "kunci_bulan",
  {
    tahun: integer("tahun").notNull(),
    bulan: integer("bulan").notNull(),
    lockedAt: ts("locked_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.tahun, t.bulan] })],
);

/** Rekap capaian per pegawai saat bulan dikunci — sumber angka CKP. */
export const capaianSnapshot = pgTable(
  "capaian_snapshot",
  {
    pegawaiId: integer("pegawai_id")
      .notNull()
      .references(() => pegawai.id),
    tahun: integer("tahun").notNull(),
    bulan: integer("bulan").notNull(),
    capaian: integer("capaian_x100").notNull(), // persen × 100 (mis. 9550 = 95,50%)
    jumlahPenugasan: integer("jumlah_penugasan").notNull(),
    beban: integer("beban").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.pegawaiId, t.tahun, t.bulan] })],
);
