import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data = await request.json();
  const { url } = data;
  
  try {
    // Fetch the PDF
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require('pdf-parse');
    const pdfData = await pdf(Buffer.from(buffer));
    
    return NextResponse.json({ 
      success: true, 
      text: pdfData.text,
      pages: pdfData.numpages 
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar PDF' 
    });
  }
}
