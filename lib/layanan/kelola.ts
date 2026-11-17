import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";
import type { CurrentUser } from "@/lib/auth/user";
import { fmtTanggal, labelBulan } from "@/lib/waktu";
import { AksiError } from "./progres";
import { bisaKelolaTim } from "./konteks";
import { kirimNotif } from "./notifikasi";

const TGL = /^\d{4}-\d{2}-\d{2}$/;

function cekTanggal(v: string, label: string) {
  if (!TGL.test(v) || Number.isNaN(Date.parse(v))) throw new AksiError(`${label} tidak valid.`);
}

/* ------------------------------ helper kepemilikan ------------------------------ */

async function kegiatanMilik(tx: Tx | typeof db, user: CurrentUser, kegiatanId: number) {
  const k = await tx.query.kegiatan.findFirst({ where: eq(schema.kegiatan.id, kegiatanId) });
  if (!k || !k.aktif) throw new AksiError("Kegiatan tidak ditemukan.");
  if (!bisaKelolaTim(user, k.timId)) throw new AksiError("Anda hanya dapat mengelola kegiatan di tim sendiri.");
  return k;
}

async function subMilik(tx: Tx | typeof db, user: CurrentUser, subId: number) {
  const s = await tx.query.subKegiatan.findFirst({ where: eq(schema.subKegiatan.id, subId) });
  if (!s || !s.aktif) throw new AksiError("Sub-kegiatan tidak ditemukan.");
  const k = await kegiatanMilik(tx, user, s.kegiatanId);
  return { sub: s, kegiatan: k };
}

async function pekerjaanMilik(tx: Tx | typeof db, user: CurrentUser, pekerjaanId: number) {
  const p = await tx.query.pekerjaan.findFirst({ where: eq(schema.pekerjaan.id, pekerjaanId) });
  if (!p || !p.aktif) throw new AksiError("Pekerjaan tidak ditemukan.");
  const { sub, kegiatan } = await subMilik(tx, user, p.subKegiatanId);
  return { pekerjaan: p, sub, kegiatan };
}

/* ------------------------------------ Kegiatan ------------------------------------ */

export type InputKegiatan = {
  id?: number;
  nama: string;
  timId: number;
  pjId: number | null;
  mulai: string;
  selesai: string;
  keterangan: string | null;
};

export async function simpanKegiatan(user: CurrentUser, input: InputKegiatan) {
  const nama = input.nama.trim();
  if (nama.length < 2) throw new AksiError("Nama kegiatan wajib diisi.");
  cekTanggal(input.mulai, "Tanggal mulai");
  cekTanggal(input.selesai, "Tanggal selesai");
  if (input.selesai < input.mulai) throw new AksiError("Tanggal selesai harus setelah tanggal mulai.");
  if (!bisaKelolaTim(user, input.timId)) throw new AksiError("Anda hanya dapat membuat kegiatan di tim sendiri.");

  const nilai = {
    nama,
    timId: input.timId,
    pjId: input.pjId,
    mulai: input.mulai,
    selesai: input.selesai,
    keterangan: input.keterangan?.trim() || null,
  };
  if (input.id) {
    await kegiatanMilik(db, user, input.id);
    await db.update(schema.kegiatan).set(nilai).where(eq(schema.kegiatan.id, input.id));
    return input.id;
  }
  const [k] = await db
    .insert(schema.kegiatan)
    .values({ ...nilai, createdBy: user.id })
    .returning({ id: schema.kegiatan.id });
  return k.id;
}

/** Soft delete: data tetap tersimpan agar riwayat dan CKP utuh. */
export async function hapusKegiatan(user: CurrentUser, kegiatanId: number) {
  await kegiatanMilik(db, user, kegiatanId);
  await db.update(schema.kegiatan).set({ aktif: false }).where(eq(schema.kegiatan.id, kegiatanId));
}

/* ---------------------------------- Sub-kegiatan ---------------------------------- */

export async function simpanSub(
  user: CurrentUser,
  input: { id?: number; kegiatanId: number; nama: string; mulai: string | null; selesai: string | null },
) {
  const nama = input.nama.trim();
  if (nama.length < 2) throw new AksiError("Nama sub-kegiatan wajib diisi.");
  if (input.mulai) cekTanggal(input.mulai, "Tanggal mulai");
  if (input.selesai) cekTanggal(input.selesai, "Tanggal selesai");
  if (input.mulai && input.selesai && input.selesai < input.mulai) {
    throw new AksiError("Tanggal selesai harus setelah tanggal mulai.");
  }
  if (input.id) {
    const { sub } = await subMilik(db, user, input.id);
    await db
      .update(schema.subKegiatan)
      .set({ nama, mulai: input.mulai, selesai: input.selesai })
      .where(eq(schema.subKegiatan.id, sub.id));
    return sub.id;
  }
  await kegiatanMilik(db, user, input.kegiatanId);
  const [s] = await db
    .insert(schema.subKegiatan)
    .values({ kegiatanId: input.kegiatanId, nama, mulai: input.mulai, selesai: input.selesai })
    .returning({ id: schema.subKegiatan.id });
  return s.id;
}

