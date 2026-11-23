import { describe, it, expect } from "vitest";
import { namaTim, parseMatriksTim } from "../lib/impor-tim";

// Data sintetis dengan bentuk yang sama seperti matriks pegawai × tim.
const CSV = [
  "NIP_Lama;Nama_Lengkap;Tim Umum;Tim Sosial;Tim Kerja Sensus Ekonomi;Total_Tim",
  "340000001;Ani;Ketua Tim;-;Anggota;2",
  "340000002;Budi;Anggota;Ketua Tim;-;2",
  "340000003;Citra;Anggota;-;Ketua Tim;2",
  "340000004;Dedi;Ketua Tim;Ngawur;-;1",
  "12345;Salah;Anggota;-;-;1",
].join("\r\n");

describe("namaTim", () => {
  it("membuang awalan 'Tim' / 'Tim Kerja'", () => {
    expect(namaTim("Tim Umum")).toBe("Umum");
    expect(namaTim("Tim Kerja Sensus Ekonomi")).toBe("Sensus Ekonomi");
    expect(namaTim("Tim Hubungan Masyarakat dan Keprotokolan")).toBe("Hubungan Masyarakat dan Keprotokolan");
  });
});

describe("parseMatriksTim", () => {
  const { tim, nama, masalah } = parseMatriksTim(CSV);

  it("membaca tim, jenis, ketua, dan anggota (ketua ikut jadi anggota)", () => {
    expect(tim).toEqual([
      { nama: "Umum", jenis: "besar", ketua: "340000001", anggota: ["340000001", "340000002", "340000003", "340000004"] },
      { nama: "Sosial", jenis: "besar", ketua: "340000002", anggota: ["340000002"] },
      { nama: "Sensus Ekonomi", jenis: "kecil", ketua: "340000003", anggota: ["340000001", "340000003"] },
    ]);
    expect(nama.get("340000002")).toBe("Budi");
  });

  it("melaporkan ketua ganda, nilai tak dikenal, dan NIP tidak valid", () => {
    expect(masalah.map((m) => m.baris)).toEqual([5, 5, 6]);
    expect(masalah[0].pesan).toMatch(/lebih dari satu ketua/);
    expect(masalah[1].pesan).toMatch(/Ngawur/);
    expect(masalah[2].pesan).toMatch(/tidak valid/);
  });
});
