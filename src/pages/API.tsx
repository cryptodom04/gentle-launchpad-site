import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Code, Zap, Shield, Key, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const endpoints = [
  {
    method: 'POST',
    path: '/v1/tokens/create',
    description: 'Create a new SPL token on Solana mainnet',
    params: [
      { name: 'name', type: 'string', required: true, desc: 'Token name (max 32 chars)' },
      { name: 'symbol', type: 'string', required: true, desc: 'Token symbol (max 10 chars)' },
      { name: 'supply', type: 'number', required: true, desc: 'Total supply' },
      { name: 'decimals', type: 'number', required: false, desc: 'Decimals (default: 9)' },
    ],
  },
  {
    method: 'GET',
    path: '/v1/tokens/{mint}',
    description: 'Get token metadata by mint address',
    params: [
      { name: 'mint', type: 'string', required: true, desc: 'Token mint address' },
    ],
  },
  {
    method: 'POST',
    path: '/v1/tokens/{mint}/burn',
    description: 'Burn tokens from specified account',
    params: [
      { name: 'mint', type: 'string', required: true, desc: 'Token mint address' },
      { name: 'amount', type: 'number', required: true, desc: 'Amount to burn' },
    ],
  },
  {
    method: 'GET',
    path: '/v1/tokens/{mint}/holders',
    description: 'Get list of token holders',
    params: [
      { name: 'mint', type: 'string', required: true, desc: 'Token mint address' },
      { name: 'limit', type: 'number', required: false, desc: 'Results limit (max 100)' },
    ],
  },
];

const codeExample = `import { SolFerno } from '@solferno/sdk';

const client = new SolFerno({
  apiKey: 'sf_live_xxxxxxxxxxxx'
});

// Create a new token
const token = await client.tokens.create({
  name: 'My Token',
  symbol: 'MTK',
  supply: 1000000000,
  decimals: 9,
  revokeMint: true,
  revokeFreeze: true
});

console.log('Token created:', token.mint);
// Token created: 7xKXt...`;

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-second token creation with optimized RPC endpoints.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'All requests are encrypted and authenticated via API keys.',
  },
  {
    icon: Code,
    title: 'Developer Friendly',
    description: 'SDKs for JavaScript, Python, and REST API access.',
  },
];

const API = () => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Key className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Developer API</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
            Build with <span className="gradient-text">SolFerno API</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Programmatically create and manage Solana tokens. Integrate token creation 
            into your applications with our powerful REST API.
          </p>
          
          <Link to="/docs" className="inline-block px-8 py-4 rounded-2xl font-semibold glass hover:bg-secondary/50 transition-all">
            View Documentation
          </Link>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl glass text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Quick <span className="gradient-text">Start</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Create your first token in just a few lines of code
          </p>
          
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden glass-strong">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground">example.ts</span>
                <button 
                  onClick={copyCode}
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto text-sm">
                <code className="text-muted-foreground">{codeExample}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            API <span className="gradient-text">Endpoints</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            RESTful endpoints for all token operations
          </p>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {endpoints.map((endpoint) => (
              <div 
                key={endpoint.path}
                className="p-6 rounded-2xl glass hover:bg-secondary/30 transition-all"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    endpoint.method === 'GET' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{endpoint.description}</p>
                <div className="space-y-2">
                  {endpoint.params.map((param) => (
                    <div key={param.name} className="flex items-start gap-2 text-sm">
                      <code className="text-primary">{param.name}</code>
                      <span className="text-muted-foreground/60">{param.type}</span>
                      {param.required && (
                        <span className="text-xs text-red-400">required</span>
                      )}
                      <span className="text-muted-foreground">— {param.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default API;
