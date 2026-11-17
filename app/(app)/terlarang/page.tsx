import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TerlarangPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <ShieldAlert className="size-7" aria-hidden />
      </span>
      <h1 className="text-xl font-bold">Akses ditolak</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Halaman ini hanya bisa dibuka oleh peran tertentu.</p>
      <Button asChild className="mt-6">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
