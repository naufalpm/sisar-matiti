import { describe, it, expect } from "vitest";
import { normalUnit, parseCsv, parsePegawaiCsv, tanggalDmy } from "../lib/impor-pegawai";
import { hitungUsia } from "../lib/waktu";

// Data sintetis dengan bentuk yang sama seperti ekspor "Pegawai menurut Unit Organisasi".
const CSV = [
  "Pegawai menurut Unit Organisasi  Prov.  -  BPS Kabupaten/Kota;;;;;;;;;;;;",
  "No.;Nama;NIP;Stat.Jabatan;Gol.Akhir;TMT Gol.;Pendidikan (SK);Tgl.Lulus (SK);Jns.Kelamin;Tgl.Lahir;Username;;",
  "BPS Kabupaten/Kota Kab. Contoh;;;;;;;;;;;;",
  '1;Budi Contoh, SST, M.Stat;"340000001\r\n198001012005011001";Kepala ;IV/b ;01-04-2026;S-2 Statistika;01-09-2021;LK;01-01-1980;budi; ; ',
  '2;Sari Contoh, S.Tr.Stat.;"340000002\r\n199905172022012001";Statistisi Ahli Pertama;III/b;01-08-2026;D-IV Statistika     ;04-09-2021;PR;17-05-1999;sari.contoh; ; ',
  "Subbagian Umum Kab. Contoh;;;;;;;;;;;;",
  '3;Hadi Contoh, SST;"340000003\r\n199004052013111001";Kepala ;III/d;01-10-2023;D-IV Statistik Ekonomi;05-10-2012;LK;05-04-1990;hadi; ; ',
  '4;Tanpa NIP;"340000004";Staf;I;01-10-2025;S.D.;08-08-1989;LK;21-10-1976;tanpanip; ; ',
  '5;Dobel NIP;"340000005\r\n199905172022012001";Staf;I;01-10-2025;S.D.;08-08-1989;LK;31-02-1976;dobel; ; ',
].join("\r\n");

describe("parseCsv", () => {
  it("mendukung kutip, escape, dan baris baru dalam kutip", () => {
    expect(parseCsv('a;"b\nc";"d""e"\nf;g')).toEqual([
      ["a", "b\nc", 'd"e'],
      ["f", "g"],
    ]);
  });
});

describe("tanggalDmy", () => {
  it("mengubah dd-mm-yyyy menjadi ISO", () => expect(tanggalDmy("17-06-1983")).toBe("1983-06-17"));
  it("menolak tanggal mustahil", () => expect(tanggalDmy("31-02-1976")).toBeNull());
  it("kosong → null", () => expect(tanggalDmy("")).toBeNull());
});

describe("normalUnit", () => {
  it("merapikan nama unit", () => {
    expect(normalUnit("BPS Kabupaten/Kota Kab. Teluk Bintuni")).toBe("BPS Kabupaten Teluk Bintuni");
    expect(normalUnit("Subbagian Umum Kab. Teluk Bintuni")).toBe("Subbagian Umum");
  });
});

describe("parsePegawaiCsv", () => {
  const { pegawai, masalah } = parsePegawaiCsv(CSV);

  it("membaca pegawai valid dan memisahkan NIP lama/baru", () => {
    expect(pegawai.map((p) => p.username)).toEqual(["budi", "sari.contoh", "hadi"]);
    expect(pegawai[0]).toMatchObject({
      nama: "Budi Contoh, SST, M.Stat",
      nip: "198001012005011001",
      nipLama: "340000001",
      golongan: "IV/b",
      tmtGolongan: "2026-04-01",
      jenisKelamin: "L",
      tglLahir: "1980-01-01",
      unitKerja: "BPS Kabupaten Contoh",
    });
    expect(pegawai[1]).toMatchObject({ pendidikan: "D-IV Statistika", jenisKelamin: "P" });
  });

  it("hanya Kepala di unit BPS yang mendapat peran Kepala", () => {
    expect(pegawai[0]).toMatchObject({ jabatan: "Kepala BPS Kabupaten", isKepalaKantor: true });
    expect(pegawai[2]).toMatchObject({ jabatan: "Kepala Subbagian Umum", isKepalaKantor: false, unitKerja: "Subbagian Umum" });
  });

  it("melaporkan baris bermasalah dengan nomor baris fisik", () => {
    expect(masalah).toEqual([
      { baris: 11, pesan: "Tanpa NIP: NIP 18 digit tidak ditemukan." },
      { baris: 12, pesan: "Dobel NIP: NIP sama dengan baris 6." },
    ]);
  });
});

describe("hitungUsia", () => {
  it("menghitung usia tahun penuh", () => {
    expect(hitungUsia("1983-06-17", "2026-06-16")).toBe(42);
    expect(hitungUsia("1983-06-17", "2026-06-17")).toBe(43);
    expect(hitungUsia(null)).toBeNull();
  });
});
