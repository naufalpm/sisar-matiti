import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-info-soft text-info">
        <SearchX className="size-7" aria-hidden />
      </span>
      <h1 className="text-xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Data mungkin sudah dihapus, atau Anda tidak memiliki akses ke halaman ini.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
