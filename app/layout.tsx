import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comedic Term Generator — Find the Perfect Word for Any Situation",
  description:
    "Describe any situation and instantly get clever, witty terms for it. Perfect when you're trying to one up your buddies with a strong comedic presence.",
  keywords:
    "comedic term generator, funny words for situations, witty vocabulary, slang generator, term for any situation, clever words, situational slang",
  authors: [{ name: "Comedic Term Generator" }],
  creator: "Comedic Term Generator",
  openGraph: {
    title: "Comedic Term Generator — Find the Perfect Word for Any Situation",
    description:
      "Describe any situation and instantly get the perfect clever term for it.",
    url: "https://comedicterm.com/",
    siteName: "Comedic Term Generator",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
