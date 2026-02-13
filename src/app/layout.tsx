import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Bullshit Detector — AI-Powered Tweet Fact Checker",
  description: "Paste any Twitter/X post URL and get an instant AI-powered truthfulness score. Detects lies, bias, manipulation, logical fallacies, and AI-generated images. Free fact-checking tool.",
  keywords: ["fact checker", "tweet fact check", "misinformation detector", "bias detector", "Twitter fact check", "X fact check", "AI fact checker", "bullshit detector", "fake news detector", "manipulation detector"],
  authors: [{ name: "Bullshit Detector" }],
  openGraph: {
    title: "Bullshit Detector — AI-Powered Tweet Fact Checker",
    description: "Paste a tweet. Get the truth. AI-powered analysis scores posts 0-100% for truthfulness, detects bias, manipulation, and logical fallacies.",
    type: "website",
    siteName: "Bullshit Detector",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bullshit Detector — AI-Powered Tweet Fact Checker",
    description: "Paste a tweet. Get the truth. AI-powered analysis scores posts 0-100% for truthfulness, detects bias, manipulation, and logical fallacies.",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
      </body>
    </html>
  );
}
