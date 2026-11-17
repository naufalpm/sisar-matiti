"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Spinner, useAksi } from "@/components/sisar/client";
import { setBobotAksi } from "@/app/actions/kelola";
import { cn } from "@/lib/utils";

/** Pemilih bobot 1–10 dalam bentuk deret tombol (mudah disentuh di HP). */
export function BobotInput({ pekerjaanId, bobot, nama }: { pekerjaanId: number; bobot: number | null; nama: string }) {
  const [nilai, setNilai] = useState<number | null>(bobot);
  const { pending, run } = useAksi();
  return (
    <div className="flex items-center gap-2">
      <div role="radiogroup" aria-label={`Bobot ${nama}`} className="flex flex-wrap gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={nilai === n}
            disabled={pending}
            onClick={() => {
              setNilai(n);
              run(() => setBobotAksi(pekerjaanId, n));
            }}
            className={cn(
              "tabular size-9 cursor-pointer rounded-lg border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:size-8",
              nilai === n
                ? "border-primary bg-primary text-primary-foreground"
                : n <= (nilai ?? 0)
                  ? "border-primary/30 bg-accent text-accent-foreground"
                  : "bg-card hover:bg-muted",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="w-5" aria-live="polite">
        {pending ? <Spinner /> : nilai != null ? <Check className="size-4 text-success" aria-label="Tersimpan" /> : null}
      </span>
    </div>
  );
}
