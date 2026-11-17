import { cn } from "@/lib/utils";
import type { StatusProgres } from "@/lib/capaian";
import {
  CircleDashed,
  Loader,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  BadgeCheck,
  Scale,
  XCircle,
  Lock,
} from "lucide-react";

const STATUS: Record<StatusProgres, { label: string; cls: string; Icon: typeof CircleDashed }> = {
  belum: { label: "Belum mulai", cls: "bg-muted text-muted-foreground border-border", Icon: CircleDashed },
  dikerjakan: { label: "Dikerjakan", cls: "bg-info-soft text-info border-info/20", Icon: Loader },
  diajukan: { label: "Menunggu approval", cls: "bg-warning-soft text-warning border-warning/25", Icon: Hourglass },
  selesai: { label: "Selesai", cls: "bg-success-soft text-success border-success/25", Icon: CheckCircle2 },
};

function Chip({ className, children, title }: { className?: string; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-semibold whitespace-nowrap [&>svg]:size-3.5",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusProgres }) {
  const s = STATUS[status];
  return (
    <Chip className={s.cls}>
      <s.Icon aria-hidden />
      {s.label}
    </Chip>
  );
}

export function TerlambatBadge() {
  return (
    <Chip className="bg-danger-soft text-danger border-danger/25" title="Selesai atau masih berjalan setelah deadline">
      <AlertTriangle aria-hidden />
      Terlambat
    </Chip>
  );
}

export function DitolakBadge() {
  return (
    <Chip className="bg-danger-soft text-danger border-danger/25">
      <XCircle aria-hidden />
      Ditolak
    </Chip>
  );
}

export function ApprovalBadge({ jenis, diverifikasi }: { jenis: "normal" | "self" | null; diverifikasi: boolean }) {
  if (jenis !== "self") return null;
  return diverifikasi ? (
    <Chip className="bg-violet-soft text-violet border-violet/25">
      <BadgeCheck aria-hidden />
      Diverifikasi Kepala
    </Chip>
  ) : (
    <Chip className="bg-violet-soft text-violet border-violet/25">
      <ShieldCheck aria-hidden />
      Self-approved
    </Chip>
  );
}

export function BobotBadge({ bobot }: { bobot: number | null }) {
  return bobot == null ? (
    <Chip className="bg-brand-orange-soft text-[oklch(0.5_0.14_50)] border-brand-orange/30" title="Belum dihitung ke beban kerja">
      <Scale aria-hidden />
      Belum berbobot
    </Chip>
  ) : (
    <Chip className="bg-secondary text-secondary-foreground border-transparent" title="Bobot pekerjaan (1–10)">
      <Scale aria-hidden />
      Bobot {bobot}
    </Chip>
  );
}

export function TerkunciBadge() {
  return (
    <Chip className="bg-muted text-muted-foreground border-border" title="Capaian bulan ini sudah dikunci untuk CKP">
      <Lock aria-hidden />
      Bulan terkunci
    </Chip>
  );
}

/** Warna progress sesuai nilai dan ambang. */
export function warnaProgres(v: number | null, ambang = 90) {
  if (v == null) return "bg-muted-foreground/30";
  if (v >= 100) return "bg-success";
  if (v >= ambang) return "bg-brand-green";
  if (v >= 50) return "bg-brand-orange";
  return "bg-danger";
}

export function ProgressBar({
  value,
  ambang,
  className,
  label,
}: {
  value: number | null;
  ambang?: number;
  className?: string;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progres"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", warnaProgres(value, ambang))}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
