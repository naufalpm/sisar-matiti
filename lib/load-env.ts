// Memuat .env untuk skrip CLI (drizzle-kit, seed). Next.js memuat .env sendiri.
try {
  process.loadEnvFile?.(".env");
} catch {
  // .env opsional
}
