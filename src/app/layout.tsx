import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-zen-maru",
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: "ちどりマップ - 酔い歩きを、地図に残そう",
  description: "お酒の記録と場所をシェアする、大人のためのログアプリ",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
