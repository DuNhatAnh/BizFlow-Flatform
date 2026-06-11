import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizFlow Platform - Hệ thống quản lý bán hàng thông minh",
  description: "Hệ thống quản lý bán hàng thông minh tích hợp trợ lý AI và tự động hóa sổ sách kế toán theo Thông tư 88/2021/TT-BTC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
