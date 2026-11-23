import type { NextConfig } from "next";

// Seluruh halaman Sisar Matiti membutuhkan sesi login (dinamis per pengguna),
// jadi Cache Components tidak diaktifkan agar alur data tetap sederhana.
const nextConfig: NextConfig = {
  // Build mandiri untuk deploy di server BPS (lihat Dockerfile & docs/DEPLOY.md).
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  experimental: {
    agentFeedback: true,
    // Upload foto pegawai (maks 2 MB) lewat Server Action; default Next.js 1 MB.
    serverActions: { bodySizeLimit: "3mb" },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
