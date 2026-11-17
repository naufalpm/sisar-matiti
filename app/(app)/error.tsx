"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-7" aria-hidden />
      </span>
      <h1 className="text-xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Halaman gagal dimuat. Periksa koneksi internet Anda lalu coba lagi.
      </p>
      <Button className="mt-6" onClick={reset}>
        <RotateCcw />
        Coba lagi
      </Button>
    </div>
  );
}
