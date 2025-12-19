import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin user IDs who can reply to messages
const ADMIN_IDS = [7511015070, 1696569523];

const isAdmin = (userId: number): boolean => {
  return ADMIN_IDS.includes(userId);
};

// Get file URL from Telegram
const getFileUrl = async (fileId: string, botToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const data = await response.json();
    
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    }
    return null;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

// Upload image to Supabase Storage
const uploadToStorage = async (
  imageUrl: string,
  supabase: any
): Promise<string | null> => {
  try {
    // Download image from Telegram
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const fileName = `telegram/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }
    
    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }
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
      const userId = update.callback_query.from.id;
      
      console.log('Callback data:', callbackData, 'User ID:', userId);
      
      // Check if user is admin
      if (!isAdmin(userId)) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: '⛔ У вас нет доступа к этой функции',
            show_alert: true,
          }),
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (callbackData.startsWith('reply_')) {
        const conversationId = callbackData.replace('reply_', '');
        
        // Get conversation details
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .maybeSingle();
        
        console.log('Conversation:', conv);
        
        // Answer callback
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: 'Ответьте на следующее сообщение (текст или фото)',
          }),
        });
        
        // Send a message that user needs to reply to
        const promptResult = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `💬 Ответ для: ${conv?.visitor_name || 'Посетитель'}\n📧 ${conv?.visitor_email || ''}\n\n👇 *Ответьте на это сообщение* (текст или фото) чтобы отправить ответ клиенту\n\n🔑 _${conversationId}_`,
            parse_mode: 'Markdown',
            reply_markup: {
              force_reply: true,
              selective: false,
              input_field_placeholder: 'Введите ваш ответ или отправьте фото...'
            }
          }),
        });
        
        console.log('Prompt sent:', await promptResult.json());
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle reply to bot's message (text or photo)
    if (update.message?.reply_to_message?.text) {
      const replyToText = update.message.reply_to_message.text;
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id;
      
      // Check if this is a reply to our prompt message (contains conversation ID)
      const uuidMatch = replyToText.match(/🔑\s*_?([a-f0-9-]{36})_?/i);
      
      if (uuidMatch) {
        const conversationId = uuidMatch[1];
        console.log('Found conversation ID:', conversationId);
        
        // Check if user is admin
        if (!userId || !isAdmin(userId)) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '⛔ У вас нет доступа к этой функции',
            }),
          });
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        let adminMessage = update.message.text || '';
        let imageUrl: string | null = null;
        
        // Check if message contains a photo
        if (update.message.photo && update.message.photo.length > 0) {
          // Get the largest photo
          const photo = update.message.photo[update.message.photo.length - 1];
          const telegramFileUrl = await getFileUrl(photo.file_id, TELEGRAM_BOT_TOKEN);
          
          if (telegramFileUrl) {
            // Upload to Supabase Storage
            imageUrl = await uploadToStorage(telegramFileUrl, supabase);
            console.log('Uploaded image URL:', imageUrl);
          }
          
          // Use caption as message if present
          if (update.message.caption) {
            adminMessage = update.message.caption;
          }
        }
        
        // Insert admin reply
        const { data: insertedMsg, error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'admin',
            message: adminMessage || (imageUrl ? '📷 Image' : ''),
            image_url: imageUrl,
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
          // Get conversation for name
          const { data: conv } = await supabase
            .from('conversations')
            .select('visitor_name')
            .eq('id', conversationId)
            .maybeSingle();
          
          const messageType = imageUrl ? '📷 Фото' : '💬 Сообщение';
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ ${messageType} отправлено ${conv?.visitor_name || 'клиенту'}!`,
            }),
          });
        }
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle /r command as fallback: /r UUID message
    if (update.message?.text && update.message.text.startsWith('/r ')) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id;
      
      console.log('Reply command received. User ID:', userId, 'Text:', text);
      
      // Check if user is admin
      if (!userId || !isAdmin(userId)) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '⛔ У вас нет доступа к этой функции',
          }),
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const match = text.match(/^\/r\s+([a-f0-9-]{36})\s+(.+)$/is);
      
      if (match) {
        const conversationId = match[1];
        const replyMessage = match[2].trim();
        
        const { error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'admin',
            message: replyMessage,
          });
        
        const responseText = insertError 
          ? '❌ Ошибка: ' + insertError.message 
          : '✅ Ответ отправлен!';
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: responseText }),
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
          text: '👋 Привет! Я бот SolFerno Support.\n\nКогда пользователи пишут на сайте, вы получите уведомление с кнопкой "Ответить".\n\nНажмите кнопку и ответьте на сообщение бота текстом или фото!',
        }),
      });
    }

    // Handle /stats command
    if (update.message?.text === '/stats') {
      const chatId = update.message.chat.id;
      
      // Get all profits statistics
      const { data: profits, error: profitsError } = await supabase
        .from('profits')
        .select('amount_sol, amount_usd, created_at');
      
      if (profitsError) {
        console.error('Error fetching profits:', profitsError);
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '❌ Ошибка при получении статистики',
          }),
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Calculate total statistics
      const totalTransactions = profits?.length || 0;
      const totalSol = profits?.reduce((sum, p) => sum + Number(p.amount_sol), 0) || 0;
      const totalUsd = profits?.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0) || 0;
      
      // Get today's stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayProfits = profits?.filter(p => new Date(p.created_at) >= today) || [];
      const todaySol = todayProfits.reduce((sum, p) => sum + Number(p.amount_sol), 0);
      const todayUsd = todayProfits.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
      
      // Get current week stats (Monday to Sunday)
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, so go back 6 days
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
      const weekProfits = profits?.filter(p => new Date(p.created_at) >= weekStart) || [];
      const weekSol = weekProfits.reduce((sum, p) => sum + Number(p.amount_sol), 0);
      const weekUsd = weekProfits.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
      
      // Get current month stats (1st to last day)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthProfits = profits?.filter(p => new Date(p.created_at) >= monthStart) || [];
      const monthSol = monthProfits.reduce((sum, p) => sum + Number(p.amount_sol), 0);
      const monthUsd = monthProfits.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
      
      const statsMessage = `📊 <b>Общая статистика</b>\n\n` +
        `📈 Всего транзакций: <b>${totalTransactions}</b>\n` +
        `💰 Общий объем: <b>${totalSol.toFixed(4)} SOL</b> (~$${totalUsd.toFixed(2)})\n\n` +
        `📅 <b>Сегодня:</b>\n` +
        `├ Транзакций: ${todayProfits.length}\n` +
        `└ Объем: ${todaySol.toFixed(4)} SOL (~$${todayUsd.toFixed(2)})\n\n` +
        `📆 <b>Эта неделя:</b>\n` +
        `├ Транзакций: ${weekProfits.length}\n` +
        `└ Объем: ${weekSol.toFixed(4)} SOL (~$${weekUsd.toFixed(2)})\n\n` +
        `🗓 <b>Этот месяц:</b>\n` +
        `├ Транзакций: ${monthProfits.length}\n` +
        `└ Объем: ${monthSol.toFixed(4)} SOL (~$${monthUsd.toFixed(2)})`;
      
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: statsMessage,
          parse_mode: 'HTML',
        }),
      });
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
