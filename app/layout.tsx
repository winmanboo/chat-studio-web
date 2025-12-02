import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import React from "react";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdXProvider } from "../components/AntdXProvider";
import AppMain from "../components/AppMain";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chat Studio",
  description: "A modern chat application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.variable} style={{ background: '#F5F5F5', minHeight: '100vh' }}>
        <AntdRegistry>
          <AntdXProvider>
            <AppMain>{children}</AppMain>
          </AntdXProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
