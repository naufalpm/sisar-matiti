type Variant = "light" | "dark" | "on-primary";

const COLORS: Record<Variant, { track: string; arc: string; wave: string }> = {
  light: { track: "#D6E6F7", arc: "#025EB8", wave: "#F3821D" },
  dark: { track: "#173560", arc: "#3A81D7", wave: "#F3821D" },
  "on-primary": { track: "#3B80C9", arc: "#FFFFFF", wave: "#F3821D" },
};

type MarkProps = {
  size?: number;
  variant?: Variant;
  className?: string;
  /** Teks untuk pembaca layar. Kosongkan jika logo berdampingan dengan teks "Sisar Matiti". */
  title?: string;
};

/** Simbol logo Sisar Matiti: cincin capaian + gelombang kali. */
export function SisarMatitiMark({ size = 32, variant = "light", className, title }: MarkProps) {
  const c = COLORS[variant];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <circle cx="32" cy="32" r="25" fill="none" stroke={c.track} strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke={c.arc}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="118 157"
        transform="rotate(-90 32 32)"
      />
      <path d="M18 34 q7 -7 14 0 t14 0" fill="none" stroke={c.wave} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

type LogoProps = {
  variant?: Variant;
  /** Tampilkan kotak putih di belakang simbol (dipakai di sidebar gelap). */
  tile?: boolean;
  subtitle?: string;
  className?: string;
};

/** Logo lengkap: simbol + tulisan "Sisar Matiti" + subjudul. */
export function SisarMatitiLogo({
  variant = "light",
  tile = false,
  subtitle = "BPS Kab. Teluk Bintuni",
  className,
}: LogoProps) {
  const onDark = variant !== "light";
  const markVariant: Variant = tile ? "light" : variant;
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {tile ? (
        <span className="flex size-11 items-center justify-center rounded-xl bg-white">
          <SisarMatitiMark size={32} variant={markVariant} />
        </span>
      ) : (
        <SisarMatitiMark size={40} variant={markVariant} />
      )}
      <span className="flex flex-col leading-tight">
        <span className={`text-[17px] font-extrabold ${onDark ? "text-white" : "text-[#101B2B]"}`}>
          Sisar Matiti
        </span>
        {subtitle && (
          <span className={`text-xs ${onDark ? "text-[#D4DFEB]" : "text-[#505C6C]"}`}>{subtitle}</span>
        )}
      </span>
    </div>
  );
}
