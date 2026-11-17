/**
 * Tes integrasi alur kerja (butuh PostgreSQL tes, lihat vitest.config.mts).
 * Ditugaskan → isi progres → ajukan → approve/tolak/unapprove → self-approve → kunci bulan.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { CurrentUser } from "@/lib/auth/user";
import * as progres from "@/lib/layanan/progres";
import * as kelola from "@/lib/layanan/kelola";
import * as admin from "@/lib/layanan/admin";
import { kunciBulanJatuhTempo, notifDeadline } from "@/lib/layanan/job";
import { rekapBulan } from "@/lib/layanan/rekap";
import { bulanBerikutnya, bulanIni, hariIni, tambahHari } from "@/lib/waktu";

const { tahun, bulan } = bulanIni();
const nb = bulanBerikutnya(tahun, bulan);

type U = CurrentUser;
const users: Record<string, U> = {};
let timId = 0;
let timLainId = 0;

function mkUser(id: number, nama: string, extra: Partial<U> = {}): U {
  return {
    id,
    nama,
    username: nama.toLowerCase(),
    jabatan: null,
    isKepala: false,
    isAdmin: false,
    harusGantiPassword: false,
    timDiketuai: [],
    isKetuaTim: false,
    isPJ: false,
    ...extra,
  };
}

async function tbOf(pekerjaanId: number, pegawaiId: number) {
  const [r] = await db
    .select({ tb: schema.targetBulanan })
    .from(schema.targetBulanan)
    .innerJoin(schema.penugasan, eq(schema.penugasan.id, schema.targetBulanan.penugasanId))
    .where(
      and(
        eq(schema.penugasan.pekerjaanId, pekerjaanId),
        eq(schema.penugasan.pegawaiId, pegawaiId),
        eq(schema.targetBulanan.tahun, tahun),
        eq(schema.targetBulanan.bulan, bulan),
      ),
    );
  return r.tb;
}

let pekerjaanId = 0;

beforeAll(async () => {
  await db.execute(sql`truncate table riwayat, notifikasi, target_bulanan, penugasan, pekerjaan, sub_kegiatan,
    kegiatan, anggota_tim, tim, sesi, capaian_snapshot, kunci_bulan, pengaturan, pegawai restart identity cascade`);
  const nama = ["Kepala", "Ketua", "Pj", "Ani", "Badu", "KetuaLain"];
  for (const n of nama) {
    const [p] = await db
      .insert(schema.pegawai)
      .values({ username: n.toLowerCase(), nama: n, passwordHash: "x", isKepala: n === "Kepala" })
      .returning();
    users[n] = mkUser(p.id, n, { isKepala: n === "Kepala" });
  }
  const [t] = await db.insert(schema.tim).values({ nama: "Sosial", jenis: "besar", tahun, ketuaId: users.Ketua.id }).returning();
  const [t2] = await db.insert(schema.tim).values({ nama: "IPDS", jenis: "besar", tahun, ketuaId: users.KetuaLain.id }).returning();
  timId = t.id;
  timLainId = t2.id;
  users.Ketua.timDiketuai = [{ id: t.id, nama: "Sosial", tahun, jenis: "besar" }];
  users.Ketua.isKetuaTim = true;
  users.KetuaLain.timDiketuai = [{ id: t2.id, nama: "IPDS", tahun, jenis: "besar" }];
  users.KetuaLain.isKetuaTim = true;
});

describe("kelola kegiatan oleh Ketua Tim", () => {
  it("tidak boleh membuat kegiatan di tim lain", async () => {
    await expect(
      kelola.simpanKegiatan(users.Ketua, {
        nama: "Ilegal",
        timId: timLainId,
        pjId: null,
        mulai: `${tahun}-01-01`,
        selesai: `${tahun}-12-31`,
        keterangan: null,
      }),
    ).rejects.toThrow(/tim sendiri/);
  });

  it("membuat kegiatan → sub → pekerjaan → penugasan lintas tim", async () => {
    const kegiatanId = await kelola.simpanKegiatan(users.Ketua, {
      nama: "Sakernas",
      timId,
      pjId: users.Pj.id,
      mulai: `${tahun}-${String(bulan).padStart(2, "0")}-01`,
      selesai: `${nb.tahun}-${String(nb.bulan).padStart(2, "0")}-28`,
      keterangan: null,
    });
    const subId = await kelola.simpanSub(users.Ketua, { kegiatanId, nama: "Pencacahan", mulai: null, selesai: null });
    pekerjaanId = await kelola.simpanPekerjaan(users.Ketua, {
      subKegiatanId: subId,
      nama: "Cacah ruta",
      peran: "PCL",
      satuan: "ruta",
      targetKualitatif: null,
      deadline: tambahHari(hariIni(), 10),
    });
    // Kepala menerima notifikasi "belum berbobot"
    const n = await db.select().from(schema.notifikasi).where(eq(schema.notifikasi.pegawaiId, users.Kepala.id));
    expect(n.some((x) => x.jenis === "belum_berbobot")).toBe(true);

    await kelola.tugaskan(users.Ketua, {
      pekerjaanId,
      pegawaiIds: [users.Ani.id, users.Badu.id, users.Ketua.id],
      targets: [
        { tahun, bulan, target: 50 },
        { tahun: nb.tahun, bulan: nb.bulan, target: 20 },
      ],
    });
    const tb = await tbOf(pekerjaanId, users.Ani.id);
    expect(tb.target).toBe(50);
    expect(tb.status).toBe("belum");
    const notifAni = await db.select().from(schema.notifikasi).where(eq(schema.notifikasi.pegawaiId, users.Ani.id));
    expect(notifAni.some((x) => x.jenis === "ditugaskan")).toBe(true);
  });
});

describe("alur approval", () => {
  it("pegawai tidak bisa mengisi pekerjaan orang lain", async () => {
    const tb = await tbOf(pekerjaanId, users.Ani.id);
    await expect(progres.isiProgres(users.Badu, { targetBulananId: tb.id, realisasi: 5, catatan: null, ajukan: true })).rejects.toThrow();
  });

  it("ajukan sebagian → PJ approve → progres 60%", async () => {
    let tb = await tbOf(pekerjaanId, users.Ani.id);
    await progres.isiProgres(users.Ani, { targetBulananId: tb.id, realisasi: 30, catatan: "link", ajukan: true });
    tb = await tbOf(pekerjaanId, users.Ani.id);
    expect(tb.status).toBe("diajukan");
    expect(tb.realisasiDisetujui).toBe(0);
    const notif = await db.select().from(schema.notifikasi).where(eq(schema.notifikasi.jenis, "menunggu_approval"));
    expect(new Set(notif.map((n) => n.pegawaiId))).toEqual(new Set([users.Ketua.id, users.Pj.id]));

    // Ketua tim lain & pegawai lain tidak berwenang
    await expect(progres.approve(users.KetuaLain, tb.id)).rejects.toThrow(/berwenang/);
    await expect(progres.approve(users.Badu, tb.id)).rejects.toThrow(/berwenang/);

    await progres.approve(users.Pj, tb.id);
    tb = await tbOf(pekerjaanId, users.Ani.id);
    expect(tb.realisasiDisetujui).toBe(30);
    expect(tb.status).toBe("dikerjakan");
    const r = await rekapBulan(tahun, bulan);
    expect(r.data.get(users.Ani.id)?.capaian).toBe(60);
  });

  it("tolak wajib alasan dan mengembalikan status", async () => {
    let tb = await tbOf(pekerjaanId, users.Ani.id);
    await progres.isiProgres(users.Ani, { targetBulananId: tb.id, realisasi: 50, catatan: null, ajukan: true });
    await expect(progres.tolak(users.Ketua, tb.id, "  ")).rejects.toThrow(/wajib/);
    await progres.tolak(users.Ketua, tb.id, "Lengkapi isian blok IV");
    tb = await tbOf(pekerjaanId, users.Ani.id);
    expect(tb.status).toBe("dikerjakan");
    expect(tb.alasanTolak).toBe("Lengkapi isian blok IV");
    expect(tb.realisasiDisetujui).toBe(30);
  });

  it("approve penuh → selesai; PJ tidak boleh unapprove; Ketua unapprove kembali ke nilai sebelumnya", async () => {
    let tb = await tbOf(pekerjaanId, users.Ani.id);
    await progres.isiProgres(users.Ani, { targetBulananId: tb.id, realisasi: 55, catatan: null, ajukan: true });
    await progres.approve(users.Ketua, tb.id);
    tb = await tbOf(pekerjaanId, users.Ani.id);
    expect(tb.status).toBe("selesai");
    expect((await rekapBulan(tahun, bulan)).data.get(users.Ani.id)?.capaian).toBe(100); // dibatasi 100%

    await expect(progres.unapprove(users.Pj, tb.id, "salah")).rejects.toThrow(/Ketua Tim/);
    await progres.unapprove(users.Ketua, tb.id, "Data ganda ditemukan");
    tb = await tbOf(pekerjaanId, users.Ani.id);
    expect(tb.status).toBe("dikerjakan");
    expect(tb.realisasiDisetujui).toBe(30);
    const riw = await db.select().from(schema.riwayat).where(eq(schema.riwayat.targetBulananId, tb.id));
    expect(riw.map((r) => r.aksi)).toEqual(expect.arrayContaining(["diajukan", "disetujui", "ditolak", "unapprove"]));
  });

  it("Ketua Tim self-approve pekerjaannya, Kepala memverifikasi", async () => {
    let tb = await tbOf(pekerjaanId, users.Ketua.id);
    const r = await progres.isiProgres(users.Ketua, { targetBulananId: tb.id, realisasi: 50, catatan: null, ajukan: true });
    expect(r.selfApproved).toBe(true);
    tb = await tbOf(pekerjaanId, users.Ketua.id);
    expect(tb.jenisApproval).toBe("self");
    expect(tb.status).toBe("selesai");
    await expect(progres.verifikasiKepala(users.Ani, tb.id)).rejects.toThrow();
    await progres.verifikasiKepala(users.Kepala, tb.id);
    tb = await tbOf(pekerjaanId, users.Ketua.id);
    expect(tb.diverifikasiKepala).toBe(true);
  });

  it("bobot hanya oleh Kepala dan masuk beban kerja", async () => {
    await expect(kelola.setBobot(users.Ketua, pekerjaanId, 5)).rejects.toThrow(/Kepala/);
    await expect(kelola.setBobot(users.Kepala, pekerjaanId, 11)).rejects.toThrow();
    expect((await rekapBulan(tahun, bulan)).data.get(users.Ani.id)?.beban).toBe(0);
    await kelola.setBobot(users.Kepala, pekerjaanId, 7);
    expect((await rekapBulan(tahun, bulan)).data.get(users.Ani.id)?.beban).toBe(7);
  });
});

describe("penguncian bulan", () => {
  it("setelah tgl 5 bulan berikutnya capaian terkunci dan approval baru tidak mengubah CKP", async () => {
    // Badu: ajukan 25 dari 50 → approve → 50%
    let tb = await tbOf(pekerjaanId, users.Badu.id);
    await progres.isiProgres(users.Badu, { targetBulananId: tb.id, realisasi: 25, catatan: null, ajukan: true });
    await progres.approve(users.Ketua, tb.id);

    const tgl6 = new Date(`${nb.tahun}-${String(nb.bulan).padStart(2, "0")}-06T03:00:00Z`);
    const dikunci = await kunciBulanJatuhTempo(tgl6);
    expect(dikunci.length).toBeGreaterThanOrEqual(1);
    const sebelum = await rekapBulan(tahun, bulan);
    expect(sebelum.terkunci).toBe(true);
    expect(sebelum.data.get(users.Badu.id)?.capaian).toBe(50);

    // Pengajuan setelah dikunci tetap dicatat, tapi tidak mengubah capaian CKP
    tb = await tbOf(pekerjaanId, users.Badu.id);
    await progres.isiProgres(users.Badu, { targetBulananId: tb.id, realisasi: 50, catatan: null, ajukan: true });
    await progres.approve(users.Ketua, tb.id);
    tb = await tbOf(pekerjaanId, users.Badu.id);
    expect(tb.realisasiDisetujui).toBe(50);
    expect((await rekapBulan(tahun, bulan)).data.get(users.Badu.id)?.capaian).toBe(50);

    // idempoten
    expect(await kunciBulanJatuhTempo(tgl6)).not.toContain(dikunci[0]);
  });
});

describe("notifikasi terjadwal", () => {
  it("H-3 deadline dikirim sekali (dedup)", async () => {
    const deadline = tambahHari(hariIni(), 10);
    const now = new Date(`${tambahHari(deadline, -2)}T01:00:00Z`);
    const n1 = await notifDeadline(now);
    expect(await notifDeadline(now)).toBe(0);
    const rows = await db.select().from(schema.notifikasi).where(eq(schema.notifikasi.jenis, "deadline_h3"));
    expect(n1).toBeGreaterThan(0);
    expect(rows.length).toBe(new Set(rows.map((r) => r.dedupKey)).size);
  });
});

describe("admin", () => {
  it("pegawai hanya boleh di satu tim besar per tahun", async () => {
    await admin.setAnggotaTim(timId, [users.Ani.id]);
    await expect(admin.setAnggotaTim(timLainId, [users.Ani.id])).rejects.toThrow(/tim besar lain/);
    const [k] = await db.insert(schema.tim).values({ nama: "ZI", jenis: "kecil", tahun }).returning();
    await admin.setAnggotaTim(k.id, [users.Ani.id]); // tim kecil boleh
  });
});
