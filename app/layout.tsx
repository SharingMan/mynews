import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
  themeColor: "#ff6600",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` :
      'https://mynews-production-52a2.up.railway.app')
  ),
  title: {
    default: "GlobalNews - 全球实时新闻聚合",
    template: "%s | GlobalNews",
  },
  description: "实时聚合全球最新新闻，涵盖科技、财经、国际、体育、AI等多个领域。为您提供最快、最全的新闻资讯服务。",
  keywords: ["新闻", "科技", "财经", "AI", "人工智能", "体育", "娱乐", "全球新闻", "实时新闻"],
  authors: [{ name: "GlobalNews" }],
  creator: "GlobalNews",
  publisher: "GlobalNews",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://mynews-production-52a2.up.railway.app",
    siteName: "GlobalNews",
    title: "GlobalNews - 全球实时新闻聚合",
    description: "实时聚合全球最新新闻，涵盖科技、财经、国际、体育、AI等多个领域。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GlobalNews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobalNews - 全球实时新闻聚合",
    description: "实时聚合全球最新新闻",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://mynews-production-52a2.up.railway.app",
  },
};

// 防止主题闪烁的脚本
const themeScript = `
  (function() {
    function getTheme() {
      const theme = localStorage.getItem('theme')
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark'
      }
      return 'light'
    }
    if (getTheme() === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  })()
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
