import "server-only";
import { eq } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";
import type { CurrentUser } from "@/lib/auth/user";
import { labelBulan } from "@/lib/waktu";
import { kirimNotif, type NotifBaru } from "./notifikasi";
import { bisaApprove, bisaUnapprove, isKetuaPemilik, konteksTargetBulanan, type KonteksTB } from "./konteks";

export class AksiError extends Error {}

async function catatRiwayat(
  tx: Tx,
  k: KonteksTB,
  aksi: (typeof schema.aksiRiwayatEnum.enumValues)[number],
  olehId: number,
  alasan?: string | null,
  detail?: Record<string, unknown>,
) {
  await tx.insert(schema.riwayat).values({
    penugasanId: k.penugasan.id,
    targetBulananId: k.tb.id,
    aksi,
    olehId,
    alasan: alasan ?? null,
    detail: { bulan: k.tb.bulan, tahun: k.tb.tahun, ...detail },
  });
}

async function muatKonteks(tx: Tx, id: number) {
  const k = await konteksTargetBulanan(tx, id);
  if (!k || !k.aktif) throw new AksiError("Pekerjaan tidak ditemukan atau sudah dinonaktifkan.");
  return k;
}

function labelPekerjaan(k: KonteksTB) {
  return `${k.pekerjaan.nama} — ${k.kegiatan.nama} (${labelBulan(k.tb.tahun, k.tb.bulan, true)})`;
}

/** Terapkan approval (normal atau self) pada baris yang sedang diajukan. */
async function terapkanApproval(tx: Tx, k: KonteksTB, oleh: number, jenis: "normal" | "self") {
  const realisasi = k.tb.realisasiDiajukan;
  const selesai = realisasi >= k.tb.target;
  await tx
    .update(schema.targetBulanan)
    .set({
      realisasiDisetujuiSebelumnya: k.tb.realisasiDisetujui,
      realisasiDisetujui: realisasi,
      status: selesai ? "selesai" : "dikerjakan",
      jenisApproval: jenis,
      diverifikasiKepala: false,
      disetujuiAt: new Date(),
      disetujuiOleh: oleh,
      alasanTolak: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.targetBulanan.id, k.tb.id));
  await catatRiwayat(tx, k, jenis === "self" ? "self_approve" : "disetujui", oleh, null, {
    realisasi,
    target: k.tb.target,
  });
}

/**
 * Pegawai mengisi realisasi (dan opsional langsung mengajukan).
 * Ketua Tim pemilik kegiatan yang mengajukan pekerjaannya sendiri → self-approve.
 */
export async function isiProgres(
  user: CurrentUser,
  input: { targetBulananId: number; realisasi: number; catatan: string | null; ajukan: boolean },
) {
  return db.transaction(async (tx) => {
    const k = await muatKonteks(tx, input.targetBulananId);
    if (k.penugasan.pegawaiId !== user.id) throw new AksiError("Anda hanya dapat mengisi pekerjaan sendiri.");
    if (k.tb.status === "selesai") throw new AksiError("Pekerjaan bulan ini sudah disetujui selesai.");

    const tanpaAngka = !k.pekerjaan.satuan;
    let realisasi = Math.floor(input.realisasi);
    if (!Number.isFinite(realisasi) || realisasi < 0) throw new AksiError("Realisasi harus angka ≥ 0.");
    if (tanpaAngka) realisasi = realisasi > 0 ? 1 : 0;
    if (input.ajukan && realisasi <= k.tb.realisasiDisetujui && k.tb.realisasiDisetujui > 0) {
      throw new AksiError(
        `Realisasi yang diajukan harus lebih besar dari realisasi yang sudah disetujui (${k.tb.realisasiDisetujui}).`,
      );
    }
    if (input.ajukan && realisasi === 0) throw new AksiError("Isi realisasi sebelum mengajukan.");

    const status = input.ajukan ? "diajukan" : realisasi > 0 || k.tb.realisasiDisetujui > 0 ? "dikerjakan" : "belum";
    await tx
      .update(schema.targetBulanan)
      .set({
        realisasiDiajukan: realisasi,
        catatan: input.catatan?.trim() || null,
        status,
        diajukanAt: input.ajukan ? new Date() : k.tb.diajukanAt,
        alasanTolak: input.ajukan ? null : k.tb.alasanTolak,
        updatedAt: new Date(),
      })
      .where(eq(schema.targetBulanan.id, k.tb.id));

    if (realisasi !== k.tb.realisasiDiajukan || !input.ajukan) {
      await catatRiwayat(tx, k, "progres_diisi", user.id, null, { realisasi, target: k.tb.target });
    }
    if (!input.ajukan) return { selfApproved: false };

    await catatRiwayat(tx, k, "diajukan", user.id, null, { realisasi, target: k.tb.target });

    if (isKetuaPemilik(user, k)) {
      const k2 = await muatKonteks(tx, k.tb.id);
      await terapkanApproval(tx, k2, user.id, "self");
      return { selfApproved: true };
    }

    const penerima = new Set<number>();
    if (k.tim.ketuaId) penerima.add(k.tim.ketuaId);
    if (k.kegiatan.pjId) penerima.add(k.kegiatan.pjId);
    penerima.delete(user.id);
    await kirimNotif(
      tx,
      [...penerima].map(
        (pid): NotifBaru => ({
          pegawaiId: pid,
          jenis: "menunggu_approval",
          judul: "Pengajuan menunggu approval",
          pesan: `${user.nama}: ${labelPekerjaan(k)}`,
          link: "/approval",
        }),
      ),
    );
    return { selfApproved: false };
  });
}

