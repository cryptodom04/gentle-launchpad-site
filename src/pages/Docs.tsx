import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Book, Terminal, Key, Shield, Zap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    content: [
      {
        heading: 'Installation',
        text: 'Install the SolFerno SDK using npm or yarn:',
        code: `npm install @solferno/sdk
# or
yarn add @solferno/sdk`,
      },
      {
        heading: 'Initialize Client',
        text: 'Create a new SolFerno client instance with your API key:',
        code: `import { SolFerno } from '@solferno/sdk';

const client = new SolFerno({
  apiKey: 'sf_live_xxxxxxxxxxxx',
  network: 'mainnet' // or 'devnet'
});`,
      },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Key,
    content: [
      {
        heading: 'API Keys',
        text: 'All API requests require authentication via API key. Include your key in the Authorization header:',
        code: `Authorization: Bearer sf_live_xxxxxxxxxxxx`,
      },
      {
        heading: 'Key Types',
        text: 'SolFerno provides two types of API keys:',
        list: [
          'Live keys (sf_live_*) — For production, mainnet transactions',
          'Test keys (sf_test_*) — For development, devnet only',
        ],
      },
    ],
  },
  {
    id: 'tokens',
    title: 'Token Operations',
    icon: Terminal,
    content: [
      {
        heading: 'Create Token',
        text: 'Create a new SPL token with custom parameters:',
        code: `const token = await client.tokens.create({
  name: 'My Token',
  symbol: 'MTK',
  supply: 1000000000,
  decimals: 9,
  description: 'My awesome token',
  revokeMint: true,
  revokeFreeze: true,
  revokeUpdate: false
});

// Response
{
  mint: '7xKXtQrN5...',
  signature: '4sGjMW1s...',
  explorer: 'https://solscan.io/token/7xKXtQrN5...'
}`,
      },
      {
        heading: 'Get Token Info',
        text: 'Retrieve metadata for an existing token:',
        code: `const info = await client.tokens.get('7xKXtQrN5...');

// Response
{
  mint: '7xKXtQrN5...',
  name: 'My Token',
  symbol: 'MTK',
  decimals: 9,
  supply: 1000000000,
  holders: 42,
  frozen: false
}`,
      },
      {
        heading: 'Burn Tokens',
        text: 'Burn tokens from a specified account:',
        code: `const result = await client.tokens.burn({
  mint: '7xKXtQrN5...',
  amount: 1000000,
  owner: 'wallet_address'
});`,
      },
    ],
  },
  {
    id: 'errors',
    title: 'Error Handling',
    icon: AlertCircle,
    content: [
      {
        heading: 'Error Codes',
        text: 'The API uses standard HTTP status codes:',
        list: [
          '200 — Success',
          '400 — Bad Request (invalid parameters)',
          '401 — Unauthorized (invalid API key)',
          '402 — Payment Required (insufficient credits)',
          '429 — Too Many Requests (rate limited)',
          '500 — Internal Server Error',
        ],
      },
      {
        heading: 'Error Response Format',
        text: 'All errors return a JSON object with error details:',
        code: `{
  "error": {
    "code": "INVALID_SUPPLY",
    "message": "Supply must be greater than 0",
    "details": {
      "field": "supply",
      "value": 0
    }
  }
}`,
      },
    ],
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits',
    icon: Shield,
    content: [
      {
        heading: 'Request Limits',
        text: 'API requests are rate limited based on your plan:',
        list: [
          'Free: 10 requests/minute',
          'Pro: 100 requests/minute',
          'Enterprise: Unlimited',
        ],
      },
      {
        heading: 'Rate Limit Headers',
        text: 'Each response includes rate limit information:',
        code: `X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699200000`,
      },
    ],
  },
];

const Docs = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Book className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Documentation</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            API <span className="gradient-text">Documentation</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate SolFerno into your applications.
          </p>
        </section>

        {/* Navigation + Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-28 p-4 rounded-2xl glass">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Contents</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
                
                <div className="mt-6 pt-6 border-t border-border/50">
                  <Link 
                    to="/api"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Back to API Overview
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  
                  <div className="space-y-8">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="space-y-3">
                        <h3 className="text-lg font-semibold">{item.heading}</h3>
                        <p className="text-muted-foreground">{item.text}</p>
                        
                        {item.list && (
                          <ul className="space-y-2 ml-4">
                            {item.list.map((listItem, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                {listItem}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {item.code && (
                          <div className="rounded-xl overflow-hidden glass-strong">
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                            </div>
                            <pre className="p-4 overflow-x-auto text-sm">
                              <code className="text-muted-foreground">{item.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;
