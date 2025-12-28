with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add voice search state after extracting state
old_extract_state = "const [extracting, setExtracting] = useState(false);"
new_extract_state = """const [extracting, setExtracting] = useState(false);
  const [listening, setListening] = useState(false);"""

content = content.replace(old_extract_state, new_extract_state)

# Add voice search function after handleExtractUpload
voice_func = '''

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta búsqueda por voz. Usa Chrome o Edge.');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      loadData(transcript);
    };
    
    recognition.start();
  };'''

content = content.replace(
    "await extractFromDocument(url, type);\n  };",
    "await extractFromDocument(url, type);\n  };" + voice_func
)

# Add microphone button next to search input
old_search = '''<input
            type="text"
            placeholder="Buscar clientes, propiedades..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); loadData(e.target.value); }}
            className="w-full max-w-md border rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />'''

new_search = '''<div className="flex gap-2 w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar clientes, propiedades..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); loadData(e.target.value); }}
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              onClick={startVoiceSearch}
              className={`px-4 py-2 rounded-lg transition ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200'}`}
              title="Búsqueda por voz"
            >
              🎤
            </button>
          </div>'''

content = content.replace(old_search, new_search)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Voice search added')
