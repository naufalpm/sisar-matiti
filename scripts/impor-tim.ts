/**
 * Impor struktur tim dari matriks CSV "pegawai × tim".
 *
 *   npm run impor:tim -- data/tim.csv                       → pratinjau (tahun berjalan)
 *   npm run impor:tim -- data/tim.csv --tahun 2026 --jalankan
 *
 * - Pegawai dicocokkan lewat NIP lama (9 digit) — jalankan `impor:pegawai` lebih dulu.
 * - Tim dicari lewat nama + tahun; bila belum ada dibuat. Ketua & daftar anggota tim
 *   di matriks MENGGANTIKAN isi tim tersebut. Tim lain yang tidak ada di matriks tidak disentuh.
 * - Jenis: Umum, Sosial, Produksi, Distribusi, Neraca, IPDS = tim besar; lainnya tim kecil.
 */
import "../lib/load-env";
import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../db";
import { parseMatriksTim } from "../lib/impor-tim";
import { bulanIni } from "../lib/waktu";

const args = process.argv.slice(2);
const iTahun = args.indexOf("--tahun");
const tahun = iTahun >= 0 ? Number(args[iTahun + 1]) : bulanIni().tahun;
const file = args.find((a, i) => !a.startsWith("--") && (iTahun < 0 || i !== iTahun + 1));
const jalankan = args.includes("--jalankan");
if (!file || !Number.isInteger(tahun)) {
  console.error("Pemakaian: npm run impor:tim -- <file.csv> [--tahun YYYY] [--jalankan]");
  process.exit(1);
}

async function main() {
  const { tim, nama, masalah } = parseMatriksTim(readFileSync(file!, "utf8"));
  const pegawai = await db.select({ id: schema.pegawai.id, nama: schema.pegawai.nama, nipLama: schema.pegawai.nipLama }).from(schema.pegawai);
  const perNip = new Map(pegawai.filter((p) => p.nipLama).map((p) => [p.nipLama!, p]));

  const tidakKetemu = [...nama.entries()].filter(([nip]) => !perNip.has(nip));
  for (const [nip, n] of tidakKetemu) masalah.push({ baris: 0, pesan: `${n} (NIP lama ${nip}) tidak ditemukan di data pegawai — dilewati.` });

  const ada = await db.select().from(schema.tim).where(eq(schema.tim.tahun, tahun));
  console.log(`\nFile: ${file} — tahun ${tahun}\n`);
  const rencana = tim.map((t) => {
    const lama = ada.find((a) => a.nama.toLowerCase() === t.nama.toLowerCase());
    const anggotaIds = t.anggota.flatMap((nip) => (perNip.has(nip) ? [perNip.get(nip)!.id] : []));
    const ketuaId = t.ketua && perNip.has(t.ketua) ? perNip.get(t.ketua)!.id : null;
    const ketuaNama = t.ketua ? (perNip.get(t.ketua)?.nama ?? nama.get(t.ketua)) : "—";
    console.log(
      `  ${lama ? "~" : "+"} ${t.nama.padEnd(40)} ${t.jenis.padEnd(5)}  ketua: ${ketuaNama}  ·  ${anggotaIds.length} anggota`,
    );
    return { t, lama, anggotaIds, ketuaId };
  });
  console.log("\n  + tim baru   ~ tim yang sudah ada (ketua & anggota diganti)");
  if (masalah.length) {
    console.log(`\nPerlu diperiksa (${masalah.length}):`);
    for (const m of masalah) console.log(`  ! ${m.baris ? `baris ${m.baris}: ` : ""}${m.pesan}`);
  }
  if (!jalankan) {
    console.log("\nPratinjau saja — database tidak diubah. Tambahkan --jalankan untuk menerapkan.");
    return;
  }

  await db.transaction(async (tx) => {
    for (const r of rencana) {
      let timId = r.lama?.id;
      if (timId) {
        await tx
          .update(schema.tim)
          .set({ jenis: r.t.jenis, ketuaId: r.ketuaId, aktif: true })
          .where(and(eq(schema.tim.id, timId), eq(schema.tim.tahun, tahun)));
      } else {
        const [baru] = await tx
          .insert(schema.tim)
          .values({ nama: r.t.nama, jenis: r.t.jenis, tahun, ketuaId: r.ketuaId })
          .returning({ id: schema.tim.id });
        timId = baru.id;
      }
      await tx.delete(schema.anggotaTim).where(eq(schema.anggotaTim.timId, timId));
      if (r.anggotaIds.length) {
        await tx.insert(schema.anggotaTim).values(r.anggotaIds.map((pegawaiId) => ({ timId: timId!, pegawaiId })));
      }
    }
  });
  console.log(`\nSelesai: ${rencana.filter((r) => !r.lama).length} tim dibuat, ${rencana.filter((r) => r.lama).length} tim diperbarui.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
