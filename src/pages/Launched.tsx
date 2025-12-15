import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Rocket, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Token {
  mint: string;
  name: string;
  symbol: string;
  priceUsd: string;
  marketCap: number;
  liquidity: string;
  imageUri?: string;
  createdAt?: number;
  priceChange24h?: number;
  volume24h?: number;
  ageMinutes?: number;
}

const Launched = () => {
  useScrollReveal();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchTokens = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-pumpfun-tokens');
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (data?.tokens) {
        setTokens(data.tokens);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(true);
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => fetchTokens(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const formatMarketCap = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(1)}K`;
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num < 0.00001) {
      return `$${num.toExponential(2)}`;
    }
    return `$${num.toFixed(8)}`;
  };

  return (
    <div className="min-h-screen bg-background noise">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Live Launches</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tokens <span className="gradient-text">Launched</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time view of fresh token launches through SolFerno. 
              Only tokens less than 30 minutes old with 50K+ market cap.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-6">
              <button 
                onClick={() => fetchTokens(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-secondary/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdate}
                </span>
              )}
            </div>
          </div>


          {/* Tokens Grid */}
          {loading && tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading tokens...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <button 
                onClick={() => fetchTokens(true)}
                className="px-4 py-2 rounded-xl glass hover:bg-secondary/50 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token) => (
                <div 
                  key={token.mint}
                  className="glass rounded-2xl p-5 hover:bg-secondary/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Token Image */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {token.imageUri ? (
                        <img 
                          src={token.imageUri} 
                          alt={token.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-lg font-bold gradient-text">
                          {token.symbol?.slice(0, 2) || '??'}
                        </span>
                      )}
                    </div>
                    
                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{token.name || 'Unknown'}</h3>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50">
                          ${token.symbol || '???'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 font-medium">
                            {formatMarketCap(token.marketCap)}
                          </span>
                        </div>
                        
                        {/* Age indicator */}
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">
                            {token.ageMinutes !== undefined && token.ageMinutes !== null 
                              ? `${token.ageMinutes}m ago`
                              : 'New'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Created Time */}
                  {token.createdAt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Created: {new Date(token.createdAt).toLocaleTimeString()}
                    </div>
                  )}
                  
                  {/* Price, Change & Actions */}
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-mono text-sm">{formatPrice(token.priceUsd)}</p>
                    </div>
                    
                    {/* 24h Change */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">24h</p>
                      <div className={`flex items-center justify-center gap-1 font-medium text-sm ${
                        (token.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(token.priceChange24h || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{(token.priceChange24h || 0) >= 0 ? '+' : ''}{(token.priceChange24h || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <a
                      href={`https://dexscreener.com/solana/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tokens.length === 0 && !loading && !error && (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Watching for new launches...</span>
              </div>
              <p className="text-muted-foreground">No tokens found under 30 minutes old with 50K+ market cap</p>
              <p className="text-xs text-muted-foreground mt-2">Auto-refreshing every 5 seconds</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Launched;
