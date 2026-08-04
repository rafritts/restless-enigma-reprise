import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { AmbientBg } from "@/components/layout/ambient-bg";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Restless Enigma Reprise",
    template: "%s · Restless Enigma",
  },
  description:
    "A high-fidelity Enigma machine and Bombe breaker — TypeScript, in-browser, built as a modern SaaS experience.",
  openGraph: {
    title: "Restless Enigma Reprise",
    description:
      "Encrypt with Enigma. Break with the Bombe. Split-flap displays, live telemetry, pure TypeScript.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AmbientBg />
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          {children}
        </main>
        <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
          Restless Enigma Reprise · cipher runs entirely in your browser ·
          inspired by Bletchley Park
        </footer>
      </body>
    </html>
  );
}
