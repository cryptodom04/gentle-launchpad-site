import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is StellarMint?',
    answer: 'It\'s a platform that enables users to launch new tokens on the Solana blockchain. The launchpad helps with token creation while ensuring a secure and efficient environment for creators.',
  },
  {
    question: 'How can I create a token on the Solana blockchain?',
    answer: 'You can easily launch your token on Solana without writing any code by using StellarMint. Simply enter the key details—such as the token name, ticker symbol, initial supply, number of decimals—and optionally adding an image, description, and social links to round out your token\'s profile.',
  },
  {
    question: 'How can I manage token authorities on Solana?',
    answer: 'On Solana, each token is controlled by three distinct authority types—Mint, Freeze, and Mutability. Mint Authority lets you issue new tokens, Freeze Authority gives you the power to pause transfers, and Mutability Authority allows you to modify token details. To build and maintain investor confidence, it\'s critical to manage these permissions carefully and revoke them when appropriate.',
  },
  {
    question: 'What support resources are available if I encounter issues?',
    answer: 'If you run into any issues during your token launch, our dedicated support is available through our Discord channel. Join our community to connect directly with our team and fellow users who can help troubleshoot problems, answer your questions, and provide guidance throughout the process.',
  },
  {
    question: 'Do I need programming skills to launch a token?',
    answer: 'Not at all. Our platform is designed for everyone—from seasoned developers to beginners—so you can launch your token easily without any coding experience.',
  },
  {
    question: 'How can I confirm that my token launch was successful?',
    answer: 'After launching, you can verify your token\'s creation by checking your connected Solana wallet and using Solana block explorers. If you need any help during the process, our support team is available on Discord.',
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 stars-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground">
            Find quick answers to all common questions about StellarMint
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="hover:no-underline py-5 text-left">
                  <span className="font-display font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;