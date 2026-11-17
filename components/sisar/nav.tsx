"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  LayoutDashboard,
  Scale,
  ClipboardList,
  FolderKanban,
  FolderCog,
  CheckSquare,
  Bell,
  Users,
  UsersRound,
  Settings,
  KeyRound,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

export type NavUser = {
  nama: string;
  jabatan: string | null;
  isKepala: boolean;
  isAdmin: boolean;
  isKetuaTim: boolean;
  isPJ: boolean;
};

export type NavCounts = { notif: number; approval: number; belumBerbobot: number };

type Item = { href: string; label: string; icon: LucideIcon; badge?: number; match?: (p: string) => boolean };
type Group = { label?: string; items: Item[] };

function buildNav(u: NavUser, c: NavCounts): Group[] {
  const utama: Item[] = [{ href: "/", label: "Beranda", icon: Home, match: (p) => p === "/" }];
  if (u.isKepala || u.isAdmin) utama.push({ href: "/dashboard", label: "Dashboard Kepala", icon: LayoutDashboard, match: (p) => p === "/dashboard" });
  if (u.isKepala) utama.push({ href: "/dashboard/bobot", label: "Penetapan Bobot", icon: Scale, badge: c.belumBerbobot });

  const kerja: Item[] = [
    ...(u.isKepala ? [] : [{ href: "/pekerjaan-saya", label: "Pekerjaan Saya", icon: ClipboardList }]),
    {
      href: "/kegiatan",
      label: u.isKepala || u.isAdmin ? "Semua Kegiatan" : "Kegiatan Saya",
      icon: FolderKanban,
      match: (p) => p === "/kegiatan" || /^\/kegiatan\/\d+/.test(p),
    },
  ];
  if (u.isKetuaTim) kerja.push({ href: "/kelola", label: "Kelola Kegiatan", icon: FolderCog });
  if (u.isKetuaTim || u.isPJ || u.isKepala) kerja.push({ href: "/approval", label: "Approval", icon: CheckSquare, badge: c.approval });
  kerja.push({ href: "/notifikasi", label: "Notifikasi", icon: Bell, badge: c.notif });

  const groups: Group[] = [{ items: utama }, { label: "Pekerjaan", items: kerja }];
  if (u.isAdmin) {
    groups.push({
      label: "Admin",
      items: [
        { href: "/admin/pegawai", label: "Pegawai", icon: Users },
        { href: "/admin/tim", label: "Tim", icon: UsersRound },
        { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
      ],
    });
  }
  groups.push({ label: "Akun", items: [{ href: "/akun", label: "Ganti Password", icon: KeyRound }] });
  return groups;
}

function NavLinks({ user, counts, onNavigate }: { user: NavUser; counts: NavCounts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-5">
      {buildNav(user, counts).map((g, i) => (
        <div key={i}>
          {g.label ? (
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/55 uppercase">{g.label}</p>
          ) : null}
          <ul className="grid gap-0.5">
            {g.items.map((it) => {
              const active = it.match ? it.match(pathname) : pathname === it.href || pathname.startsWith(it.href + "/");
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <it.icon
                      className={cn("size-[18px] shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/60")}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge ? (
                      <span className="tabular min-w-5 rounded-full bg-sidebar-primary px-1.5 text-center text-[11px] leading-5 font-bold text-sidebar-primary-foreground">
                        {it.badge > 99 ? "99+" : it.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-xl px-2 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow">
        <Image src="/logo-bps.svg" alt="Logo BPS" width={32} height={32} />
      </span>
      <span className="min-w-0">
        <span className="block text-base leading-tight font-bold text-white">Sisar Matiti</span>
        <span className="block truncate text-[11px] text-sidebar-foreground/70">BPS Kab. Teluk Bintuni</span>
      </span>
    </Link>
  );
}

function UserBox({ user }: { user: NavUser }) {
  const peran = [user.isKepala && "Kepala", user.isAdmin && "Admin", user.isKetuaTim && "Ketua Tim", user.isPJ && "PJ Kegiatan"]
    .filter(Boolean)
    .join(" · ") || "Pegawai";
  return (
    <div className="rounded-xl bg-sidebar-accent/50 p-3">
      <p className="truncate text-sm font-semibold text-white">{user.nama}</p>
      <p className="truncate text-xs text-sidebar-foreground/70">{peran}</p>
      <form action={logout} className="mt-2">
        <button
          type="submit"
          className="flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
        >
          <LogOut className="size-4" aria-hidden />
          Keluar
        </button>
      </form>
    </div>
  );
}

export function Sidebar({ user, counts }: { user: NavUser; counts: NavCounts }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 overflow-y-auto bg-sidebar px-3 py-5 lg:flex">
      <Brand />
      <div className="flex-1">
        <NavLinks user={user} counts={counts} />
      </div>
      <UserBox user={user} />
    </aside>
  );
}

export function MobileNav({ user, counts }: { user: NavUser; counts: NavCounts }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 border-none bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="px-3 pt-5 pb-4">
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
          <Brand />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavLinks user={user} counts={counts} onNavigate={() => setOpen(false)} />
        </div>
        <div className="p-3">
          <UserBox user={user} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function BellLink({ count }: { count: number }) {
  return (
    <Link
      href="/notifikasi"
      aria-label={count ? `Notifikasi, ${count} belum dibaca` : "Notifikasi"}
      className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Bell className="size-5" />
      {count > 0 ? (
        <span className="tabular absolute top-1 right-1 min-w-[18px] rounded-full bg-danger px-1 text-center text-[10px] leading-[18px] font-bold text-white ring-2 ring-background">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
