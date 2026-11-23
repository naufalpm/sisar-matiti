/**
 * Parser ekspor "Pegawai menurut Unit Organisasi" (CSV pemisah `;`) menjadi profil pegawai.
 * Fungsi murni — dipakai oleh scripts/impor-pegawai.ts dan diuji di tests/impor-pegawai.test.ts.
 *
 * Bentuk file:
 *   baris judul
 *   No.;Nama;NIP;Stat.Jabatan;Gol.Akhir;TMT Gol.;Pendidikan (SK);Tgl.Lulus (SK);Jns.Kelamin;Tgl.Lahir;Username
 *   <judul unit>;;;;…            ← baris pemisah unit organisasi
 *   1;Nama;"NIP lama\nNIP baru";…  ← baris pegawai
 */

export type ProfilImpor = {
  baris: number;
  nama: string;
  nip: string;
  nipLama: string | null;
  username: string;
  jabatan: string | null;
  unitKerja: string | null;
  golongan: string | null;
  tmtGolongan: string | null;
  pendidikan: string | null;
  tglLulus: string | null;
  jenisKelamin: "L" | "P" | null;
  tglLahir: string | null;
  /** Pimpinan kantor (jabatan "Kepala" di unit BPS Kabupaten) → peran Kepala di aplikasi. */
  isKepalaKantor: boolean;
};

export type MasalahImpor = { baris: number; pesan: string };

export const USERNAME_VALID = /^[a-z0-9._-]{3,32}$/;

/** Parser CSV sederhana (RFC 4180): mendukung kutip, "" sebagai escape, dan baris baru di dalam kutip. */
export function parseCsv(teks: string, pemisah = ";"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let sel = "";
  let kutip = false;
  const s = teks.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (kutip) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          sel += '"';
          i++;
        } else kutip = false;
      } else sel += c;
    } else if (c === '"') kutip = true;
    else if (c === pemisah) {
      row.push(sel);
      sel = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(sel);
      rows.push(row);
      row = [];
      sel = "";
    } else sel += c;
  }
  if (sel !== "" || row.length) {
    row.push(sel);
    rows.push(row);
  }
  return rows;
}

const rapikan = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
const atauNull = (v: string) => (v ? v : null);