export async function hapusSub(user: CurrentUser, subId: number) {
  await subMilik(db, user, subId);
  await db.update(schema.subKegiatan).set({ aktif: false }).where(eq(schema.subKegiatan.id, subId));
}

/* ------------------------------------ Pekerjaan ------------------------------------ */

export type InputPekerjaan = {
  id?: number;
  subKegiatanId: number;
  nama: string;
  peran: string;
  satuan: string | null;
  targetKualitatif: string | null;
  deadline: string;
};

export async function simpanPekerjaan(user: CurrentUser, input: InputPekerjaan) {
  const nama = input.nama.trim();
  const peran = input.peran.trim();
  if (nama.length < 2) throw new AksiError("Nama pekerjaan wajib diisi.");
  if (!peran) throw new AksiError("Peran wajib diisi.");
  cekTanggal(input.deadline, "Deadline");
  const nilai = {
    nama,
    peran,
    satuan: input.satuan?.trim() || null,
    targetKualitatif: input.targetKualitatif?.trim() || null,
    deadline: input.deadline,
  };

  if (input.id) {
    const { pekerjaan } = await pekerjaanMilik(db, user, input.id);
    if (pekerjaan.satuan && !nilai.satuan) {
      // Berpindah ke "tanpa target angka": target bulanan dinormalkan ke 1.
      const pen = await db
        .select({ id: schema.penugasan.id })
        .from(schema.penugasan)
        .where(eq(schema.penugasan.pekerjaanId, pekerjaan.id));
      if (pen.length) {
        await db
          .update(schema.targetBulanan)
          .set({ target: 1 })
          .where(inArray(schema.targetBulanan.penugasanId, pen.map((p) => p.id)));
      }
    }
    await db.update(schema.pekerjaan).set(nilai).where(eq(schema.pekerjaan.id, input.id));
    return input.id;
  }

  const { kegiatan } = await subMilik(db, user, input.subKegiatanId);
  return db.transaction(async (tx) => {
    const [p] = await tx
      .insert(schema.pekerjaan)
      .values({ ...nilai, subKegiatanId: input.subKegiatanId, createdBy: user.id })
      .returning({ id: schema.pekerjaan.id });
    const kepala = await tx
      .select({ id: schema.pegawai.id })
      .from(schema.pegawai)
      .where(and(eq(schema.pegawai.isKepala, true), eq(schema.pegawai.aktif, true)));
    await kirimNotif(
      tx,
      kepala.map((k) => ({
        pegawaiId: k.id,
        jenis: "belum_berbobot" as const,
        judul: "Pekerjaan baru belum berbobot",
        pesan: `${nama} — ${kegiatan.nama}`,
        link: "/dashboard/bobot",
      })),
    );
    return p.id;
  });
}

export async function hapusPekerjaan(user: CurrentUser, pekerjaanId: number) {
  await pekerjaanMilik(db, user, pekerjaanId);
  await db.update(schema.pekerjaan).set({ aktif: false }).where(eq(schema.pekerjaan.id, pekerjaanId));
}

/* ------------------------------------ Penugasan ------------------------------------ */

export type TargetInput = { tahun: number; bulan: number; target: number };

function normalTarget(targets: TargetInput[], tanpaAngka: boolean) {
  const seen = new Set<string>();
  const out: TargetInput[] = [];
  for (const t of targets) {
    const target = Math.floor(Number(t.target));
    if (!Number.isFinite(target) || target < 0) throw new AksiError("Target harus angka ≥ 0.");
    if (t.bulan < 1 || t.bulan > 12) throw new AksiError("Bulan tidak valid.");
    const key = `${t.tahun}-${t.bulan}`;
    if (seen.has(key) || target === 0) continue;
    seen.add(key);
    out.push({ tahun: t.tahun, bulan: t.bulan, target: tanpaAngka ? 1 : target });
  }
  if (out.length === 0) throw new AksiError("Isi target minimal untuk satu bulan.");
  return out;
}

