import { getUser } from "@/lib/auth/user";
import { bacaFileFoto } from "@/lib/foto";

/** Foto pegawai — hanya untuk pengguna yang login. Nama file berisi token acak, jadi aman di-cache lama. */
export async function GET(_req: Request, ctx: RouteContext<"/api/foto/[nama]">) {
  if (!(await getUser())) return new Response("Unauthorized", { status: 401 });
  const { nama } = await ctx.params;
  const foto = await bacaFileFoto(nama);
  if (!foto) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(foto.isi), {
    headers: {
      "Content-Type": foto.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
