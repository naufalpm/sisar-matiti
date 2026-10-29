"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  Users,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard Utama", icon: LayoutDashboard, href: "/" },
  { label: "Kegiatan dan Survei", icon: ClipboardList, href: "/kegiatan", badge: "12" },
  { label: "Daftar Pegawai", icon: Users, href: "/pegawai" },
  { label: "Alokasi Beban Kerja", icon: BriefcaseBusiness, href: "/beban-kerja" },
  { label: "Evaluasi Kinerja", icon: Target, href: "/evaluasi" },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan" },
];

function Logo() {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#003b70] shadow-sm">
      <div className="flex size-6 flex-col justify-between py-0.5">
        <span className="h-1 rounded-full bg-[#003b70]" />
        <span className="h-1 rounded-full bg-[#0d73a5]" />
        <span className="h-1 rounded-full bg-[#f2b233]" />
      </div>
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Tutup menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-[#001f3b]/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col bg-[#003b70] px-5 py-6 text-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + Title */}
        <div className="mb-10 flex items-center gap-3">
          <Logo />
          <div>
            <div className="text-[15px] font-bold tracking-wide">
              SISAR MATITI
            </div>
            <div className="mt-0.5 text-[10px] tracking-[0.16em] text-blue-100/65">
              BPS KABUPATEN TELUK BINTUNI
            </div>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100/45">
          Menu Utama
        </div>
        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ label, icon: Icon, href, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] transition ${
                  active
                    ? "bg-white text-[#003b70] shadow-lg shadow-[#00274d]/20"
                    : "text-blue-50/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className="size-[17px] shrink-0"
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span className="leading-5">{label}</span>
                {badge && (
                  <span className="ml-auto rounded-full bg-[#e7a72d] px-2 py-0.5 text-[10px] font-bold text-[#19344d]">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#f1c27d] text-sm font-bold text-[#704111]">
              N
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">Naufal</div>
              <div className="truncate text-[11px] text-blue-100/55">
                Kepala BPS
              </div>
            </div>
            <Link
              href="/login"
              title="Keluar / Ganti Akun"
              className="ml-auto flex items-center justify-center rounded-lg p-1.5 text-blue-100/60 hover:bg-white/15 hover:text-white transition"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
