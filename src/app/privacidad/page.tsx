'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function PrivacidadPage() {
  const { lang } = useLanguage();
  
  const content = {
    es: {
      title: 'Aviso de Privacidad',
      intro: 'CASTLE Solutions, con domicilio en Puerto Vallarta, Jalisco, México, es responsable del tratamiento de sus datos personales.',
      sections: [
        {
          title: '¿Qué datos recopilamos?',
          content: 'Recopilamos datos de identificación (nombre, teléfono, email), datos de propiedades y datos de transacciones relacionadas con la administración de inmuebles.'
        },
        {
          title: '¿Para qué usamos sus datos?',
          content: 'Sus datos son utilizados para: administración de propiedades, gestión de reservaciones, generación de estados de cuenta, y comunicación de recordatorios de pagos.'
        },
        {
          title: '¿Con quién compartimos sus datos?',
          content: 'No compartimos sus datos personales con terceros, excepto cuando sea necesario para cumplir con obligaciones legales.'
        },
        {
          title: '¿Cómo protegemos sus datos?',
          content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra acceso no autorizado, pérdida o alteración.'
        },
        {
          title: 'Sus derechos',
          content: 'Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales (derechos ARCO). Para ejercer estos derechos, contáctenos.'
        },
        {
          title: 'Cambios al aviso',
          content: 'Nos reservamos el derecho de modificar este aviso de privacidad. Cualquier cambio será notificado a través de la plataforma.'
        }
      ],
      lastUpdate: 'Última actualización: 28 de diciembre de 2025',
      back: '← Volver al inicio'
    },
    en: {
      title: 'Privacy Policy',
      intro: 'CASTLE Solutions, located in Puerto Vallarta, Jalisco, Mexico, is responsible for processing your personal data.',
      sections: [
        {
          title: 'What data do we collect?',
          content: 'We collect identification data (name, phone, email), property data, and transaction data related to property management.'
        },
        {
          title: 'How do we use your data?',
          content: 'Your data is used for: property management, reservation management, account statement generation, and payment reminder communications.'
        },
        {
          title: 'Who do we share your data with?',
          content: 'We do not share your personal data with third parties, except when necessary to comply with legal obligations.'
        },
        {
          title: 'How do we protect your data?',
          content: 'We implement technical and organizational security measures to protect your data against unauthorized access, loss, or alteration.'
        },
        {
          title: 'Your rights',
          content: 'You have the right to access, rectify, cancel, or oppose the processing of your personal data (ARCO rights). To exercise these rights, contact us.'
        },
        {
          title: 'Changes to this policy',
          content: 'We reserve the right to modify this privacy policy. Any changes will be notified through the platform.'
        }
      ],
      lastUpdate: 'Last updated: December 28, 2025',
      back: '← Back to home'
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-amber-600 hover:text-amber-700 text-sm mb-8 inline-block">
          {c.back}
        </Link>
        
        <h1 className="text-3xl font-bold text-stone-800 mb-6">{c.title}</h1>
        
        <p className="text-stone-600 mb-8">{c.intro}</p>
        
        <div className="space-y-6">
          {c.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg p-5 shadow-sm">
              <h2 className="font-semibold text-stone-800 mb-2">{section.title}</h2>
              <p className="text-stone-600 text-sm">{section.content}</p>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-stone-400 mt-8 text-center">{c.lastUpdate}</p>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-stone-500">
            {lang === 'es' ? 'Hecho por' : 'Made by'} <span className="text-amber-600 font-semibold">Colmena (C6)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
