import Link from "next/link";
import { after } from "next/server";
import { KeyRound } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { jumlahBelumDibaca } from "@/lib/layanan/notifikasi";
import { jumlahBelumBerbobot, jumlahMenungguApproval } from "@/lib/data";
import { jalankanJobJikaPerlu } from "@/lib/layanan/job";
import { BellLink, MobileNav, Sidebar, type NavUser } from "@/components/sisar/nav";
import { Avatar } from "@/components/sisar/ui";
import { urlFoto } from "@/lib/foto";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const [notif, approval, belumBerbobot] = await Promise.all([
    jumlahBelumDibaca(user.id),
    user.isKetuaTim || user.isPJ ? jumlahMenungguApproval(user) : Promise.resolve(0),
    user.isKepala ? jumlahBelumBerbobot() : Promise.resolve(0),
  ]);

  // Penguncian bulan & notifikasi deadline: dijalankan maksimal sekali sehari setelah respons terkirim.
  after(async () => {
    try {
      await jalankanJobJikaPerlu();
    } catch (e) {
      console.error("Job harian gagal", e);
    }
  });

  const navUser: NavUser = {
    nama: user.nama,
    jabatan: user.jabatan,
    isKepala: user.isKepala,
    isAdmin: user.isAdmin,
    isKetuaTim: user.isKetuaTim,
    isPJ: user.isPJ,
  };
  const counts = { notif, approval, belumBerbobot };

  return (
    <div className="flex min-h-dvh">
      <a
        href="#konten"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Lewati ke konten
      </a>
      <Sidebar user={navUser} counts={counts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md sm:px-6">
          <MobileNav user={navUser} counts={counts} />
          <Link href="/" className="font-bold text-primary lg:hidden">
            Sisar Matiti
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <BellLink count={notif} />
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar nama={user.nama} foto={urlFoto(user.foto)} />
              <div className="leading-tight">
                <p className="max-w-40 truncate text-sm font-semibold">{user.nama}</p>
                <p className="max-w-40 truncate text-xs text-muted-foreground">{user.jabatan ?? "Pegawai"}</p>
              </div>
            </div>
          </div>
        </header>
        {user.harusGantiPassword ? (
          <div className="border-b bg-warning-soft px-4 py-2.5 text-sm text-[oklch(0.42_0.1_65)] sm:px-6">
            <KeyRound className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
            Anda masih memakai password awal dari Admin.{" "}
            <Link href="/akun" className="font-semibold underline underline-offset-2">
              Ganti password sekarang
            </Link>
          </div>
        ) : null}
        <main id="konten" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
