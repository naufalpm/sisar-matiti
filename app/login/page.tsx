import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import { SisarMatitiMark } from "@/components/sisar/logo";
import { LoginForm } from "./login-form";
import { BarChart3, CheckCircle2, ClipboardCheck, CircleHelp } from "lucide-react";

export const metadata: Metadata = { title: "Masuk" };

/** Animasi masuk (tw-animate-css). Dimatikan bila pengguna memilih kurangi gerakan. */
const MASUK = "animate-in fade-in fill-mode-both ease-out motion-reduce:animate-none";

const FITUR = [
  { Icon: BarChart3, judul: "Pantau progres", teks: "Progres & deadline seluruh kegiatan dalam satu layar." },
  { Icon: CheckCircle2, judul: "Approval tercatat", teks: "Setiap persetujuan pekerjaan terdokumentasi rapi." },
  { Icon: ClipboardCheck, judul: "Capaian bulanan", teks: "Rekap otomatis sebagai dasar pengisian CKP." },
];

/** `putih`: teks logo putih, untuk latar biru/gelap. */
function LogoBps({ className, putih = false }: { className?: string; putih?: boolean }) {
  return (
    <Image
      src={putih ? "/logo/logo-bps-teluk-bintuni-putih.png" : "/logo/logo-bps-teluk-bintuni.png"}
      alt="Badan Pusat Statistik Kabupaten Teluk Bintuni"
      width={1484}
      height={285}
      priority
      className={className}
    />
  );
}

/** Tautan kontak Admin IPDS dari env (WhatsApp diutamakan, lalu email). */
function kontakAdmin(): string | null {
  const wa = process.env.ADMIN_KONTAK_WA?.replace(/\D/g, "");
  if (wa) {
    const pesan = encodeURIComponent("Halo Admin IPDS, saya ingin reset password Sisar Matiti.");
    return `https://wa.me/${wa}?text=${pesan}`;
  }
  const email = process.env.ADMIN_KONTAK_EMAIL?.trim();
  if (email) return `mailto:${email}?subject=${encodeURIComponent("Reset password Sisar Matiti")}`;
  return null;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getUser()) redirect("/");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const kontak = kontakAdmin();

  return (
    <main className="relative grid min-h-dvh bg-[oklch(0.975_0.008_250)] lg:grid-cols-[1.05fr_1fr]">
      {/* ===== Panel branding (desktop) ===== */}
      <section className={`hidden p-4 lg:flex ${MASUK} slide-in-from-left-8 duration-700`}>
        <div
          className="relative flex flex-1 flex-col overflow-hidden rounded-[28px] p-10 text-white xl:p-12"
          style={{ background: "linear-gradient(150deg, #0B3C8C 0%, #0052A8 55%, #0062C4 100%)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgb(255 255 255 / 0.08) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
            }}
          />
          {/* Ornamen kecil di pojok kanan bawah, sejajar copyright */}
          <div
            aria-hidden
            className={`pointer-events-none absolute right-10 -bottom-6 flex items-end gap-3 ${MASUK} slide-in-from-bottom-16 delay-900 duration-1000`}
          >
            <span className="h-24 w-9 -skew-x-12 rounded-xl bg-white/[0.05]" />
            <span className="h-32 w-9 -skew-x-12 rounded-xl bg-white/[0.07]" />
            <span className="h-20 w-9 -skew-x-12 rounded-xl bg-white/[0.04]" />
          </div>

          {/* Logo BPS pojok kiri atas */}
          <div className={`relative w-fit ${MASUK} slide-in-from-top-3 delay-300 duration-700`}>
            <LogoBps putih className="h-11 w-auto xl:h-12" />
          </div>

          <div className="relative my-auto max-w-lg py-12">
            <div className="flex items-center gap-4">
              <span
                className={`flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/10 xl:size-[72px] ${MASUK} zoom-in-50 spin-in-12 delay-400 duration-700`}
              >
                <SisarMatitiMark size={44} />
              </span>
              <h1
                className={`text-5xl font-extrabold tracking-tight xl:text-6xl ${MASUK} slide-in-from-left-4 delay-500 duration-700`}
              >
                Sisar <span className="text-[#FDB863]">Matiti</span>
              </h1>
            </div>
            <p className={`mt-5 text-base leading-relaxed text-white/80 ${MASUK} slide-in-from-bottom-3 delay-600 duration-700`}>
              Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring Aktivitas Terpadu Insan Teluk
              Bintuni.
            </p>

            <ul className="mt-10 grid gap-3">
              {FITUR.map(({ Icon, judul, teks }, i) => (
                <li
                  key={judul}
                  className={`flex items-start gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur-sm ${MASUK} slide-in-from-bottom-4 duration-600`}
                  style={{ animationDelay: `${750 + i * 120}ms` }}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{judul}</span>
                    <span className="block text-sm text-white/70">{teks}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/60">
            © {new Date().getFullYear()} BPS Kabupaten Teluk Bintuni
          </p>
        </div>
      </section>

      {/* ===== Form ===== */}
      <section className="relative flex flex-col px-4 py-8 sm:px-8">
        {/* Logo untuk layar kecil */}
        <div className={`lg:hidden ${MASUK} slide-in-from-top-3 duration-600`}>
          <LogoBps className="h-9 w-auto sm:h-10" />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div
            className={`w-full max-w-[460px] rounded-3xl border bg-card p-7 shadow-xl shadow-primary/5 sm:p-10 ${MASUK} slide-in-from-bottom-6 zoom-in-95 delay-200 duration-700`}
          >
            <span
              className={`flex size-14 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10 ${MASUK} zoom-in-75 delay-500 duration-500`}
            >
              <SisarMatitiMark size={36} />
            </span>
            <h2 className="mt-6 text-[28px] leading-tight font-bold tracking-tight">Masuk ke Sisar Matiti</h2>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">Gunakan akun dari Admin IPDS.</p>

            <LoginForm next={next} />

            <div className="mt-6 flex items-start gap-2.5 border-t pt-5 text-sm text-muted-foreground">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Lupa password?{" "}
                {kontak ? (
                  <a
                    href={kontak}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Hubungi Admin IPDS
                  </a>
                ) : (
                  <span className="font-semibold text-foreground">Hubungi Admin IPDS</span>
                )}{" "}
                untuk reset.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} BPS Kabupaten Teluk Bintuni
        </p>
      </section>
    </main>
  );
}
