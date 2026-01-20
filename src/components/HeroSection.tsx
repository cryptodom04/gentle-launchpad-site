import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Rocket, Flame, Gem } from 'lucide-react';
import solanaLogo from '@/assets/solana-logo.png';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/create');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      
      {/* Animated orbs - hidden on mobile */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/30 to-accent/20 rounded-full blur-[120px] animate-pulse-glow pointer-events-none hidden md:block" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-accent/20 to-primary/30 rounded-full blur-[100px] animate-pulse-glow pointer-events-none hidden md:block" style={{
        animationDelay: '1.5s'
      }} />
      
      <div className="container mx-auto px-4 relative z-10 pt-20 sm:pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full glass gradient-border mb-6 sm:mb-8 animate-fade-in">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-accent">Live on Mainnet</span>
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm">•</span>
            <span className="text-xs sm:text-sm text-muted-foreground">Token Launcher & Booster</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-[0.95] animate-fade-in-up px-2" style={{
            animationDelay: '0.1s'
          }}>
            <span className="block">Create Solana</span>
            <span className="block gradient-text pb-3">Tokens Instantly</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-in-up px-4" style={{
            animationDelay: '0.2s'
          }}>
            <span className="block mb-2">Launch & Take it to the Moon in under 60 seconds!</span>
            <span className="block text-foreground font-medium">Create. Deploy. Rugpull - with us and Solana. No limits.</span>
          </p>

          {/* CTA Button */}
          <div className="flex items-center justify-center mb-12 sm:mb-16 animate-fade-in-up px-4" style={{
            animationDelay: '0.3s'
          }}>
            <Button 
              size="lg" 
              onClick={handleCreateClick}
              className="text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 rounded-2xl bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 transition-all duration-300 glow-multi font-semibold group"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Launch Token
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-4 md:grid-cols-4 max-w-4xl mx-auto animate-fade-in-up px-2" style={{
            animationDelay: '0.4s'
          }}>
            {[{
              value: '2K+',
              label: 'Tokens Created',
              Icon: Rocket
            }, {
              value: '$3M+',
              label: 'Total Volume',
              Icon: Gem
            }, {
              value: '99.9%',
              label: 'Uptime',
              Icon: Zap
            }, {
              value: '<60s',
              label: 'Deploy Time',
              Icon: Flame
            }].map((stat) => (
              <div key={stat.label} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 group hover:glow-primary transition-all duration-500 card-3d text-center">
                <div className="card-3d-inner flex flex-col items-center">
                  <stat.Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-white" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Floating Token */}
      <div className="absolute right-4 lg:right-8 xl:right-16 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 animate-float-slow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/30 rounded-[2rem] blur-3xl" />
          <div className="absolute inset-4 lg:inset-6 rounded-[1.5rem] bg-gradient-to-br from-primary/50 via-accent/40 to-primary/30 p-1">
            <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-primary/60 via-accent/50 to-cyan-400/40" />
          </div>
          <div className="absolute inset-10 lg:inset-14 xl:inset-16 rounded-full bg-background/95 border border-border/50 flex items-center justify-center shadow-2xl">
            <img src={solanaLogo} alt="Solana" className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;