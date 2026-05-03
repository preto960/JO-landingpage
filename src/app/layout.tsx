import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JO-Shop | Tu tienda digital en todos los dispositivos",
  description: "JO-Shop es la solución digital premium para llevar tu negocio al siguiente nivel. Tienda online, app móvil y catálogo digital todo en uno.",
  keywords: ["JO-Shop", "tienda online", "e-commerce", "app móvil", "catálogo digital", "negocio digital", "vender en línea"],
  authors: [{ name: "JO-Shop" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "JO-Shop | Tu tienda digital en todos los dispositivos",
    description: "Solución digital premium para llevar tu negocio al siguiente nivel. Tienda online, app móvil y catálogo digital todo en uno.",
    siteName: "JO-Shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JO-Shop | Tu tienda digital en todos los dispositivos",
    description: "Solución digital premium para llevar tu negocio al siguiente nivel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
