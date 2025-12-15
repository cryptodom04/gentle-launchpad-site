import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin Telegram IDs who can approve/reject workers
const ADMIN_IDS = [7511015070, 1696569523];

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('WORKER_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const adminChatId = Deno.env.get('TELEGRAM_CHAT_ID');

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

      // ==================== REGISTRATION FLOW ====================
      
      // Step 1: Traffic type selection
      if (data.startsWith('traffic_')) {
        const trafficType = data.replace('traffic_', '');
        
        await supabase
          .from('workers')
          .update({ traffic_type: trafficType, registration_step: 'hours' })
          .eq('telegram_id', userId);

        await editMessageText(botToken, chatId, messageId,
          `📋 <b>Анкета регистрации</b>\n\n✅ Вид трафика: ${trafficType}\n\n⏰ <b>Сколько часов в день готовы уделять работе?</b>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '1-2 часа', callback_data: 'hours_1-2' }],
                [{ text: '3-5 часов', callback_data: 'hours_3-5' }],
                [{ text: '6-8 часов', callback_data: 'hours_6-8' }],
                [{ text: '8+ часов (фуллтайм)', callback_data: 'hours_8+' }],
              ],
            },
          }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Step 2: Hours per day selection
      if (data.startsWith('hours_')) {
        const hours = data.replace('hours_', '');
        
        const { data: worker } = await supabase
          .from('workers')
          .select('traffic_type')
          .eq('telegram_id', userId)
          .single();

        await supabase
          .from('workers')
          .update({ hours_per_day: hours, registration_step: 'experience' })
          .eq('telegram_id', userId);

        await editMessageText(botToken, chatId, messageId,
          `📋 <b>Анкета регистрации</b>\n\n✅ Вид трафика: ${worker?.traffic_type || 'Не указан'}\n✅ Часов в день: ${hours}\n\n💼 <b>Есть ли опыт в данной сфере?</b>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Нет опыта', callback_data: 'exp_no' }],
                [{ text: '📚 Есть теоретические знания', callback_data: 'exp_theory' }],
                [{ text: '✅ Да, есть опыт до 6 месяцев', callback_data: 'exp_6m' }],
                [{ text: '⭐ Да, опыт более 6 месяцев', callback_data: 'exp_6m+' }],
              ],
            },
          }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Step 3: Experience selection - submit application
      if (data.startsWith('exp_')) {
        const experience = data.replace('exp_', '');
        const expLabels: Record<string, string> = {
          'no': 'Нет опыта',
          'theory': 'Теоретические знания',
          '6m': 'До 6 месяцев',
          '6m+': 'Более 6 месяцев',
        };

        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        await supabase
          .from('workers')
          .update({ experience: expLabels[experience] || experience, registration_step: 'pending', status: 'pending' })
          .eq('telegram_id', userId);

        await editMessageText(botToken, chatId, messageId,
          `🔥 <b>SolFerno Workers</b>\n\n✅ Заявка на регистрацию отправлена!\n\nОжидайте одобрения администратором.`
        );

        // Send to admin chat
        if (adminChatId) {
          const applicationText = `🆕 <b>Новая заявка на регистрацию</b>\n\n` +
            `👤 <b>Имя:</b> ${fullName || 'Не указано'}\n` +
            `🆔 <b>Username:</b> @${username || 'нет'}\n` +
            `📱 <b>ID:</b> <code>${userId}</code>\n\n` +
            `📋 <b>Анкета:</b>\n` +
            `• Трафик: ${worker?.traffic_type || 'Не указан'}\n` +
            `• Часов в день: ${worker?.hours_per_day || 'Не указано'}\n` +
            `• Опыт: ${expLabels[experience] || experience}`;

          await sendTelegramMessage(botToken, parseInt(adminChatId), applicationText, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Принять', callback_data: `approve_${worker?.id}` },
                  { text: '❌ Отклонить', callback_data: `reject_${worker?.id}` },
                ],
              ],
            },
          });
        }

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
          `✅ <b>Ваша заявка одобрена!</b>\n\nДобро пожаловать в команду SolFerno! 🔥`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Мой профиль', callback_data: 'profile' }],
                [{ text: '🌐 Привязать домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
        );

        await answerCallbackQuery(botToken, callbackId, '✅ Воркер принят');
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Admin rejecting worker
      if (data.startsWith('reject_')) {
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
      if (data === 'menu' || data === 'back_menu') {
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
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Мой профиль', callback_data: 'profile' }],
                [{ text: '🌐 Привязать домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
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
        profileText += `📅 Дата регистрации: ${registrationDate}\n`;
        profileText += `✅ Дата одобрения: ${approvedDate}\n`;
        profileText += `💰 Баланс: <b>${parseFloat(worker.balance_sol).toFixed(4)} SOL</b>\n`;
        profileText += `📊 Всего профитов: ${totalProfits.toFixed(4)} SOL\n`;
        profileText += `💵 Ваша доля: 80%\n\n`;

        if (domains && domains.length > 0) {
          profileText += `🌐 <b>Ваши домены:</b>\n`;
          for (const domain of domains) {
            const domainProfits = profits?.filter(p => p.domain_id === domain.id) || [];
            const domainTotal = domainProfits.reduce((sum, p) => sum + parseFloat(p.amount_sol), 0);
            profileText += `• ${domain.subdomain}.solferno.com — ${domainTotal.toFixed(4)} SOL\n`;
          }
        } else {
          profileText += `🌐 Домены: нет привязанных`;
        }

        await editMessageText(botToken, chatId, messageId, profileText, {
          reply_markup: {
            inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'back_menu' }]],
          },
        });
        await answerCallbackQuery(botToken, callbackId);
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

        await editMessageText(botToken, chatId, messageId,
          `🌐 <b>Привязка домена</b>\n\nОтправьте желаемый субдомен одним сообщением.\n\nПример: <code>worker1</code>\n\n✨ Ваш сайт будет: <code>worker1.solferno.com</code>\n\n⚠️ Только латинские буквы, цифры и дефис (мин. 3 символа)`,
          {
            reply_markup: {
              inline_keyboard: [[{ text: '◀️ Отмена', callback_data: 'back_menu' }]],
            },
          }
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

        await editMessageText(botToken, chatId, messageId,
          `💸 <b>Вывод средств</b>\n\n💰 Ваш баланс: <b>${balance.toFixed(4)} SOL</b>\n\nОтправьте адрес вашего Solana кошелька одним сообщением:`,
          {
            reply_markup: {
              inline_keyboard: [[{ text: '◀️ Отмена', callback_data: 'back_menu' }]],
            },
          }
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
      const { from, chat, text } = update.message;
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
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Мой профиль', callback_data: 'profile' }],
                [{ text: '🌐 Привязать домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
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
          const { data: newWorker, error } = await supabase
            .from('workers')
            .insert({
              telegram_id: userId,
              telegram_username: username,
              telegram_name: fullName,
              status: 'pending',
              registration_step: 'traffic',
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating worker:', error);
            await sendTelegramMessage(botToken, chatId, '❌ Ошибка. Попробуйте позже.');
            return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
          }

          await sendTelegramMessage(botToken, chatId,
            `🔥 <b>SolFerno Workers</b>\n\nДобро пожаловать! Для регистрации заполните анкету.\n\n📋 <b>Какой вид трафика используете?</b>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📱 Инстаграм', callback_data: 'traffic_Instagram' }],
                  [{ text: '📘 Фейсбук', callback_data: 'traffic_Facebook' }],
                  [{ text: '🎵 ТикТок', callback_data: 'traffic_TikTok' }],
                  [{ text: '✈️ Телеграм', callback_data: 'traffic_Telegram' }],
                  [{ text: '🌐 Другое', callback_data: 'traffic_Other' }],
                ],
              },
            }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Existing worker
        if (existingWorker.status === 'banned') {
          await sendTelegramMessage(botToken, chatId, '🚫 Вы забанены.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (existingWorker.status === 'pending') {
          await sendTelegramMessage(botToken, chatId, '⏳ <b>Ваша заявка на рассмотрении</b>\n\nОжидайте одобрения администратором.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Approved - show menu
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n💰 Баланс: <b>${parseFloat(existingWorker.balance_sol).toFixed(4)} SOL</b>\n\nВыберите действие:`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Мой профиль', callback_data: 'profile' }],
                [{ text: '🌐 Привязать домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Handle awaiting domain input
      if (existingWorker?.registration_step === 'awaiting_domain' && existingWorker.status === 'approved') {
        const subdomain = text.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

        if (!subdomain || subdomain.length < 3) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Субдомен должен быть минимум 3 символа (буквы, цифры, дефис).',
            {
              reply_markup: {
                inline_keyboard: [[{ text: '◀️ Отмена', callback_data: 'back_menu' }]],
              },
            }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: existingDomain } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('subdomain', subdomain)
          .maybeSingle();

        if (existingDomain) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Этот субдомен уже занят. Попробуйте другой.',
            {
              reply_markup: {
                inline_keyboard: [[{ text: '◀️ Отмена', callback_data: 'back_menu' }]],
              },
            }
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await supabase
          .from('worker_domains')
          .insert({ worker_id: existingWorker.id, subdomain });

        await supabase
          .from('workers')
          .update({ registration_step: 'completed' })
          .eq('telegram_id', userId);

        await sendTelegramMessage(botToken, chatId,
          `✅ <b>Домен добавлен!</b>\n\n🌐 Ваш сайт: <code>${subdomain}.solferno.com</code>\n\n⚠️ DNS настройка может занять до 24ч.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Мой профиль', callback_data: 'profile' }],
                [{ text: '🌐 Ещё домен', callback_data: 'add_domain' }],
                [{ text: '◀️ Меню', callback_data: 'back_menu' }],
              ],
            },
          }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Handle awaiting wallet input
      if (existingWorker?.registration_step === 'awaiting_wallet' && existingWorker.status === 'approved') {
        const walletAddress = text.trim();

        if (walletAddress.length < 32 || walletAddress.length > 44) {
          await sendTelegramMessage(botToken, chatId,
            '❌ Неверный формат адреса кошелька.',
            {
              reply_markup: {
                inline_keyboard: [[{ text: '◀️ Отмена', callback_data: 'back_menu' }]],
              },
            }
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
          {
            reply_markup: {
              inline_keyboard: [[{ text: '◀️ Меню', callback_data: 'back_menu' }]],
            },
          }
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
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Мой профиль', callback_data: 'profile' }],
                [{ text: '🌐 Привязать домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
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