import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd?: string;
  priceNative?: string;
  fdv?: number;
  marketCap?: number;
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
  };
  priceChange?: {
    h24?: number;
    h6?: number;
    h1?: number;
  };
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching new Solana tokens from DexScreener...');

    // Fetch multiple sources in parallel for more tokens
    const [profilesRes, boostsRes, trendingRes] = await Promise.all([
      // Latest token profiles (new tokens)
      fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
        headers: { 'Accept': 'application/json' },
      }),
      // Boosted tokens
      fetch('https://api.dexscreener.com/token-boosts/top/v1', {
        headers: { 'Accept': 'application/json' },
      }),
      // Search for new Solana pairs (moonshot/pump related)
      fetch('https://api.dexscreener.com/latest/dex/search?q=solana', {
        headers: { 'Accept': 'application/json' },
      }),
    ]);

    const allTokenAddresses: string[] = [];

    // Process latest profiles
    if (profilesRes.ok) {
      const profiles = await profilesRes.json();
      if (Array.isArray(profiles)) {
        const solanaProfiles = profiles
          .filter((p: any) => p.chainId === 'solana')
          .map((p: any) => p.tokenAddress)
          .filter(Boolean);
        allTokenAddresses.push(...solanaProfiles);
        console.log('Profiles Solana tokens:', solanaProfiles.length);
      }
    }

    // Process boosts
    if (boostsRes.ok) {
      const boosts = await boostsRes.json();
      if (Array.isArray(boosts)) {
        const solanaBoosts = boosts
          .filter((b: any) => b.chainId === 'solana')
          .map((b: any) => b.tokenAddress)
          .filter(Boolean);
        allTokenAddresses.push(...solanaBoosts);
        console.log('Boosts Solana tokens:', solanaBoosts.length);
      }
    }

    // Process trending search results
    let searchPairs: DexScreenerPair[] = [];
    if (trendingRes.ok) {
      const trending = await trendingRes.json();
      if (trending.pairs) {
        searchPairs = trending.pairs.filter((p: DexScreenerPair) => p.chainId === 'solana');
        console.log('Search Solana pairs:', searchPairs.length);
      }
    }

    // Deduplicate token addresses
    const uniqueAddresses = [...new Set(allTokenAddresses)].slice(0, 100);
    console.log('Unique token addresses:', uniqueAddresses.length);

    // Fetch details for tokens in batches
    let detailedPairs: DexScreenerPair[] = [];
    
    if (uniqueAddresses.length > 0) {
      const batches = [];
      for (let i = 0; i < uniqueAddresses.length; i += 30) {
        batches.push(uniqueAddresses.slice(i, i + 30));
      }

      const batchPromises = batches.map(batch => 
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${batch.join(',')}`, {
          headers: { 'Accept': 'application/json' },
        }).then(res => res.ok ? res.json() : { pairs: [] })
      );

      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        if (result.pairs) {
          detailedPairs.push(...result.pairs.filter((p: DexScreenerPair) => p.chainId === 'solana'));
        }
      }
      console.log('Detailed pairs fetched:', detailedPairs.length);
    }

    // Combine all pairs
    const allPairs = [...detailedPairs, ...searchPairs];

    // Filter by 50k+ market cap and deduplicate
    const seenTokens = new Set<string>();
    const filteredTokens = allPairs
      .filter((pair: DexScreenerPair) => {
        if (!pair.baseToken?.address) return false;
        if (seenTokens.has(pair.baseToken.address)) return false;
        
        const marketCap = pair.marketCap || pair.fdv || 0;
        if (marketCap < 50000) return false;
        
        seenTokens.add(pair.baseToken.address);
        return true;
      })
      .map((pair: DexScreenerPair) => ({
        mint: pair.baseToken.address,
        name: pair.baseToken.name || 'Unknown',
        symbol: pair.baseToken.symbol || '???',
        priceUsd: pair.priceUsd || '0',
        marketCap: pair.marketCap || pair.fdv || 0,
        liquidity: pair.liquidity?.usd?.toString() || '0',
        imageUri: pair.info?.imageUrl,
        createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : undefined,
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        dex: pair.dexId,
      }))
      .sort((a, b) => {
        // Sort by creation date (newest first), then by market cap
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return b.marketCap - a.marketCap;
      })
      .slice(0, 50);

    console.log(`Returning ${filteredTokens.length} tokens with 50k+ market cap`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokens: filteredTokens,
        count: filteredTokens.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching tokens:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        tokens: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
