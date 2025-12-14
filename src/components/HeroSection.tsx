import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, ChevronDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/30 to-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-accent/20 to-primary/30 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      {/* Floating geometric shapes */}
      <div className="absolute top-32 left-[10%] w-24 h-24 border border-primary/30 rounded-2xl rotate-12 animate-float opacity-40" style={{ animationDelay: '0s' }} />
      <div className="absolute top-48 right-[15%] w-16 h-16 border border-accent/40 rounded-full animate-float opacity-50" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-[20%] w-20 h-20 border border-primary/20 rounded-3xl -rotate-12 animate-float opacity-30" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 right-[10%] w-12 h-12 bg-gradient-to-br from-accent/20 to-transparent rounded-xl rotate-45 animate-float" style={{ animationDelay: '0.5s' }} />
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass gradient-border mb-8 animate-fade-in"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">Live on Mainnet</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">#1 Token Launcher</span>
          </div>

          {/* Main Heading */}
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[0.9] animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="block">Create Solana</span>
            <span className="block gradient-text">Tokens Instantly</span>
          </h1>

          {/* Subheading */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Launch your token in under 60 seconds. No code required.
            <br className="hidden sm:block" />
            <span className="text-foreground font-medium">Trusted by 50,000+ creators worldwide.</span>
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link to="/create">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-7 rounded-2xl bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 transition-all duration-300 glow-multi font-semibold group"
              >
                <Zap className="w-5 h-5 mr-2" />
                Launch Token
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg px-8 py-7 rounded-2xl glass border-border/50 hover:bg-secondary/50 font-medium"
            >
              <Sparkles className="w-5 h-5 mr-2 text-accent" />
              View Examples
            </Button>
          </div>

          {/* Stats Grid */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            {[
              { value: '50K+', label: 'Tokens Created', icon: '🚀' },
              { value: '$12M+', label: 'Total Volume', icon: '💎' },
              { value: '99.9%', label: 'Uptime', icon: '⚡' },
              { value: '<60s', label: 'Deploy Time', icon: '🔥' },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="glass rounded-2xl p-5 group hover:glow-primary transition-all duration-500 card-3d"
              >
                <div className="card-3d-inner">
                  <span className="text-2xl mb-2 block">{stat.icon}</span>
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      {/* 3D Floating Token */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <div className="relative w-80 h-80 animate-float-slow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/30 rounded-full blur-3xl" />
          <div className="absolute inset-8 morph-blob bg-gradient-to-br from-primary/60 to-accent/50" />
          <div className="absolute inset-16 rounded-full bg-gradient-to-br from-background to-card border border-border/50 flex items-center justify-center">
            <span className="text-6xl">💫</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;