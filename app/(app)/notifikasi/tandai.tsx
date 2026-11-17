"use client";

import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, useAksi } from "@/components/sisar/client";
import { tandaiDibacaAksi } from "@/app/actions/umum";

export function TandaiSemua() {
  const { pending, run } = useAksi();
  return (
    <Button variant="outline" disabled={pending} onClick={() => run(() => tandaiDibacaAksi())}>
      {pending ? <Spinner /> : <CheckCheck />}
      Tandai semua dibaca
    </Button>
  );
}

export function TandaiSatu({ id }: { id: number }) {
  const { pending, run } = useAksi();
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Tandai dibaca" disabled={pending} onClick={() => run(() => tandaiDibacaAksi(id))}>
      {pending ? <Spinner /> : <Check />}
    </Button>
  );
}
