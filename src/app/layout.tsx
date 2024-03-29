import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Color Hint",
  description: "A game of colors, hints, and guesses.",
};

const DynamicLayout = dynamic(() => import("@/components/pages/layout"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicLayout>{children}</DynamicLayout>
        <Analytics />
      </body>
    </html>
  );
}
