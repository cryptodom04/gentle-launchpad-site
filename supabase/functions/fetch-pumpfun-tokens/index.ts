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
    console.log('Fetching tokens from DexScreener API...');

    // Fetch trending Solana tokens from DexScreener
    const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('DexScreener boosts API error:', response.status);
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const boostData = await response.json();
    console.log('Boosts data received:', Array.isArray(boostData) ? boostData.length : 'not array');

    // Filter for Solana tokens and get their details
    const solanaTokens = Array.isArray(boostData) 
      ? boostData.filter((item: any) => item.chainId === 'solana').slice(0, 20)
      : [];

    console.log('Solana tokens from boosts:', solanaTokens.length);

    // Also fetch latest pairs from Solana
    const latestResponse = await fetch('https://api.dexscreener.com/latest/dex/pairs/solana', {
      headers: {
        'Accept': 'application/json',
      },
    });

    let latestPairs: DexScreenerPair[] = [];
    if (latestResponse.ok) {
      const latestData = await latestResponse.json();
      latestPairs = latestData.pairs || [];
      console.log('Latest pairs received:', latestPairs.length);
    }

    // Get token details for boosted tokens
    const tokenAddresses = solanaTokens.map((t: any) => t.tokenAddress).filter(Boolean);
    let detailedTokens: DexScreenerPair[] = [];

    if (tokenAddresses.length > 0) {
      // Fetch in batches of 30 (API limit)
      const batches = [];
      for (let i = 0; i < tokenAddresses.length; i += 30) {
        batches.push(tokenAddresses.slice(i, i + 30));
      }

      for (const batch of batches) {
        const detailsUrl = `https://api.dexscreener.com/latest/dex/tokens/${batch.join(',')}`;
        const detailsResponse = await fetch(detailsUrl, {
          headers: { 'Accept': 'application/json' },
        });

        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          if (detailsData.pairs) {
            detailedTokens.push(...detailsData.pairs);
          }
        }
      }
      console.log('Detailed tokens fetched:', detailedTokens.length);
    }

    // Combine all pairs
    const allPairs = [...detailedTokens, ...latestPairs];

    // Filter and deduplicate by base token address
    const seenTokens = new Set<string>();
    const filteredTokens = allPairs
      .filter((pair: DexScreenerPair) => {
        if (!pair.baseToken?.address || seenTokens.has(pair.baseToken.address)) {
          return false;
        }
        
        const marketCap = pair.marketCap || pair.fdv || 0;
        if (marketCap < 50000) {
          return false;
        }
        
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
      }))
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 30);

    console.log(`Returning ${filteredTokens.length} tokens with 50k+ market cap`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokens: filteredTokens,
        count: filteredTokens.length
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
