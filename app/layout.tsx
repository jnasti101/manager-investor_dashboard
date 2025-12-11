import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google"; // Import fonts
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Apex Wealth | AI-Powered Asset Management",
  description: "Comprehensive wealth management for high-net-worth individuals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans`}>
        {children}
      </body>
    </html>
  );
}
