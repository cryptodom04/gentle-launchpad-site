import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const MONITORED_ADDRESS = 'AHMmLk5UqivEpT3BwQ7FZHKovx862EkGGrKnQeuZ8Er6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

async function getSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );
    const data = await response.json();
    return data.solana?.usd || 0;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 0;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Helius sends an array of transactions
    const transactions = Array.isArray(payload) ? payload : [payload];

    for (const tx of transactions) {
      const signature = tx.signature;
      
      if (!signature) {
        console.log('No signature found, skipping');
        continue;
      }

      // Check if already processed
      const { data: existing } = await supabase
        .from('processed_transactions')
        .select('id')
        .eq('signature', signature)
        .maybeSingle();
      
      if (existing) {
        console.log('Transaction already processed:', signature);
        continue;
      }

      // Mark as processed FIRST to prevent race conditions
      const { error: insertError } = await supabase
        .from('processed_transactions')
        .insert({ signature });
      
      if (insertError) {
        // If insert fails (duplicate), skip
        console.log('Could not insert signature (likely duplicate):', insertError.message);
        continue;
      }

      // Fetch current SOL price
      const solPrice = await getSolPrice();
      console.log('Current SOL price:', solPrice);

      // Check for native SOL transfers
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        for (const transfer of tx.nativeTransfers) {
          if (transfer.toUserAccount === MONITORED_ADDRESS) {
            const solAmount = lamportsToSol(transfer.amount);
            const usdAmount = solPrice > 0 ? (solAmount * solPrice).toFixed(2) : null;
            const fromAddress = transfer.fromUserAccount;

            let message = `💰 <b>Новый депозит SOL!</b>\n\n` +
              `📥 Сумма: <b>${solAmount.toFixed(4)} SOL</b>`;
            
            if (usdAmount) {
              message += ` (~$${usdAmount})`;
            }
            
            message += `\n📤 От: <code>${fromAddress}</code>\n` +
              `🔗 <a href="https://solscan.io/tx/${signature}">Посмотреть транзакцию</a>`;

            await sendTelegramMessage(message);
            console.log(`Sent notification for ${solAmount} SOL ($${usdAmount}) deposit`);
          }
        }
      }

      // Also check for token transfers (SPL tokens)
      if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        for (const transfer of tx.tokenTransfers) {
          if (transfer.toUserAccount === MONITORED_ADDRESS) {
            const tokenAmount = transfer.tokenAmount;
            const tokenMint = transfer.mint;
            const fromAddress = transfer.fromUserAccount;

            const message = `🪙 <b>Новый токен депозит!</b>\n\n` +
              `📥 Сумма: <b>${tokenAmount}</b>\n` +
              `🏷️ Токен: <code>${tokenMint}</code>\n` +
              `📤 От: <code>${fromAddress}</code>\n` +
              `🔗 <a href="https://solscan.io/tx/${signature}">Посмотреть транзакцию</a>`;

            await sendTelegramMessage(message);
            console.log(`Sent notification for token deposit`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
