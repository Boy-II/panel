import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BWC 專案監控儀表板",
  description: "BWC 專案列表監控與管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
