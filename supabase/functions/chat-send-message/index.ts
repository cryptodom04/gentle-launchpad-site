import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Country code to flag emoji
const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input: string, maxLength: number): string => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Missing Telegram credentials');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const body = await req.json();
    
    // Validate and sanitize inputs
    const conversationId = body.conversationId;
    const message = sanitizeInput(body.message, 5000);
    const visitorEmail = sanitizeInput(body.visitorEmail, 255);
    const visitorName = sanitizeInput(body.visitorName, 100);
    const isNewConversation = Boolean(body.isNewConversation);
    
    // Validate required fields
    if (!message || message.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required and cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (isNewConversation) {
      if (!visitorName || visitorName.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!visitorEmail || !validateEmail(visitorEmail)) {
        return new Response(
          JSON.stringify({ error: 'Valid email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Validate conversationId format if provided
    if (conversationId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conversation ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get visitor's IP from headers
    const visitorIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('cf-connecting-ip') || 
                      'Unknown';
    
    let country = 'Unknown';
    let countryCode = '';
    
    // Get geo info from IP
    if (visitorIp && visitorIp !== 'Unknown') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${visitorIp}?fields=status,country,countryCode`);
        const geoData = await geoResponse.json();
        if (geoData.status === 'success') {
          country = geoData.country;
          countryCode = geoData.countryCode;
        }
      } catch (e) {
        console.error('Geo lookup failed:', e);
      }
    }
    
    let convId = conversationId;
    let sessionToken = body.sessionToken;
    
    // Create new conversation if needed
    if (isNewConversation) {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          visitor_email: visitorEmail,
          visitor_name: visitorName,
          visitor_ip: visitorIp,
          visitor_country: country,
          visitor_country_code: countryCode,
        })
        .select('id, session_token')
        .single();
      
      if (convError) throw convError;
      convId = convData.id;
      sessionToken = convData.session_token;
    } else {
      // Validate session token for existing conversation
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: 'Session token required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('session_token', sessionToken)
        .maybeSingle();
      
      if (!conv) {
        return new Response(
          JSON.stringify({ error: 'Invalid session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Insert message
    const { data: msgData, error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        sender_type: 'visitor',
        message: message,
      })
      .select()
      .single();
    
    if (msgError) throw msgError;
    
    // Get conversation details
    const { data: convDetails } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', convId)
      .single();
    
    const flag = getCountryFlag(convDetails?.visitor_country_code || countryCode);
    const now = new Date();
    const timeStr = now.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    
    // Build Telegram message
    const telegramMessage = `💬 *Новое сообщение*

${flag} *${country || convDetails?.visitor_country || 'Unknown'}*
🕐 ${timeStr}
👤 ${convDetails?.visitor_name || visitorName}
📧 ${convDetails?.visitor_email || visitorEmail}
🌐 IP: ${convDetails?.visitor_ip || visitorIp}

📝 *Сообщение:*
${message}`;

    // Send to Telegram with reply button
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '💬 Ответить', callback_data: `reply_${convId}` }
          ]]
        }
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram response:', JSON.stringify(telegramResult, null, 2));

    // Update message with telegram_message_id
    if (telegramResult.ok && telegramResult.result?.message_id) {
      await supabase
        .from('chat_messages')
        .update({ telegram_message_id: telegramResult.result.message_id })
        .eq('id', msgData.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversationId: convId,
        sessionToken: sessionToken,
        messageId: msgData.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
