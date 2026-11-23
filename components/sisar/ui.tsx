import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "blue" | "orange" | "green" | "red" | "violet" | "amber" | "slate";

const TONE: Record<Tone, string> = {
  blue: "bg-info-soft text-info",
  orange: "bg-brand-orange-soft text-[oklch(0.55_0.15_50)]",
  green: "bg-success-soft text-success",
  red: "bg-danger-soft text-danger",
  violet: "bg-violet-soft text-violet",
  amber: "bg-warning-soft text-warning",
  slate: "bg-muted text-muted-foreground",
};

export function IconCircle({ icon: Icon, tone = "blue", className }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full", TONE[tone], className)}>
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "blue",
  hint,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  hint?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full items-center gap-3 rounded-2xl border bg-card p-3 shadow-xs transition-shadow duration-200 sm:p-4",
        href && "hover:shadow-md hover:border-primary/30",
      )}
    >
      <IconCircle icon={icon} tone={tone} className="size-9 sm:size-10" />
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs leading-tight font-medium text-muted-foreground">{label}</p>
        <p className="tabular text-2xl leading-tight font-bold">{value}</p>
        {hint ? <p className="line-clamp-2 text-xs leading-tight text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</div> : null}
        <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function HeroHeader({
  title,
  description,
  children,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="bg-hero relative mb-6 overflow-hidden rounded-3xl p-5 text-white shadow-md sm:p-7">
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-72 opacity-20"
        viewBox="0 0 300 160"
        fill="none"
      >
        <path d="M0 140 C60 100 90 150 150 110 S240 60 300 90" stroke="white" strokeWidth="2" />
        <path d="M0 120 C70 80 100 130 160 90 S250 40 300 70" stroke="white" strokeWidth="1.5" />
        <rect x="200" y="70" width="18" height="70" rx="4" fill="white" />
        <rect x="228" y="40" width="18" height="100" rx="4" fill="white" />
        <rect x="256" y="10" width="18" height="130" rx="4" fill="white" />
      </svg>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm text-white/85">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="relative mt-5">{children}</div> : null}
    </section>
  );
}

export function SectionCard({
  title,
  description,
  icon,
  tone = "blue",
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl border bg-card shadow-xs", className)}>
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? <IconCircle icon={icon} tone={tone} className="size-8 [&>svg]:size-4" /> : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
  compact,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "py-6" : "py-12")}>
      {!compact && (
        <svg aria-hidden viewBox="0 0 160 110" className="mb-4 h-24 w-36" fill="none">
          <ellipse cx="80" cy="100" rx="60" ry="6" fill="oklch(0.92 0.015 250)" />
          <rect x="34" y="18" width="92" height="72" rx="10" fill="white" stroke="oklch(0.86 0.03 250)" strokeWidth="2" />
          <rect x="46" y="32" width="40" height="6" rx="3" fill="oklch(0.49 0.16 255)" opacity=".7" />
          <rect x="46" y="46" width="64" height="5" rx="2.5" fill="oklch(0.9 0.02 250)" />
          <rect x="46" y="57" width="52" height="5" rx="2.5" fill="oklch(0.9 0.02 250)" />
          <rect x="46" y="68" width="30" height="5" rx="2.5" fill="oklch(0.9 0.02 250)" />
          <circle cx="122" cy="22" r="14" fill="oklch(0.72 0.17 55)" />
          <path d="M116 22l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Nama tanpa gelar di belakang koma: "Maimun, SST, M.Stat" → "Maimun". */
export function namaTanpaGelar(nama: string) {
  return nama.split(",")[0].trim() || nama;
}

export function Avatar({ nama, foto, className }: { nama: string; foto?: string | null; className?: string }) {
  const dasar = namaTanpaGelar(nama);
  const inisial = dasar
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const hue = [...dasar].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  if (foto) {
    return (
      <Image
        src={foto}
        alt=""
        aria-hidden
        width={160}
        height={160}
        unoptimized
        className={cn("size-8 shrink-0 rounded-full bg-muted object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", className)}
      style={{ background: `oklch(0.58 0.13 ${hue})` }}
    >
      {inisial}
    </span>
  );
}
