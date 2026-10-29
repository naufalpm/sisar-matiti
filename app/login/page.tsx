"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  HelpCircle,
  KeyRound,
  Lock,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function BpsLogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5 ${className}`}
    >
      <div className="flex size-6 flex-col justify-between py-0.5">
        <span className="h-1 rounded-full bg-[#003b70]" />
        <span className="h-1 rounded-full bg-[#0d73a5]" />
        <span className="h-1 rounded-full bg-[#f2b233]" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeTab, setActiveTab] = useState<"nip" | "sso">("nip");

  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!nip.trim()) {
      setErrorMessage("Silakan masukkan NIP atau Email Resmi BPS Anda.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Kata sandi tidak boleh kosong.");
      return;
    }

    setLoading(true);

    // Simulate authenticating against BPS credentials
    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }, 800);
  };

  const handleSsoLogin = () => {
    setLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0b132b] text-slate-100 flex flex-col justify-center items-center overflow-x-hidden selection:bg-[#f2b233] selection:text-[#00274d]">
      {/* Background Decorative Gradients & Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[25%] -left-[10%] size-[600px] rounded-full bg-[#0d73a5]/15 blur-[120px]" />
        <div className="absolute top-1/2 -right-[15%] size-[700px] rounded-full bg-[#003b70]/25 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-1/3 size-[500px] rounded-full bg-[#f2b233]/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col justify-center min-h-screen my-auto">
        {/* Top Header Mobile / Tablet Compact Bar */}
        <div
          className={`lg:hidden flex items-center justify-between pb-6 mb-2 border-b border-white/10 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-3">
            <BpsLogoMark className="size-9" />
            <div>
              <div className="text-base font-bold tracking-tight text-white">
                SISAR MATITI
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                BPS Kab. Teluk Bintuni
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium"
          >
            Sistem Aktif 2026
          </Badge>
        </div>

        {/* Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center my-auto">
          {/* LEFT COLUMN: Hero & Institutional Identity (Col 7) */}
          <div
            className={`lg:col-span-7 flex flex-col justify-center space-y-6 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center gap-4">
              <BpsLogoMark className="size-14 shadow-xl ring-2 ring-white/20 hidden lg:flex shrink-0" />
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  SISAR MATITI
                </h1>
                <p className="text-sm font-semibold tracking-wide text-slate-300 mt-0.5">
                  BADAN PUSAT STATISTIK KABUPATEN TELUK BINTUNI
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-xl font-normal">
              Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring
              Aktivitas Terpadu Insan Teluk Bintuni. Mengawal efektivitas survei,
              sensus, dan penugasan statistik secara presisi dan real-time.
            </p>
          </div>

          {/* RIGHT COLUMN: Clean Executive Login Card (Col 5) */}
          <div
            className={`lg:col-span-5 w-full transition-all duration-700 delay-150 ease-out ${
              mounted
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-10 scale-[0.96]"
            }`}
          >
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Masuk ke Sistem
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-white/20 bg-white/5 text-slate-300 text-[10px] px-2 py-0.5"
                  >
                    BPS Auth v2.4
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Gunakan NIP resmi atau Single Sign-On BPS untuk mengelola aktivitas.
                </p>
              </div>

              {/* Login Method Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10 mb-6 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("nip")}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === "nip"
                      ? "bg-[#003b70] text-white shadow font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <KeyRound className="size-3.5" />
                  <span>NIP Pegawai</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sso")}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === "sso"
                      ? "bg-[#003b70] text-white shadow font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Fingerprint className="size-3.5" />
                  <span>SSO BPS RI</span>
                </button>
              </div>

              {/* Error Alert Display */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <ShieldAlert className="size-4 shrink-0 text-red-400 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Success Notification */}
              {authSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  <div className="font-medium">
                    Otentikasi berhasil! Mengalihkan ke Dashboard Utama...
                  </div>
                </div>
              )}

              {activeTab === "nip" ? (
                /* NIP Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* NIP Input */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="nip"
                      className="text-xs font-semibold text-slate-200 flex items-center justify-between"
                    >
                      <span>Nomor Induk Pegawai (NIP)</span>
                      {nip.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {nip.length} digit
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserCheck className="size-4 text-blue-300" />
                      </div>
                      <Input
                        id="nip"
                        name="nip"
                        type="text"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        placeholder="Contoh: 198904122010121001"
                        className="h-10 pl-9 pr-3 rounded-xl border-white/15 bg-black/25 text-white placeholder:text-slate-500 focus-visible:border-[#0d73a5] focus-visible:ring-[#0d73a5]/40 text-sm font-mono tracking-wide"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-xs font-semibold text-slate-200"
                      >
                        Kata Sandi
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="text-[11px] text-blue-300 hover:text-white transition hover:underline"
                      >
                        Lupa kata sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="size-4 text-blue-300" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun BPS"
                        className="h-10 pl-9 pr-10 rounded-xl border-white/15 bg-black/25 text-white placeholder:text-slate-500 focus-visible:border-[#0d73a5] focus-visible:ring-[#0d73a5]/40 text-sm"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-white/10 text-[#003b70] focus:ring-[#0d73a5] focus:ring-offset-0 size-3.5 accent-[#0d73a5]"
                      />
                      <span>Ingat sesi di perangkat ini</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || authSuccess}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#003b70] via-[#0b548b] to-[#003b70] hover:from-[#0d4a85] hover:to-[#0f609e] text-white font-semibold text-sm shadow-lg shadow-[#003b70]/40 transition-all border border-blue-400/20 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memverifikasi NIP & Kredensial...</span>
                      </>
                    ) : authSuccess ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-300" />
                        <span>Berhasil Masuk!</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* SSO Tab */
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 space-y-2">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Fingerprint className="size-4 text-[#f2b233]" />
                      Single Sign-On Terpadu BPS RI
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      Anda dapat masuk langsung menggunakan akun email terdaftar di domain{" "}
                      <code className="text-blue-300">@bps.go.id</code> tanpa perlu mengingat kata sandi terpisah.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSsoLogin}
                    disabled={loading || authSuccess}
                    className="w-full h-11 rounded-xl bg-white text-[#00274d] hover:bg-slate-100 font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <div className="size-4 border-2 border-[#00274d]/30 border-t-[#00274d] rounded-full animate-spin" />
                        <span>Menghubungkan ke Portal SSO BPS...</span>
                      </>
                    ) : (
                      <>
                        <BpsLogoMark className="size-6 shadow-none ring-0" />
                        <span>Masuk dengan Akun SSO BPS</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help & IT Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f1d3a] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <HelpCircle className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Bantuan Akun SISAR MATITI</h3>
                  <p className="text-xs text-slate-300">Subbagian Umum & Tim IPDS BPS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Jika Anda lupa kata sandi atau NIP belum terdaftar di sistem SISAR MATITI,
                silakan ikuti langkah berikut:
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-semibold text-white">1. Reset Kata Sandi SSO</div>
                <p>
                  Akses portal resmi SSO BPS RI melalui{" "}
                  <code className="text-blue-300">sso.bps.go.id</code> untuk mengatur ulang
                  kata sandi email dinas Anda.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-semibold text-white">2. Hubungi Admin IPDS Bintuni</div>
                <p>
                  WhatsApp Helpdesk: <strong className="text-white">+62 821-9876-5432</strong>
                  <br />
                  Email Dukungan: <code className="text-blue-300">bps9104@bps.go.id</code>
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs h-9 px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
