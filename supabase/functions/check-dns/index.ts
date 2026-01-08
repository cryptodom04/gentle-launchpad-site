import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_IP = '185.158.133.1';

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResponse {
  Status: number;
  Answer?: DnsRecord[];
}

async function checkDnsRecords(domain: string): Promise<{ verified: boolean; ip: string | null }> {
  try {
    // Use Google DNS-over-HTTPS to check A records
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { 'Accept': 'application/dns-json' } }
    );

    if (!response.ok) {
      console.log(`DNS check failed for ${domain}: HTTP ${response.status}`);
      return { verified: false, ip: null };
    }

    const data: DnsResponse = await response.json();
    
    if (data.Status !== 0 || !data.Answer) {
      console.log(`DNS check for ${domain}: No A records found`);
      return { verified: false, ip: null };
    }

    // Find A records
    const aRecords = data.Answer.filter(r => r.type === 1);
    
    if (aRecords.length === 0) {
      console.log(`DNS check for ${domain}: No A records in answer`);
      return { verified: false, ip: null };
    }

    const ip = aRecords[0].data;
    const verified = aRecords.some(r => r.data === LOVABLE_IP);
    
    console.log(`DNS check for ${domain}: IP=${ip}, verified=${verified}`);
    return { verified, ip };
  } catch (error) {
    console.error(`DNS check error for ${domain}:`, error);
    return { verified: false, ip: null };
  }
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const botToken = Deno.env.get('WORKER_BOT_TOKEN');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active domains that are not verified yet
    const { data: domains, error: fetchError } = await supabase
      .from('worker_domains')
      .select('*, workers!inner(telegram_id, telegram_name, status)')
      .eq('is_active', true)
      .eq('dns_verified', false)
      .eq('workers.status', 'approved');

    if (fetchError) {
      throw fetchError;
    }

    if (!domains || domains.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No domains to check', checked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking DNS for ${domains.length} domains`);

    let verified = 0;
    let notified = 0;

    for (const domain of domains) {
      const { verified: isVerified, ip } = await checkDnsRecords(domain.subdomain);

      // Update check timestamp
      await supabase
        .from('worker_domains')
        .update({ 
          dns_checked_at: new Date().toISOString(),
          dns_verified: isVerified 
        })
        .eq('id', domain.id);

      if (isVerified) {
        verified++;

        // Send notification if not already notified
        if (!domain.dns_notified && botToken && domain.workers?.telegram_id) {
          await sendTelegramMessage(
            botToken,
            domain.workers.telegram_id,
            `✅ <b>DNS настроен правильно!</b>\n\n` +
            `🌐 Домен: <code>${domain.subdomain}</code>\n` +
            `📍 IP: <code>${LOVABLE_IP}</code>\n\n` +
            `Теперь добавьте домен в Lovable:\n` +
            `Settings → Domains → Connect Domain\n\n` +
            `После этого ваш сайт будет доступен по адресу:\n` +
            `🔗 https://${domain.subdomain}`
          );

          await supabase
            .from('worker_domains')
            .update({ dns_notified: true })
            .eq('id', domain.id);

          notified++;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'DNS check completed',
        checked: domains.length,
        verified,
        notified
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DNS check error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
