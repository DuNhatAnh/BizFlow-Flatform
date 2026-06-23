import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizFlow Platform - Hệ thống quản lý bán hàng thông minh",
  description: "Hệ thống quản lý bán hàng thông minh tích hợp trợ lý AI và tự động hóa sổ sách kế toán theo Thông tư 88/2021/TT-BTC",
};

import NextTopLoader from 'nextjs-toploader';
import QueryProvider from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-background text-on-background">
        <QueryProvider>
          <NextTopLoader
            color="#10b981"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #10b981,0 0 5px #10b981"
          />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
