/**
 * Set password awal = username + "123" (mis. naufal123) untuk akun yang BELUM mengganti password
 * (harus_ganti_password = true). Akun yang sudah mengganti password tidak disentuh.
 *
 *   npm run password:reset-awal              → pratinjau
 *   npm run password:reset-awal -- --jalankan → terapkan
 */
import "../lib/load-env";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { hashPassword, passwordAwal } from "../lib/auth/password";

const jalankan = process.argv.includes("--jalankan");

async function main() {
  const target = await db
    .select({ id: schema.pegawai.id, username: schema.pegawai.username, nama: schema.pegawai.nama })
    .from(schema.pegawai)
    .where(eq(schema.pegawai.harusGantiPassword, true));

  console.log(`Akun yang masih memakai password awal (${target.length}):`);
  for (const p of target) console.log(`  ${p.username.padEnd(24)} → ${passwordAwal(p.username)}   (${p.nama})`);

  if (!jalankan) {
    console.log("\nPratinjau saja — database tidak diubah. Tambahkan --jalankan untuk menerapkan.");
    return;
  }
  for (const p of target) {
    await db
      .update(schema.pegawai)
      .set({ passwordHash: await hashPassword(passwordAwal(p.username)) })
      .where(eq(schema.pegawai.id, p.id));
  }
  console.log(`\nSelesai: ${target.length} password direset.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
