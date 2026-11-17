CREATE TYPE "public"."aksi_riwayat" AS ENUM('ditugaskan', 'target_diubah', 'progres_diisi', 'diajukan', 'disetujui', 'ditolak', 'unapprove', 'self_approve', 'verifikasi_kepala', 'penugasan_dihapus');--> statement-breakpoint
CREATE TYPE "public"."jenis_approval" AS ENUM('normal', 'self');--> statement-breakpoint
CREATE TYPE "public"."jenis_tim" AS ENUM('besar', 'kecil');--> statement-breakpoint
CREATE TYPE "public"."status_progres" AS ENUM('belum', 'dikerjakan', 'diajukan', 'selesai');--> statement-breakpoint
CREATE TABLE "anggota_tim" (
	"tim_id" integer NOT NULL,
	"pegawai_id" integer NOT NULL,
	CONSTRAINT "anggota_tim_tim_id_pegawai_id_pk" PRIMARY KEY("tim_id","pegawai_id")
);
--> statement-breakpoint
CREATE TABLE "capaian_snapshot" (
	"pegawai_id" integer NOT NULL,
	"tahun" integer NOT NULL,
	"bulan" integer NOT NULL,
	"capaian_x100" integer NOT NULL,
	"jumlah_penugasan" integer NOT NULL,
	"beban" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capaian_snapshot_pegawai_id_tahun_bulan_pk" PRIMARY KEY("pegawai_id","tahun","bulan")
);
--> statement-breakpoint
CREATE TABLE "kegiatan" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"tim_id" integer NOT NULL,
	"pj_id" integer,
	"mulai" date NOT NULL,
	"selesai" date NOT NULL,
	"keterangan" text,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kunci_bulan" (
	"tahun" integer NOT NULL,
	"bulan" integer NOT NULL,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kunci_bulan_tahun_bulan_pk" PRIMARY KEY("tahun","bulan")
);
--> statement-breakpoint
CREATE TABLE "notifikasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"pegawai_id" integer NOT NULL,
	"jenis" text NOT NULL,
	"judul" text NOT NULL,
	"pesan" text,
	"link" text,
	"dedup_key" text,
	"dibaca" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifikasi_dedup_key_unique" UNIQUE("dedup_key")
);
--> statement-breakpoint
CREATE TABLE "pegawai" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"nama" text NOT NULL,
	"nip" text,
	"jabatan" text,
	"password_hash" text NOT NULL,
	"is_kepala" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"harus_ganti_password" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pegawai_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "pekerjaan" (
	"id" serial PRIMARY KEY NOT NULL,
	"sub_kegiatan_id" integer NOT NULL,
	"nama" text NOT NULL,
	"peran" text NOT NULL,
	"satuan" text,
	"target_kualitatif" text,
	"deadline" date NOT NULL,
	"bobot" integer,
	"bobot_oleh" integer,
	"bobot_at" timestamp with time zone,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengaturan" (
	"kunci" text PRIMARY KEY NOT NULL,
	"nilai" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "penugasan" (
	"id" serial PRIMARY KEY NOT NULL,
	"pekerjaan_id" integer NOT NULL,
	"pegawai_id" integer NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riwayat" (
	"id" serial PRIMARY KEY NOT NULL,
	"penugasan_id" integer NOT NULL,
	"target_bulanan_id" integer,
	"aksi" "aksi_riwayat" NOT NULL,
	"oleh_id" integer NOT NULL,
	"alasan" text,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesi" (
	"id" text PRIMARY KEY NOT NULL,
	"pegawai_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_kegiatan" (
	"id" serial PRIMARY KEY NOT NULL,
	"kegiatan_id" integer NOT NULL,
	"nama" text NOT NULL,
	"mulai" date,
	"selesai" date,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "target_bulanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"penugasan_id" integer NOT NULL,
	"tahun" integer NOT NULL,
	"bulan" integer NOT NULL,
	"target" integer NOT NULL,
	"realisasi_diajukan" integer DEFAULT 0 NOT NULL,
	"realisasi_disetujui" integer DEFAULT 0 NOT NULL,
	"realisasi_disetujui_sebelumnya" integer DEFAULT 0 NOT NULL,
	"realisasi_terkunci" integer,
	"status" "status_progres" DEFAULT 'belum' NOT NULL,
	"jenis_approval" "jenis_approval",
	"diverifikasi_kepala" boolean DEFAULT false NOT NULL,
	"catatan" text,
	"alasan_tolak" text,
	"diajukan_at" timestamp with time zone,
	"disetujui_at" timestamp with time zone,
	"disetujui_oleh" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tim" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"jenis" "jenis_tim" NOT NULL,
	"tahun" integer NOT NULL,
	"ketua_id" integer,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anggota_tim" ADD CONSTRAINT "anggota_tim_tim_id_tim_id_fk" FOREIGN KEY ("tim_id") REFERENCES "public"."tim"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anggota_tim" ADD CONSTRAINT "anggota_tim_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capaian_snapshot" ADD CONSTRAINT "capaian_snapshot_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_tim_id_tim_id_fk" FOREIGN KEY ("tim_id") REFERENCES "public"."tim"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_pj_id_pegawai_id_fk" FOREIGN KEY ("pj_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_created_by_pegawai_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pekerjaan" ADD CONSTRAINT "pekerjaan_sub_kegiatan_id_sub_kegiatan_id_fk" FOREIGN KEY ("sub_kegiatan_id") REFERENCES "public"."sub_kegiatan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pekerjaan" ADD CONSTRAINT "pekerjaan_bobot_oleh_pegawai_id_fk" FOREIGN KEY ("bobot_oleh") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pekerjaan" ADD CONSTRAINT "pekerjaan_created_by_pegawai_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penugasan" ADD CONSTRAINT "penugasan_pekerjaan_id_pekerjaan_id_fk" FOREIGN KEY ("pekerjaan_id") REFERENCES "public"."pekerjaan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penugasan" ADD CONSTRAINT "penugasan_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat" ADD CONSTRAINT "riwayat_penugasan_id_penugasan_id_fk" FOREIGN KEY ("penugasan_id") REFERENCES "public"."penugasan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat" ADD CONSTRAINT "riwayat_target_bulanan_id_target_bulanan_id_fk" FOREIGN KEY ("target_bulanan_id") REFERENCES "public"."target_bulanan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat" ADD CONSTRAINT "riwayat_oleh_id_pegawai_id_fk" FOREIGN KEY ("oleh_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_kegiatan" ADD CONSTRAINT "sub_kegiatan_kegiatan_id_kegiatan_id_fk" FOREIGN KEY ("kegiatan_id") REFERENCES "public"."kegiatan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_bulanan" ADD CONSTRAINT "target_bulanan_penugasan_id_penugasan_id_fk" FOREIGN KEY ("penugasan_id") REFERENCES "public"."penugasan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_bulanan" ADD CONSTRAINT "target_bulanan_disetujui_oleh_pegawai_id_fk" FOREIGN KEY ("disetujui_oleh") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim" ADD CONSTRAINT "tim_ketua_id_pegawai_id_fk" FOREIGN KEY ("ketua_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kegiatan_tim_idx" ON "kegiatan" USING btree ("tim_id");--> statement-breakpoint
CREATE INDEX "notifikasi_pegawai_idx" ON "notifikasi" USING btree ("pegawai_id","dibaca");--> statement-breakpoint
CREATE INDEX "pekerjaan_sub_idx" ON "pekerjaan" USING btree ("sub_kegiatan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "penugasan_pekerjaan_pegawai_uq" ON "penugasan" USING btree ("pekerjaan_id","pegawai_id");--> statement-breakpoint
CREATE INDEX "penugasan_pegawai_idx" ON "penugasan" USING btree ("pegawai_id");--> statement-breakpoint
CREATE INDEX "riwayat_penugasan_idx" ON "riwayat" USING btree ("penugasan_id");--> statement-breakpoint
CREATE INDEX "sesi_pegawai_idx" ON "sesi" USING btree ("pegawai_id");--> statement-breakpoint
CREATE INDEX "sub_kegiatan_kegiatan_idx" ON "sub_kegiatan" USING btree ("kegiatan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "target_bulanan_uq" ON "target_bulanan" USING btree ("penugasan_id","tahun","bulan");--> statement-breakpoint
CREATE INDEX "target_bulanan_periode_idx" ON "target_bulanan" USING btree ("tahun","bulan");--> statement-breakpoint
CREATE INDEX "target_bulanan_status_idx" ON "target_bulanan" USING btree ("status");