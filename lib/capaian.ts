/**
 * Rumus capaian & beban kerja (PRD §6). Fungsi murni tanpa akses DB.
 */

export type StatusProgres = "belum" | "dikerjakan" | "diajukan" | "selesai";

/** Progres satu penugasan di bulan m, 0–100. */
export function hitungProgres(realisasiDisetujui: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(realisasiDisetujui / target, 1) * 100;
}

/** Capaian pegawai di bulan m: rata-rata progres semua penugasan yang punya target di bulan m. */
export function hitungCapaian(items: { realisasi: number; target: number }[]): number | null {
  const valid = items.filter((i) => i.target > 0);
  if (valid.length === 0) return null;
  const total = valid.reduce((s, i) => s + hitungProgres(i.realisasi, i.target), 0);
  return total / valid.length;
}

/** Beban kerja: jumlah bobot pekerjaan yang sudah diberi bobot. */
export function hitungBeban(items: { bobot: number | null }[]): number {
  return items.reduce((s, i) => s + (i.bobot ?? 0), 0);
}

/**
 * Label Terlambat: disetujui setelah deadline, atau belum selesai saat deadline lewat.
 * Tanggal dalam format YYYY-MM-DD (WIT).
 */
export function isTerlambat(args: {
  deadline: string;
  status: StatusProgres;
  tanggalSelesai: string | null; // tanggal disetujui (WIT) bila selesai
  hariIni: string;
}): boolean {
  if (args.status === "selesai") {
    return args.tanggalSelesai != null && args.tanggalSelesai > args.deadline;
  }
  return args.hariIni > args.deadline;
}

/** Realisasi yang dipakai untuk capaian: nilai terkunci bila bulan sudah dikunci. */
export function realisasiUntukCapaian(row: {
  realisasiDisetujui: number;
  realisasiTerkunci: number | null;
}): number {
  return row.realisasiTerkunci ?? row.realisasiDisetujui;
}

export function fmtPersen(v: number | null | undefined, digit = 1): string {
  if (v == null) return "—";
  return `${v.toLocaleString("id-ID", { maximumFractionDigits: digit, minimumFractionDigits: 0 })}%`;
}
