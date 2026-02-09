import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import AppShell from "@/components/AppShell";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2b7ba8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a5278" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "AI+ プラットフォーム",
    template: "%s | AI+",
  },
  description: "AI技術を活用した革新的なソーシャルプラットフォーム。アイデア共有、コンテンツ作成、コミュニティとつながる。",
  keywords: ["AI", "SNS", "ソーシャル", "コンテンツ", "クリエイター", "プラットフォーム"],
  authors: [{ name: "AI+" }],
  creator: "AI+",
  publisher: "AI+",
  applicationName: "AI+",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { rel: "icon", url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png", sizes: "192x192" },
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://aiplus.app",
    siteName: "AI+ プラットフォーム",
    title: "AI+ プラットフォーム",
    description: "AI技術を活用した革新的なソーシャルプラットフォーム",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "AI+ Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI+ プラットフォーム",
    description: "AI技術を活用した革新的なソーシャルプラットフォーム",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI+",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#2b7ba8" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PWAInstallPrompt />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}