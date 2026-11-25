/**
 * Data DEMO kegiatan/pekerjaan di atas pegawai & tim ASLI (hasil impor:pegawai dan impor:tim).
 * Tidak mengubah akun, profil, maupun tim — hanya kegiatan, pekerjaan, penugasan, progres,
 * riwayat, dan notifikasi. Untuk presentasi/uji coba; JANGAN dijalankan di produksi.
 *
 *   npm run db:demo            → isi bila belum ada kegiatan
 *   npm run db:demo -- --reset → hapus semua data kegiatan (beserta progres & CKP) lalu isi ulang
 *
 * Mencakup: approval normal, menunggu approval (Ketua & PJ), ditolak, unapprove, self-approve
 * (sudah/belum diverifikasi Kepala), pekerjaan terlambat & H-3, pekerjaan belum berbobot,
 * pekerjaan lintas tim, dan riwayat bulan lalu untuk CKP.
 */
import "../lib/load-env";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { akhirBulan, bulanIni, bulanSebelumnya, hariIni, tambahHari } from "../lib/waktu";

const HARI = 86_400_000;
const lalu = (hari: number) => new Date(Date.now() - hari * HARI);

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Data demo tidak boleh dijalankan di produksi.");
    process.exit(1);
  }
  const reset = process.argv.includes("--reset");
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.kegiatan);
  if (n > 0 && !reset) {
    console.log(`Sudah ada ${n} kegiatan. Jalankan dengan --reset untuk menghapus data kegiatan lalu mengisi ulang.`);
    process.exit(0);
  }
  if (reset) {
    await db.execute(sql`truncate table riwayat, notifikasi, target_bulanan, penugasan, pekerjaan, sub_kegiatan,
      kegiatan, capaian_snapshot, kunci_bulan restart identity cascade`);
  }

  const { tahun, bulan } = bulanIni();
  const prev = bulanSebelumnya(tahun, bulan);
  const today = hariIni();
  const tgl = (t: number, b: number, d: number) => `${t}-${String(b).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // ---- Pegawai & tim asli ----
  const pegawai = await db.select({ id: schema.pegawai.id, username: schema.pegawai.username, isKepala: schema.pegawai.isKepala }).from(schema.pegawai);
  const uid = new Map(pegawai.map((p) => [p.username, p.id]));
  const kepala = pegawai.find((p) => p.isKepala);
  if (!kepala) throw new Error("Belum ada akun Kepala. Jalankan impor:pegawai lebih dulu.");
  const U = (username: string) => {
    const id = uid.get(username);
    if (!id) throw new Error(`Pegawai "${username}" tidak ditemukan. Jalankan impor:pegawai lebih dulu.`);
    return id;
  };
  const timRows = await db.select().from(schema.tim).where(and(eq(schema.tim.tahun, tahun), eq(schema.tim.aktif, true)));
  const T = (nama: string) => {
    const t = timRows.find((r) => r.nama === nama);
    if (!t) throw new Error(`Tim "${nama}" tahun ${tahun} tidak ditemukan. Jalankan impor:tim lebih dulu.`);
    if (!t.ketuaId) throw new Error(`Tim "${nama}" belum punya ketua.`);
    return { id: t.id, ketuaId: t.ketuaId };
  };

  // ---- Helper ----
  type Kg = { id: number; ketuaId: number; pjId: number | null };
  async function kegiatan(nama: string, timNama: string, pj: string | null, mulai: string, selesai: string, keterangan?: string): Promise<Kg> {
    const t = T(timNama);
    const pjId = pj ? U(pj) : null;
    const [k] = await db
      .insert(schema.kegiatan)
      .values({ nama, timId: t.id, pjId, mulai, selesai, keterangan: keterangan ?? null })
      .returning({ id: schema.kegiatan.id });
    return { id: k.id, ketuaId: t.ketuaId, pjId };
  }
  async function sub(kg: Kg, nama: string, mulai: string | null = null, selesai: string | null = null) {
    const [s] = await db.insert(schema.subKegiatan).values({ kegiatanId: kg.id, nama, mulai, selesai }).returning({ id: schema.subKegiatan.id });
    return { kg, id: s.id };
  }
  type Pk = { kg: Kg; id: number; nama: string };
  const belumBerbobot: Pk[] = [];
  async function pekerjaan(
    s: { kg: Kg; id: number },
    nama: string,
    peran: string,
    deadline: string,
    opts: { satuan?: string; bobot: number | null; kualitatif?: string },
  ): Promise<Pk> {
    const [p] = await db
      .insert(schema.pekerjaan)
      .values({
        subKegiatanId: s.id,
        nama,
        peran,
        deadline,
        satuan: opts.satuan ?? null,
        targetKualitatif: opts.kualitatif ?? null,
        bobot: opts.bobot,
        bobotOleh: opts.bobot === null ? null : kepala!.id,
        bobotAt: opts.bobot === null ? null : lalu(8),
        createdBy: s.kg.ketuaId,
        createdAt: lalu(12),
      })
      .returning({ id: schema.pekerjaan.id });
    const pk = { kg: s.kg, id: p.id, nama };
    if (opts.bobot === null) belumBerbobot.push(pk);
    return pk;
  }

  type Prog = {
    target: number;
    /** Realisasi yang sudah disetujui. */
    ok?: number;
    /** Realisasi yang diajukan/diisi pegawai (default = ok). */
    isi?: number;
    status?: "belum" | "dikerjakan" | "diajukan" | "selesai";
    /** Bulan lalu (default bulan ini). */
    lalu?: boolean;
    /** Username penyetuju (default: PJ kegiatan, atau Ketua bila pegawai = PJ). */
    oleh?: string;
    /** Self-approve oleh Ketua Tim; `verif` = sudah diverifikasi Kepala. */
    self?: boolean;
    verif?: boolean;
    tolak?: string;
    unapprove?: string;
    catatan?: string;
  };
  const notif: (typeof schema.notifikasi.$inferInsert)[] = [];
  const periode = (p: Prog) => (p.lalu ? prev : { tahun, bulan });

  async function tugas(pk: Pk, username: string, progs: Prog[]) {
    const pegawaiId = U(username);
    const [pn] = await db.insert(schema.penugasan).values({ pekerjaanId: pk.id, pegawaiId, createdAt: lalu(11) }).returning({ id: schema.penugasan.id });
    await db.insert(schema.riwayat).values({ penugasanId: pn.id, aksi: "ditugaskan", olehId: pk.kg.ketuaId, createdAt: lalu(11) });

    for (const p of progs) {
      const per = periode(p);
      const ok = p.ok ?? 0;
      const isi = p.isi ?? ok;
      const status = p.status ?? (ok >= p.target ? "selesai" : ok > 0 || isi > 0 ? "dikerjakan" : "belum");
      const self = !!p.self;
      const penyetuju = self ? pegawaiId : p.oleh ? U(p.oleh) : pk.kg.pjId && pk.kg.pjId !== pegawaiId ? pk.kg.pjId : pk.kg.ketuaId;
      const disetujui = ok > 0 && !p.unapprove;
      const geser = p.lalu ? 30 : 0; // riwayat bulan lalu ~30 hari lebih awal
      const [tb] = await db
        .insert(schema.targetBulanan)
        .values({
          penugasanId: pn.id,
          tahun: per.tahun,
          bulan: per.bulan,
          target: p.target,
          realisasiDiajukan: isi,
          realisasiDisetujui: p.unapprove ? 0 : ok,
          status,
          jenisApproval: disetujui ? (self ? "self" : "normal") : null,
          diverifikasiKepala: self && !!p.verif,
          catatan: p.catatan ?? null,
          alasanTolak: p.tolak ?? p.unapprove ?? null,
          diajukanAt: isi > 0 && status !== "belum" ? lalu(geser + 3) : null,
          disetujuiAt: disetujui ? lalu(geser + 2) : null,
          disetujuiOleh: disetujui ? penyetuju : null,
          updatedAt: lalu(geser + 1),
        })
        .returning({ id: schema.targetBulanan.id });
      const r = (aksi: (typeof schema.riwayat.$inferInsert)["aksi"], olehId: number, hari: number, extra: Partial<typeof schema.riwayat.$inferInsert> = {}) =>
        db.insert(schema.riwayat).values({ penugasanId: pn.id, targetBulananId: tb.id, aksi, olehId, createdAt: lalu(geser + hari), ...extra });

      if (isi > 0) await r("progres_diisi", pegawaiId, 4, { detail: { realisasi: isi } });
      if (isi > 0 && !self) await r("diajukan", pegawaiId, 3, { detail: { realisasi: isi } });
      if (ok > 0) {
        await r(self ? "self_approve" : "disetujui", penyetuju, 2, { detail: { realisasi: ok, target: p.target } });
      }
      if (self && p.verif) await r("verifikasi_kepala", kepala!.id, 1);
      if (p.unapprove) {
        await r("unapprove", penyetuju, 1, { alasan: p.unapprove });
        if (!p.lalu) {
          notif.push({ pegawaiId, jenis: "unapprove", judul: "Approval dibatalkan", pesan: `${pk.nama}: ${p.unapprove}`, link: `/pekerjaan-saya`, createdAt: lalu(1) });
        }
      }
      if (p.tolak) {
        await r("ditolak", penyetuju, 1, { alasan: p.tolak });
        notif.push({ pegawaiId, jenis: "ditolak", judul: "Pengajuan ditolak", pesan: `${pk.nama}: ${p.tolak}`, link: `/pekerjaan-saya`, createdAt: lalu(1) });
      }
      if (status === "diajukan") {
        const tujuan = new Set([pk.kg.ketuaId, ...(pk.kg.pjId && pk.kg.pjId !== pegawaiId ? [pk.kg.pjId] : [])]);
        for (const t of tujuan) {
          notif.push({ pegawaiId: t, jenis: "menunggu_approval", judul: "Pengajuan menunggu approval", pesan: `${pk.nama} — realisasi ${isi} dari ${p.target}`, link: "/approval", createdAt: lalu(3) });
        }
      }
    }
    if (!progs.some((p) => p.lalu)) {
      notif.push({ pegawaiId, jenis: "ditugaskan", judul: "Anda ditugaskan ke pekerjaan baru", pesan: pk.nama, link: "/pekerjaan-saya", dibaca: true, createdAt: lalu(11) });
    }
  }

  const P = prev;
  const akhirBulanIni = tgl(tahun, bulan, 28);

  /* ============================ Tim Sosial ============================ */
  const susenas = await kegiatan("Survei Sosial Ekonomi Nasional (Susenas)", "Sosial", "galuh.sri", tgl(P.tahun, P.bulan, 1), tgl(tahun, 12, 20),
    "Pencacahan rumah tangga sampel Susenas di 6 kecamatan.");
  const pelatihan = await sub(susenas, "Pelatihan Petugas", tgl(P.tahun, P.bulan, 1), tgl(P.tahun, P.bulan, 20));
  const panitia = await pekerjaan(pelatihan, "Panitia pelatihan petugas", "Panitia", tgl(P.tahun, P.bulan, 20), { bobot: 3 });
  await tugas(panitia, "darno", [{ lalu: true, target: 1, ok: 1, self: true, verif: true }]);
  await tugas(panitia, "magdalena.rondang", [{ lalu: true, target: 1, ok: 1 }]);
  const peserta = await pekerjaan(pelatihan, "Peserta pelatihan petugas", "Peserta", tgl(P.tahun, P.bulan, 20), { bobot: 2 });
  await tugas(peserta, "alifah.rahma", [{ lalu: true, target: 1, ok: 1 }]);
  await tugas(peserta, "hendra2", [{ lalu: true, target: 1, ok: 1 }]); // lintas tim (Produksi)

  const cacah = await sub(susenas, "Pencacahan", tgl(P.tahun, P.bulan, 21), akhirBulanIni);
  const pcl = await pekerjaan(cacah, "Pencacahan rumah tangga sampel", "PCL", tambahHari(today, 5), {
    satuan: "ruta",
    bobot: 8,
    kualitatif: "Isian kuesioner lengkap & konsisten",
  });
  await tugas(pcl, "galuh.sri", [
    { lalu: true, target: 20, ok: 20, oleh: "darno" },
    { target: 20, ok: 10, isi: 16, status: "diajukan", oleh: "darno", catatan: "Sisa 4 ruta di Distrik Bintuni sudah dicacah, mohon dicek." },
  ]);
  await tugas(pcl, "magdalena.rondang", [
    { lalu: true, target: 20, ok: 16 },
    { target: 20, ok: 8, isi: 14, status: "diajukan", catatan: "6 ruta tambahan di Distrik Manimeri." }, // antrean PJ (Galuh)
  ]);
  await tugas(pcl, "alifah.rahma", [
    { target: 20, isi: 12, status: "dikerjakan", tolak: "Lampirkan rekap pencacahan per blok sensus sebelum mengajukan." },
  ]);
  await tugas(pcl, "bella.siregar", [{ target: 20, ok: 20 }]); // lintas tim (Distribusi)
  const pml = await pekerjaan(cacah, "Pengawasan & pemeriksaan dokumen", "PML", tambahHari(today, 6), { satuan: "dokumen", bobot: 7 });
  await tugas(pml, "darno", [{ target: 40, ok: 22, self: true }]);
  await tugas(pml, "galuh.sri", [{ target: 40, ok: 15, isi: 28, status: "diajukan", oleh: "darno" }]);

  const olah = await sub(susenas, "Pengolahan");
  const entri = await pekerjaan(olah, "Entri & validasi dokumen Susenas", "Operator", tambahHari(today, 12), { satuan: "dokumen", bobot: null });
  await tugas(entri, "ajengwahyulinda", [{ target: 60 }]);
  await tugas(entri, "naufalihsan", [{ target: 60, isi: 20, status: "dikerjakan" }]);

  /* ============================ Tim Produksi ============================ */
  const ubinan = await kegiatan("Survei Ubinan Padi & Palawija", "Produksi", "ambung", tgl(P.tahun, P.bulan, 1), tgl(tahun, 12, 31));
  const plot = await sub(ubinan, "Pengukuran Plot Ubinan Subround III");
  const ub = await pekerjaan(plot, "Pengukuran plot ubinan", "PCL", tambahHari(today, -2), { satuan: "plot", bobot: 6 }); // sudah lewat deadline
  await tugas(ub, "hendra2", [{ target: 8, ok: 5, isi: 7, status: "diajukan" }]); // antrean PJ (Ambung), terlambat
  await tugas(ub, "ririssilalahi", [{ target: 8, ok: 8 }]);
  await tugas(ub, "ambung", [{ target: 6, ok: 2, isi: 4, status: "diajukan" }]);
  await tugas(ub, "sapier", [{ target: 4, ok: 4, self: true, verif: true }]);
  const lahan = await sub(ubinan, "Survei Luas Panen (KSA)", tgl(P.tahun, P.bulan, 1), akhirBulan(P.tahun, P.bulan));
  const ksa = await pekerjaan(lahan, "Pengamatan titik KSA Oktober", "PCL", tgl(P.tahun, P.bulan, 28), { satuan: "titik", bobot: 5 });
  await tugas(ksa, "hendra2", [{ lalu: true, target: 10, ok: 10 }]);
  await tugas(ksa, "ririssilalahi", [{ lalu: true, target: 10, ok: 9 }]);

  /* ============================ Tim Distribusi ============================ */
  const shk = await kegiatan("Survei Harga Konsumen (SHK)", "Distribusi", null, tgl(tahun, 1, 1), tgl(tahun, 12, 31),
    "Pencacahan harga eceran komoditas di pasar Bintuni.");
  const harga = await sub(shk, "Pencacahan Harga Bulanan");
  const shkP = await pekerjaan(harga, "Pencacahan harga komoditas", "PCL", tgl(tahun, bulan, 25), { satuan: "komoditas", bobot: 6 });
  await tugas(shkP, "bella.siregar", [
    { lalu: true, target: 120, ok: 120 },
    { target: 120, ok: 70, isi: 95, status: "diajukan" },
  ]);
  await tugas(shkP, "abraham", [
    { lalu: true, target: 120, ok: 100 },
    { target: 120, ok: 60 },
  ]);
  await tugas(shkP, "fahmi.rais", [
    { lalu: true, target: 120, ok: 120 },
    { target: 120, ok: 80, isi: 80, status: "dikerjakan", unapprove: "Harga beras medium belum sesuai pantauan pasar; mohon dicek ulang." },
  ]);
  await tugas(shkP, "fransniko", [
    { lalu: true, target: 60, ok: 60, self: true, verif: true },
    { target: 60, ok: 60, self: true },
  ]);
  const produsen = await sub(shk, "Survei Harga Produsen");
  const hp = await pekerjaan(produsen, "Pencacahan harga produsen gabah", "PCL", tambahHari(today, 10), { satuan: "observasi", bobot: null });
  await tugas(hp, "abraham", [{ target: 15 }]);

  /* ============================ Tim Neraca ============================ */
  const kda = await kegiatan(`Publikasi Kabupaten Teluk Bintuni Dalam Angka ${tahun + 1}`, "Neraca", "agustienwahyu", tgl(tahun, bulan, 1), tgl(tahun + 1, 2, 28));
  const opd = await sub(kda, "Pengumpulan Data OPD");
  const tabel = await pekerjaan(opd, "Pengumpulan tabel dari OPD", "Pengumpul data", tambahHari(today, 3), { satuan: "tabel", bobot: null }); // H-3
  await tugas(tabel, "priambudi.arief", [{ target: 40, ok: 18, isi: 26, status: "diajukan" }]);
  await tugas(tabel, "agustienwahyu", [{ target: 30, ok: 30, oleh: "luh.sitha" }]);
  await tugas(tabel, "luh.sitha", [{ target: 20, ok: 12, self: true }]);
  const susun = await sub(kda, "Penyusunan & Layout");
  const draf = await pekerjaan(susun, "Penyusunan draf publikasi", "Penyusun", tambahHari(today, 20), { bobot: null, kualitatif: "Sesuai template publikasi BPS" });
  await tugas(draf, "agustienwahyu", [{ target: 1 }]);

  const pdrb = await kegiatan("Penghitungan PDRB Triwulanan", "Neraca", null, tgl(P.tahun, P.bulan, 1), tgl(tahun, 12, 31));
  const tw = await sub(pdrb, "PDRB Triwulan III");
  const kompilasi = await pekerjaan(tw, "Kompilasi data PDRB triwulan III", "Penyusun", akhirBulan(P.tahun, P.bulan), { bobot: 7 });
  await tugas(kompilasi, "luh.sitha", [{ lalu: true, target: 1, ok: 1, self: true, verif: true }]);
  await tugas(kompilasi, "priambudi.arief", [{ lalu: true, target: 1, ok: 1 }]);

  /* ============================ Tim IPDS ============================ */
  const web = await kegiatan("Pengelolaan Website & Diseminasi Statistik", "IPDS", "naufalihsan", tgl(tahun, 1, 1), tgl(tahun, 12, 31));
  const tabelWeb = await sub(web, "Pemutakhiran Tabel Statistik");
  const upload = await pekerjaan(tabelWeb, "Upload tabel statistik ke website", "Operator", akhirBulan(tahun, bulan), { satuan: "tabel", bobot: 4 });
  await tugas(upload, "naufalihsan", [
    { lalu: true, target: 20, ok: 20, oleh: "yusuf.adha" },
    { target: 25, ok: 25, oleh: "yusuf.adha" },
  ]);
  await tugas(upload, "ajengwahyulinda", [
    { lalu: true, target: 20, ok: 20 },
    { target: 25, isi: 25, status: "diajukan" },
  ]);
  const pst = await sub(web, "Pelayanan Statistik Terpadu (PST)");
  const konsul = await pekerjaan(pst, "Layanan konsultasi statistik", "Petugas PST", akhirBulan(tahun, bulan), { satuan: "layanan", bobot: 3 });
  await tugas(konsul, "josegi.ginting", [{ target: 10, ok: 6 }]);
  await tugas(konsul, "yusuf.adha", [{ target: 10, ok: 10, self: true }]);

  /* ============================ Tim Sensus Ekonomi ============================ */
  const se = await kegiatan(`Sensus Ekonomi ${tahun} — Pengolahan`, "Sensus Ekonomi", "martin.hasiholan", tgl(P.tahun, P.bulan, 1), tgl(tahun, 12, 31),
    "Pemeriksaan, pengkodean, dan entri dokumen hasil pendataan SE.");
  const kode = await sub(se, "Pemeriksaan & Pengkodean");
  const pengkodean = await pekerjaan(kode, "Pemeriksaan dan pengkodean dokumen", "Pengolah", tambahHari(today, 7), { satuan: "dokumen", bobot: 7 });
  await tugas(pengkodean, "martin.hasiholan", [
    { lalu: true, target: 100, ok: 100, oleh: "josegi.ginting" },
    { target: 150, ok: 90, isi: 120, status: "diajukan", oleh: "josegi.ginting" },
  ]);
  await tugas(pengkodean, "alim.ghifran", [
    { lalu: true, target: 100, ok: 100 },
    { target: 150, ok: 150 },
  ]);
  await tugas(pengkodean, "khadijah.syukriah", [
    { lalu: true, target: 100, ok: 80 },
    { target: 150, ok: 60 },
  ]);
  await tugas(pengkodean, "arintasinaga", [
    { target: 150, isi: 40, status: "dikerjakan", tolak: "Kode KBLI pada 12 dokumen belum sesuai; perbaiki lalu ajukan ulang." },
  ]);
  await tugas(pengkodean, "fahmi.rais", [{ target: 100, ok: 100 }]);
  const entriSe = await sub(se, "Entri Data");
  const entriSeP = await pekerjaan(entriSe, "Entri data dokumen SE", "Operator", tambahHari(today, 14), { satuan: "dokumen", bobot: null });
  await tugas(entriSeP, "ririssilalahi", [{ target: 200 }]);
  await tugas(entriSeP, "priambudi.arief", [{ target: 200, isi: 50, status: "dikerjakan" }]);

  /* ============================ Tim Umum ============================ */
  const keu = await kegiatan("Laporan Keuangan & BMN Semester II", "Umum", null, tgl(P.tahun, P.bulan, 1), tgl(tahun, 12, 31));
  const lap = await sub(keu, "Penyusunan Laporan");
  const rekon = await pekerjaan(lap, "Rekonsiliasi laporan keuangan bulanan", "Penyusun", tgl(tahun, bulan, 10), { bobot: 5 }); // lewat deadline
  await tugas(rekon, "khadijah.syukriah", [
    { lalu: true, target: 1, ok: 1 },
    { target: 1, ok: 1 },
  ]);
  await tugas(rekon, "arintasinaga", [{ target: 1, isi: 1, status: "diajukan" }]);
  const sarpras = await sub(keu, "Pemeliharaan Sarana & Prasarana");
  const pelihara = await pekerjaan(sarpras, "Pemeliharaan sarana & prasarana kantor", "Pelaksana", akhirBulan(tahun, bulan), { bobot: 3 });
  await tugas(pelihara, "maulludin-pppk", [
    { lalu: true, target: 1, ok: 1 },
    { target: 1, ok: 1 },
  ]);
  await tugas(pelihara, "kiswandi-pppk", [{ lalu: true, target: 1, ok: 1 }, { target: 1 }]);
  const arsip = await pekerjaan(sarpras, "Pengelolaan persuratan & arsip", "Pelaksana", akhirBulan(tahun, bulan), { bobot: null });
  await tugas(arsip, "khadijah.syukriah", [{ target: 1 }]);

  /* ============================ Tim SAKIP ============================ */
  const sakip = await kegiatan(`Penyusunan Perjanjian Kinerja ${tahun + 1}`, "SAKIP", "ambung", tgl(tahun, bulan, 1), tgl(tahun, 12, 31));
  const pk = await sub(sakip, "Penyusunan Dokumen");
  const drafPk = await pekerjaan(pk, `Penyusunan draf Perjanjian Kinerja ${tahun + 1}`, "Penyusun", tambahHari(today, 15), { bobot: 4 });
  await tugas(drafPk, "ambung", [{ target: 1 }]);
  await tugas(drafPk, "galuh.sri", [{ target: 1, ok: 1 }]);
  await tugas(drafPk, "haristw", [{ target: 1, ok: 1, self: true }]);

  /* ============================ Tim Humas ============================ */
  const humas = await kegiatan("Konten Media Sosial & Rilis BRS", "Hubungan Masyarakat dan Keprotokolan", "priambudi.arief", tgl(tahun, bulan, 1), tgl(tahun, 12, 31));
  const konten = await sub(humas, "Konten Media Sosial");
  const infografis = await pekerjaan(konten, "Pembuatan infografis media sosial", "Desainer", akhirBulan(tahun, bulan), { satuan: "konten", bobot: 3 });
  await tugas(infografis, "magdalena.rondang", [{ target: 4, ok: 4 }]);
  await tugas(infografis, "priambudi.arief", [{ target: 4, ok: 2, isi: 3, status: "diajukan" }]);
  await tugas(infografis, "naufalihsan", [{ target: 4, ok: 1 }]);

  // ---- Notifikasi ----
  for (const b of belumBerbobot) {
    notif.push({ pegawaiId: kepala.id, jenis: "belum_berbobot", judul: "Pekerjaan baru belum berbobot", pesan: b.nama, link: "/dashboard/bobot", createdAt: lalu(10) });
  }
  if (notif.length) await db.insert(schema.notifikasi).values(notif);

  const [{ jk }] = await db.select({ jk: sql<number>`count(*)::int` }).from(schema.kegiatan);
  const [{ jp }] = await db.select({ jp: sql<number>`count(*)::int` }).from(schema.penugasan);
  console.log(`Data demo selesai: ${jk} kegiatan, ${jp} penugasan, ${belumBerbobot.length} pekerjaan belum berbobot, ${notif.length} notifikasi.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
