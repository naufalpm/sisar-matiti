CREATE TYPE "public"."jenis_kelamin" AS ENUM('L', 'P');--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "nip_lama" text;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "unit_kerja" text;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "golongan" text;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "tmt_golongan" date;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "pendidikan" text;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "tgl_lulus" date;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "jenis_kelamin" "jenis_kelamin";--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "tgl_lahir" date;--> statement-breakpoint
ALTER TABLE "pegawai" ADD COLUMN "foto" text;--> statement-breakpoint
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_nip_unique" UNIQUE("nip");