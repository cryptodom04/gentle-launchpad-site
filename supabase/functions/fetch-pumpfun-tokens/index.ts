import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  bonding_curve?: string;
  associated_bonding_curve?: string;
  creator?: string;
  created_timestamp?: number;
  raydium_pool?: string;
  complete?: boolean;
  virtual_sol_reserves?: number;
  virtual_token_reserves?: number;
  total_supply?: number;
  website?: string;
  show_name?: boolean;
  king_of_the_hill_timestamp?: number;
  market_cap?: number;
  reply_count?: number;
  last_reply?: number;
  nsfw?: boolean;
  market_id?: string;
  inverted?: boolean;
  usd_market_cap?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching tokens from Pump.fun API...');

    // Fetch king of the hill (trending tokens)
    const kingResponse = await fetch('https://frontend-api.pump.fun/coins/king-of-the-hill?includeNsfw=false', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Fetch recently completed (graduated) tokens
    const completedResponse = await fetch('https://frontend-api.pump.fun/coins?offset=0&limit=50&sort=last_trade_timestamp&order=DESC&includeNsfw=false&complete=true', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const allTokens: PumpFunToken[] = [];

    // Process king of the hill
    if (kingResponse.ok) {
      const kingData = await kingResponse.json();
      console.log('King of the hill data:', JSON.stringify(kingData).slice(0, 200));
      if (kingData) {
        // Could be single token or array
        const kingTokens = Array.isArray(kingData) ? kingData : [kingData];
        allTokens.push(...kingTokens);
      }
    } else {
      console.log('King response not ok:', kingResponse.status);
    }

    // Process completed tokens
    if (completedResponse.ok) {
      const completedData = await completedResponse.json();
      console.log('Completed tokens count:', Array.isArray(completedData) ? completedData.length : 'not array');
      if (Array.isArray(completedData)) {
        allTokens.push(...completedData);
      }
    } else {
      console.log('Completed response not ok:', completedResponse.status);
    }

    // Filter by market cap >= 50k and deduplicate
    const seenMints = new Set<string>();
    const filteredTokens = allTokens
      .filter(token => {
        if (!token.mint || seenMints.has(token.mint)) return false;
        seenMints.add(token.mint);
        
        const marketCap = token.usd_market_cap || token.market_cap || 0;
        return marketCap >= 50000;
      })
      .map(token => {
        const marketCap = token.usd_market_cap || token.market_cap || 0;
        // Calculate approximate price from market cap and total supply
        const totalSupply = token.total_supply || 1000000000000000; // Default pump.fun supply
        const priceUsd = marketCap / (totalSupply / 1e6); // Adjust for decimals
        
        return {
          mint: token.mint,
          name: token.name || 'Unknown',
          symbol: token.symbol || '???',
          priceUsd: priceUsd.toString(),
          marketCap: marketCap,
          liquidity: '0',
          imageUri: token.image_uri,
          createdAt: token.created_timestamp ? new Date(token.created_timestamp).toISOString() : undefined,
        };
      })
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 30); // Limit to top 30

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
    console.error('Error fetching Pump.fun tokens:', error);
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
