import { describe, it, expect } from "vitest";
import {
  hitungProgres,
  hitungCapaian,
  hitungBeban,
  isTerlambat,
  realisasiUntukCapaian,
} from "../lib/capaian";
import { batasKunci, sudahTerkunci, daftarBulan, selisihHari, hariIni } from "../lib/waktu";

describe("hitungProgres", () => {
  it("menghitung progres sebagian", () => expect(hitungProgres(30, 50)).toBe(60));
  it("membatasi maksimal 100%", () => expect(hitungProgres(70, 50)).toBe(100));
  it("pekerjaan tanpa target angka: 0 atau 100", () => {
    expect(hitungProgres(0, 1)).toBe(0);
    expect(hitungProgres(1, 1)).toBe(100);
  });
  it("target 0 → 0", () => expect(hitungProgres(5, 0)).toBe(0));
});

describe("hitungCapaian", () => {
  it("rata-rata tanpa bobot", () => {
    expect(
      hitungCapaian([
        { realisasi: 30, target: 50 },
        { realisasi: 1, target: 1 },
      ]),
    ).toBe(80);
  });
  it("null bila tidak ada penugasan", () => expect(hitungCapaian([])).toBeNull());
});

describe("hitungBeban", () => {
  it("mengabaikan pekerjaan belum berbobot", () => {
    expect(hitungBeban([{ bobot: 3 }, { bobot: null }, { bobot: 7 }])).toBe(10);
  });
});

describe("isTerlambat", () => {
  it("selesai sebelum deadline tidak terlambat", () => {
    expect(
      isTerlambat({ deadline: "2026-11-20", status: "selesai", tanggalSelesai: "2026-11-19", hariIni: "2026-11-25" }),
    ).toBe(false);
  });
  it("disetujui setelah deadline terlambat", () => {
    expect(
      isTerlambat({ deadline: "2026-11-20", status: "selesai", tanggalSelesai: "2026-11-21", hariIni: "2026-11-25" }),
    ).toBe(true);
  });
  it("belum selesai saat deadline lewat terlambat", () => {
    expect(
      isTerlambat({ deadline: "2026-11-20", status: "diajukan", tanggalSelesai: null, hariIni: "2026-11-21" }),
    ).toBe(true);
    expect(
      isTerlambat({ deadline: "2026-11-20", status: "dikerjakan", tanggalSelesai: null, hariIni: "2026-11-20" }),
    ).toBe(false);
  });
});

describe("penguncian bulan", () => {
  it("batas kunci tanggal 5 bulan berikutnya", () => {
    expect(batasKunci(2026, 11)).toBe("2026-12-05");
    expect(batasKunci(2026, 12)).toBe("2027-01-05");
  });
  it("tanggal 5 masih boleh, tanggal 6 terkunci (WIT)", () => {
    // 5 Des 2026 23:00 WIT = 5 Des 14:00 UTC
    expect(sudahTerkunci(2026, 11, new Date("2026-12-05T14:00:00Z"))).toBe(false);
    // 6 Des 2026 00:30 WIT = 5 Des 15:30 UTC
    expect(sudahTerkunci(2026, 11, new Date("2026-12-05T15:30:00Z"))).toBe(true);
  });
  it("memakai realisasi terkunci bila ada", () => {
    expect(realisasiUntukCapaian({ realisasiDisetujui: 10, realisasiTerkunci: 4 })).toBe(4);
    expect(realisasiUntukCapaian({ realisasiDisetujui: 10, realisasiTerkunci: null })).toBe(10);
  });
});

describe("waktu", () => {
  it("daftar bulan lintas tahun", () => {
    expect(daftarBulan("2026-11-10", "2027-02-01")).toEqual([
      { tahun: 2026, bulan: 11 },
      { tahun: 2026, bulan: 12 },
      { tahun: 2027, bulan: 1 },
      { tahun: 2027, bulan: 2 },
    ]);
  });
  it("selisih hari", () => expect(selisihHari("2026-11-17", "2026-11-24")).toBe(7));
  it("hari ini memakai WIT", () => expect(hariIni(new Date("2026-11-16T16:00:00Z"))).toBe("2026-11-17"));
});
