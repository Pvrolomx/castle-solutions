'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { lang, setLang, t } = useLanguage();

  const NAV_ITEMS = [
    { href: '/', label: t('clients'), isTab: true, tabName: 'clients' },
    { href: '/', label: t('properties'), isTab: true, tabName: 'properties' },
    { href: '/', label: t('family'), isTab: true, tabName: 'familia' },
    { href: '/gastos', label: t('expenses') },
    { href: '/calendario', label: t('calendar') },
    { href: '/contratos', label: t('contracts') },
    { href: '/facturacion', label: t('billing') },
  ];

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <div className="w-full flex justify-end">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-sm font-medium transition"
          >
            <span className={lang === 'es' ? 'opacity-100' : 'opacity-40'}>🇲🇽</span>
            <span className="text-stone-400">/</span>
            <span className={lang === 'en' ? 'opacity-100' : 'opacity-40'}>🇺🇸</span>
          </button>
        </div>
        
        <Link href="/">
          <img src="/logo.png" alt="Castle Solutions" className="h-14 w-auto" />
        </Link>
        
        <div className="flex gap-2 justify-center flex-wrap">
          {NAV_ITEMS.map((item, idx) => {
            const active = pathname === item.href && !item.isTab;
            
            return (
              <Link
                key={idx}
                href={item.href}
                className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${
                  active
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
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
