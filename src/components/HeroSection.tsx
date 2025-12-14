import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 stars-bg opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">#1 Solana Token Launcher</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            StellarMint - Solana
            <br />
            <span className="text-primary">Token Launcher</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Take it to the <span className="text-primary font-semibold">Stars!</span>
          </p>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Create and deploy your Solana token effortlessly in seconds.
            <br className="hidden sm:block" />
            Reach the world and scale without limits!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 glow group">
              Create Token
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { value: '10K+', label: 'Tokens Created' },
              { value: '50K+', label: 'Active Users' },
              { value: '$2M+', label: 'Total Volume' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-4xl font-display font-bold text-primary">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Moon/Coin */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block animate-float">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 glow flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-foreground/10 to-transparent border border-foreground/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-foreground/20" style={{ marginLeft: '-40px', marginTop: '-20px' }} />
              <div className="w-4 h-4 rounded-full bg-foreground/15" style={{ marginLeft: '20px', marginTop: '30px' }} />
              <div className="w-3 h-3 rounded-full bg-foreground/10" style={{ marginLeft: '-30px', marginTop: '40px' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;