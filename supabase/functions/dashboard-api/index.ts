import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const DASHBOARD_PASSWORD = Deno.env.get('DASHBOARD_PASSWORD') || '1488';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const body = await req.json();
    const { password, action, limit = 500 } = body;

    // Verify dashboard password
    if (!password || password !== DASHBOARD_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (action) {
      case 'get_visits': {
        const { data, error } = await supabase
          .from('page_visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(Math.min(limit, 500));

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_profits': {
        const { data, error } = await supabase
          .from('profits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(Math.min(limit, 100));

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_workers': {
        const { data, error } = await supabase
          .from('workers')
          .select('id, telegram_username, telegram_name, status, balance_sol, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_withdrawal_requests': {
        const { data, error } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(Math.min(limit, 100));

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_stats': {
        // Get visits count
        const { data: visits, error: visitsError } = await supabase
          .from('page_visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);

        if (visitsError) throw visitsError;

        // Get profits total
        const { data: profits, error: profitsError } = await supabase
          .from('profits')
          .select('amount_sol, amount_usd, created_at');

        if (profitsError) throw profitsError;

        // Calculate stats
        const uniqueIPs = new Set(visits?.map(v => v.visitor_ip).filter(Boolean) || []);
        const uniqueCountries = new Set(visits?.map(v => v.visitor_country_code).filter(Boolean) || []);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayVisits = visits?.filter(v => new Date(v.created_at) >= today).length || 0;

        const totalProfitsSol = profits?.reduce((sum, p) => sum + Number(p.amount_sol), 0) || 0;
        const totalProfitsUsd = profits?.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0) || 0;

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              totalVisits: visits?.length || 0,
              uniqueIPs: uniqueIPs.size,
              todayVisits,
              countries: uniqueCountries.size,
              totalProfitsSol,
              totalProfitsUsd,
              profitsCount: profits?.length || 0
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Dashboard API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
