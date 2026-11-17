"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/sisar/client";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [lihat, setLihat] = useState(false);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="grid gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          defaultValue={state.username}
          required
          className="h-11"
          aria-invalid={!!state.pesan}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={lihat ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 pr-11"
            aria-invalid={!!state.pesan}
          />
          <button
            type="button"
            onClick={() => setLihat((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
          >
            {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {state.pesan ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-soft p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.pesan}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Spinner /> : <LogIn />}
        Masuk
      </Button>
    </form>
  );
}
