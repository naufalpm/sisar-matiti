import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import { LoginForm } from "./login-form";
import { BarChart3, CheckCircle2, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getUser()) redirect("/");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="bg-hero relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow">
            <Image src="/logo-bps.svg" alt="Logo BPS" width={40} height={40} priority />
          </span>
          <div>
            <p className="text-sm font-semibold">Badan Pusat Statistik</p>
            <p className="text-xs text-white/80">Kabupaten Teluk Bintuni</p>
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">Sisar Matiti</h1>
          <p className="mt-3 text-white/85">
            Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring Aktivitas Terpadu Insan Teluk Bintuni.
          </p>
          <ul className="mt-8 grid gap-3 text-sm">
            {[
              { Icon: BarChart3, t: "Pantau progres & deadline seluruh kegiatan" },
              { Icon: CheckCircle2, t: "Approval pekerjaan yang tercatat rapi" },
              { Icon: Clock, t: "Capaian bulanan otomatis sebagai dasar CKP" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
                  <Icon className="size-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} BPS Kabupaten Teluk Bintuni</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-xl border bg-white p-1.5 shadow-xs">
              <Image src="/logo-bps.svg" alt="Logo BPS" width={36} height={36} priority />
            </span>
            <div>
              <p className="text-lg font-bold text-primary">Sisar Matiti</p>
              <p className="text-xs text-muted-foreground">BPS Kabupaten Teluk Bintuni</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Selamat datang</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Masuk dengan akun yang diberikan Admin IPDS.</p>
          <LoginForm next={next} />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Lupa password? Hubungi Admin (Tim IPDS) untuk reset.
          </p>
        </div>
      </section>
    </main>
  );
}
