/**
 * Membuat akun Admin pertama di database produksi yang masih kosong.
 *
 *   npm run admin:buat -- <username> "<Nama Lengkap>" <password>
 */
import "../lib/load-env";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { hashPassword } from "../lib/auth/password";

async function main() {
  const [username, nama, password] = process.argv.slice(2);
  if (!username || !nama || !password || password.length < 8) {
    console.error('Pemakaian: npm run admin:buat -- <username> "<Nama Lengkap>" <password min 8 karakter>');
    process.exit(1);
  }
  const ada = await db.query.pegawai.findFirst({ where: eq(schema.pegawai.username, username.toLowerCase()) });
  if (ada) {
    console.error(`Username "${username}" sudah ada.`);
    process.exit(1);
  }
  await db.insert(schema.pegawai).values({
    username: username.toLowerCase(),
    nama,
    jabatan: "Admin IPDS",
    passwordHash: await hashPassword(password),
    isAdmin: true,
    harusGantiPassword: false,
  });
  await db.insert(schema.pengaturan).values({ kunci: "ambang_capaian", nilai: "90" }).onConflictDoNothing();
  console.log(`Admin "${username}" dibuat. Silakan login dan buat akun pegawai lain dari menu Admin.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
