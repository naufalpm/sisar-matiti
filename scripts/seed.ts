/**
 * Data contoh untuk development / uji coba. JANGAN dijalankan di produksi
 * (PRD: data awal mulai dari nol — gunakan `npm run admin:buat`).
 *
 *   npm run db:seed            → isi bila database kosong
 *   npm run db:seed -- --reset → hapus semua data lalu isi ulang
 */
import "../lib/load-env";
import { sql } from "drizzle-orm";
import { db, schema } from "../db";
import { hashPassword } from "../lib/auth/password";
import { bulanIni, bulanSebelumnya, hariIni, tambahHari } from "../lib/waktu";

const PASSWORD = "sisar12345";

const PEGAWAI: [username: string, nama: string, jabatan: string][] = [
  ["kepala", "Yohanes Werimon", "Kepala BPS Kabupaten"],
  ["admin", "Rizky Pratama", "Pranata Komputer (IPDS)"],
  ["sri", "Sri Wahyuni", "Kepala Subbagian Umum"],
  ["agus", "Agus Salim Bauw", "Statistisi Ahli Muda"],
  ["maria", "Maria Kambuaya", "Statistisi Ahli Muda"],
  ["dewi", "Dewi Lestari", "Statistisi Ahli Pertama"],
  ["budi", "Budi Santoso", "Pranata Komputer Ahli Pertama"],
  ["fransiska", "Fransiska Iba", "Statistisi Ahli Pertama"],
  ["hendra", "Hendra Gunawan", "Statistisi Terampil"],
  ["nur", "Nur Aini Fataruba", "Statistisi Ahli Pertama"],
  ["yosep", "Yosep Kawab", "Statistisi Terampil"],
  ["ratna", "Ratna Sari", "Statistisi Ahli Muda"],
  ["imanuel", "Imanuel Orocomna", "Statistisi Terampil"],
  ["fitri", "Fitri Handayani", "Pranata Keuangan APBN"],
  ["samuel", "Samuel Inggeruhi", "Statistisi Pelaksana"],
  ["lina", "Lina Marlina", "Analis SDM Aparatur"],
  ["arif", "Arif Rahman", "Statistisi Ahli Pertama"],
  ["elisabeth", "Elisabeth Dowansiba", "Statistisi Terampil"],
  ["taufik", "Taufik Hidayat", "Pranata Komputer Terampil"],
  ["yuliana", "Yuliana Sroyer", "Statistisi Pelaksana"],
  ["andi", "Andi Mappanyompa", "Statistisi Ahli Pertama"],
  ["novita", "Novita Rumbekwan", "Statistisi Terampil"],
  ["ahmad", "Ahmad Fauzi", "Pengelola Pengadaan"],
  ["paulina", "Paulina Ullo", "Statistisi Pelaksana"],
  ["rudi", "Rudi Hartono", "Statistisi Terampil"],
  ["wulan", "Wulan Dari", "Arsiparis"],
  ["markus", "Markus Fimbay", "Pengemudi"],
  ["siti", "Siti Rahmawati", "Statistisi Ahli Pertama"],
];

