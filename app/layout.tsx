import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import React from "react";
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
      <body className={inter.variable} style={{ background: '#f5f6fa', minHeight: '100vh' }}>
        <AppMain>{children}</AppMain>
      </body>
    </html>
  );
}
