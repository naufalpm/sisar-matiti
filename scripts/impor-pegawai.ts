/**
 * Impor data kepegawaian dari ekspor CSV "Pegawai menurut Unit Organisasi".
 *
 *   npm run impor:pegawai -- data/pegawai.csv              → pratinjau (tidak mengubah database)
 *   npm run impor:pegawai -- data/pegawai.csv --jalankan   → terapkan
 *
 * - Dicocokkan lewat NIP 18 digit; bila belum ada, lewat username.
 * - Pegawai baru dibuatkan akun: password awal = NIP 18 digit, wajib ganti saat login pertama.
 * - Pegawai lama: profil diperbarui; username, password, status aktif & peran admin tidak diubah.
 * - Peran Kepala hanya ditambahkan untuk Kepala BPS Kabupaten (tidak pernah dicabut oleh impor).
 */
import "../lib/load-env";
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { hashPassword } from "../lib/auth/password";
import { parsePegawaiCsv, type ProfilImpor } from "../lib/impor-pegawai";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const jalankan = args.includes("--jalankan");
if (!file) {
  console.error("Pemakaian: npm run impor:pegawai -- <file.csv> [--jalankan]");
  process.exit(1);
}

const profil = (p: ProfilImpor) => ({
  nama: p.nama,
  nip: p.nip,
  nipLama: p.nipLama,
  jabatan: p.jabatan,
  unitKerja: p.unitKerja,
  golongan: p.golongan,
  tmtGolongan: p.tmtGolongan,
  pendidikan: p.pendidikan,
  tglLulus: p.tglLulus,
  jenisKelamin: p.jenisKelamin,
  tglLahir: p.tglLahir,
});

async function main() {
  const { pegawai, masalah } = parsePegawaiCsv(readFileSync(file!, "utf8"));
  const ada = await db.select().from(schema.pegawai);
  const perNip = new Map(ada.filter((a) => a.nip).map((a) => [a.nip!, a]));
  const perUser = new Map(ada.map((a) => [a.username, a]));

  const baru: ProfilImpor[] = [];
  const ubah: { p: ProfilImpor; id: number; catatan?: string }[] = [];
  for (const p of pegawai) {
    const cocok = perNip.get(p.nip) ?? perUser.get(p.username);
    if (!cocok) {
      baru.push(p);
      continue;
    }
    if (cocok.nip && cocok.nip !== p.nip) {
      masalah.push({ baris: p.baris, pesan: `${p.nama}: username "${p.username}" sudah dipakai akun lain (NIP ${cocok.nip}). Dilewati.` });
      continue;
    }
    ubah.push({
      p,
      id: cocok.id,
      catatan: cocok.username !== p.username ? `username di aplikasi tetap "${cocok.username}"` : undefined,
    });
  }

  console.log(`\nFile: ${file}`);
  console.log(`Terbaca ${pegawai.length} pegawai.\n`);
  console.log(`Akun baru (${baru.length}):`);
  for (const p of baru) console.log(`  + ${p.nama} — ${p.username}${p.isKepalaKantor ? " [peran Kepala]" : ""}`);
  console.log(`\nProfil diperbarui (${ubah.length}):`);
  for (const u of ubah) {
    console.log(`  ~ ${u.p.nama}${u.p.isKepalaKantor ? " [peran Kepala]" : ""}${u.catatan ? ` (${u.catatan})` : ""}`);
  }
  if (masalah.length) {
    console.log(`\nPerlu diperiksa (${masalah.length}):`);
    for (const m of masalah.sort((a, b) => a.baris - b.baris)) console.log(`  ! baris ${m.baris}: ${m.pesan}`);
  }

  if (!jalankan) {
    console.log("\nPratinjau saja — database tidak diubah. Tambahkan --jalankan untuk menerapkan.");
    return;
  }

  const hashBaru = await Promise.all(baru.map((p) => hashPassword(p.nip)));
  await db.transaction(async (tx) => {
    for (const [i, p] of baru.entries()) {
      await tx.insert(schema.pegawai).values({
        ...profil(p),
        username: p.username,
        passwordHash: hashBaru[i],
        isKepala: p.isKepalaKantor,
        harusGantiPassword: true,
      });
    }
    for (const u of ubah) {
      await tx
        .update(schema.pegawai)
        .set({ ...profil(u.p), ...(u.p.isKepalaKantor ? { isKepala: true } : {}) })
        .where(eq(schema.pegawai.id, u.id));
    }
  });
  console.log(`\nSelesai: ${baru.length} akun dibuat, ${ubah.length} profil diperbarui.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
