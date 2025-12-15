import { useState } from 'react';
import { ChevronDown, HelpCircle, Zap, Shield, Coins, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: Zap,
    questions: [
      {
        question: 'What is SolFerno?',
        answer: 'SolFerno is a platform for creating tokens and ragpulls on the Solana blockchain. We enable anyone to create their own SPL token without having to write code or understand the technical details.'
      },
      {
        question: 'How do I start creating tokens?',
        answer: 'Simply go to the Create page, fill out the form with your token parameters (name, symbol, supply), connect your Solana wallet and pay the fee. The token will be created automatically.'
      },
      {
        question: 'Do I need technical knowledge?',
        answer: 'No! Our platform is designed so anyone can create a token. The intuitive interface will guide you through the entire process step by step.'
      }
    ]
  },
  {
    title: 'Security',
    icon: Shield,
    questions: [
      {
        question: 'Is the platform secure?',
        answer: 'Yes, we use verified smart contracts and follow security best practices. All transactions happen directly on the Solana blockchain, ensuring transparency and immutability.'
      },
      {
        question: 'How are my funds protected?',
        answer: 'We never store your private keys. All operations are signed in your wallet. The platform only creates transactions but has no access to your funds.'
      },
      {
        question: 'Can I lose my tokens?',
        answer: 'After creation, tokens belong only to you and are stored in your wallet. You can only lose them by losing access to your wallet, so keep your seed phrase in a safe place.'
      }
    ]
  },
  {
    title: 'Tokens & Fees',
    icon: Coins,
    questions: [
      {
        question: 'How much does it cost to create a token?',
        answer: 'The cost of creating a token depends on the selected parameters. The base price starts at 1.35 SOL and includes all necessary blockchain operations.'
      },
      {
        question: 'What parameters can I customize?',
        answer: 'You can customize: token name, symbol (ticker), total supply, decimal places, description, icon and metadata.'
      },
      {
        question: 'Can I modify the token after creation?',
        answer: 'Some parameters (metadata, icon) can be changed if you kept admin rights. Core parameters (supply, decimals) are immutable.'
      }
    ]
  },
  {
    title: 'Community',
    icon: Users,
    questions: [
      {
        question: 'Is there support available?',
        answer: 'Yes! We provide support via Telegram and Discord. Our team is ready to answer any questions and help with token creation.'
      },
      {
        question: 'How can I contact the team?',
        answer: 'You can message us on Telegram @solferno_support or join our Discord server. Email support is also available.'
      }
    ]
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  const toggleItem = (category: string, index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [category]: prev[category] === index ? null : index
    }));
  };

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
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Support Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Frequently Asked{' '}
              <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to popular questions about creating tokens on Solana
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: '24/7', label: 'Support' },
              { value: '< 60s', label: 'Creation Time' },
              { value: '99.9%', label: 'Uptime' },
              { value: '2K+', label: 'Tokens Created' }
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {faqCategories.map((category) => (
              <div key={category.title} className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">{category.title}</h2>
                </div>
                
                <div className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <div 
                      key={index}
                      className="rounded-2xl bg-secondary/30 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(category.title, index)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-medium text-sm sm:text-base pr-4">{faq.question}</span>
                        <ChevronDown 
                          className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                            openItems[category.title] === index && "rotate-180"
                          )}
                        />
                      </button>
                      
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          openItems[category.title] === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
