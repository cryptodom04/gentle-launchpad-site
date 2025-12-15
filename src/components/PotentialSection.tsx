import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, TrendingUp, Wallet, Send, ArrowUpDown, DollarSign } from 'lucide-react';
import solLogo from '@/assets/sol-logo.png';
import usdcLogo from '@/assets/usdc-logo.png';
import pepeLogo from '@/assets/pepe-logo.png';
import phantomGhost from '@/assets/phantom-ghost.jpg';

const PotentialSection = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-l from-primary/30 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-gradient-to-r from-accent/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
      
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
          {/* Left side - iPhone 17 Pro Max mockup with stats */}
          <div className="relative flex justify-center lg:justify-start">
            {/* iPhone 17 Pro Max mockup */}
            <div className="relative">
              {/* Titanium frame */}
              <div className="w-[260px] sm:w-[300px] h-[540px] sm:h-[620px] rounded-[48px] sm:rounded-[55px] bg-gradient-to-b from-[#3a3a3c] via-[#2c2c2e] to-[#1c1c1e] p-[3px] shadow-[0_0_60px_rgba(0,0,0,0.5),0_25px_50px_-12px_rgba(0,0,0,0.8)]">
                {/* Inner titanium edge */}
                <div className="w-full h-full rounded-[45px] sm:rounded-[52px] bg-gradient-to-b from-[#48484a] to-[#2c2c2e] p-[2px]">
                  {/* Screen bezel */}
                  <div className="w-full h-full rounded-[43px] sm:rounded-[50px] bg-black p-[8px] sm:p-[10px]">
                    {/* Screen */}
                    <div className="w-full h-full rounded-[35px] sm:rounded-[40px] bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] overflow-hidden relative">
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[72px] sm:w-[85px] h-[20px] sm:h-[24px] bg-black rounded-full flex items-center justify-center">
                        <div className="w-[6px] h-[6px] rounded-full bg-[#1a1a1a] border border-[#2a2a2a]" />
                      </div>
                      
                      {/* Phantom Wallet UI */}
                      <div className="pt-12 sm:pt-14 px-4 h-full">
                        {/* Phantom Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {/* Phantom ghost icon */}
                            <img src={phantomGhost} alt="SolFerno" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
                            <div>
                              <p className="text-[10px] sm:text-xs text-[#ab9ff2]">SolFerno</p>
                              <p className="text-[10px] sm:text-xs font-medium text-white/90">Wallet 1</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#14f195]" />
                            <span className="text-[8px] text-[#14f195]">Mainnet</span>
                          </div>
                        </div>
                        
                        {/* Balance - Phantom style */}
                        <div className="mb-5 text-center">
                          <p className="text-3xl sm:text-4xl font-bold text-white">$15,041.89</p>
                          <p className="text-xs text-[#14f195] mt-1">+$152.89 (+1.03%)</p>
                        </div>
                        
                        {/* Action buttons - Phantom style */}
                        <div className="grid grid-cols-4 gap-2 mb-5">
                          {[
                            { icon: Wallet, label: 'Receive' },
                            { icon: Send, label: 'Send' },
                            { icon: ArrowUpDown, label: 'Swap' },
                            { icon: DollarSign, label: 'Buy' },
                          ].map((action) => (
                            <div key={action.label} className="flex flex-col items-center gap-1">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#232336] hover:bg-[#2d2d44] flex items-center justify-center transition-colors">
                                <action.icon className="w-4 h-4 text-[#ab9ff2]" />
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-white/60">{action.label}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Token list - Phantom style */}
                        <div className="space-y-2">
                          {[
                            { name: 'USD Coin', symbol: 'USDC', amount: '$10,049.52', tokens: '10,049.16', change: '+$0.36', logo: usdcLogo },
                            { name: 'Solana', symbol: 'SOL', amount: '$4,944.10', tokens: '31.24', change: '+$153.80', logo: solLogo },
                            { name: 'Pepe', symbol: 'PEPE', amount: '$31.11', tokens: '1,420,690', change: '+$1.45', logo: pepeLogo },
                          ].map((token) => (
                            <div key={token.symbol} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#232336]/80 hover:bg-[#2d2d44]/80 transition-colors">
                              <div className="flex items-center gap-2.5">
                                <img src={token.logo} alt={token.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
                                <div>
                                  <p className="text-xs sm:text-sm font-medium text-white">{token.name}</p>
                                  <p className="text-[9px] sm:text-[10px] text-white/50">{token.tokens} {token.symbol}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs sm:text-sm font-medium text-white">{token.amount}</p>
                                <p className="text-[9px] sm:text-[10px] text-[#14f195]">{token.change}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stat card 1 - Success rate */}
              <div className="absolute -right-4 sm:-right-16 top-36 sm:top-44 glass-strong rounded-2xl p-4 sm:p-6 border border-border/50 shadow-xl">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">99.9%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Successful Launches</p>
              </div>
              
              {/* Stat card 2 - Profit */}
              <div className="absolute -right-2 sm:-right-8 bottom-4 sm:bottom-8 bg-gradient-to-br from-primary to-accent rounded-2xl p-4 sm:p-6 shadow-xl">
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
