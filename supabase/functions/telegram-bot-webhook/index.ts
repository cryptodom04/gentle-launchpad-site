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
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
      return new Response(JSON.stringify({ error: 'Missing bot token' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const update = await req.json();
    console.log('=== Telegram Update ===');
    console.log(JSON.stringify(update, null, 2));

    // Handle callback query (button click)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      
      console.log('Callback data:', callbackData);
      
      if (callbackData.startsWith('reply_')) {
        const conversationId = callbackData.replace('reply_', '');
        
        // Get conversation details
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        console.log('Conversation:', conv, 'Error:', convError);
        
        // Answer callback
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: 'Используйте команду ниже для ответа',
          }),
        });
        
        // Send reply instruction with command
        const shortId = conversationId.substring(0, 8);
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✍️ Чтобы ответить *${conv?.visitor_name}*, отправьте:\n\n\`/r ${conversationId} Ваш ответ\`\n\nИли скопируйте и измените:\n\`/r ${conversationId} Здравствуйте! Чем могу помочь?\``,
            parse_mode: 'Markdown',
          }),
        });
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle /r command: /r UUID message
    if (update.message?.text?.startsWith('/r ')) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      
      console.log('Reply command received:', text);
      
      // Parse: /r <uuid> <message>
      const match = text.match(/^\/r\s+([a-f0-9-]+)\s+(.+)$/is);
      
      if (match) {
        const conversationId = match[1];
        const replyMessage = match[2].trim();
        
        console.log('Parsed - ConvID:', conversationId, 'Message:', replyMessage);
        
        // Verify conversation exists
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        if (convError || !conv) {
          console.error('Conversation not found:', convError);
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '❌ Диалог не найден. Проверьте ID.',
            }),
          });
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Insert admin reply
        const { data: insertedMsg, error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'admin',
            message: replyMessage,
          })
          .select()
          .single();
        
        console.log('Insert result:', insertedMsg, 'Error:', insertError);
        
        if (insertError) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '❌ Ошибка: ' + insertError.message,
            }),
          });
        } else {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ Ответ отправлен пользователю *${conv.visitor_name}*!`,
              parse_mode: 'Markdown',
            }),
          });
        }
      } else {
        // Invalid format
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '❌ Неверный формат. Используйте:\n`/r <ID диалога> <Ваш ответ>`',
            parse_mode: 'Markdown',
          }),
        });
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '👋 Привет! Я бот SolFerno Support.\n\nКогда пользователи пишут на сайте, вы получите уведомление с кнопкой "Ответить".',
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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