export async function approve(user: CurrentUser, targetBulananId: number) {
  return db.transaction(async (tx) => {
    const k = await muatKonteks(tx, targetBulananId);
    if (!bisaApprove(user, k)) throw new AksiError("Anda tidak berwenang meng-approve pekerjaan ini.");
    if (k.tb.status !== "diajukan") throw new AksiError("Pekerjaan ini tidak sedang menunggu approval.");
    await terapkanApproval(tx, k, user.id, "normal");
  });
}

export async function tolak(user: CurrentUser, targetBulananId: number, alasan: string) {
  alasan = alasan.trim();
  if (alasan.length < 3) throw new AksiError("Alasan penolakan wajib diisi.");
  return db.transaction(async (tx) => {
    const k = await muatKonteks(tx, targetBulananId);
    if (!bisaApprove(user, k)) throw new AksiError("Anda tidak berwenang menolak pekerjaan ini.");
    if (k.tb.status !== "diajukan") throw new AksiError("Pekerjaan ini tidak sedang menunggu approval.");
    await tx
      .update(schema.targetBulanan)
      .set({ status: "dikerjakan", alasanTolak: alasan, updatedAt: new Date() })
      .where(eq(schema.targetBulanan.id, k.tb.id));
    await catatRiwayat(tx, k, "ditolak", user.id, alasan, { realisasi: k.tb.realisasiDiajukan });
    await kirimNotif(tx, [
      {
        pegawaiId: k.penugasan.pegawaiId,
        jenis: "ditolak",
        judul: "Pengajuan ditolak",
        pesan: `${labelPekerjaan(k)}. Alasan: ${alasan}`,
        link: `/pekerjaan-saya?bulan=${k.tb.tahun}-${String(k.tb.bulan).padStart(2, "0")}`,
      },
    ]);
  });
}

export async function unapprove(user: CurrentUser, targetBulananId: number, alasan: string) {
  alasan = alasan.trim();
  if (alasan.length < 3) throw new AksiError("Alasan unapprove wajib diisi.");
  return db.transaction(async (tx) => {
    const k = await muatKonteks(tx, targetBulananId);
    if (!bisaUnapprove(user, k)) throw new AksiError("Hanya Ketua Tim pemilik kegiatan yang dapat unapprove.");
    if (!k.tb.jenisApproval || k.tb.status === "diajukan") {
      throw new AksiError("Pekerjaan ini tidak memiliki approval yang bisa dibatalkan.");
    }
    const kembali = k.tb.realisasiDisetujuiSebelumnya;
    await tx
      .update(schema.targetBulanan)
      .set({
        realisasiDisetujui: kembali,
        realisasiDisetujuiSebelumnya: 0,
        realisasiDiajukan: k.tb.realisasiDiajukan,
        status: "dikerjakan",
        jenisApproval: kembali > 0 ? k.tb.jenisApproval : null,
        diverifikasiKepala: false,
        disetujuiAt: kembali > 0 ? k.tb.disetujuiAt : null,
        alasanTolak: alasan,
        updatedAt: new Date(),
      })
      .where(eq(schema.targetBulanan.id, k.tb.id));
    await catatRiwayat(tx, k, "unapprove", user.id, alasan, {
      dari: k.tb.realisasiDisetujui,
      ke: kembali,
    });
    if (k.penugasan.pegawaiId !== user.id) {
      await kirimNotif(tx, [
        {
          pegawaiId: k.penugasan.pegawaiId,
          jenis: "unapprove",
          judul: "Approval dibatalkan",
          pesan: `${labelPekerjaan(k)}. Alasan: ${alasan}`,
          link: `/pekerjaan-saya?bulan=${k.tb.tahun}-${String(k.tb.bulan).padStart(2, "0")}`,
        },
      ]);
    }
  });
}

/** Kepala memberi approval tambahan atas pekerjaan yang di-self-approve Ketua Tim. */
export async function verifikasiKepala(user: CurrentUser, targetBulananId: number) {
  if (!user.isKepala) throw new AksiError("Hanya Kepala yang dapat memverifikasi.");
  return db.transaction(async (tx) => {
    const k = await muatKonteks(tx, targetBulananId);
    if (k.tb.jenisApproval !== "self") throw new AksiError("Pekerjaan ini bukan hasil self-approve.");
    if (k.tb.diverifikasiKepala) return;
    await tx
      .update(schema.targetBulanan)
      .set({ diverifikasiKepala: true, updatedAt: new Date() })
      .where(eq(schema.targetBulanan.id, k.tb.id));
    await catatRiwayat(tx, k, "verifikasi_kepala", user.id);
  });
}
