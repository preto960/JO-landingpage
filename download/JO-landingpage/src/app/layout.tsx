import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JO-Shop | Tu negocio digital, en todos los dispositivos",
  description:
    "Diseñamos tiendas online y apps nativas que convierten visitantes en clientes. Sin costos ocultos, sin sorpresas.",
  keywords: [
    "tienda online",
    "e-commerce",
    "app nativa",
    "diseño web",
    "JO-Shop",
    "negocio digital",
  ],
  openGraph: {
    title: "JO-Shop | Tu negocio digital, en todos los dispositivos",
    description:
      "Diseñamos tiendas online y apps nativas que convierten visitantes en clientes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
