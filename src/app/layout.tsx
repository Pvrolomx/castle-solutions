import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Castle Solutions",
  description: "Administracion de propiedades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}
