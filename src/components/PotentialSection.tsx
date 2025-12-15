import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, TrendingUp, Wallet, Send, ArrowUpDown, DollarSign } from 'lucide-react';

const PotentialSection = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-l from-primary/30 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-gradient-to-r from-accent/20 to-transparent rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Unlock the Full Potential of Your
            <br />
            <span className="gradient-text">Solana Token Effortlessly</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Create, manage, and launch your Solana token effortlessly with secure transactions, instant deployment, and zero coding required!
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Left side - Phone mockup with stats */}
          <div className="relative flex justify-center lg:justify-start">
            {/* Phone mockup */}
            <div className="relative">
              <div className="w-[260px] sm:w-[300px] h-[520px] sm:h-[600px] rounded-[40px] bg-gradient-to-b from-secondary to-background border border-border/50 p-3 shadow-2xl">
                <div className="w-full h-full rounded-[32px] bg-background overflow-hidden">
                  {/* Phone header */}
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground">@solferno_user</p>
                          <p className="text-xs font-medium">Wallet</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      </div>
                    </div>
                    
                    {/* Balance */}
                    <div className="mb-4">
                      <p className="text-3xl sm:text-4xl font-bold">$15,041.89</p>
                      <p className="text-xs text-accent">+$152.89 +1.03%</p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { icon: Wallet, label: 'Receive' },
                        { icon: Send, label: 'Send' },
                        { icon: ArrowUpDown, label: 'Swap' },
                        { icon: DollarSign, label: 'Buy' },
                      ].map((action) => (
                        <div key={action.label} className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center">
                            <action.icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{action.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Token list */}
                  <div className="px-4 space-y-2">
                    {[
                      { name: 'USDC', amount: '$10,049.52', change: '+$0.36', color: 'from-blue-500 to-cyan-500' },
                      { name: 'Solana', amount: '$4,944.10', change: '+$153.80', color: 'from-purple-500 to-pink-500' },
                      { name: 'NEBULA', amount: '$31.11', change: '+$1.45', color: 'from-primary to-accent' },
                    ].map((token) => (
                      <div key={token.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.color}`} />
                          <div>
                            <p className="text-sm font-medium">{token.name}</p>
                            <p className="text-[10px] text-muted-foreground">Token</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{token.amount}</p>
                          <p className="text-[10px] text-accent">{token.change}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Stat card 1 - Success rate */}
              <div className="absolute -right-4 sm:-right-16 top-16 sm:top-20 glass-strong rounded-2xl p-4 sm:p-6 border border-border/50 shadow-xl">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">99.9%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Successful Launches</p>
              </div>
              
              {/* Stat card 2 - Profit */}
              <div className="absolute -right-2 sm:-right-8 bottom-24 sm:bottom-32 bg-gradient-to-br from-primary to-accent rounded-2xl p-4 sm:p-6 shadow-xl">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">3.2x</p>
                <p className="text-xs sm:text-sm text-white/80 mt-1">Average Profit</p>
              </div>
            </div>
          </div>

          {/* Right side - CTA Card */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 gradient-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-xs sm:text-sm text-accent font-medium">Boost Your Token</span>
              </div>
            </div>
            
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Create, Deploy, Boost & Earn with Us!
            </h3>
            
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Our automated platform ensures secure token creation with full control over your liquidity. Build confidence for potential buyers and generate profit with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/create" className="flex-1">
                <Button 
                  size="lg" 
                  className="w-full py-5 sm:py-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 transition-all duration-300 glow-multi font-semibold group text-sm sm:text-base"
                >
                  Create Token
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 py-5 sm:py-6 rounded-xl sm:rounded-2xl glass border-border/50 hover:bg-secondary/50 font-medium text-sm sm:text-base"
              >
                Learn More
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-6 sm:mt-8 pt-6 border-t border-border/30">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold gradient-text">2K+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Tokens Created</p>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold gradient-text">$3M+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Volume</p>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold gradient-text">&lt;60s</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Deploy Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PotentialSection;
