import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
const blogPosts = [{
  id: 'how-to-create-solana-token',
  title: 'How to Create Your First Solana Token in 60 Seconds',
  excerpt: 'Learn the step-by-step process of launching your own SPL token on Solana blockchain without any coding knowledge.',
  date: '2024-12-10',
  readTime: '5 min',
  category: 'Tutorial'
}, {
  id: 'understanding-tokenomics',
  title: 'Understanding Tokenomics: Supply, Decimals & Authorities',
  excerpt: 'A deep dive into token economics and how to configure your token for maximum investor confidence.',
  date: '2024-12-08',
  readTime: '8 min',
  category: 'Education'
}, {
  id: 'liquidity-pool-guide',
  title: 'Complete Guide to Adding Liquidity on Raydium',
  excerpt: 'Everything you need to know about creating and managing liquidity pools for your Solana token.',
  date: '2024-12-05',
  readTime: '6 min',
  category: 'Guide'
}, {
  id: 'revoke-authorities-explained',
  title: 'Why Revoking Token Authorities Builds Trust',
  excerpt: 'Discover why investors prefer tokens with revoked freeze, mint, and update authorities.',
  date: '2024-12-01',
  readTime: '4 min',
  category: 'Security'
}];
const Blog = () => {
  return <div className="min-h-screen bg-background noise">
      <Header />
      
      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Page Header */}
          <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Sol<span className="gradient-text">Ferno</span> Learn
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Insights, tutorials, and guides about Solana token creation and blockchain development
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.map((post, index) => <Link key={post.id} to={`/blog/${post.id}`} className="group glass rounded-2xl p-6 hover:glow-primary transition-all duration-500 animate-fade-in-up" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all">
                  {post.title}
                </h2>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.readTime} read
                  </div>
                  <span className="flex items-center gap-1 text-sm text-accent group-hover:gap-2 transition-all">
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>)}
          </div>
        </div>
      </main>
    </div>;
};
export default Blog;