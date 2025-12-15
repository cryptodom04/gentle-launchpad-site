import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const blogContent: Record<string, {
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: string[];
}> = {
  'how-to-create-solana-token': {
    title: 'How to Create Your First Solana Token in 60 Seconds',
    date: '2024-12-10',
    readTime: '5 min',
    category: 'Tutorial',
    content: [
      'Creating a token on Solana has never been easier. With SolFerno, you can launch your own SPL token in under a minute, without writing a single line of code.',
      '## Getting Started',
      'First, navigate to our Create Token page and connect your Solana wallet. We support all major wallets including Phantom, Solflare, and Backpack.',
      '## Step 1: Basic Information',
      'Enter your token name (up to 32 characters) and symbol (up to 10 characters). These will be visible on all Solana explorers and DEXs.',
      '## Step 2: Token Economics',
      'Set your decimals (typically 9 for Solana tokens) and initial supply. The supply will be minted directly to your connected wallet.',
      '## Step 3: Upload Logo',
      'Add a professional logo for your token. We recommend a 1000x1000 PNG image for best quality across all platforms.',
      '## Step 4: Authority Settings',
      'Choose which authorities to revoke. Revoking freeze, mint, and update authorities shows investors you are committed to a fair launch.',
      '## Launch Your Token',
      'Review your settings and click Launch Token. The transaction will be processed in seconds, and your token will be live on Solana mainnet!',
    ],
  },
  'understanding-tokenomics': {
    title: 'Understanding Tokenomics: Supply, Decimals & Authorities',
    date: '2024-12-08',
    readTime: '8 min',
    category: 'Education',
    content: [
      'Tokenomics is the economic model of your token. Understanding these fundamentals is crucial for creating a successful project.',
      '## What Are Decimals?',
      'Decimals determine the smallest unit of your token. Solana tokens typically use 9 decimals, meaning 1 token = 1,000,000,000 smallest units.',
      '## Token Supply',
      'Your initial supply is the number of tokens minted at creation. Consider your use case: utility tokens might need billions, while governance tokens might only need thousands.',
      '## Token Authorities',
      'Solana tokens have three authorities that control different aspects:',
      '**Freeze Authority**: Can freeze any holder\'s token account, preventing transfers. Revoking this ensures no one can freeze your holders\' tokens.',
      '**Mint Authority**: Can create additional tokens. Revoking this guarantees a fixed supply, which is attractive to investors.',
      '**Update Authority**: Can modify token metadata. Revoking this means the token name, symbol, and logo are permanent.',
      '## Best Practices',
      'For maximum investor confidence, consider revoking all three authorities. This shows commitment to decentralization and fair tokenomics.',
    ],
  },
  'liquidity-pool-guide': {
    title: 'Complete Guide to Adding Liquidity on Raydium',
    date: '2024-12-05',
    readTime: '6 min',
    category: 'Guide',
    content: [
      'After creating your token, the next step is adding liquidity so users can trade it. This guide covers everything you need to know about Raydium liquidity pools.',
      '## What is a Liquidity Pool?',
      'A liquidity pool is a smart contract containing two tokens. Users can swap between them, and liquidity providers earn fees from each trade.',
      '## Preparing Your Tokens',
      'You will need your new token and SOL (or another base token). The ratio you provide determines the initial price of your token.',
      '## Creating the Pool',
      'On Raydium, navigate to Liquidity and select Create Pool. Enter your token\'s mint address and the amount of each token you want to provide.',
      '## Setting Initial Price',
      'The initial price is calculated as: Base Token Amount / Your Token Amount. Plan carefully as this determines your token\'s starting market cap.',
      '## After Launch',
      'Monitor your pool\'s performance, track volume, and consider adding more liquidity as trading grows. Remember: higher liquidity means lower slippage for traders.',
    ],
  },
  'revoke-authorities-explained': {
    title: 'Why Revoking Token Authorities Builds Trust',
    date: '2024-12-01',
    readTime: '4 min',
    category: 'Security',
    content: [
      'In the crypto space, trust is everything. Revoking token authorities is one of the most powerful ways to demonstrate your commitment to a fair project.',
      '## The Trust Problem',
      'Many projects have rugged their communities by using retained authorities. They freeze accounts, mint extra tokens, or change metadata to deceive holders.',
      '## What Revoking Means',
      'When you revoke an authority, you permanently give up that power. It cannot be undone, which is exactly what makes it valuable as a trust signal.',
      '## Freeze Authority',
      'Revoking freeze authority means no one can ever freeze a holder\'s tokens. Investors can trade freely without fear of having their assets locked.',
      '## Mint Authority',
      'Revoking mint authority guarantees fixed supply. No more tokens can ever be created, protecting holders from inflation and dilution.',
      '## Update Authority',
      'Revoking update authority makes your token\'s identity permanent. The name, symbol, and logo can never be changed, preventing bait-and-switch scams.',
      '## The Bottom Line',
      'Revoking all authorities costs a small fee but provides priceless peace of mind to your community. It is an investment in trust that pays dividends.',
    ],
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogContent[slug] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background noise flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-accent hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise">
      <Header />
      
      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <main className="relative z-10 pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Back Button */}
          <Link 
            to="/blog"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-10">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {post.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime} read
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4 gradient-text">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <p key={index} className="font-semibold text-foreground">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (paragraph.includes('**')) {
                const parts = paragraph.split(/(\*\*[^*]+\*\*)/);
                return (
                  <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                    {parts.map((part, i) => 
                      part.startsWith('**') ? (
                        <strong key={i} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>
                      ) : part
                    )}
                  </p>
                );
              }
              return (
                <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Share & CTA */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="outline" className="glass">
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </Button>
              <Link to="/create">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Create Your Token Now
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
