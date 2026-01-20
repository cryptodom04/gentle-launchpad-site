import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tawkto-signature',
};

// Escape Telegram Markdown special characters to prevent injection
const escapeMarkdown = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const TAWKTO_WEBHOOK_SECRET = Deno.env.get('TAWKTO_WEBHOOK_SECRET');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Telegram credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify webhook authentication using shared secret
    const authHeader = req.headers.get('authorization') || req.headers.get('x-tawkto-signature');
    if (TAWKTO_WEBHOOK_SECRET) {
      if (authHeader !== TAWKTO_WEBHOOK_SECRET && authHeader !== `Bearer ${TAWKTO_WEBHOOK_SECRET}`) {
        console.error('Invalid webhook authentication');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('TAWKTO_WEBHOOK_SECRET not configured - webhook authentication disabled');
    }

    const payload = await req.json();
    console.log('Tawk.to webhook received:', JSON.stringify(payload, null, 2));

    // Extract message details from Tawk.to webhook and escape for Markdown safety
    const event = payload.event;
    const chatId = escapeMarkdown(payload.chatId || 'Unknown');
    const visitorName = escapeMarkdown(payload.visitor?.name || 'Посетитель');
    const visitorEmail = escapeMarkdown(payload.visitor?.email || '');
    const message = escapeMarkdown(payload.message?.text || payload.property?.name || '');
    const propertyName = escapeMarkdown(payload.property?.name || 'SolFerno');

    let telegramMessage = '';

    switch (event) {
      case 'chat:start':
        telegramMessage = `🟢 *Новый чат начат*\n\n👤 Посетитель: ${visitorName}${visitorEmail ? `\n📧 Email: ${visitorEmail}` : ''}\n🏠 Сайт: ${propertyName}\n🆔 Chat ID: ${chatId}`;
        break;
      case 'chat:end':
        telegramMessage = `🔴 *Чат завершён*\n\n👤 Посетитель: ${visitorName}\n🆔 Chat ID: ${chatId}`;
        break;
      case 'ticket:create':
        telegramMessage = `🎫 *Новый тикет*\n\n👤 От: ${visitorName}${visitorEmail ? `\n📧 Email: ${visitorEmail}` : ''}\n💬 Сообщение: ${message}`;
        break;
      case 'chat:message':
      case 'visitor:message':
        telegramMessage = `💬 *Новое сообщение*\n\n👤 От: ${visitorName}${visitorEmail ? `\n📧 Email: ${visitorEmail}` : ''}\n\n📝 ${message}`;
        break;
      default:
        telegramMessage = `📩 *Событие Tawk.to*\n\nТип: ${escapeMarkdown(event)}\n👤 Посетитель: ${visitorName}\n💬 ${message || 'Нет сообщения'}`;
    }

    // Send message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram response:', JSON.stringify(telegramResult, null, 2));

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram message', details: telegramResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent to Telegram' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
