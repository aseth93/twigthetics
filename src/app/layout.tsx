import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Instrument_Sans,
  Oswald,
} from "next/font/google";
import "./globals.css";

const bodyFont = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Twigthetics | Online Physique Coaching",
  description:
    "Online coaching for a lean, aesthetic, athletic physique and a sustainable maintenance guide from Abe Seth.",
  openGraph: {
    title: "Twigthetics | Online Physique Coaching",
    description:
      "Online coaching for a lean, aesthetic, athletic physique and a sustainable maintenance guide from Abe Seth.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twigthetics | Online Physique Coaching",
    description:
      "Online coaching for a lean, aesthetic, athletic physique and a sustainable maintenance guide from Abe Seth.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${serifFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
