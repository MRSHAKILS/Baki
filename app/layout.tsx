import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Baki" },
  description:
    "Outstanding, still owed. Freelancers send an invoice link, and Baki chases the client.",
  metadataBase: new URL(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
  ),
  openGraph: {
    title: "Baki",
    description:
      "Outstanding, still owed. Freelancers send an invoice link, and Baki chases the client.",
    siteName: "Baki",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baki",
    description:
      "Outstanding, still owed. Freelancers send an invoice link, and Baki chases the client.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plex.variable}`}>
      <body className="min-h-dvh bg-ground font-sans text-surface antialiased">{children}</body>
    </html>
  );
}