export async function tugaskan(
  user: CurrentUser,
  input: { pekerjaanId: number; pegawaiIds: number[]; targets: TargetInput[] },
) {
  const { pekerjaan, kegiatan } = await pekerjaanMilik(db, user, input.pekerjaanId);
  const targets = normalTarget(input.targets, !pekerjaan.satuan);
  const ids = [...new Set(input.pegawaiIds)];
  if (ids.length === 0) throw new AksiError("Pilih minimal satu pegawai.");

  await db.transaction(async (tx) => {
    const pegawaiValid = await tx
      .select({ id: schema.pegawai.id })
      .from(schema.pegawai)
      .where(and(inArray(schema.pegawai.id, ids), eq(schema.pegawai.aktif, true)));
    if (pegawaiValid.length !== ids.length) throw new AksiError("Ada pegawai yang tidak valid atau nonaktif.");

    for (const pegawaiId of ids) {
      const ada = await tx.query.penugasan.findFirst({
        where: and(eq(schema.penugasan.pekerjaanId, pekerjaan.id), eq(schema.penugasan.pegawaiId, pegawaiId)),
      });
      if (ada?.aktif) continue; // sudah ditugaskan
      let penugasanId: number;
      if (ada) {
        await tx.update(schema.penugasan).set({ aktif: true }).where(eq(schema.penugasan.id, ada.id));
        penugasanId = ada.id;
      } else {
        const [p] = await tx
          .insert(schema.penugasan)
          .values({ pekerjaanId: pekerjaan.id, pegawaiId })
          .returning({ id: schema.penugasan.id });
        penugasanId = p.id;
      }
      await terapkanTarget(tx, penugasanId, targets);
      await tx.insert(schema.riwayat).values({
        penugasanId,
        aksi: "ditugaskan",
        olehId: user.id,
        detail: { targets },
      });
      await kirimNotif(tx, [
        {
          pegawaiId,
          jenis: "ditugaskan",
          judul: "Anda ditugaskan ke pekerjaan baru",
          pesan: `${pekerjaan.nama} (${pekerjaan.peran}) — ${kegiatan.nama}, deadline ${fmtTanggal(pekerjaan.deadline)}`,
          link: "/pekerjaan-saya",
        },
      ]);
    }
  });
}

/** Upsert target per bulan. Bulan yang dihapus (target 0) hanya boleh bila belum ada realisasi disetujui. */
async function terapkanTarget(tx: Tx, penugasanId: number, targets: TargetInput[]) {
  const lama = await tx
    .select()
    .from(schema.targetBulanan)
    .where(eq(schema.targetBulanan.penugasanId, penugasanId));

  for (const row of lama) {
    const baru = targets.find((t) => t.tahun === row.tahun && t.bulan === row.bulan);
    if (!baru) {
      if (row.realisasiDisetujui > 0 || row.status === "diajukan") {
        throw new AksiError(
          `Target ${labelBulan(row.tahun, row.bulan)} tidak bisa dihapus karena sudah ada progres yang diajukan/disetujui.`,
        );
      }
      await tx.delete(schema.targetBulanan).where(eq(schema.targetBulanan.id, row.id));
      continue;
    }
    if (baru.target === row.target) continue;
    let status = row.status;
    if (row.jenisApproval && row.status !== "diajukan") {
      status = row.realisasiDisetujui >= baru.target ? "selesai" : row.realisasiDisetujui > 0 ? "dikerjakan" : row.status;
    }
    await tx
      .update(schema.targetBulanan)
      .set({ target: baru.target, status, updatedAt: new Date() })
      .where(eq(schema.targetBulanan.id, row.id));
  }
  const baruRows = targets.filter((t) => !lama.some((l) => l.tahun === t.tahun && l.bulan === t.bulan));
  if (baruRows.length) {
    await tx.insert(schema.targetBulanan).values(baruRows.map((t) => ({ ...t, penugasanId })));
  }
}

export async function ubahTarget(user: CurrentUser, penugasanId: number, targets: TargetInput[]) {
  const pen = await db.query.penugasan.findFirst({ where: eq(schema.penugasan.id, penugasanId) });
  if (!pen || !pen.aktif) throw new AksiError("Penugasan tidak ditemukan.");
  const { pekerjaan } = await pekerjaanMilik(db, user, pen.pekerjaanId);
  const norm = normalTarget(targets, !pekerjaan.satuan);
  await db.transaction(async (tx) => {
    await terapkanTarget(tx, penugasanId, norm);
    await tx.insert(schema.riwayat).values({
      penugasanId,
      aksi: "target_diubah",
      olehId: user.id,
      detail: { targets: norm },
    });
  });
}

export async function hapusPenugasan(user: CurrentUser, penugasanId: number) {
  const pen = await db.query.penugasan.findFirst({ where: eq(schema.penugasan.id, penugasanId) });
  if (!pen || !pen.aktif) throw new AksiError("Penugasan tidak ditemukan.");
  await pekerjaanMilik(db, user, pen.pekerjaanId);
  await db.transaction(async (tx) => {
    await tx.update(schema.penugasan).set({ aktif: false }).where(eq(schema.penugasan.id, penugasanId));
    await tx.insert(schema.riwayat).values({ penugasanId, aksi: "penugasan_dihapus", olehId: user.id });
  });
}

/* -------------------------------------- Bobot -------------------------------------- */

export async function setBobot(user: CurrentUser, pekerjaanId: number, bobot: number | null) {
  if (!user.isKepala) throw new AksiError("Hanya Kepala yang dapat menetapkan bobot.");
  if (bobot != null && (!Number.isInteger(bobot) || bobot < 1 || bobot > 10)) {
    throw new AksiError("Bobot harus bilangan bulat 1–10.");
  }
  await db
    .update(schema.pekerjaan)
    .set({ bobot, bobotOleh: user.id, bobotAt: new Date() })
    .where(eq(schema.pekerjaan.id, pekerjaanId));
}
