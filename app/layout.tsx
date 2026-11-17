import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sisar Matiti — BPS Kabupaten Teluk Bintuni",
    template: "%s · Sisar Matiti",
  },
  description:
    "Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring Aktivitas Terpadu Insan Teluk Bintuni",
};

export const viewport: Viewport = {
  themeColor: "#1f4f99",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
