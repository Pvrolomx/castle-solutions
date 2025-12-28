import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data = await request.json();
  const { text, type } = data;
  
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'GROQ_API_KEY no configurada' 
    });
  }
  
  let prompt = '';
  
  if (type === 'client') {
    prompt = `Extrae los siguientes datos del texto de un documento legal/contrato. Responde SOLO en formato JSON válido, sin explicaciones ni markdown:
{"name": "nombre completo", "phone": "teléfono", "email": "email", "notes": "info adicional"}
Si no encuentras algún dato, usa "". TEXTO: ${text}`;
  } else if (type === 'property') {
    prompt = `Extrae datos de propiedad del texto. Responde SOLO en JSON válido, sin explicaciones ni markdown:
{"name": "nombre propiedad", "address": "dirección", "propertyType": "casa/departamento/local/otro", "regime": "independiente/condominio", "condoName": "", "condoAdminName": "", "condoAdminPhone": "", "condoFee": "", "notes": ""}
Si no encuentras algún dato, usa "". TEXTO: ${text}`;
  } else if (type === 'contact') {
    prompt = `Extrae datos de contacto del texto. Responde SOLO en JSON válido, sin explicaciones ni markdown:
{"name": "nombre", "phone": "teléfono", "email": "email", "address": "dirección", "birthday": "cumpleaños", "notes": ""}
Si no encuentras algún dato, usa "". TEXTO: ${text}`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const result = await response.json();
    const responseText = result.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, data: extracted });
    }
    
    return NextResponse.json({ success: false, error: 'No se pudo parsear respuesta' });
  } catch (error) {
    console.error('Groq error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error con Groq API' 
    });
  }
}
