import { timingSafeEqual } from "node:crypto";
import { jalankanJobHarian } from "@/lib/layanan/job";

/**
 * Job harian: kunci capaian bulan yang jatuh tempo (tgl 5) + notifikasi deadline.
 * Panggil dari cron server BPS:
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/harian
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const ok =
    secret.length >= 16 &&
    auth.length === expected.length &&
    timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
  if (!ok) return Response.json({ ok: false, pesan: "Tidak diizinkan" }, { status: 401 });

  const r = await jalankanJobHarian();
  return Response.json({ ok: true, ...r });
}
