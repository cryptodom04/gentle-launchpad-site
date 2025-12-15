import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory store for pending replies (resets on cold start, but works for our use case)
const pendingReplies: Record<string, string> = {};

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
    console.log('Telegram update received:', JSON.stringify(update, null, 2));

    // Handle callback query (button click)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const userId = update.callback_query.from.id;
      
      console.log('Callback received:', callbackData);
      
      if (callbackData.startsWith('reply_')) {
        const conversationId = callbackData.replace('reply_', '');
        
        // Store pending reply for this user
        pendingReplies[String(userId)] = conversationId;
        console.log('Stored pending reply for user', userId, 'conversation', conversationId);
        
        // Get conversation details
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        console.log('Conversation found:', conv);
        
        // Answer callback query
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: 'Напишите ваш ответ следующим сообщением',
          }),
        });
        
        // Send prompt message with conversation ID for reference
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✍️ *Ответ для:* ${conv?.visitor_name} (${conv?.visitor_email})\n\n📝 Напишите ваш ответ следующим сообщением.\n\n_ID: ${conversationId}_`,
            parse_mode: 'Markdown',
          }),
        });
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle regular message from admin
    if (update.message?.text && !update.message.text.startsWith('/')) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const adminMessage = update.message.text;
      
      console.log('Message from user', userId, ':', adminMessage);
      console.log('Pending replies:', JSON.stringify(pendingReplies));
      
      // Check if user has a pending reply
      const conversationId = pendingReplies[String(userId)];
      
      if (conversationId) {
        console.log('Found pending reply for conversation:', conversationId);
        
        // Insert admin reply
        const { data: insertedMsg, error } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'admin',
            message: adminMessage,
          })
          .select()
          .single();
        
        console.log('Insert result:', insertedMsg, 'Error:', error);
        
        if (!error) {
          // Clear pending reply
          delete pendingReplies[String(userId)];
          
          // Confirm delivery
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '✅ Ответ отправлен!',
            }),
          });
        } else {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '❌ Ошибка: ' + error.message,
            }),
          });
        }
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle direct command format: /r UUID message
    if (update.message?.text?.startsWith('/r ')) {
      const text = update.message.text;
      const parts = text.substring(3).split(' ');
      const conversationId = parts[0];
      const replyMessage = parts.slice(1).join(' ');
      const chatId = update.message.chat.id;
      
      if (conversationId && replyMessage) {
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'admin',
            message: replyMessage,
          });
        
        const responseText = error ? '❌ Ошибка: ' + error.message : '✅ Ответ отправлен!';
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: responseText }),
        });
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
