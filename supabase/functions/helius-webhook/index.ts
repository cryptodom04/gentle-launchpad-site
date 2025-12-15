import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Helius sends an array of transactions
    const transactions = Array.isArray(payload) ? payload : [payload];

    for (const tx of transactions) {
      // Check for native SOL transfers
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        for (const transfer of tx.nativeTransfers) {
          if (transfer.toUserAccount === MONITORED_ADDRESS) {
            const solAmount = lamportsToSol(transfer.amount);
            const fromAddress = transfer.fromUserAccount;
            const signature = tx.signature;

            const message = `💰 <b>Новый депозит SOL!</b>\n\n` +
              `📥 Сумма: <b>${solAmount.toFixed(4)} SOL</b>\n` +
              `📤 От: <code>${fromAddress}</code>\n` +
              `🔗 <a href="https://solscan.io/tx/${signature}">Посмотреть транзакцию</a>`;

            await sendTelegramMessage(message);
            console.log(`Sent notification for ${solAmount} SOL deposit`);
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
            const signature = tx.signature;

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