async function main() {
  const reset = process.argv.includes("--reset");
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.pegawai);
  if (n > 0 && !reset) {
    console.log("Database sudah berisi data. Jalankan dengan --reset untuk mengisi ulang.");
    process.exit(0);
  }
  if (reset) {
    await db.execute(sql`truncate table riwayat, notifikasi, target_bulanan, penugasan, pekerjaan, sub_kegiatan,
      kegiatan, anggota_tim, tim, sesi, capaian_snapshot, kunci_bulan, pengaturan, pegawai restart identity cascade`);
  }

  const hash = await hashPassword(PASSWORD);
  const ids: Record<string, number> = {};
  for (const [username, nama, jabatan] of PEGAWAI) {
    const [p] = await db
      .insert(schema.pegawai)
      .values({
        username,
        nama,
        jabatan,
        passwordHash: hash,
        isKepala: username === "kepala",
        isAdmin: username === "admin",
        harusGantiPassword: false,
      })
      .returning({ id: schema.pegawai.id });
    ids[username] = p.id;
  }
  await db.insert(schema.pengaturan).values({ kunci: "ambang_capaian", nilai: "90" });

  const { tahun, bulan } = bulanIni();
  const prev = bulanSebelumnya(tahun, bulan);
  const today = hariIni();

  // ---- Tim ----
  const timBesar: [string, string, string[]][] = [
    ["Umum", "sri", ["sri", "fitri", "lina", "ahmad", "wulan", "markus"]],
    ["Statistik Sosial", "agus", ["agus", "dewi", "hendra", "yuliana", "paulina"]],
    ["Statistik Produksi", "maria", ["maria", "fransiska", "yosep", "samuel"]],
    ["Statistik Distribusi", "ratna", ["ratna", "imanuel", "novita", "rudi"]],
    ["Neraca Wilayah & Analisis", "nur", ["nur", "arif", "elisabeth", "siti"]],
    ["IPDS", "budi", ["budi", "admin", "taufik", "andi"]],
  ];
  const tim: Record<string, number> = {};
  for (const [nama, ketua, anggota] of timBesar) {
    const [t] = await db
      .insert(schema.tim)
      .values({ nama, jenis: "besar", tahun, ketuaId: ids[ketua] })
      .returning({ id: schema.tim.id });
    tim[nama] = t.id;
    await db.insert(schema.anggotaTim).values(anggota.map((u) => ({ timId: t.id, pegawaiId: ids[u] })));
  }
  const [zi] = await db
    .insert(schema.tim)
    .values({ nama: "Zona Integritas", jenis: "kecil", tahun, ketuaId: ids.dewi })
    .returning({ id: schema.tim.id });
  await db.insert(schema.anggotaTim).values(["dewi", "budi", "lina", "arif", "wulan"].map((u) => ({ timId: zi.id, pegawaiId: ids[u] })));
  tim["Zona Integritas"] = zi.id;

  // ---- Helper ----
  async function kegiatan(nama: string, timNama: string, pj: string | null, mulai: string, selesai: string, ket?: string) {
    const [k] = await db
      .insert(schema.kegiatan)
      .values({ nama, timId: tim[timNama], pjId: pj ? ids[pj] : null, mulai, selesai, keterangan: ket ?? null })
      .returning({ id: schema.kegiatan.id });
    return k.id;
  }
  async function sub(kegiatanId: number, nama: string, mulai: string | null = null, selesai: string | null = null) {
    const [s] = await db.insert(schema.subKegiatan).values({ kegiatanId, nama, mulai, selesai }).returning({ id: schema.subKegiatan.id });
    return s.id;
  }
  async function pekerjaan(
    subId: number,
    nama: string,
    peran: string,
    deadline: string,
    opts: { satuan?: string; bobot?: number | null; kualitatif?: string } = {},
  ) {
    const [p] = await db
      .insert(schema.pekerjaan)
      .values({
        subKegiatanId: subId,
        nama,
        peran,
        deadline,
        satuan: opts.satuan ?? null,
        bobot: opts.bobot === undefined ? 5 : opts.bobot,
        targetKualitatif: opts.kualitatif ?? null,
      })
      .returning({ id: schema.pekerjaan.id });
    return p.id;
  }
  type Prog = {
    target: number;
    disetujui?: number;
    diajukan?: number;
    status?: "belum" | "dikerjakan" | "diajukan" | "selesai";
    self?: boolean;
    tolak?: string;
    tahun?: number;
    bulan?: number;
    approver?: string;
  };
  async function tugas(pekerjaanId: number, username: string, progs: Prog[]) {
    const [pn] = await db
      .insert(schema.penugasan)
      .values({ pekerjaanId, pegawaiId: ids[username] })
      .returning({ id: schema.penugasan.id });
    await db.insert(schema.riwayat).values({ penugasanId: pn.id, aksi: "ditugaskan", olehId: ids.kepala });
    for (const p of progs) {
      const disetujui = p.disetujui ?? 0;
      const status = p.status ?? (disetujui >= p.target ? "selesai" : disetujui > 0 ? "dikerjakan" : "belum");
      const approved = disetujui > 0;
      const [tb] = await db
        .insert(schema.targetBulanan)
        .values({
          penugasanId: pn.id,
          tahun: p.tahun ?? tahun,
          bulan: p.bulan ?? bulan,
          target: p.target,
          realisasiDiajukan: p.diajukan ?? disetujui,
          realisasiDisetujui: disetujui,
          status,
          jenisApproval: approved ? (p.self ? "self" : "normal") : null,
          disetujuiAt: approved ? new Date(Date.now() - 86_400_000 * 2) : null,
          disetujuiOleh: approved ? ids[p.approver ?? (p.self ? username : "agus")] : null,
          diajukanAt: status === "diajukan" || approved ? new Date(Date.now() - 86_400_000 * 3) : null,
          alasanTolak: p.tolak ?? null,
        })
        .returning({ id: schema.targetBulanan.id });
      if (status === "diajukan") {
        await db.insert(schema.riwayat).values({ penugasanId: pn.id, targetBulananId: tb.id, aksi: "diajukan", olehId: ids[username] });
      }
      if (approved) {
        await db.insert(schema.riwayat).values({
          penugasanId: pn.id,
          targetBulananId: tb.id,
          aksi: p.self ? "self_approve" : "disetujui",
          olehId: ids[p.approver ?? (p.self ? username : "agus")],
          detail: { realisasi: disetujui, target: p.target },
        });
      }
      if (p.tolak) {
        await db.insert(schema.riwayat).values({
          penugasanId: pn.id,
          targetBulananId: tb.id,
          aksi: "ditolak",
          olehId: ids.agus,
          alasan: p.tolak,
        });
      }
    }
  }

  const ym = (t: number, b: number, d: number) => `${t}-${String(b).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // ---- Sakernas (Tim Sosial) ----
  const sakernas = await kegiatan("Sakernas", "Statistik Sosial", "dewi", ym(prev.tahun, prev.bulan, 1), ym(tahun, bulan, 28),
    "Survei Angkatan Kerja Nasional — pencacahan rumah tangga sampel.");
  const pel = await sub(sakernas, "Pelatihan Petugas", ym(prev.tahun, prev.bulan, 1), ym(prev.tahun, prev.bulan, 20));
  const pan = await pekerjaan(pel, "Panitia pelatihan", "Panitia", ym(prev.tahun, prev.bulan, 20), { bobot: 3 });
  await tugas(pan, "dewi", [{ target: 1, disetujui: 1, tahun: prev.tahun, bulan: prev.bulan, approver: "agus" }]);
  await tugas(pan, "budi", [{ target: 1, disetujui: 1, tahun: prev.tahun, bulan: prev.bulan }]);
  const pes = await pekerjaan(pel, "Peserta pelatihan", "Peserta", ym(prev.tahun, prev.bulan, 20), { bobot: 2 });
  await tugas(pes, "hendra", [{ target: 1, disetujui: 1, tahun: prev.tahun, bulan: prev.bulan }]);
  await tugas(pes, "yuliana", [{ target: 1, disetujui: 1, tahun: prev.tahun, bulan: prev.bulan }]);

  const cacah = await sub(sakernas, "Pencacahan", ym(prev.tahun, prev.bulan, 20), ym(tahun, bulan, 28));
  const pcl = await pekerjaan(cacah, "Pencacahan rumah tangga sampel", "PCL", tambahHari(today, 5), {
    satuan: "ruta",
    bobot: 8,
    kualitatif: "Isian kuesioner lengkap & konsisten",
  });
  await tugas(pcl, "hendra", [
    { target: 30, disetujui: 30, tahun: prev.tahun, bulan: prev.bulan },
    { target: 20, disetujui: 10, diajukan: 16, status: "diajukan" },
  ]);
  await tugas(pcl, "yuliana", [
    { target: 30, disetujui: 24, tahun: prev.tahun, bulan: prev.bulan },
    { target: 20, disetujui: 8, diajukan: 8, status: "dikerjakan" },
  ]);
  await tugas(pcl, "paulina", [{ target: 20, diajukan: 12, status: "dikerjakan", tolak: "Lampirkan link rekap pencacahan per blok sensus." }]);
  await tugas(pcl, "taufik", [{ target: 20, disetujui: 20, approver: "dewi" }]);
  const pml = await pekerjaan(cacah, "Pengawasan & pemeriksaan dokumen", "PML", tambahHari(today, 6), { satuan: "dokumen", bobot: 7 });
  await tugas(pml, "andi", [{ target: 40, disetujui: 15, diajukan: 28, status: "diajukan" }]);
  await tugas(pml, "dewi", [{ target: 40, disetujui: 22 }]);

  const olah = await sub(sakernas, "Pengolahan");
  const ent = await pekerjaan(olah, "Entri & validasi dokumen", "Operator", tambahHari(today, 12), { satuan: "dokumen", bobot: null });
  await tugas(ent, "budi", [{ target: 60 }]);
  await tugas(ent, "taufik", [{ target: 60, diajukan: 20, status: "dikerjakan" }]);

  // ---- Survei Ubinan (Tim Produksi) ----
  const ubinan = await kegiatan("Survei Ubinan Padi & Palawija", "Statistik Produksi", "fransiska", ym(prev.tahun, prev.bulan, 1), ym(tahun, 12, 31));
  const ubSub = await sub(ubinan, "Pengukuran Plot Ubinan");
  const ub = await pekerjaan(ubSub, "Pengukuran plot ubinan subround III", "PCL", tambahHari(today, -2), { satuan: "plot", bobot: 6 });
  await tugas(ub, "yosep", [{ target: 8, disetujui: 5 }]);
  await tugas(ub, "samuel", [{ target: 8, disetujui: 8, approver: "maria" }]);
  await tugas(ub, "imanuel", [{ target: 6, disetujui: 2, diajukan: 4, status: "diajukan" }]);
  await tugas(ub, "maria", [{ target: 4, disetujui: 4, self: true }]);

  // ---- Kabupaten Dalam Angka (Tim Nerwilis) ----
  const kda = await kegiatan("Publikasi Kabupaten Teluk Bintuni Dalam Angka 2027", "Neraca Wilayah & Analisis", "arif",
    ym(tahun, bulan, 1), ym(tahun + (bulan >= 11 ? 1 : 0), ((bulan + 2) % 12) || 12, 28));
  const kdaSub = await sub(kda, "Pengumpulan Data OPD");
  const kdaP = await pekerjaan(kdaSub, "Pengumpulan tabel dari OPD", "Pengumpul data", tambahHari(today, 3), { satuan: "tabel", bobot: null });
  await tugas(kdaP, "arif", [{ target: 40, disetujui: 18, diajukan: 26, status: "diajukan" }]);
  await tugas(kdaP, "elisabeth", [{ target: 30, disetujui: 30, approver: "nur" }]);
  await tugas(kdaP, "siti", [{ target: 30, disetujui: 9 }]);
  await tugas(kdaP, "nur", [{ target: 20, disetujui: 12, self: true }]);
  const layout = await sub(kda, "Penyusunan & Layout");
  const lay = await pekerjaan(layout, "Penyusunan draf publikasi", "Penyusun", tambahHari(today, 20), { kualitatif: "Sesuai template publikasi BPS" });
  await tugas(lay, "elisabeth", [{ target: 1 }]);

  // ---- Survei Harga (Tim Distribusi) ----
  const shk = await kegiatan("Survei Harga Konsumen", "Statistik Distribusi", "novita", ym(tahun, 1, 1), ym(tahun, 12, 31));
  const shkSub = await sub(shk, "Pencacahan Harga Bulanan");
  const shkP = await pekerjaan(shkSub, "Pencacahan harga komoditas", "PCL", ym(tahun, bulan, 25), { satuan: "komoditas", bobot: 6 });
  await tugas(shkP, "rudi", [
    { target: 120, disetujui: 120, tahun: prev.tahun, bulan: prev.bulan, approver: "ratna" },
    { target: 120, disetujui: 70, diajukan: 95, status: "diajukan" },
  ]);
  await tugas(shkP, "imanuel", [
    { target: 120, disetujui: 100, tahun: prev.tahun, bulan: prev.bulan, approver: "ratna" },
    { target: 120, disetujui: 60 },
  ]);
  await tugas(shkP, "ratna", [{ target: 60, disetujui: 60, self: true }]);

  // ---- Kegiatan Umum & ZI ----
  const keu = await kegiatan("Laporan Keuangan & BMN Semester II", "Umum", "fitri", ym(tahun, bulan, 1), ym(tahun, 12, 31));
  const keuSub = await sub(keu, "Penyusunan Laporan");
  const keuP = await pekerjaan(keuSub, "Rekonsiliasi laporan keuangan bulanan", "Penyusun", ym(tahun, bulan, 10), { bobot: 5 });
  await tugas(keuP, "fitri", [{ target: 1, disetujui: 1, approver: "sri" }]);
  await tugas(keuP, "ahmad", [{ target: 1 }]);
  await tugas(keuP, "wulan", [{ target: 1, diajukan: 1, status: "diajukan" }]);
  await tugas(keuP, "markus", [{ target: 1, disetujui: 1, approver: "sri" }]);
  await tugas(keuP, "lina", [{ target: 1, disetujui: 1, approver: "sri" }]);

  const ziK = await kegiatan("Pembangunan Zona Integritas", "Zona Integritas", "budi", ym(tahun, 1, 1), ym(tahun, 12, 31));
  const ziSub = await sub(ziK, "Penyusunan Eviden LKE");
  const ziP = await pekerjaan(ziSub, "Pengumpulan eviden area perubahan", "Anggota", tambahHari(today, 9), { satuan: "eviden", bobot: 4 });
  await tugas(ziP, "dewi", [{ target: 10, disetujui: 6, self: true }]);
  await tugas(ziP, "lina", [{ target: 10, disetujui: 4, approver: "dewi" }]);

  console.log(`Seed selesai: ${PEGAWAI.length} pegawai. Semua akun memakai password "${PASSWORD}".`);
  console.log("Contoh akun: kepala, admin, agus (Ketua Tim Sosial), dewi (PJ Sakernas), hendra (pegawai).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
