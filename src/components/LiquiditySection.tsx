import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Lock, Coins, ArrowUpRight, Droplets } from 'lucide-react';

const pools = [
  { pair: 'SOL/USDC', tvl: '$2.4M', apy: '127%', change: '+12.4%' },
  { pair: 'NEBULA/SOL', tvl: '$856K', apy: '89%', change: '+8.2%' },
  { pair: 'BONK/SOL', tvl: '$1.2M', apy: '156%', change: '+24.1%' },
];

const LiquiditySection = () => {
  return (
    <section id="liquidity" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Large decorative orb */}
      <div className="absolute -left-64 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent/20 to-primary/10 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Droplets className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Liquidity Pools</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Maximize Your
              <br />
              <span className="gradient-text">Token's Potential</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-md">
              Create and manage liquidity pools with ease. Lock liquidity to build trust and attract investors.
            </p>

            {/* Feature cards */}
            <div className="space-y-4 mb-10">
              {[
                { icon: TrendingUp, title: 'Create Pools', desc: 'Launch liquidity pools with custom parameters' },
                { icon: Lock, title: 'Lock Liquidity', desc: 'Build investor trust with time-locked LP tokens' },
                { icon: Coins, title: 'Earn Rewards', desc: 'Collect fees from every swap in your pool' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl glass group hover:glow-accent transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="px-8 py-6 rounded-2xl bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-all glow-accent font-semibold group"
            >
              Start Providing Liquidity
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right side - Pool Dashboard */}
          <div className="relative">
            {/* Main card */}
            <div className="glass-strong rounded-3xl p-8 gradient-border">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Top Pools</h3>
                  <p className="text-sm text-muted-foreground">Highest APY pools</p>
                </div>
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Pool list */}
              <div className="space-y-4">
                {pools.map((pool, index) => (
                  <div 
                    key={pool.pair}
                    className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary absolute -right-3 top-0 border-2 border-card" />
                      </div>
                      <div className="ml-2">
                        <p className="font-semibold">{pool.pair}</p>
                        <p className="text-xs text-muted-foreground">TVL: {pool.tvl}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">{pool.apy}</p>
                      <p className="text-xs text-green-500">{pool.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/50">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">$12.4M</p>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">2,847</p>
                  <p className="text-sm text-muted-foreground">Active Pools</p>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-accent/30 to-transparent rounded-2xl rotate-12 blur-sm" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiquiditySection;