"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, EmptyState } from "@/components/sisar/ui";

export type BarisPegawai = {
  id: number;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  tim: { id: number; nama: string; ketua: boolean }[];
  golongan: string | null;
  pendidikan: string | null;
  foto: string | null;
};

const SEMUA = "__semua";

export function TabelPegawai({ rows }: { rows: BarisPegawai[] }) {
  const [q, setQ] = useState("");
  const [tim, setTim] = useState(SEMUA);
  const daftarTim = useMemo(() => {
    const m = new Map<number, string>();
    for (const r of rows) for (const t of r.tim) m.set(t.id, t.nama);
    return [...m].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);
  const hasil = useMemo(() => {
    const kata = q.toLowerCase().trim();
    return rows.filter(
      (r) =>
        (tim === SEMUA || r.tim.some((t) => String(t.id) === tim)) &&
        (!kata ||
          [r.nama, r.nip, r.jabatan, r.golongan, r.pendidikan, ...r.tim.map((t) => t.nama)].some((v) =>
            v?.toLowerCase().includes(kata),
          )),
    );
  }, [rows, q, tim]);

  return (
    <>
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:px-5">
        <label className="relative flex-1">
          <span className="sr-only">Cari pegawai</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, NIP, jabatan, tim…"
            className="pl-9"
          />
        </label>
        {daftarTim.length > 0 ? (
          <Select value={tim} onValueChange={setTim}>
            <SelectTrigger className="w-full sm:w-64" aria-label="Filter tim kerja">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua tim</SelectItem>
              {daftarTim.map(([id, nama]) => (
                <SelectItem key={id} value={String(id)}>
                  Tim {nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {hasil.length === 0 ? (
        <EmptyState compact title="Tidak ada pegawai yang cocok" description="Coba kata kunci lain atau ganti filter tim." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold sm:px-5">Pegawai</th>
                <th className="px-3 py-2 font-semibold">NIP</th>
                <th className="px-3 py-2 font-semibold">Golongan</th>
                <th className="px-3 py-2 font-semibold">Pendidikan</th>
                <th className="px-4 py-2 font-semibold sm:px-5">Tim kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hasil.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-2.5 sm:px-5">
                    <Link
                      href={`/pegawai/${p.id}`}
                      className="flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <Avatar nama={p.nama} foto={p.foto} className="size-9" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-primary hover:underline">{p.nama}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.jabatan ?? "—"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="tabular px-3 py-2.5 font-mono text-xs">{p.nip ?? "—"}</td>
                  <td className="px-3 py-2.5">{p.golongan ?? "—"}</td>
                  <td className="max-w-56 truncate px-3 py-2.5" title={p.pendidikan ?? undefined}>
                    {p.pendidikan ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 sm:px-5">
                    {p.tim.length ? (
                      <ul className="flex max-w-80 flex-wrap gap-1" aria-label={`Tim ${p.nama}`}>
                        {p.tim.map((t) => (
                          <li
                            key={t.id}
                            className={
                              t.ketua
                                ? "rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
                                : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                            }
                            title={t.ketua ? `Ketua Tim ${t.nama}` : `Anggota Tim ${t.nama}`}
                          >
                            {t.nama}
                            {t.ketua ? <span className="sr-only"> (ketua)</span> : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
        <span aria-live="polite">
          Menampilkan {hasil.length} dari {rows.length} pegawai
        </span>
        <span className="flex items-center gap-1.5">
          <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">Tim</span> = ketua tim
        </span>
      </p>
    </>
  );
}
