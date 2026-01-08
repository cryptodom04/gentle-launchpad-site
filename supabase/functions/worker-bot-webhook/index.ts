import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin Telegram IDs who can approve/reject workers
const ADMIN_IDS = [7511015070, 1696569523];

// DNS settings for custom domains
const DNS_SERVER_IP = '185.158.133.1';
const DNS_NAMESERVERS = ['ns1.cloudflare.com', 'ns2.cloudflare.com'];

const isAdmin = (userId: number): boolean => ADMIN_IDS.includes(userId);

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    chat: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number; username?: string; first_name?: string; last_name?: string };
    message: { chat: { id: number }; message_id: number };
    data: string;
  };
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string, options: any = {}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options,
    }),
  });
  return response.json();
}

async function answerCallbackQuery(botToken: string, callbackQueryId: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
}

async function editMessageText(botToken: string, chatId: number, messageId: number, text: string, options: any = {}) {
  await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...options,
    }),
  });
}

async function deleteMessage(botToken: string, chatId: number, messageId: number) {
  await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  });
}

// Helper to create main menu keyboard
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👤 Мой профиль', callback_data: 'profile' }],
      [{ text: '🌐 Мои домены', callback_data: 'domains' }],
      [{ text: '➕ Добавить домен', callback_data: 'add_domain' }],
      [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
    ],
  };
}

