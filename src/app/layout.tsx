import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Club Adventure",
  description: "社团互动冒险 — 像素风角色 + 异步事件卡对局 + 搞笑结局",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${pixelFont.variable} h-full`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ background: "#0a0a1a", color: "#ededed" }}
      >
        {children}
      </body>
    </html>
  );
}
