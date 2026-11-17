import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { PageHeader, SectionCard } from "@/components/sisar/ui";
import { GantiPasswordForm } from "./form";

export const metadata: Metadata = { title: "Ganti Password" };

export default async function AkunPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Akun" title={user.nama} description={`Username: ${user.username}${user.jabatan ? ` · ${user.jabatan}` : ""}`} />
      <SectionCard title="Ganti password" description="Minimal 8 karakter" icon={KeyRound} className="max-w-lg">
        <GantiPasswordForm />
      </SectionCard>
    </>
  );
}
