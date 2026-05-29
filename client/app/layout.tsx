import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EcoMix Optimizer | Sustainable Concrete Engineering & TS EN 206 Compliance",
  description: "Academic-grade civil engineering optimization dashboard. Optimizes concrete mix designs to minimize costs and embodied carbon under structural strength standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-[#090d16] text-[#f1f5f9] flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
