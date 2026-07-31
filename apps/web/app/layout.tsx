import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alif",
  description: "A local-first autonomous AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
