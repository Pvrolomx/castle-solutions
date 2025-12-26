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
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Castle Solutions" className="h-12" />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
