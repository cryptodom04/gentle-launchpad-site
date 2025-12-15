import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

    if (!TELEGRAM_BOT_TOKEN) {
      return new Response(JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construct webhook URL
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot-webhook`;
    console.log('Setting webhook URL:', webhookUrl);

    // Delete existing webhook first
    const deleteResult = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
    });
    const deleteData = await deleteResult.json();
    console.log('Delete webhook result:', deleteData);

    // Set new webhook
    const setResult = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });
    const setData = await setResult.json();
    console.log('Set webhook result:', setData);

    // Get webhook info
    const infoResult = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const infoData = await infoResult.json();
    console.log('Webhook info:', infoData);

    return new Response(JSON.stringify({
      deleted: deleteData,
      set: setData,
      info: infoData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
