import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "말로 쓰는 일기",
  description: "음성으로 기록하고, AI가 분석하는 감정 일기",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/Icon.png",
    apple: "/icons/Icon@2x.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "말로 쓰는 일기",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <I18nProvider>{children}</I18nProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
