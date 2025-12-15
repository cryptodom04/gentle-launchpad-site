import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    icon: Database,
    title: "We Don't Collect Information",
    content: [
      'We do not store wallet addresses or transactions.',
      'Transaction history and token creation data on the Solana blockchain',
      'Usage data including pages visited and features used',
      'Device information such as browser type and operating system'
    ]
  },
  {
    icon: Eye,
    title: 'Information Sharing',
    content: [
      'We do not sell your personal information to third parties',
      'Blockchain transactions are publicly visible by nature',
      'We may share data with service providers who assist our operations'
    ]
  },
  {
    icon: Shield,
    title: 'Data Security',
    content: [
      'We implement industry-standard security measures',
      'We never store your private keys or seed phrases',
      'All sensitive data is encrypted in transit and at rest',
      'Regular security audits are conducted on our systems'
    ]
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    content: [
      'Access and review your personal data',
      'Request deletion of your account data',
      'Opt out of marketing communications',
      'Export your data in a portable format'
    ]
  },
  {
    icon: Globe,
    title: 'Cookies & Tracking',
    content: [
      'We use essential cookies for platform functionality',
      'Analytics cookies help us understand usage patterns',
      'You can control cookie preferences in your browser',
      'Third-party services may use their own cookies'
    ]
  }
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy matters to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: June 10, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pt-8 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Introduction */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              SolFerno ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our token creation platform on the Solana blockchain. Please read this policy carefully to understand our practices regarding your personal data.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
