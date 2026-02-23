import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "AI Bolajon — Bolalar uchun AI ta'lim",
  description: "AI asosida bolalar uchun xavfsiz va qiziqarli ta'lim platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={poppins.variable}>
      <body className="min-h-screen bg-navy-950 text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
