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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pancreatic-care-platform.up.railway.app"),
  title: {
    default: "Care Platform - AI 정밀 건강 관리",
    template: "%s | Care Platform",
  },
  description: "AI 전문의가 분석하는 췌장암/담도암 환자 맞춤형 건강 관리 플랫폼. 혈액 검사, CT 판독, iNKt 투여 기록을 통합 관리하세요.",
  keywords: ["췌장암", "담도암", "건강관리", "AI분석", "혈액검사", "CT판독", "iNKt", "Care Platform"],
  authors: [{ name: "Care Platform Team" }],
  creator: "Care Platform",
  publisher: "Care Platform",
  openGraph: {
    title: "Care Platform - AI 정밀 건강 관리",
    description: "AI 전문의가 분석하는 췌장암/담도암 환자 맞춤형 건강 관리 플랫폼",
    url: "/",
    siteName: "Care Platform",
    locale: "ko_KR",
    type: "website",
    images: [{
      url: "/og-image.png", // public 폴더에 og-image.png를 추가하세요 (1200x630 권장)
      width: 1200,
      height: 630,
      alt: "Care Platform Preview",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Care Platform",
    description: "AI 전문의가 분석하는 췌장암/담도암 환자 맞춤형 건강 관리 플랫폼",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
