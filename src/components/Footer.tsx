'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
  const { lang } = useLanguage();
  
  return (
    <footer className="bg-stone-800 text-stone-300 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm mb-2">
          {lang === 'es' ? 'Hecho por' : 'Made by'} <span className="text-amber-500 font-semibold">Colmena (C6)</span> • 28/12/2025
        </p>
        <Link 
          href="/privacidad" 
          className="text-xs text-stone-400 hover:text-amber-500 transition"
        >
          {lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Policy'}
        </Link>
      </div>
    </footer>
  );
}
