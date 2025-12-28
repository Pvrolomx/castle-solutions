with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add state for link modal
old_state = "const [expandedClient, setExpandedClient] = useState<string | null>(null);"
new_state = """const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkClientName, setLinkClientName] = useState('');"""

content = content.replace(old_state, new_state)

# Add generate link function after loadData
generate_link_func = '''

  const generateClientLink = async (clientId: string, clientName: string) => {
    const res = await fetch('/api/generate-client-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json();
    if (data.success) {
      setGeneratedLink(data.url);
      setLinkClientName(clientName);
      setShowLinkModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copiado!');
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`Hola! Aquí está tu estado de cuenta de Castle Solutions:\\n${generatedLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };'''

content = content.replace(
    "const loadData = async (searchTerm = '') => {",
    generate_link_func + "\n\n  const loadData = async (searchTerm = '') => {"
)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Generate link functions added')
