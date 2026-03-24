import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comedic Term Generator",
  description: "Describe a situation. Get the perfect word for it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
