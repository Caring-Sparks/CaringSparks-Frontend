import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/utils/ToastNotification";

const roboto = Roboto({
  variable: "--roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "The•PR•God – Empowering Brand & Influencer Collaborations",
  description:
    "The•PR•God connects brands and influencers to create meaningful, authentic campaigns. Discover seamless collaboration, campaign management, and creative growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <html lang="en">
        <body className={`${roboto.variable} antialiased`}>{children}</body>
      </html>
    </ToastProvider>
  );
}
