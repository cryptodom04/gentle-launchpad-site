import { Shield, Zap, Sparkles, Wallet, HeadphonesIcon, Settings } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Security',
    description: 'All tokens are created through Solana\'s native API, ensuring maximum security.',
  },
  {
    icon: Zap,
    title: 'Speed',
    description: 'Create tokens in seconds thanks to optimized smart contracts.',
  },
  {
    icon: Sparkles,
    title: 'Simplicity',
    description: 'Intuitive interface requires no programming skills or blockchain knowledge.',
  },
  {
    icon: Wallet,
    title: 'Wallet Integration',
    description: 'Support for all popular Solana wallets for convenient interaction.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our team is always ready to help with any token creation questions.',
  },
  {
    icon: Settings,
    title: 'Flexible Customization',
    description: 'Customize token parameters to suit your needs with advanced options.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 stars-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">StellarMint</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create, manage, and control your tokens effortlessly with secure transactions,
            instant deployment, and zero coding required
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group glass rounded-2xl p-6 hover:glow-sm transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;