// Helper to create back button
function getBackButton(callback: string = 'back_menu') {
  return {
    inline_keyboard: [[{ text: '◀️ Назад', callback_data: callback }]],
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('WORKER_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const adminChatId = Deno.env.get('WORKER_ADMIN_CHAT_ID');

    if (!botToken || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const update: TelegramUpdate = await req.json();

    console.log('Worker bot received update:', JSON.stringify(update, null, 2));

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const { id: callbackId, from, message, data } = update.callback_query;
      const userId = from.id;
      const chatId = message.chat.id;
      const messageId = message.message_id;
      const username = from.username;
      const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ');

      // ==================== BACK NAVIGATION ====================
      
      // Back to main menu
      if (data === 'back_menu') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await deleteMessage(botToken, chatId, messageId);
          await answerCallbackQuery(botToken, callbackId);
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Reset step if was in input mode
        await supabase
          .from('workers')
          .update({ registration_step: 'completed' })
          .eq('telegram_id', userId);

        await deleteMessage(botToken, chatId, messageId);
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n💰 Баланс: <b>${parseFloat(worker.balance_sol).toFixed(4)} SOL</b>\n\nВыберите действие:`,
          { reply_markup: getMainMenuKeyboard() }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Back during registration - go to previous step
      if (data === 'back_reg_traffic') {
        await supabase
          .from('workers')
          .update({ registration_step: 'traffic', traffic_type: null })
          .eq('telegram_id', userId);

        await deleteMessage(botToken, chatId, messageId);
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n❓ <b>Какой вид трафика вы используете?</b>\n\n<i>Напишите ответ сообщением (например: Instagram, TikTok, Telegram и т.д.)</i>`,
          { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'cancel_reg' }]] } }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      if (data === 'back_reg_hours') {
        const { data: worker } = await supabase
          .from('workers')
          .select('traffic_type')
          .eq('telegram_id', userId)
          .single();

        await supabase
          .from('workers')
          .update({ registration_step: 'hours', hours_per_day: null })
          .eq('telegram_id', userId);

        await deleteMessage(botToken, chatId, messageId);
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n✅ Трафик: ${worker?.traffic_type || 'Указан'}\n\n❓ <b>Сколько часов в день готовы работать?</b>\n\n<i>Напишите ответ сообщением (например: 3-4 часа, фуллтайм и т.д.)</i>`,
          { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_traffic' }]] } }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Cancel registration
      if (data === 'cancel_reg') {
        await supabase
          .from('workers')
          .delete()
          .eq('telegram_id', userId)
          .eq('status', 'pending');

        await deleteMessage(botToken, chatId, messageId);
        await sendTelegramMessage(botToken, chatId, '❌ Регистрация отменена. Для начала напишите /start');
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // ==================== ADMIN ACTIONS ====================

      // Admin approving worker
      if (data.startsWith('approve_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const workerId = data.replace('approve_', '');

        const { data: worker, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerId)
          .single();

        if (error || !worker) {
          await answerCallbackQuery(botToken, callbackId, '❌ Воркер не найден');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: userId, registration_step: 'completed' })
          .eq('id', workerId);

        await editMessageText(botToken, chatId, messageId,
          `✅ <b>Воркер принят</b>\n\n👤 ${worker.telegram_name || 'Без имени'}\n🆔 @${worker.telegram_username || 'нет'}\n📱 ID: <code>${worker.telegram_id}</code>`
        );

        // Notify worker with main menu
        await sendTelegramMessage(botToken, worker.telegram_id,
          `✅ <b>Ваша заявка одобрена!</b>\n\nДобро пожаловать в команду SolFerno! 🔥\n\n💡 Добавьте свой домен, чтобы начать работать.`,
          { reply_markup: getMainMenuKeyboard() }
        );

        await answerCallbackQuery(botToken, callbackId, '✅ Воркер принят');
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Admin rejecting worker
      if (data.startsWith('reject_') && !data.startsWith('reject_wd_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const workerId = data.replace('reject_', '');

        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerId)
          .single();

        if (!worker) {
          await answerCallbackQuery(botToken, callbackId, '❌ Воркер не найден');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ status: 'banned', registration_step: 'banned' })
          .eq('id', workerId);

        await editMessageText(botToken, chatId, messageId,
          `❌ <b>Воркер отклонён и забанен</b>\n\n👤 ${worker.telegram_name || 'Без имени'}\n🆔 @${worker.telegram_username || 'нет'}\n📱 ID: <code>${worker.telegram_id}</code>\n\n💡 Для разбана: <code>/unban ${worker.telegram_id}</code>`
        );

        await sendTelegramMessage(botToken, worker.telegram_id, '❌ Ваша заявка отклонена.');

        await answerCallbackQuery(botToken, callbackId, '❌ Воркер забанен');
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // ==================== WORKER MENU ACTIONS ====================

      // Main menu
      if (data === 'menu') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await editMessageText(botToken, chatId, messageId,
          `🔥 <b>SolFerno Workers</b>\n\n💰 Баланс: <b>${parseFloat(worker.balance_sol).toFixed(4)} SOL</b>\n\nВыберите действие:`,
          { reply_markup: getMainMenuKeyboard() }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Profile
      if (data === 'profile') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: domains } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('worker_id', worker.id)
          .eq('is_active', true);

        const { data: profits } = await supabase
          .from('profits')
          .select('amount_sol, domain_id')
          .eq('worker_id', worker.id);

        const totalProfits = profits?.reduce((sum, p) => sum + parseFloat(p.amount_sol), 0) || 0;
        const registrationDate = new Date(worker.created_at).toLocaleDateString('ru-RU');
        const approvedDate = worker.approved_at ? new Date(worker.approved_at).toLocaleDateString('ru-RU') : 'Не одобрен';

        let profileText = `👤 <b>Мой профиль</b>\n\n`;
        profileText += `📅 Регистрация: ${registrationDate}\n`;
        profileText += `✅ Одобрен: ${approvedDate}\n`;
        profileText += `📋 Трафик: ${worker.traffic_type || 'Не указан'}\n`;
        profileText += `⏰ Часов/день: ${worker.hours_per_day || 'Не указано'}\n`;
        profileText += `💼 Опыт: ${worker.experience || 'Не указан'}\n\n`;
        profileText += `💰 Баланс: <b>${parseFloat(worker.balance_sol).toFixed(4)} SOL</b>\n`;
        profileText += `📊 Всего заработано: ${totalProfits.toFixed(4)} SOL\n`;
        profileText += `💵 Ваша доля: 80%\n\n`;
        profileText += `🌐 Доменов: ${domains?.length || 0}`;

        await editMessageText(botToken, chatId, messageId, profileText, {
          reply_markup: getBackButton(),
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Domains list
      if (data === 'domains') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: domains } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('worker_id', worker.id)
          .order('created_at', { ascending: false });

        const { data: profits } = await supabase
          .from('profits')
          .select('amount_sol, domain_id')
          .eq('worker_id', worker.id);

        let domainsText = `🌐 <b>Мои домены</b>\n\n`;

        if (domains && domains.length > 0) {
          for (const domain of domains) {
            const domainProfits = profits?.filter(p => p.domain_id === domain.id) || [];
            const domainTotal = domainProfits.reduce((sum, p) => sum + parseFloat(p.amount_sol), 0);
            const txCount = domainProfits.length;
            
            // Status: active + dns verified
            let statusIcon = '❌';
            if (domain.is_active && domain.dns_verified) {
              statusIcon = '✅';
            } else if (domain.is_active && !domain.dns_verified) {
              statusIcon = '⏳';
            }
            
            domainsText += `${statusIcon} <code>${domain.subdomain}</code>\n`;
            domainsText += `   💰 ${domainTotal.toFixed(4)} SOL • 📊 ${txCount} транз.\n`;
            
            if (domain.is_active && !domain.dns_verified) {
              domainsText += `   ⚠️ <i>DNS не подтверждён</i>\n`;
            }
            domainsText += `\n`;
          }
          
          domainsText += `<i>✅ = DNS OK • ⏳ = ожидает DNS</i>`;
        } else {
          domainsText += `<i>У вас нет привязанных доменов</i>\n\n`;
          domainsText += `💡 Добавьте домен, чтобы начать зарабатывать!`;
        }

        const keyboard = [
          [{ text: '➕ Добавить домен', callback_data: 'add_domain' }],
        ];
        
        if (domains && domains.length > 0) {
          keyboard.push([{ text: '🔍 Проверить DNS', callback_data: 'check_domains_dns' }]);
          keyboard.push([{ text: '📖 Инструкция DNS', callback_data: 'dns_help' }]);
          keyboard.push([{ text: '📊 Статистика доменов', callback_data: 'domain_stats' }]);
          keyboard.push([{ text: '🗑 Удалить домен', callback_data: 'delete_domains' }]);
        } else {
          keyboard.push([{ text: '📖 Инструкция DNS', callback_data: 'dns_help' }]);
        }
        
        keyboard.push([{ text: '◀️ Назад', callback_data: 'back_menu' }]);

        await editMessageText(botToken, chatId, messageId, domainsText, {
          reply_markup: { inline_keyboard: keyboard },
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Domain statistics
      if (data === 'domain_stats') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: domains } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('worker_id', worker.id)
          .order('created_at', { ascending: false });

        const { data: profits } = await supabase
          .from('profits')
          .select('amount_sol, worker_share_sol, domain_id, created_at')
          .eq('worker_id', worker.id);

        let statsText = `📊 <b>Статистика доменов</b>\n\n`;

        if (domains && domains.length > 0) {
          let totalProfit = 0;
          let totalTx = 0;

          for (const domain of domains) {
            const domainProfits = profits?.filter(p => p.domain_id === domain.id) || [];
            const domainTotal = domainProfits.reduce((sum, p) => sum + parseFloat(p.worker_share_sol), 0);
            const txCount = domainProfits.length;
            totalProfit += domainTotal;
            totalTx += txCount;

            const status = domain.is_active ? '🟢' : '🔴';
            const addedDate = new Date(domain.created_at).toLocaleDateString('ru-RU');
            
            statsText += `${status} <b>${domain.subdomain}</b>\n`;
            statsText += `├ 💰 Заработок: ${domainTotal.toFixed(4)} SOL\n`;
            statsText += `├ 📈 Транзакций: ${txCount}\n`;
            statsText += `└ 📅 Добавлен: ${addedDate}\n\n`;
          }

          statsText += `━━━━━━━━━━━━━━━━━━━━\n`;
          statsText += `📊 <b>Итого:</b>\n`;
          statsText += `💰 Заработок: ${totalProfit.toFixed(4)} SOL\n`;
          statsText += `📈 Транзакций: ${totalTx}\n`;
          statsText += `🌐 Доменов: ${domains.length}`;
        } else {
          statsText += `<i>Нет данных для отображения</i>`;
        }

        await editMessageText(botToken, chatId, messageId, statsText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Мои домены', callback_data: 'domains' }],
              [{ text: '◀️ Меню', callback_data: 'back_menu' }],
            ],
          },
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // DNS help instructions
      if (data === 'dns_help') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const helpText = 
          `📖 <b>Инструкция по настройке DNS</b>\n\n` +
          `Для привязки вашего домена к SolFerno:\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<b>1️⃣ Войдите в DNS панель</b>\n` +
          `Зайдите туда, где покупали домен\n` +
          `(Namecheap, GoDaddy, Cloudflare и т.д.)\n\n` +
          `<b>2️⃣ Создайте A записи:</b>\n\n` +
          `<b>Запись 1 (основной домен):</b>\n` +
          `├ Тип: <code>A</code>\n` +
          `├ Имя: <code>@</code>\n` +
          `└ IP: <code>${DNS_SERVER_IP}</code>\n\n` +
          `<b>Запись 2 (www):</b>\n` +
          `├ Тип: <code>A</code>\n` +
          `├ Имя: <code>www</code>\n` +
          `└ IP: <code>${DNS_SERVER_IP}</code>\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<b>3️⃣ Для Cloudflare:</b>\n` +
          `• Proxy: OFF (серое облако)\n` +
          `• Или SSL: Full (strict)\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<b>4️⃣ Добавьте в Lovable:</b>\n` +
          `Settings → Domains → Connect\n\n` +
          `⏳ Ожидание DNS: 24-72 часа`;

        await editMessageText(botToken, chatId, messageId, helpText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Мои домены', callback_data: 'domains' }],
              [{ text: '◀️ Меню', callback_data: 'back_menu' }],
            ],
          },
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Check DNS for a specific domain
      if (data.startsWith('check_dns_')) {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const domainId = data.replace('check_dns_', '');

        const { data: domain } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('id', domainId)
          .eq('worker_id', worker.id)
          .single();

        if (!domain) {
          await answerCallbackQuery(botToken, callbackId, '❌ Домен не найден');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await answerCallbackQuery(botToken, callbackId, '🔍 Проверяю DNS...');

        // Check DNS using Google DNS-over-HTTPS
        try {
          const dnsResponse = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(domain.subdomain)}&type=A`,
            { headers: { 'Accept': 'application/dns-json' } }
          );

          const dnsData = await dnsResponse.json();
          
          let resultText = `🔍 <b>Проверка DNS</b>\n\n🌐 Домен: <code>${domain.subdomain}</code>\n\n`;
          
          if (dnsData.Status === 0 && dnsData.Answer) {
            const aRecords = dnsData.Answer.filter((r: any) => r.type === 1);
            
            if (aRecords.length > 0) {
              const ip = aRecords[0].data;
              const isCorrect = ip === DNS_SERVER_IP;
              
              resultText += `📍 <b>Текущий IP:</b> <code>${ip}</code>\n`;
              resultText += `📍 <b>Требуемый IP:</b> <code>${DNS_SERVER_IP}</code>\n\n`;
              
              if (isCorrect) {
                resultText += `✅ <b>DNS настроен правильно!</b>\n\n`;
                resultText += `Теперь добавьте домен в Lovable:\n`;
                resultText += `Settings → Domains → Connect Domain`;
                
                // Update domain as verified
                await supabase
                  .from('worker_domains')
                  .update({ 
                    dns_verified: true, 
                    dns_checked_at: new Date().toISOString(),
                    dns_notified: true 
                  })
                  .eq('id', domainId);
              } else {
                resultText += `❌ <b>IP не совпадает!</b>\n\n`;
                resultText += `Измените A запись в DNS панели:\n`;
                resultText += `• Имя: <code>@</code>\n`;
                resultText += `• IP: <code>${DNS_SERVER_IP}</code>`;
              }
            } else {
              resultText += `❌ <b>A записи не найдены</b>\n\n`;
              resultText += `Добавьте A запись в DNS панели.`;
            }
          } else {
            resultText += `❌ <b>DNS записи не найдены</b>\n\n`;
            resultText += `Возможные причины:\n`;
            resultText += `• Домен не существует\n`;
            resultText += `• DNS ещё не обновился`;
          }

          await editMessageText(botToken, chatId, messageId, resultText, {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Проверить снова', callback_data: `check_dns_${domainId}` }],
                [{ text: '🌐 Мои домены', callback_data: 'domains' }],
                [{ text: '◀️ Меню', callback_data: 'back_menu' }],
              ],
            },
          });
        } catch (error) {
          await editMessageText(botToken, chatId, messageId,
            `❌ Ошибка проверки DNS\n\nПопробуйте позже.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🔄 Повторить', callback_data: `check_dns_${domainId}` }],
                  [{ text: '◀️ Назад', callback_data: 'domains' }],
                ],
              },
            }
          );
        }

        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Show domains with check DNS option
      if (data === 'check_domains_dns') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: domains } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('worker_id', worker.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!domains || domains.length === 0) {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доменов');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        let checkText = `🔍 <b>Проверка DNS</b>\n\nВыберите домен для проверки:`;

        const keyboard = domains.map(d => {
          const status = d.dns_verified ? '✅' : '⏳';
          return [{ text: `${status} ${d.subdomain}`, callback_data: `check_dns_${d.id}` }];
        });
        keyboard.push([{ text: '◀️ Назад', callback_data: 'domains' }]);

        await editMessageText(botToken, chatId, messageId, checkText, {
          reply_markup: { inline_keyboard: keyboard },
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Delete domains - show list
      if (data === 'delete_domains') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: domains } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('worker_id', worker.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!domains || domains.length === 0) {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доменов для удаления');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        let deleteText = `🗑 <b>Удаление домена</b>\n\n`;
        deleteText += `Выберите домен для удаления:\n\n`;
        deleteText += `⚠️ Статистика домена сохранится`;

        const keyboard = domains.map(d => ([{ text: `🗑 ${d.subdomain}`, callback_data: `del_domain_${d.id}` }]));
        keyboard.push([{ text: '◀️ Назад', callback_data: 'domains' }]);

        await editMessageText(botToken, chatId, messageId, deleteText, {
          reply_markup: { inline_keyboard: keyboard },
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Delete specific domain
      if (data.startsWith('del_domain_')) {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const domainId = data.replace('del_domain_', '');

        // Verify domain belongs to worker
        const { data: domain } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('id', domainId)
          .eq('worker_id', worker.id)
          .single();

        if (!domain) {
          await answerCallbackQuery(botToken, callbackId, '❌ Домен не найден');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Deactivate domain (keep for stats)
        await supabase
          .from('worker_domains')
          .update({ is_active: false })
          .eq('id', domainId);

        await editMessageText(botToken, chatId, messageId,
          `✅ <b>Домен удалён</b>\n\n🌐 <code>${domain.subdomain}</code>\n\n<i>Статистика сохранена</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🌐 Мои домены', callback_data: 'domains' }],
                [{ text: '◀️ Меню', callback_data: 'back_menu' }],
              ],
            },
          }
        );
        await answerCallbackQuery(botToken, callbackId, '✅ Домен удалён');
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Add domain - show input prompt
      if (data === 'add_domain') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ registration_step: 'awaiting_domain' })
          .eq('telegram_id', userId);

        await deleteMessage(botToken, chatId, messageId);
        await sendTelegramMessage(botToken, chatId,
          `🌐 <b>Добавление домена</b>\n\n` +
          `Отправьте ваш домен одним сообщением.\n\n` +
          `📝 <b>Примеры:</b>\n` +
          `• <code>mydomain.com</code>\n` +
          `• <code>crypto.mysite.org</code>\n\n` +
          `⚠️ Домен должен быть зарегистрирован на вас`,
          { reply_markup: getBackButton() }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Withdraw - show input prompt
      if (data === 'withdraw') {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await answerCallbackQuery(botToken, callbackId, '❌ Нет доступа');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const balance = parseFloat(worker.balance_sol);
        if (balance < 0.1) {
          await answerCallbackQuery(botToken, callbackId, '❌ Минимум для вывода: 0.1 SOL');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Check pending withdrawals
        const { data: pendingWithdrawal } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('worker_id', worker.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (pendingWithdrawal) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас уже есть активная заявка');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ registration_step: 'awaiting_wallet' })
          .eq('telegram_id', userId);

        await deleteMessage(botToken, chatId, messageId);
        await sendTelegramMessage(botToken, chatId,
          `💸 <b>Вывод средств</b>\n\n💰 Ваш баланс: <b>${balance.toFixed(4)} SOL</b>\n\nОтправьте адрес вашего Solana кошелька:`,
          { reply_markup: getBackButton() }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // ==================== ADMIN WITHDRAWAL ACTIONS ====================

      if (data.startsWith('payout_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const withdrawalId = data.replace('payout_', '');

        const { data: withdrawal } = await supabase
          .from('withdrawal_requests')
          .select('*, workers(*)')
          .eq('id', withdrawalId)
          .single();

        if (!withdrawal) {
          await answerCallbackQuery(botToken, callbackId, '❌ Заявка не найдена');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('withdrawal_requests')
          .update({ status: 'approved', processed_at: new Date().toISOString(), processed_by: userId })
          .eq('id', withdrawalId);

        await supabase
          .from('workers')
          .update({ balance_sol: 0 })
          .eq('id', withdrawal.worker_id);

        await editMessageText(botToken, chatId, messageId,
          `✅ <b>Выплата одобрена</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL\n💳 Кошелёк: <code>${withdrawal.wallet_address}</code>\n\n⚠️ Переведите средства вручную`,
          {
            reply_markup: {
              inline_keyboard: [[{ text: '✅ Выплачено', callback_data: `paid_${withdrawalId}` }]],
            },
          }
        );

        await sendTelegramMessage(botToken, withdrawal.workers.telegram_id,
          `✅ <b>Заявка на вывод одобрена!</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL\n\nОжидайте перевода.`
        );

        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      if (data.startsWith('reject_wd_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const withdrawalId = data.replace('reject_wd_', '');

        const { data: withdrawal } = await supabase
          .from('withdrawal_requests')
          .select('*, workers(*)')
          .eq('id', withdrawalId)
          .single();

        if (!withdrawal) {
          await answerCallbackQuery(botToken, callbackId, '❌ Заявка не найдена');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('withdrawal_requests')
          .update({ status: 'rejected', processed_at: new Date().toISOString(), processed_by: userId })
          .eq('id', withdrawalId);

        await editMessageText(botToken, chatId, messageId,
          `❌ <b>Выплата отклонена</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL`
        );

        await sendTelegramMessage(botToken, withdrawal.workers.telegram_id,
          '❌ Ваша заявка на вывод отклонена. Обратитесь к администратору.'
        );

        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      if (data.startsWith('paid_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const withdrawalId = data.replace('paid_', '');

        const { data: withdrawal } = await supabase
          .from('withdrawal_requests')
          .select('*, workers(*)')
          .eq('id', withdrawalId)
          .single();

        if (withdrawal) {
          await supabase
            .from('withdrawal_requests')
            .update({ status: 'paid' })
            .eq('id', withdrawalId);

          await editMessageText(botToken, chatId, messageId,
            `✅ <b>Выплачено</b>\n\n💰 ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL → <code>${withdrawal.wallet_address}</code>`
          );

          await sendTelegramMessage(botToken, withdrawal.workers.telegram_id,
            `✅ <b>Средства отправлены!</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL\n💳 На кошелёк: <code>${withdrawal.wallet_address}</code>`
          );
        }

        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // ==================== TEXT MESSAGES ====================
    if (update.message?.text) {
      const { from, chat, text, message_id } = update.message;
      const userId = from.id;
      const chatId = chat.id;
      const username = from.username;
      const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ');

      // Admin unban command
      if (text.startsWith('/unban ') && isAdmin(userId)) {
        const targetId = text.replace('/unban ', '').trim();

        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', parseInt(targetId))
          .single();

        if (!worker) {
          await sendTelegramMessage(botToken, chatId, '❌ Воркер с таким ID не найден.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (worker.status !== 'banned') {
          await sendTelegramMessage(botToken, chatId, '⚠️ Этот воркер не забанен.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ status: 'approved', registration_step: 'completed' })
          .eq('telegram_id', parseInt(targetId));

        await sendTelegramMessage(botToken, chatId,
          `✅ <b>Воркер разбанен</b>\n\n👤 ${worker.telegram_name || 'Без имени'}\n🆔 @${worker.telegram_username || 'нет'}`
        );

        // Notify worker
        await sendTelegramMessage(botToken, worker.telegram_id,
          `✅ <b>Вы были разбанены!</b>\n\nТеперь вы можете пользоваться ботом.`,
          { reply_markup: getMainMenuKeyboard() }
        );

        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Admin stats
      if (text === '/stats' && isAdmin(userId)) {
        const { data: workers } = await supabase.from('workers').select('*').eq('status', 'approved');
        const { data: profits } = await supabase.from('profits').select('amount_sol, admin_share_sol');
        const { data: pendingWithdrawals } = await supabase.from('withdrawal_requests').select('amount_sol').eq('status', 'pending');

        const totalWorkers = workers?.length || 0;
        const totalProfits = profits?.reduce((sum, p) => sum + parseFloat(p.amount_sol), 0) || 0;
        const adminShare = profits?.reduce((sum, p) => sum + parseFloat(p.admin_share_sol), 0) || 0;
        const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount_sol), 0) || 0;

        await sendTelegramMessage(botToken, chatId,
          `📊 <b>Статистика</b>\n\n👥 Воркеров: ${totalWorkers}\n💰 Профитов: ${totalProfits.toFixed(4)} SOL\n💵 Доля админа: ${adminShare.toFixed(4)} SOL\n⏳ На выплату: ${pendingAmount.toFixed(4)} SOL`
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Admin workers list
      if (text === '/workers' && isAdmin(userId)) {
        const { data: workers } = await supabase
          .from('workers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!workers || workers.length === 0) {
          await sendTelegramMessage(botToken, chatId, '📋 Нет воркеров.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        let msg = '📋 <b>Воркеры:</b>\n\n';
        for (const w of workers) {
          const emoji = w.status === 'approved' ? '✅' : w.status === 'pending' ? '⏳' : '🚫';
          msg += `${emoji} ${w.telegram_name || 'Без имени'} (@${w.telegram_username || 'нет'}) — ${parseFloat(w.balance_sol).toFixed(2)} SOL\n`;
        }

        await sendTelegramMessage(botToken, chatId, msg);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Admin banned list
      if (text === '/banned' && isAdmin(userId)) {
        const { data: workers } = await supabase
          .from('workers')
          .select('*')
          .eq('status', 'banned')
          .order('created_at', { ascending: false });

        if (!workers || workers.length === 0) {
          await sendTelegramMessage(botToken, chatId, '📋 Нет забаненных воркеров.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        let msg = '🚫 <b>Забаненные воркеры:</b>\n\n';
        for (const w of workers) {
          msg += `• ${w.telegram_name || 'Без имени'} (@${w.telegram_username || 'нет'})\n`;
          msg += `  ID: <code>${w.telegram_id}</code>\n`;
          msg += `  Разбан: <code>/unban ${w.telegram_id}</code>\n\n`;
        }

        await sendTelegramMessage(botToken, chatId, msg);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Check if worker exists
      const { data: existingWorker } = await supabase
        .from('workers')
        .select('*')
        .eq('telegram_id', userId)
        .maybeSingle();

      // /start command - begin registration or show menu
      if (text === '/start') {
        if (!existingWorker) {
          // Create new worker and start registration
          const { error } = await supabase
            .from('workers')
            .insert({
              telegram_id: userId,
              telegram_username: username,
              telegram_name: fullName,
              status: 'pending',
              registration_step: 'traffic',
            });

          if (error) {
            console.error('Error creating worker:', error);
            await sendTelegramMessage(botToken, chatId, '❌ Ошибка. Попробуйте позже.');
            return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
          }

          await sendTelegramMessage(botToken, chatId,
            `🔥 <b>SolFerno Workers</b>\n\n` +
            `Добро пожаловать! Для регистрации заполните анкету.\n\n` +
            `📋 <b>Анкета регистрации</b>\n\n` +
            `❓ <b>Какой вид трафика вы используете?</b>\n\n` +
            `<i>Напишите ответ сообщением (например: Instagram, TikTok, Telegram, Facebook и т.д.)</i>`,
            { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'cancel_reg' }]] } }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Existing worker
        if (existingWorker.status === 'banned') {
          await sendTelegramMessage(botToken, chatId, '🚫 Вы забанены.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (existingWorker.status === 'pending' && existingWorker.registration_step === 'pending') {
          await sendTelegramMessage(botToken, chatId, '⏳ <b>Ваша заявка на рассмотрении</b>\n\nОжидайте одобрения администратором.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Continue registration if not finished
        if (existingWorker.status === 'pending' && existingWorker.registration_step !== 'pending') {
          const step = existingWorker.registration_step;
          
          if (step === 'traffic') {
            await sendTelegramMessage(botToken, chatId,
              `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n❓ <b>Какой вид трафика вы используете?</b>\n\n<i>Напишите ответ сообщением</i>`,
              { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'cancel_reg' }]] } }
            );
          } else if (step === 'hours') {
            await sendTelegramMessage(botToken, chatId,
              `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n✅ Трафик: ${existingWorker.traffic_type}\n\n❓ <b>Сколько часов в день готовы работать?</b>\n\n<i>Напишите ответ сообщением</i>`,
              { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_traffic' }]] } }
            );
          } else if (step === 'experience') {
            await sendTelegramMessage(botToken, chatId,
              `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n✅ Трафик: ${existingWorker.traffic_type}\n✅ Часов/день: ${existingWorker.hours_per_day}\n\n❓ <b>Опишите ваш опыт в данной сфере</b>\n\n<i>Напишите ответ сообщением</i>`,
              { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_hours' }]] } }
            );
          }
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Approved - show menu
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n💰 Баланс: <b>${parseFloat(existingWorker.balance_sol).toFixed(4)} SOL</b>\n\nВыберите действие:`,
          { reply_markup: getMainMenuKeyboard() }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // ==================== REGISTRATION FLOW (TEXT INPUTS) ====================

      // Traffic type input
      if (existingWorker?.registration_step === 'traffic' && existingWorker.status === 'pending') {
        const trafficType = text.trim();
        
        if (trafficType.length < 2 || trafficType.length > 100) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Ответ слишком короткий или длинный. Попробуйте ещё раз.',
            { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'cancel_reg' }]] } }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ traffic_type: trafficType, registration_step: 'hours' })
          .eq('telegram_id', userId);

        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n✅ Трафик: ${trafficType}\n\n❓ <b>Сколько часов в день готовы работать?</b>\n\n<i>Напишите ответ сообщением (например: 2-3 часа, 5-6 часов, фуллтайм)</i>`,
          { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_traffic' }]] } }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Hours input
      if (existingWorker?.registration_step === 'hours' && existingWorker.status === 'pending') {
        const hours = text.trim();
        
        if (hours.length < 1 || hours.length > 50) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Ответ слишком короткий или длинный. Попробуйте ещё раз.',
            { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_traffic' }]] } }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ hours_per_day: hours, registration_step: 'experience' })
          .eq('telegram_id', userId);

        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n📋 <b>Анкета регистрации</b>\n\n✅ Трафик: ${existingWorker.traffic_type}\n✅ Часов/день: ${hours}\n\n❓ <b>Опишите ваш опыт в данной сфере</b>\n\n<i>Напишите ответ сообщением (например: нет опыта, 3 месяца опыта, 1 год в крипте)</i>`,
          { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_hours' }]] } }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Experience input - submit application
      if (existingWorker?.registration_step === 'experience' && existingWorker.status === 'pending') {
        const experience = text.trim();
        
        if (experience.length < 2 || experience.length > 200) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Ответ слишком короткий или длинный. Попробуйте ещё раз.',
            { reply_markup: { inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_reg_hours' }]] } }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ experience: experience, registration_step: 'pending' })
          .eq('telegram_id', userId);

        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n✅ <b>Заявка отправлена!</b>\n\nОжидайте одобрения администратором.`
        );

        // Send to admin chat
        if (adminChatId) {
          const applicationText = `🆕 <b>Новая заявка на регистрацию</b>\n\n` +
            `👤 <b>Имя:</b> ${fullName || 'Не указано'}\n` +
            `🆔 <b>Username:</b> @${username || 'нет'}\n` +
            `📱 <b>ID:</b> <code>${userId}</code>\n\n` +
            `📋 <b>Анкета:</b>\n` +
            `• Трафик: ${existingWorker.traffic_type}\n` +
            `• Часов/день: ${existingWorker.hours_per_day}\n` +
            `• Опыт: ${experience}`;

          await sendTelegramMessage(botToken, parseInt(adminChatId), applicationText, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Принять', callback_data: `approve_${existingWorker.id}` },
                  { text: '❌ Отклонить', callback_data: `reject_${existingWorker.id}` },
                ],
              ],
            },
          });
        }

        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // ==================== APPROVED WORKER INPUT HANDLERS ====================

      // Handle awaiting domain input
      if (existingWorker?.registration_step === 'awaiting_domain' && existingWorker.status === 'approved') {
        // Parse and validate domain
        let domain = text.trim().toLowerCase();
        
        // Remove protocol if present
        domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
        // Remove trailing slash
        domain = domain.replace(/\/$/, '');

        // Validate domain format
        const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
        if (!domainRegex.test(domain) || domain.length < 4 || domain.length > 100) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Неверный формат домена.\n\nПример: <code>mydomain.com</code>',
            { reply_markup: getBackButton() }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Check if domain already exists
        const { data: existingDomain } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('subdomain', domain)
          .maybeSingle();

        if (existingDomain) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Этот домен уже добавлен. Попробуйте другой.',
            { reply_markup: getBackButton() }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Add domain
        await supabase
          .from('worker_domains')
          .insert({ worker_id: existingWorker.id, subdomain: domain });

        await supabase
          .from('workers')
          .update({ registration_step: 'completed' })
          .eq('telegram_id', userId);

        // Send DNS instructions
        const dnsInstructions = 
          `✅ <b>Домен добавлен!</b>\n\n` +
          `🌐 Домен: <code>${domain}</code>\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📋 <b>Настройка DNS</b>\n\n` +
          `Перейдите в панель управления DNS вашего домена и создайте следующие записи:\n\n` +
          `<b>1️⃣ A запись (основной домен):</b>\n` +
          `├ Тип: <code>A</code>\n` +
          `├ Имя: <code>@</code>\n` +
          `└ IP адрес: <code>${DNS_SERVER_IP}</code>\n\n` +
          `<b>2️⃣ A запись (www субдомен):</b>\n` +
          `├ Тип: <code>A</code>\n` +
          `├ Имя: <code>www</code>\n` +
          `└ IP адрес: <code>${DNS_SERVER_IP}</code>\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 <b>Если используете Cloudflare:</b>\n` +
          `• Отключите прокси (серое облако)\n` +
          `• Или включите "Full" SSL\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📌 <b>После настройки:</b>\n` +
          `Добавьте домен в Lovable:\n` +
          `Settings → Domains → Connect Domain\n\n` +
          `⏳ DNS обновление: до 24-72ч`;

        await sendTelegramMessage(botToken, chatId, dnsInstructions, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Мои домены', callback_data: 'domains' }],
              [{ text: '➕ Ещё домен', callback_data: 'add_domain' }],
              [{ text: '◀️ Меню', callback_data: 'back_menu' }],
            ],
          },
        });
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Handle awaiting wallet input
      if (existingWorker?.registration_step === 'awaiting_wallet' && existingWorker.status === 'approved') {
        const walletAddress = text.trim();

        if (walletAddress.length < 32 || walletAddress.length > 44) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Неверный формат адреса кошелька.',
            { reply_markup: getBackButton() }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const balance = parseFloat(existingWorker.balance_sol);

        const { data: withdrawal, error } = await supabase
          .from('withdrawal_requests')
          .insert({
            worker_id: existingWorker.id,
            amount_sol: balance,
            wallet_address: walletAddress,
          })
          .select()
          .single();

        if (error) {
          await sendTelegramMessage(botToken, chatId, '❌ Ошибка создания заявки.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('workers')
          .update({ registration_step: 'completed' })
          .eq('telegram_id', userId);

        await sendTelegramMessage(botToken, chatId,
          `✅ <b>Заявка на вывод создана!</b>\n\n💰 Сумма: ${balance.toFixed(4)} SOL\n💳 Кошелёк: <code>${walletAddress}</code>\n\nОжидайте обработки.`,
          { reply_markup: { inline_keyboard: [[{ text: '◀️ Меню', callback_data: 'back_menu' }]] } }
        );

        // Notify admin
        if (adminChatId) {
          await sendTelegramMessage(botToken, parseInt(adminChatId),
            `💸 <b>Заявка на вывод</b>\n\n👤 ${fullName || 'Без имени'} (@${username || 'нет'})\n💰 ${balance.toFixed(4)} SOL\n💳 <code>${walletAddress}</code>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '✅ Выплатить', callback_data: `payout_${withdrawal.id}` },
                    { text: '❌ Отклонить', callback_data: `reject_wd_${withdrawal.id}` },
                  ],
                ],
              },
            }
          );
        }

        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Unknown message - show menu if approved
      if (existingWorker?.status === 'approved') {
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\nИспользуйте кнопки меню:`,
          { reply_markup: getMainMenuKeyboard() }
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });

  } catch (error) {
    console.error('Worker bot webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
