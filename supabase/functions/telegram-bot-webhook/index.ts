import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store pending replies in memory (conversation_id -> waiting for reply)
const pendingReplies = new Map<string, boolean>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const update = await req.json();
    console.log('Telegram update:', JSON.stringify(update, null, 2));

    // Handle callback query (button click)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      
      if (callbackData.startsWith('reply_')) {
        const conversationId = callbackData.replace('reply_', '');
        
        // Get conversation details
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        // Answer callback query
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: 'Напишите ваш ответ следующим сообщением',
          }),
        });
        
        // Send prompt message
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✍️ Напишите ответ для *${conv?.visitor_name}* (${conv?.visitor_email}):\n\n_Отправьте следующее сообщение как ответ_`,
            parse_mode: 'Markdown',
            reply_markup: {
              force_reply: true,
              selective: true,
              input_field_placeholder: 'Введите ответ...'
            }
          }),
        });
        
        // Store pending reply state in database (using a simple approach)
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
        
        // We'll use the reply_to_message to track which conversation to reply to
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle regular message (reply from admin)
    if (update.message && update.message.reply_to_message) {
      const replyToText = update.message.reply_to_message.text || '';
      const adminMessage = update.message.text;
      const chatId = update.message.chat.id;
      
      // Check if this is a reply to our prompt
      if (replyToText.includes('Напишите ответ для')) {
        // Extract email from the prompt
        const emailMatch = replyToText.match(/\(([^)]+@[^)]+)\)/);
        if (emailMatch) {
          const email = emailMatch[1];
          
          // Find the conversation
          const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('visitor_email', email)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
          
          if (conv) {
            // Insert admin reply
            const { error } = await supabase
              .from('chat_messages')
              .insert({
                conversation_id: conv.id,
                sender_type: 'admin',
                message: adminMessage,
              });
            
            if (!error) {
              // Confirm delivery
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `✅ Ответ отправлен пользователю *${conv.visitor_name}*`,
                  parse_mode: 'Markdown',
                }),
              });
            }
          }
        }
      }
    }

    // Handle direct message with conversation ID format: /reply_UUID message
    if (update.message?.text?.startsWith('/reply_')) {
      const text = update.message.text;
      const match = text.match(/^\/reply_([a-f0-9-]+)\s+(.+)$/s);
      
      if (match) {
        const conversationId = match[1];
        const replyMessage = match[2];
        const chatId = update.message.chat.id;
        
        // Insert admin reply
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'admin',
            message: replyMessage,
          });
        
        if (!error) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '✅ Ответ отправлен!',
            }),
          });
        }
      }
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
