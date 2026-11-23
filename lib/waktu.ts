/**
 * Utilitas tanggal. Seluruh tanggal bisnis memakai zona WIT (Asia/Jayapura, UTC+9),
 * zona waktu Kabupaten Teluk Bintuni.
 */
export const ZONA = "Asia/Jayapura";

export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

export const NAMA_BULAN_PENDEK = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
] as const;

/** Tanggal hari ini (WIT) dalam format YYYY-MM-DD. */
export function hariIni(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function bulanIni(now: Date = new Date()): { tahun: number; bulan: number } {
  const [y, m] = hariIni(now).split("-").map(Number);
  return { tahun: y, bulan: m };
}

/** Tambah n hari ke tanggal YYYY-MM-DD. */
export function tambahHari(tgl: string, n: number): string {
  const d = new Date(`${tgl}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Selisih hari (b − a) untuk dua tanggal YYYY-MM-DD. */
export function selisihHari(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00Z`);
  const dbb = Date.parse(`${b}T00:00:00Z`);
  return Math.round((dbb - da) / 86_400_000);
}

export function bulanBerikutnya(tahun: number, bulan: number) {
  return bulan === 12 ? { tahun: tahun + 1, bulan: 1 } : { tahun, bulan: bulan + 1 };
}

export function bulanSebelumnya(tahun: number, bulan: number) {
  return bulan === 1 ? { tahun: tahun - 1, bulan: 12 } : { tahun, bulan: bulan - 1 };
}

/** Batas input & approval bulan m: tanggal 5 bulan berikutnya (WIT, inklusif). */
export function batasKunci(tahun: number, bulan: number): string {
  const nb = bulanBerikutnya(tahun, bulan);
  return `${nb.tahun}-${String(nb.bulan).padStart(2, "0")}-05`;
}

/** Bulan m terkunci bila hari ini (WIT) sudah melewati tanggal 5 bulan berikutnya. */
export function sudahTerkunci(tahun: number, bulan: number, now: Date = new Date()): boolean {
  return hariIni(now) > batasKunci(tahun, bulan);
}

/** Daftar {tahun, bulan} dari tanggal mulai s.d. selesai (inklusif). */
export function daftarBulan(mulai: string, selesai: string) {
  const [y1, m1] = mulai.split("-").map(Number);
  const [y2, m2] = selesai.split("-").map(Number);
  const out: { tahun: number; bulan: number }[] = [];
  let y = y1;
  let m = m1;
  while (y < y2 || (y === y2 && m <= m2)) {
    out.push({ tahun: y, bulan: m });
    ({ tahun: y, bulan: m } = bulanBerikutnya(y, m));
    if (out.length > 120) break;
  }
  return out;
}

export function labelBulan(tahun: number, bulan: number, pendek = false) {
  return `${(pendek ? NAMA_BULAN_PENDEK : NAMA_BULAN)[bulan - 1]} ${tahun}`;
}

export function awalBulan(tahun: number, bulan: number) {
  return `${tahun}-${String(bulan).padStart(2, "0")}-01`;
}

export function akhirBulan(tahun: number, bulan: number) {
  const d = new Date(Date.UTC(tahun, bulan, 0));
  return d.toISOString().slice(0, 10);
}

/** Format tanggal Indonesia, mis. "17 Nov 2026". */
export function fmtTanggal(tgl: string | Date | null | undefined, panjang = false): string {
  if (!tgl) return "—";
  const s = typeof tgl === "string" ? tgl : hariIni(tgl);
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${(panjang ? NAMA_BULAN : NAMA_BULAN_PENDEK)[m - 1]} ${y}`;
}

export function fmtWaktu(d: Date | null | undefined): string {
  if (!d) return "—";
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: ZONA,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIT"
  );
}

/** Parse ?bulan=YYYY-MM, default bulan ini. */
export function parsePeriode(raw: string | string[] | undefined) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const m = v?.match(/^(\d{4})-(\d{1,2})$/);
  if (m) {
    const tahun = Number(m[1]);
    const bulan = Number(m[2]);
    if (bulan >= 1 && bulan <= 12 && tahun > 2000 && tahun < 2100) return { tahun, bulan };
  }
  return bulanIni();
}

export function kodePeriode(tahun: number, bulan: number) {
  return `${tahun}-${String(bulan).padStart(2, "0")}`;
}

/** Usia dalam tahun penuh pada tanggal `per` (default hari ini, WIT). */
export function hitungUsia(tglLahir: string | null | undefined, per: string = hariIni()): number | null {
  if (!tglLahir) return null;
  const [y, m, d] = tglLahir.split("-").map(Number);
  const [py, pm, pd] = per.split("-").map(Number);
  return py - y - (pm < m || (pm === m && pd < d) ? 1 : 0);
}
