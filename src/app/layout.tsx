import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/utils/ToastNotification";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caring Sparks – Empowering Brand & Influencer Collaborations",
  description:
    "Caring Sparks connects brands and influencers to create meaningful, authentic campaigns. Discover seamless collaboration, campaign management, and creative growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>{children}</body>
      </html>
    </ToastProvider>
  );
}
