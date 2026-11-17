/**
 * Menjalankan job harian lewat CLI (alternatif dari endpoint /api/cron/harian).
 * Contoh crontab (setiap hari 00:15 WIT):
 *   15 0 * * *  cd /opt/sisar-matiti && npm run job:harian
 */
import "../lib/load-env";

async function main() {
  // Import dinamis agar modul "server-only" bisa dilewati di luar Next.js.
  const { jalankanJobHarian } = await import("../lib/layanan/job");
  const r = await jalankanJobHarian();
  console.log(`Job harian selesai. Bulan dikunci: ${r.dikunci.join(", ") || "-"}. Notifikasi: ${r.notif}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
