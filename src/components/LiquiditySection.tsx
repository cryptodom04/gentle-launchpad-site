import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Lock, Coins, ArrowUpRight, Droplets } from 'lucide-react';

const pools = [
  { pair: 'SOL/USDC', tvl: '$2.4M', apy: '127%', change: '+12.4%' },
  { pair: 'NEBULA/SOL', tvl: '$856K', apy: '89%', change: '+8.2%' },
  { pair: 'BONK/SOL', tvl: '$1.2M', apy: '156%', change: '+24.1%' },
];

const LiquiditySection = () => {
  return (
    <section id="liquidity" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Large decorative orb */}
      <div className="absolute -left-64 top-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-accent/20 to-primary/10 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 sm:mb-6">
              <Droplets className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Liquidity Pools</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Maximize Your
              <br />
              <span className="gradient-text">Token's Potential</span>
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-10 max-w-md">
              Create and manage liquidity pools with ease. Lock liquidity to build trust and attract investors.
            </p>

            {/* Feature cards */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
              {[
                { icon: TrendingUp, title: 'Create Pools', desc: 'Launch liquidity pools with custom parameters' },
                { icon: Lock, title: 'Lock Liquidity', desc: 'Build investor trust with time-locked LP tokens' },
                { icon: Coins, title: 'Earn Rewards', desc: 'Collect fees from every swap in your pool' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl glass group hover:glow-accent transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-all glow-accent font-semibold group text-sm sm:text-base"
            >
              Start Providing Liquidity
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right side - Pool Dashboard */}
          <div className="relative">
            {/* Main card */}
            <div className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-8 gradient-border">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">Top Pools</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Highest APY pools</p>
                </div>
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent text-xs sm:text-sm">
                  View All <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>

              {/* Pool list */}
              <div className="space-y-3 sm:space-y-4">
                {pools.map((pool, index) => (
                  <div 
                    key={pool.pair}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent to-primary absolute -right-2 sm:-right-3 top-0 border-2 border-card" />
                      </div>
                      <div className="ml-1 sm:ml-2">
                        <p className="font-semibold text-sm sm:text-base">{pool.pair}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">TVL: {pool.tvl}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base sm:text-lg font-bold text-accent">{pool.apy}</p>
                      <p className="text-[10px] sm:text-xs text-green-500">{pool.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">$12.4M</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Value Locked</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">2,847</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Pools</p>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-8 -right-8 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-accent/30 to-transparent rounded-2xl rotate-12 blur-sm hidden sm:block" />
            <div className="absolute -bottom-6 -left-6 w-14 sm:w-20 h-14 sm:h-20 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-sm hidden sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiquiditySection;