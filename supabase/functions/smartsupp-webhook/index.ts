import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
const SMARTSUPP_WEBHOOK_SECRET = Deno.env.get('SMARTSUPP_WEBHOOK_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-smartsupp-hmac',
};

// Verify HMAC signature from Smartsupp
async function verifyHmacSignature(body: string, receivedHmac: string | null, secret: string): Promise<boolean> {
  if (!receivedHmac) return false;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', 
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, 
    false, 
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHmac = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  
  return receivedHmac === expectedHmac;
}

async function sendTelegramMessage(message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const result = await response.json();
  console.log('Telegram response:', result);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook authentication
    const receivedHmac = req.headers.get('x-smartsupp-hmac');
    const body = await req.text();
    
    // If secret is configured, verify HMAC signature
    if (SMARTSUPP_WEBHOOK_SECRET) {
      const isValid = await verifyHmacSignature(body, receivedHmac, SMARTSUPP_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid HMAC signature');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
    } else {
      console.warn('SMARTSUPP_WEBHOOK_SECRET not configured - webhook authentication disabled');
    }
    
    const payload = JSON.parse(body);
    console.log('Received Smartsupp webhook:', JSON.stringify(payload, null, 2));

    const { event, data, timestamp } = payload;

    // Handle contact/visitor messages
    if (event === 'conversation.contact_replied' || event === 'visitor.replied') {
      const message = data?.message;
      const contact = data?.conversation?.contact || data?.visitor;
      
      const visitorName = contact?.name || contact?.email || 'Посетитель';
      const visitorEmail = contact?.email || 'не указан';
      const messageText = message?.content?.text || message?.text || 'Медиа-сообщение';
      const pageUrl = contact?.variables?.pageUrl || data?.conversation?.variables?.pageUrl || '';

      const telegramMessage = `💬 <b>Новое сообщение в чате!</b>\n\n` +
        `👤 От: <b>${visitorName}</b>\n` +
        `📧 Email: ${visitorEmail}\n` +
        `💭 Сообщение: ${messageText}\n` +
        (pageUrl ? `🔗 Страница: ${pageUrl}\n` : '') +
        `\n⏰ ${new Date(timestamp).toLocaleString('ru-RU')}`;

      await sendTelegramMessage(telegramMessage);
      console.log('Sent Telegram notification for chat message');
    }

    // Handle new conversation opened
    if (event === 'conversation.opened') {
      const contact = data?.conversation?.contact;
      const visitorName = contact?.name || contact?.email || 'Новый посетитель';

      const telegramMessage = `🆕 <b>Новый чат начат!</b>\n\n` +
        `👤 Посетитель: <b>${visitorName}</b>\n` +
        `⏰ ${new Date(timestamp).toLocaleString('ru-RU')}`;

      await sendTelegramMessage(telegramMessage);
      console.log('Sent Telegram notification for new conversation');
    }

    // Handle conversation rated
    if (event === 'conversation.rated') {
      const rating = data?.rating;
      const ratingEmoji = rating >= 4 ? '⭐️' : rating >= 2 ? '😐' : '😞';

      const telegramMessage = `${ratingEmoji} <b>Оценка чата!</b>\n\n` +
        `📊 Оценка: <b>${rating}/5</b>\n` +
        `⏰ ${new Date(timestamp).toLocaleString('ru-RU')}`;

      await sendTelegramMessage(telegramMessage);
      console.log('Sent Telegram notification for rating');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error processing Smartsupp webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
