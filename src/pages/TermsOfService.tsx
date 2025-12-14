import { FileText, AlertTriangle, Scale, Ban, Coins, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: 'By accessing or using NebulaForge, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of any changes.'
  },
  {
    icon: Coins,
    title: 'Token Creation Services',
    content: 'NebulaForge provides tools for creating SPL tokens on the Solana blockchain. You are solely responsible for the tokens you create, including their name, symbol, supply, and any associated metadata. We do not endorse, verify, or guarantee the legitimacy of any tokens created through our platform. Token creation fees are non-refundable once the transaction is confirmed on the blockchain.'
  },
  {
    icon: AlertTriangle,
    title: 'Risks and Disclaimers',
    content: 'Cryptocurrency and blockchain technologies involve significant risks. You acknowledge that: (1) the value of tokens can be highly volatile; (2) blockchain transactions are irreversible; (3) you may lose access to your tokens if you lose your wallet credentials; (4) regulatory changes may affect your ability to use tokens; (5) smart contracts may contain bugs or vulnerabilities. NebulaForge is provided "as is" without warranties of any kind.'
  },
  {
    icon: Ban,
    title: 'Prohibited Activities',
    content: 'You agree not to use NebulaForge for: creating tokens intended for fraud or scams; impersonating other projects or entities; money laundering or terrorist financing; violating any applicable laws or regulations; attempting to exploit or harm our platform or users; creating tokens with misleading or deceptive information; any activity that could damage our reputation or operations.'
  },
  {
    icon: Scale,
    title: 'Limitation of Liability',
    content: 'To the maximum extent permitted by law, NebulaForge and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or tokens. Our total liability shall not exceed the amount you paid for our services in the 12 months preceding the claim.'
  },
  {
    icon: RefreshCw,
    title: 'Modifications and Termination',
    content: 'We reserve the right to modify, suspend, or discontinue any part of our services at any time without notice. We may also terminate or suspend your access to the platform if we believe you have violated these terms or engaged in any prohibited activities. Upon termination, your right to use the platform will immediately cease.'
  }
];

const TermsOfService = () => {
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
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using our token creation platform.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: June 10, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Introduction */}
          <div className="glass rounded-3xl p-6 sm:p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to NebulaForge. These Terms of Service ("Terms") govern your use of our token creation platform and related services. By using NebulaForge, you enter into a binding agreement with us. Please ensure you understand and agree to these terms before proceeding.
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
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Governing Law */}
          <div className="glass rounded-3xl p-6 sm:p-8 mt-8">
            <h3 className="text-xl font-bold mb-4">Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these terms or your use of NebulaForge shall be resolved through binding arbitration.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
