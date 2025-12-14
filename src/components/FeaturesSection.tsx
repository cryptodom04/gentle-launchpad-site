import { Shield, Zap, Sparkles, Wallet, HeadphonesIcon, Settings, Lock, Cpu, Globe } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'All tokens created through Solana\'s native programs with audited smart contracts.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Deploy in under 60 seconds with optimized transaction batching.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Sparkles,
    title: 'No-Code Required',
    description: 'Intuitive interface designed for everyone, from beginners to experts.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Wallet,
    title: 'Universal Wallet Support',
    description: 'Compatible with Phantom, Solflare, Backpack, and 20+ more wallets.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Lock,
    title: 'Authority Control',
    description: 'Full control over mint, freeze, and metadata authorities.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Global Infrastructure',
    description: 'Distributed nodes ensure 99.9% uptime and global accessibility.',
    color: 'from-indigo-500 to-purple-500',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 sm:mb-6">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Features</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
            Why Creators
            <br />
            <span className="gradient-text">Choose NebulaForge</span>
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need to launch, manage, and scale your token — all in one powerful platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:glow-primary transition-all duration-500 card-3d overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="card-3d-inner relative">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-4 sm:mb-6`}>
                  <div className="w-full h-full rounded-xl sm:rounded-2xl bg-background flex items-center justify-center">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
              
              {/* Corner decoration */}
              <div className={`absolute -bottom-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${feature.color} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;