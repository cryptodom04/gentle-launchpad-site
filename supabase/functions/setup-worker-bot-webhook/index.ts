const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('WORKER_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!botToken) {
      throw new Error('WORKER_BOT_TOKEN is not set');
    }

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not set');
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/worker-bot-webhook`;

    console.log('Setting up worker bot webhook to:', webhookUrl);

    // Delete existing webhook
    const deleteResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/deleteWebhook`,
      { method: 'POST' }
    );
    const deleteResult = await deleteResponse.json();
    console.log('Delete webhook result:', deleteResult);

    // Set new webhook
    const setResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      }
    );
    const setResult = await setResponse.json();
    console.log('Set webhook result:', setResult);

    // Get webhook info
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    );
    const infoResult = await infoResponse.json();
    console.log('Webhook info:', infoResult);

    return new Response(
      JSON.stringify({
        success: true,
        delete: deleteResult,
        set: setResult,
        info: infoResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error setting up worker bot webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});