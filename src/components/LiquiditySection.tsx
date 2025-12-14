import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Lock, Coins } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Create Liquidity Pool',
    description: 'Set up liquidity pools for your tokens with just a few clicks.',
  },
  {
    icon: Lock,
    title: 'Lock Liquidity',
    description: 'Lock your liquidity to build investor trust and ensure stability.',
  },
  {
    icon: Coins,
    title: 'Manage Positions',
    description: 'Track and manage your liquidity positions across multiple pools.',
  },
];

const LiquiditySection = () => {
  return (
    <section id="liquidity" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 stars-bg opacity-20" />
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Enhance Your
              <br />
              <span className="text-primary">Solana Token</span>
              <br />
              Experience
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Create, manage, and control your tokens effortlessly with secure
              transactions, instant deployment, and zero coding required.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl glass">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="glow group">
              Manage Liquidity
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="relative">
            <div className="glass rounded-3xl p-8 glow animate-float">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Coins className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">Liquidity Pool</h3>
                <p className="text-sm text-muted-foreground">SOL / STELLAR</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Total Value Locked</span>
                  <span className="font-semibold text-primary">$503,372.32</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">APY</span>
                  <span className="font-semibold text-primary">127.4%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Your Position</span>
                  <span className="font-semibold">$12,450.00</span>
                </div>
              </div>

              <Button className="w-full mt-6">Add Liquidity</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiquiditySection;