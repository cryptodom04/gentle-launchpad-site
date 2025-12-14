import { Rocket, Sparkles, Check, Copy, Image as ImageIcon } from 'lucide-react';

const TokenCreatorForm = () => {
  return (
    <section id="create" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-50" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text */}
          <div className="reveal-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Token Creator</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Design Your
              <br />
              <span className="gradient-text">Perfect Token</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Customize every aspect of your Solana token. From supply to authorities — you have complete control.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                'Instant deployment on Solana mainnet',
                'Full metadata support with images',
                'Configurable mint & freeze authorities',
                'Compatible with all major wallets',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - MacBook Mockup (Static Presentation) */}
          <div className="reveal-right">
            {/* MacBook Frame */}
            <div className="relative pointer-events-none select-none">
              {/* MacBook Screen */}
              <div className="bg-[#1a1a1a] rounded-2xl p-2 shadow-2xl shadow-black/50">
                {/* Screen bezel */}
                <div className="relative bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-xl overflow-hidden">
                  {/* Camera notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#333] flex items-center justify-center z-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                  </div>
                  
                  {/* Screen Content */}
                  <div className="pt-6 pb-4 px-4">
                    <div className="glass-strong rounded-2xl p-6 gradient-border relative overflow-hidden">
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[80px]" />
                      
                      <div className="space-y-4 relative">
                        {/* Logo Upload - Static */}
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                              <span className="text-[10px] text-muted-foreground">Upload Logo</span>
                            </div>
                          </div>
                        </div>

                        {/* Token Name & Symbol - Static */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">Token Name</p>
                            <div className="bg-secondary/50 border border-border/50 rounded-lg h-10 px-3 flex items-center">
                              <span className="text-sm text-muted-foreground">My Token</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">Symbol</p>
                            <div className="bg-secondary/50 border border-border/50 rounded-lg h-10 px-3 flex items-center">
                              <span className="text-sm text-muted-foreground">TKN</span>
                            </div>
                          </div>
                        </div>

                        {/* Decimals - Static */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-medium text-foreground">Decimals</p>
                            <span className="text-lg font-bold gradient-text">9</span>
                          </div>
                          {/* Static slider representation */}
                          <div className="relative h-2 bg-secondary rounded-full">
                            <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-primary to-accent rounded-full" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full shadow-lg" />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>0</span>
                            <span>9 (default)</span>
                            <span>18</span>
                          </div>
                        </div>

                        {/* Supply - Static */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">Total Supply</p>
                          <div className="relative bg-secondary/50 border border-border/50 rounded-lg h-10 px-3 flex items-center justify-between">
                            <span className="text-sm text-foreground">1,000,000,000</span>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Authority Toggles - Static */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                            <div>
                              <p className="font-medium text-xs">Freeze</p>
                              <p className="text-[10px] text-muted-foreground">Authority</p>
                            </div>
                            {/* Static toggle OFF */}
                            <div className="w-9 h-5 bg-secondary rounded-full relative">
                              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-muted-foreground rounded-full" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                            <div>
                              <p className="font-medium text-xs">Mint</p>
                              <p className="text-[10px] text-muted-foreground">Authority</p>
                            </div>
                            {/* Static toggle ON */}
                            <div className="w-9 h-5 bg-gradient-to-r from-primary to-accent rounded-full relative">
                              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-foreground rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Create Button - Static */}
                        <div className="w-full text-sm py-4 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-accent text-center font-semibold flex items-center justify-center gap-2 glow-multi">
                          <Rocket className="w-4 h-4" />
                          Create Token
                        </div>

                        <p className="text-center text-[10px] text-muted-foreground">
                          Creation fee: <span className="text-foreground font-medium">0.05 SOL</span> • Instant deployment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* MacBook Bottom/Hinge */}
              <div className="relative mx-auto">
                {/* Notch cutout */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 h-2 bg-[#1a1a1a] rounded-b-lg z-10" />
                {/* Bottom part */}
                <div className="h-4 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] rounded-b-xl mx-4" />
                {/* Base */}
                <div className="h-2 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-b-2xl mx-2 shadow-lg" />
              </div>
              
              {/* Reflection/Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-2xl -z-10 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenCreatorForm;
