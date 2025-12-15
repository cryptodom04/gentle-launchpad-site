import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Droplets, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Create Your Token',
    description: 'Launch your Solana token using our simple creation tool with custom settings.',
  },
  {
    number: '02',
    title: 'Fund Your Wallet',
    description: 'Ensure you have enough SOL to cover liquidity and transaction fees.',
  },
  {
    number: '03',
    title: 'Add to DEX',
    description: 'Connect to Raydium or other Solana DEXs to create your liquidity pool.',
  },
  {
    number: '04',
    title: 'Start Trading',
    description: 'Your token is now tradeable! Monitor and manage your liquidity.',
  },
];

const features = [
  {
    icon: Droplets,
    title: 'Deep Liquidity',
    description: 'Access the largest liquidity pools on Solana ecosystem.',
  },
  {
    icon: TrendingUp,
    title: 'Low Slippage',
    description: 'Execute trades with minimal price impact thanks to concentrated liquidity.',
  },
  {
    icon: Shield,
    title: 'Secure Pools',
    description: 'Audited smart contracts ensure your liquidity is protected.',
  },
  {
    icon: Zap,
    title: 'Instant Swaps',
    description: 'Lightning-fast transactions powered by Solana blockchain.',
  },
];

const Liquidity = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Liquidity Solutions</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Add <span className="gradient-text">Liquidity</span> to Your Token
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Make your token tradeable on decentralized exchanges. Learn how to create 
            liquidity pools and enable seamless trading for your community.
          </p>
          
          <Link 
            to="/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all"
          >
            Create Token First
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Steps Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Follow these simple steps to add liquidity to your token
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative p-6 rounded-2xl glass group hover:bg-secondary/30 transition-all"
              >
                <span className="text-5xl font-bold text-primary/20 absolute top-4 right-4">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/50" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Add <span className="gradient-text">Liquidity</span>?
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Benefits of providing liquidity for your token
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl glass hover:bg-secondary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Liquidity;