/** "17-06-1983" → "1983-06-17"; null bila kosong/tidak valid. */
export function tanggalDmy(v: string): string | null {
  const m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(v.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const t = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== iso ? null : iso;
}

/** "BPS Kabupaten/Kota Kab. Teluk Bintuni" → "BPS Kabupaten Teluk Bintuni"; "Subbagian Umum Kab. Teluk Bintuni" → "Subbagian Umum". */
export function normalUnit(judul: string): string {
  const u = rapikan(judul);
  const bps = /^BPS Kabupaten\/Kota\s+Kab\.\s*(.+)$/i.exec(u);
  if (bps) return `BPS Kabupaten ${bps[1]}`;
  return u.replace(/\s+Kab\.\s+.+$/i, "");
}

const isUnitBps = (unit: string | null) => !!unit && /^BPS\b/i.test(unit);

const KOLOM = {
  nama: /^nama$/i,
  nip: /^nip$/i,
  jabatan: /jabatan/i,
  golongan: /^gol/i,
  tmtGolongan: /^tmt/i,
  pendidikan: /^pendidikan/i,
  tglLulus: /lulus/i,
  jenisKelamin: /kelamin/i,
  tglLahir: /lahir/i,
  username: /^username$/i,
} as const;

export function parsePegawaiCsv(teks: string): { pegawai: ProfilImpor[]; masalah: MasalahImpor[] } {
  const rows = parseCsv(teks);
  const masalah: MasalahImpor[] = [];
  const pegawai: ProfilImpor[] = [];

  const iHeader = rows.findIndex((r) => r.some((c) => KOLOM.nama.test(rapikan(c))) && r.some((c) => KOLOM.nip.test(rapikan(c))));
  if (iHeader < 0) return { pegawai, masalah: [{ baris: 0, pesan: "Baris header (Nama; NIP; …) tidak ditemukan." }] };
  const header = rows[iHeader].map(rapikan);
  const idx = Object.fromEntries(
    Object.entries(KOLOM).map(([k, re]) => [k, header.findIndex((h) => re.test(h))]),
  ) as Record<keyof typeof KOLOM, number>;
  for (const k of ["nama", "nip", "username"] as const) {
    if (idx[k] < 0) masalah.push({ baris: iHeader + 1, pesan: `Kolom wajib "${k}" tidak ditemukan di header.` });
  }
  if (masalah.length) return { pegawai, masalah };

  // Nomor baris fisik di file (NIP dua baris membuat satu record memakan 2 baris).
  let barisFisik = 1;
  const nomorBaris: number[] = [];
  for (const r of rows) {
    nomorBaris.push(barisFisik);
    barisFisik += r.join(";").split("\n").length;
  }

  const ambil = (r: string[], k: keyof typeof KOLOM) => (idx[k] >= 0 ? rapikan(r[idx[k]]) : "");
  const nipTerpakai = new Map<string, number>();
  const userTerpakai = new Map<string, number>();
  let unit: string | null = null;

  for (let i = iHeader + 1; i < rows.length; i++) {
    const r = rows[i];
    const baris = nomorBaris[i];
    const isi = r.map(rapikan);
    if (isi.every((c) => !c)) continue;
    // Baris unit: kolom pertama berisi teks (bukan nomor urut) dan kolom lain kosong.
    if (!/^\d+$/.test(isi[0]) && isi.slice(1).every((c) => !c)) {
      unit = normalUnit(isi[0]);
      continue;
    }

    const nama = ambil(r, "nama");
    const nipSel = (r[idx.nip] ?? "").split(/\s+/).filter(Boolean);
    const nip = nipSel.find((n) => /^\d{18}$/.test(n)) ?? "";
    const nipLama = nipSel.find((n) => /^\d{9}$/.test(n)) ?? null;
    const username = ambil(r, "username").toLowerCase();

    if (!nama) masalah.push({ baris, pesan: "Nama kosong." });
    if (!nip) masalah.push({ baris, pesan: `${nama || "?"}: NIP 18 digit tidak ditemukan.` });
    if (!USERNAME_VALID.test(username)) {
      masalah.push({ baris, pesan: `${nama || "?"}: username "${username}" tidak valid (3–32 karakter: a-z, 0-9, . _ -).` });
    }
    if (nip && nipTerpakai.has(nip)) masalah.push({ baris, pesan: `${nama}: NIP sama dengan baris ${nipTerpakai.get(nip)}.` });
    if (username && userTerpakai.has(username)) {
      masalah.push({ baris, pesan: `${nama}: username sama dengan baris ${userTerpakai.get(username)}.` });
    }
    if (!nama || !nip || !USERNAME_VALID.test(username) || nipTerpakai.has(nip) || userTerpakai.has(username)) continue;
    nipTerpakai.set(nip, baris);
    userTerpakai.set(username, baris);

    let jabatan = ambil(r, "jabatan");
    const isKepala = /^kepala$/i.test(jabatan);
    const isKepalaKantor = isKepala && isUnitBps(unit);
    if (isKepala) jabatan = isKepalaKantor ? "Kepala BPS Kabupaten" : unit ? `Kepala ${unit}` : "Kepala";

    const jk = ambil(r, "jenisKelamin").toUpperCase();
    const tgl = (k: "tmtGolongan" | "tglLulus" | "tglLahir") => {
      const v = ambil(r, k);
      const iso = tanggalDmy(v);
      if (v && !iso) masalah.push({ baris, pesan: `${nama}: tanggal "${v}" tidak valid (diabaikan).` });
      return iso;
    };

    pegawai.push({
      baris,
      nama,
      nip,
      nipLama,
      username,
      jabatan: atauNull(jabatan),
      unitKerja: unit,
      golongan: atauNull(ambil(r, "golongan")),
      tmtGolongan: tgl("tmtGolongan"),
      pendidikan: atauNull(ambil(r, "pendidikan")),
      tglLulus: tgl("tglLulus"),
      jenisKelamin: jk === "LK" || jk === "L" ? "L" : jk === "PR" || jk === "P" ? "P" : null,
      tglLahir: tgl("tglLahir"),
      isKepalaKantor,
    });
  }
  return { pegawai, masalah };
}
