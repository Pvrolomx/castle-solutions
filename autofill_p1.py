with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add extracting state
old_state = 'const [editingContact, setEditingContact] = useState<Contact | null>(null);'
new_state = '''const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [extracting, setExtracting] = useState(false);'''

content = content.replace(old_state, new_state)

# Add extract functions after shareViaWhatsApp
extract_funcs = '''

  const extractFromDocument = async (url: string, type: 'client' | 'property' | 'contact') => {
    setExtracting(true);
    try {
      // First parse PDF to get text
      const parseRes = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const parseData = await parseRes.json();
      
      if (!parseData.success) {
        alert('Error al leer el documento');
        setExtracting(false);
        return;
      }
      
      // Then extract fields with Ollama
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: parseData.text, type }),
      });
      const extractData = await extractRes.json();
      
      if (extractData.success && extractData.data) {
        if (type === 'client') {
          setClientData({
            name: extractData.data.name || '',
            phone: extractData.data.phone || '',
            email: extractData.data.email || '',
            notes: extractData.data.notes || '',
          });
        } else if (type === 'property') {
          setPropertyData(prev => ({
            ...prev,
            name: extractData.data.name || prev.name,
            address: extractData.data.address || prev.address,
            propertyType: extractData.data.propertyType || prev.propertyType,
            regime: extractData.data.regime || prev.regime,
            condoName: extractData.data.condoName || prev.condoName,
            condoAdminName: extractData.data.condoAdminName || prev.condoAdminName,
            condoAdminPhone: extractData.data.condoAdminPhone || prev.condoAdminPhone,
            condoFee: extractData.data.condoFee || prev.condoFee,
            notes: extractData.data.notes || prev.notes,
          }));
        } else if (type === 'contact') {
          setContactData({
            name: extractData.data.name || '',
            phone: extractData.data.phone || '',
            email: extractData.data.email || '',
            category: 'familia',
            birthday: extractData.data.birthday || '',
            address: extractData.data.address || '',
            notes: extractData.data.notes || '',
          });
        }
        alert('✅ Datos extraídos con IA');
      } else {
        alert(extractData.error || 'No se pudieron extraer datos');
      }
    } catch (error) {
      alert('Error de conexión con Ollama');
    }
    setExtracting(false);
  };

  const handleExtractUpload = async (url: string, type: 'client' | 'property' | 'contact') => {
    await extractFromDocument(url, type);
  };'''

content = content.replace(
    "window.open(`https://wa.me/?text=${message}`, '_blank');\n  };",
    "window.open(`https://wa.me/?text=${message}`, '_blank');\n  };" + extract_funcs
)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Extract functions added')
