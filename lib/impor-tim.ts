/**
 * Parser matriks "pegawai × tim" (CSV pemisah `;`):
 *   NIP_Lama;Nama_Lengkap;Tim Umum;Tim Sosial;…;Total_Tim
 *   340056298;Hari Setiawan SST;Ketua Tim;-;…;3
 * Sel berisi "Ketua Tim", "Anggota", atau "-" (bukan anggota).
 */
import { parseCsv } from "./impor-pegawai";

/** Tim yang dihitung sebagai tim besar; tim lain di matriks menjadi tim kecil. */
export const TIM_BESAR = ["Umum", "Sosial", "Produksi", "Distribusi", "Neraca", "IPDS"];

export type TimImpor = {
  nama: string;
  jenis: "besar" | "kecil";
  /** NIP lama ketua (null bila matriks tidak menyebut ketua). */
  ketua: string | null;
  /** NIP lama seluruh anggota, termasuk ketua. */
  anggota: string[];
};

export type MasalahImpor = { baris: number; pesan: string };

/** "Tim Kerja Sensus Ekonomi" → "Sensus Ekonomi"; "Tim Umum" → "Umum". */
export function namaTim(header: string) {
  return header.replace(/\s+/g, " ").trim().replace(/^Tim\s+(Kerja\s+)?/i, "");
}

export function parseMatriksTim(teks: string): { tim: TimImpor[]; nama: Map<string, string>; masalah: MasalahImpor[] } {
  const rows = parseCsv(teks).map((r) => r.map((c) => c.replace(/\s+/g, " ").trim()));
  const masalah: MasalahImpor[] = [];
  const nama = new Map<string, string>();
  const header = rows[0] ?? [];
  const iNip = header.findIndex((h) => /nip/i.test(h));
  const iNama = header.findIndex((h) => /nama/i.test(h));
  const kolomTim = header.flatMap((h, i) => (/^tim\b/i.test(h) ? [i] : []));
  if (iNip < 0 || kolomTim.length === 0) {
    return { tim: [], nama, masalah: [{ baris: 1, pesan: "Header harus berisi kolom NIP dan kolom \"Tim …\"." }] };
  }

  const tim: TimImpor[] = kolomTim.map((i) => {
    const n = namaTim(header[i]);
    return { nama: n, jenis: TIM_BESAR.includes(n) ? "besar" : "kecil", ketua: null, anggota: [] };
  });

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every((c) => !c)) continue;
    const nip = row[iNip];
    if (!/^\d{9}$/.test(nip)) {
      masalah.push({ baris: r + 1, pesan: `NIP lama "${nip}" tidak valid (harus 9 digit).` });
      continue;
    }
    if (nama.has(nip)) {
      masalah.push({ baris: r + 1, pesan: `NIP lama ${nip} muncul lebih dari sekali.` });
      continue;
    }
    nama.set(nip, iNama >= 0 ? row[iNama] : nip);
    kolomTim.forEach((i, k) => {
      const v = (row[i] ?? "").toLowerCase();
      if (!v || v === "-") return;
      const t = tim[k];
      if (v === "ketua tim" || v === "ketua") {
        if (t.ketua) masalah.push({ baris: r + 1, pesan: `Tim ${t.nama} punya lebih dari satu ketua; yang dipakai: ${nama.get(t.ketua)}.` });
        else t.ketua = nip;
        t.anggota.push(nip);
      } else if (v === "anggota") {
        t.anggota.push(nip);
      } else {
        masalah.push({ baris: r + 1, pesan: `Nilai "${row[i]}" di kolom ${header[i]} tidak dikenal (pakai "Ketua Tim", "Anggota", atau "-").` });
      }
    });
  }
  return { tim, nama, masalah };
}
