import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data = await request.json();
  const { text, type } = data; // type: 'client' | 'property' | 'contact'
  
  // Ollama endpoint - adjust if needed
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  let prompt = '';
  
  if (type === 'client') {
    prompt = `Extrae los siguientes datos del texto de un documento legal/contrato. Responde SOLO en formato JSON válido, sin explicaciones:
{
  "name": "nombre completo de la persona",
  "phone": "número de teléfono si existe",
  "email": "email si existe",
  "notes": "información relevante adicional"
}

Si no encuentras algún dato, usa cadena vacía "".

TEXTO DEL DOCUMENTO:
${text}`;
  } else if (type === 'property') {
    prompt = `Extrae los siguientes datos del texto de un documento de propiedad/contrato. Responde SOLO en formato JSON válido, sin explicaciones:
{
  "name": "nombre o alias de la propiedad",
  "address": "dirección completa",
  "propertyType": "casa, departamento, local u otro",
  "regime": "independiente o condominio",
  "condoName": "nombre del condominio si aplica",
  "condoAdminName": "administrador del condominio si existe",
  "condoAdminPhone": "teléfono del administrador si existe",
  "condoFee": "cuota de mantenimiento si existe",
  "notes": "información relevante adicional"
}

Si no encuentras algún dato, usa cadena vacía "".

TEXTO DEL DOCUMENTO:
${text}`;
  } else if (type === 'contact') {
    prompt = `Extrae los siguientes datos del texto. Responde SOLO en formato JSON válido, sin explicaciones:
{
  "name": "nombre completo",
  "phone": "teléfono",
  "email": "email si existe",
  "address": "dirección si existe",
  "birthday": "fecha de cumpleaños si existe",
  "notes": "información adicional"
}

Si no encuentras algún dato, usa cadena vacía "".

TEXTO:
${text}`;
  }

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama not responding');
    }

    const result = await response.json();
    const responseText = result.response;
    
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, data: extracted });
    }
    
    return NextResponse.json({ success: false, error: 'Could not parse response' });
  } catch (error) {
    console.error('Ollama error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ollama no disponible. Verifica que esté corriendo en localhost:11434' 
    });
  }
}
