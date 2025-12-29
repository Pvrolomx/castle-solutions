'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface NavItem {
  href: string;
  label: string;
  isTab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Clientes', isTab: true },
  { href: '/', label: 'Propiedades', isTab: true },
  { href: '/', label: 'Familia', isTab: true },
  { href: '/gastos', label: 'Gastos' },
  { href: '/calendario', label: 'Calendario' },
  { href: '/contratos', label: 'Contratos' },
  { href: '/facturacion', label: 'Facturación' },
];

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string, label: string) => {
    if (currentPage) return currentPage === label;
    return pathname === href && !NAV_ITEMS.find(n => n.href === href && n.isTab);
  };

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <Link href="/">
          <img src="/logo.png" alt="Castle Solutions" className="h-14 w-auto" />
        </Link>
        
        <div className="flex gap-2 justify-center flex-wrap">
          {NAV_ITEMS.map((item, idx) => {
            const active = isActive(item.href, item.label);
            
            if (item.isTab) {
              // These are handled by the main page
              return (
                <Link
                  key={idx}
                  href="/"
                  className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${
                    active
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300'
                      : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            }
            
            return (
              <Link
                key={idx}
                href={item.href}
                className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${
                  pathname === item.href
                    ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300'
                    : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        
        {session?.user && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-stone-500">{session.user.email}</span>
            <button onClick={() => signOut()} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
