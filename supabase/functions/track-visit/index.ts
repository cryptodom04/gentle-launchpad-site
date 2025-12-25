import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Country flag emoji helper
const getFlag = (countryCode: string | null): string => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { page_path, referrer, user_agent, session_id, worker_subdomain } = body;

    // Get visitor IP from headers
    const forwarded = req.headers.get('x-forwarded-for');
    const visitorIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('cf-connecting-ip') || 'unknown';

    console.log('Tracking visit:', { page_path, visitorIp, referrer, worker_subdomain });

    // Geo lookup using ip-api.com (free, no API key needed)
    let geoData = {
      country: null as string | null,
      countryCode: null as string | null,
      city: null as string | null,
    };

    if (visitorIp && visitorIp !== 'unknown' && visitorIp !== '127.0.0.1') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${visitorIp}?fields=status,country,countryCode,city`);
        const geoJson = await geoResponse.json();
        
        if (geoJson.status === 'success') {
          geoData = {
            country: geoJson.country,
            countryCode: geoJson.countryCode,
            city: geoJson.city,
          };
        }
        console.log('Geo data:', geoData);
      } catch (geoError) {
        console.error('Geo lookup error:', geoError);
      }
    }

    // Insert visit record
    const { error: insertError } = await supabase
      .from('page_visits')
      .insert({
        page_path,
        visitor_ip: visitorIp,
        visitor_country: geoData.country,
        visitor_country_code: geoData.countryCode,
        visitor_city: geoData.city,
        referrer: referrer || null,
        user_agent: user_agent || null,
        session_id: session_id || null,
        worker_subdomain: worker_subdomain || null,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Visit tracked successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error tracking visit:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
