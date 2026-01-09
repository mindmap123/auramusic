import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // [NEW] Import Outfit
import "./globals.css";
import { Providers } from "@/components/Providers";
import { clsx } from "clsx";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body", // [NEW] CSS Variable
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display", // [NEW] CSS Variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura Streaming | Musique d'ambiance pour magasins",
  description: "Plateforme de streaming musical intelligente pour espaces commerciaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={clsx(inter.variable, outfit.variable)} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
