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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` || 'http://localhost:3000'),
  title: {
    default: "이음 (I-Eum) - 의무 기록 및 통합 분석",
    template: "%s | 이음 (I-Eum)",
  },
  description: "AI 전문의가 분석하는 환자 맞춤형 의무 기록 통합 관리 플랫폼. 혈액 검사, CT 판독, 투여 기록을 체계적으로 관리하고 분석합니다.",
  keywords: ["의무기록", "건강관리", "AI분석", "혈액검사", "CT판독", "iNKt", "이음", "I-Eum", "투여기록"],
  authors: [{ name: "I-Eum Team" }],
  creator: "I-Eum",
  publisher: "I-Eum",
  openGraph: {
    title: "이음 (I-Eum) - 의무 기록 및 통합 분석",
    description: "AI 전문의가 분석하는 환자 맞춤형 의무 기록 통합 관리 플랫폼",
    url: '/',
    siteName: "이음 (I-Eum)",
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "I-Eum Service Preview",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "이음 (I-Eum)",
    description: "AI 전문의가 분석하는 환자 맞춤형 의무 기록 통합 관리 플랫폼",
    images: ['/og-image.png'],
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
