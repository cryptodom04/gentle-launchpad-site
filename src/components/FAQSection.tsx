import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'What is NebulaForge?',
    answer: 'NebulaForge is a premium platform that enables users to launch new tokens on the Solana blockchain without writing any code. Our platform provides a secure, efficient, and user-friendly environment for token creators of all experience levels.',
  },
  {
    question: 'How quickly can I create a token?',
    answer: 'Token creation takes less than 60 seconds! Simply connect your wallet, fill in the token details, upload a logo, and click create. Your token will be deployed to Solana mainnet instantly.',
  },
  {
    question: 'What are token authorities and how do they work?',
    answer: 'Solana tokens have three authority types: Mint Authority (create new tokens), Freeze Authority (pause transfers), and Update Authority (modify metadata). You can configure these during creation and revoke them later to build investor trust.',
  },
  {
    question: 'Is my wallet and funds safe?',
    answer: 'Absolutely. We never have access to your private keys. All transactions are signed directly in your wallet, and our smart contracts are audited. We only request the minimum permissions needed for token creation.',
  },
  {
    question: 'What wallets are supported?',
    answer: 'We support all major Solana wallets including Phantom, Solflare, Backpack, Ledger, Torus, and 20+ more. Any wallet compatible with Solana dApps will work seamlessly with NebulaForge.',
  },
  {
    question: 'How much does it cost to create a token?',
    answer: 'The creation fee is 0.05 SOL, which covers the token account creation, metadata upload, and transaction fees. This is a one-time fee with no hidden charges or subscriptions.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">FAQ</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Got <span className="gradient-text">Questions?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Find quick answers to common questions about NebulaForge
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "glass rounded-2xl overflow-hidden transition-all duration-300",
                  openIndex === index && "glow-primary"
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-lg pr-8">{faq.question}</span>
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0 transition-all duration-300",
                    openIndex === index && "bg-gradient-to-br from-primary to-accent rotate-180"
                  )}>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-colors",
                      openIndex === index && "text-white"
                    )} />
                  </div>
                </button>
                
                <div className={cn(
                  "grid transition-all duration-300",
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;