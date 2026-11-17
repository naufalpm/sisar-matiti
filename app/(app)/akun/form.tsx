"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner, useAksi } from "@/components/sisar/client";
import { gantiPasswordAksi } from "@/app/actions/umum";

export function GantiPasswordForm() {
  const [f, setF] = useState({ lama: "", baru: "", ulang: "" });
  const { pending, run } = useAksi();
  const cocok = f.ulang === "" || f.baru === f.ulang;
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => gantiPasswordAksi(f.lama, f.baru, f.ulang), { onOk: () => setF({ lama: "", baru: "", ulang: "" }) });
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="pw-lama">Password lama</Label>
        <Input id="pw-lama" type="password" autoComplete="current-password" value={f.lama} onChange={(e) => setF({ ...f, lama: e.target.value })} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="pw-baru">Password baru</Label>
        <Input id="pw-baru" type="password" autoComplete="new-password" minLength={8} value={f.baru} onChange={(e) => setF({ ...f, baru: e.target.value })} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="pw-ulang">Ulangi password baru</Label>
        <Input
          id="pw-ulang"
          type="password"
          autoComplete="new-password"
          value={f.ulang}
          onChange={(e) => setF({ ...f, ulang: e.target.value })}
          aria-invalid={!cocok}
          aria-describedby="pw-ulang-err"
          required
        />
        {!cocok ? (
          <p id="pw-ulang-err" className="text-xs text-danger">
            Konfirmasi password tidak sama.
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending || !cocok || f.baru.length < 8} className="justify-self-start">
        {pending ? <Spinner /> : null}
        Simpan password
      </Button>
    </form>
  );
}
