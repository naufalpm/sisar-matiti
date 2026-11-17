import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarClock, CheckSquare, UserPlus, XCircle, Undo2, AlertTriangle, Scale } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { daftarNotif } from "@/lib/layanan/notifikasi";
import { fmtWaktu } from "@/lib/waktu";
import { EmptyState, IconCircle, PageHeader } from "@/components/sisar/ui";
import { cn } from "@/lib/utils";
import { TandaiSemua, TandaiSatu } from "./tandai";

export const metadata: Metadata = { title: "Notifikasi" };

const IKON = {
  ditugaskan: { icon: UserPlus, tone: "blue" },
  ditolak: { icon: XCircle, tone: "red" },
  unapprove: { icon: Undo2, tone: "red" },
  deadline_h3: { icon: CalendarClock, tone: "amber" },
  menunggu_approval: { icon: CheckSquare, tone: "violet" },
  lewat_deadline: { icon: AlertTriangle, tone: "red" },
  belum_berbobot: { icon: Scale, tone: "orange" },
} as const;

export default async function NotifikasiPage() {
  const user = await requireUser();
  const rows = await daftarNotif(user.id, 100);
  const belum = rows.filter((r) => !r.dibaca).length;

  return (
    <>
      <PageHeader
        eyebrow="Notifikasi"
        title="Notifikasi"
        description={belum ? `${belum} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
        actions={belum ? <TandaiSemua /> : null}
      />
      <div className="rounded-2xl border bg-card shadow-xs">
        {rows.length === 0 ? (
          <EmptyState title="Belum ada notifikasi" description="Notifikasi penugasan, approval, dan deadline akan muncul di sini." />
        ) : (
          <ul className="divide-y">
            {rows.map((n) => {
              const ik = IKON[n.jenis as keyof typeof IKON] ?? { icon: Bell, tone: "slate" as const };
              const isi = (
                <div className="flex min-w-0 flex-1 gap-3">
                  <IconCircle icon={ik.icon} tone={ik.tone} className="size-9 [&>svg]:size-4" />
                  <div className="min-w-0">
                    <p className={cn("text-sm", !n.dibaca && "font-semibold")}>{n.judul}</p>
                    {n.pesan ? <p className="text-sm break-words text-muted-foreground">{n.pesan}</p> : null}
                    <p className="mt-0.5 text-xs text-muted-foreground">{fmtWaktu(n.createdAt)}</p>
                  </div>
                </div>
              );
              return (
                <li key={n.id} className={cn("flex items-start gap-2 px-4 py-3 sm:px-5", !n.dibaca && "bg-info-soft/50")}>
                  {n.link ? (
                    <Link href={n.link} className="flex min-w-0 flex-1 rounded-lg hover:opacity-80">
                      {isi}
                    </Link>
                  ) : (
                    isi
                  )}
                  {!n.dibaca ? <TandaiSatu id={n.id} /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
