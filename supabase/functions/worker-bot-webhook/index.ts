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
    reply_to_message?: {
      text?: string;
      message_id: number;
    };
  };
  callback_query?: {
    id: string;
    from: { id: number };
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

      // Admin approving/rejecting worker
      if (data.startsWith('approve_') || data.startsWith('reject_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const action = data.startsWith('approve_') ? 'approve' : 'reject';
        const workerId = data.replace('approve_', '').replace('reject_', '');

        const { data: worker, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerId)
          .single();

        if (error || !worker) {
          await answerCallbackQuery(botToken, callbackId, '❌ Воркер не найден');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (action === 'approve') {
          await supabase
            .from('workers')
            .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: userId })
            .eq('id', workerId);

          await editMessageText(botToken, chatId, messageId, 
            `✅ <b>Воркер одобрен</b>\n\n👤 ${worker.telegram_name || 'Без имени'}\n🆔 @${worker.telegram_username || 'нет username'}`
          );

          // Notify worker
          await sendTelegramMessage(botToken, worker.telegram_id, 
            '✅ <b>Ваша заявка одобрена!</b>\n\nТеперь вы можете:\n• Привязать домен\n• Получать профиты\n\nИспользуйте /menu для доступа к функциям.'
          );
        } else {
          await supabase.from('workers').delete().eq('id', workerId);

          await editMessageText(botToken, chatId, messageId,
            `❌ <b>Воркер отклонён</b>\n\n👤 ${worker.telegram_name || 'Без имени'}\n🆔 @${worker.telegram_username || 'нет username'}`
          );

          await sendTelegramMessage(botToken, worker.telegram_id, '❌ Ваша заявка отклонена.');
        }

        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Worker menu actions
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

        let profileText = `👤 <b>Ваш профиль</b>\n\n`;
        profileText += `📅 Дата регистрации: ${registrationDate}\n`;
        profileText += `💰 Баланс: <b>${parseFloat(worker.balance_sol).toFixed(4)} SOL</b>\n`;
        profileText += `📊 Всего профитов: ${totalProfits.toFixed(4)} SOL\n\n`;

        if (domains && domains.length > 0) {
          profileText += `🌐 <b>Ваши домены:</b>\n`;
          for (const domain of domains) {
            const domainProfits = profits?.filter(p => p.domain_id === domain.id) || [];
            const domainTotal = domainProfits.reduce((sum, p) => sum + parseFloat(p.amount_sol), 0);
            profileText += `• ${domain.subdomain} — ${domainTotal.toFixed(4)} SOL\n`;
          }
        } else {
          profileText += `🌐 Домены: нет привязанных доменов`;
        }

        await editMessageText(botToken, chatId, messageId, profileText, {
          reply_markup: {
            inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'menu' }]],
          },
        });
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

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

        await editMessageText(botToken, chatId, messageId,
          `🌐 <b>Привязка домена</b>\n\nОтправьте название субдомена в формате:\n<code>/domain ваш_субдомен</code>\n\nПример: <code>/domain worker1</code>\n\nВаш сайт будет доступен по адресу:\nworker1.solferno.com`,
          {
            reply_markup: {
              inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'menu' }]],
            },
          }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

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

        await editMessageText(botToken, chatId, messageId,
          `💸 <b>Запрос на вывод</b>\n\n💰 Ваш баланс: <b>${balance.toFixed(4)} SOL</b>\n\nОтправьте команду в формате:\n<code>/withdraw адрес_кошелька</code>\n\nПример:\n<code>/withdraw AHMmLk5UqivEpT3...</code>`,
          {
            reply_markup: {
              inline_keyboard: [[{ text: '◀️ Назад', callback_data: 'menu' }]],
            },
          }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

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
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Профиль', callback_data: 'profile' }],
                [{ text: '🌐 Добавить домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
        );
        await answerCallbackQuery(botToken, callbackId);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // Admin: approve withdrawal
      if (data.startsWith('payout_') || data.startsWith('reject_wd_')) {
        if (!isAdmin(userId)) {
          await answerCallbackQuery(botToken, callbackId, '❌ У вас нет прав');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const action = data.startsWith('payout_') ? 'approve' : 'reject';
        const withdrawalId = data.replace('payout_', '').replace('reject_wd_', '');

        const { data: withdrawal, error } = await supabase
          .from('withdrawal_requests')
          .select('*, workers(*)')
          .eq('id', withdrawalId)
          .single();

        if (error || !withdrawal) {
          await answerCallbackQuery(botToken, callbackId, '❌ Заявка не найдена');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (action === 'approve') {
          await supabase
            .from('withdrawal_requests')
            .update({ status: 'approved', processed_at: new Date().toISOString(), processed_by: userId })
            .eq('id', withdrawalId);

          // Deduct from worker balance
          await supabase
            .from('workers')
            .update({ balance_sol: 0 })
            .eq('id', withdrawal.worker_id);

          await editMessageText(botToken, chatId, messageId,
            `✅ <b>Выплата одобрена</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL\n💳 Кошелёк: <code>${withdrawal.wallet_address}</code>\n\n⚠️ Переведите средства и отметьте как выплачено.`,
            {
              reply_markup: {
                inline_keyboard: [[{ text: '✅ Выплачено', callback_data: `paid_${withdrawalId}` }]],
              },
            }
          );

          await sendTelegramMessage(botToken, withdrawal.workers.telegram_id,
            `✅ <b>Заявка на вывод одобрена!</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL\n\nОжидайте перевода на кошелёк.`
          );
        } else {
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
        }

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
            `✅ <b>Выплачено</b>\n\n💰 Сумма: ${parseFloat(withdrawal.amount_sol).toFixed(4)} SOL\n💳 Кошелёк: <code>${withdrawal.wallet_address}</code>`
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

    // Handle text messages
    if (update.message?.text) {
      const { from, chat, text } = update.message;
      const userId = from.id;
      const chatId = chat.id;
      const username = from.username;
      const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ');

      // /start - Registration or menu
      if (text === '/start' || text === '/menu') {
        const { data: existingWorker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!existingWorker) {
          // New worker - create registration request
          const { data: newWorker, error } = await supabase
            .from('workers')
            .insert({
              telegram_id: userId,
              telegram_username: username,
              telegram_name: fullName,
              status: 'pending',
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating worker:', error);
            await sendTelegramMessage(botToken, chatId, '❌ Ошибка при регистрации. Попробуйте позже.');
            return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
          }

          await sendTelegramMessage(botToken, chatId,
            '🔥 <b>SolFerno Workers</b>\n\n✅ Заявка на регистрацию отправлена!\n\nОжидайте одобрения администратором.'
          );

          // Notify admins
          if (adminChatId) {
            await sendTelegramMessage(botToken, parseInt(adminChatId),
              `🆕 <b>Новая заявка на регистрацию</b>\n\n👤 ${fullName || 'Без имени'}\n🆔 @${username || 'нет username'}\n📱 ID: <code>${userId}</code>`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '✅ Одобрить', callback_data: `approve_${newWorker.id}` },
                      { text: '❌ Отклонить', callback_data: `reject_${newWorker.id}` },
                    ],
                  ],
                },
              }
            );
          }

          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (existingWorker.status === 'pending') {
          await sendTelegramMessage(botToken, chatId,
            '⏳ <b>Ваша заявка на рассмотрении</b>\n\nОжидайте одобрения администратором.'
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        if (existingWorker.status === 'banned') {
          await sendTelegramMessage(botToken, chatId, '🚫 Ваш аккаунт заблокирован.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Approved worker - show menu
        await sendTelegramMessage(botToken, chatId,
          `🔥 <b>SolFerno Workers</b>\n\n💰 Баланс: <b>${parseFloat(existingWorker.balance_sol).toFixed(4)} SOL</b>\n\nВыберите действие:`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '👤 Профиль', callback_data: 'profile' }],
                [{ text: '🌐 Добавить домен', callback_data: 'add_domain' }],
                [{ text: '💸 Вывод средств', callback_data: 'withdraw' }],
              ],
            },
          }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // /domain - Add subdomain
      if (text.startsWith('/domain ')) {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await sendTelegramMessage(botToken, chatId, '❌ У вас нет доступа к этой функции.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const subdomain = text.replace('/domain ', '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

        if (!subdomain || subdomain.length < 3) {
          await sendTelegramMessage(botToken, chatId, '❌ Субдомен должен быть минимум 3 символа (только буквы, цифры, дефис).');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Check if subdomain exists
        const { data: existingDomain } = await supabase
          .from('worker_domains')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (existingDomain) {
          await sendTelegramMessage(botToken, chatId, '❌ Этот субдомен уже занят. Выберите другой.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { error } = await supabase
          .from('worker_domains')
          .insert({
            worker_id: worker.id,
            subdomain,
          });

        if (error) {
          console.error('Error adding domain:', error);
          await sendTelegramMessage(botToken, chatId, '❌ Ошибка при добавлении домена.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await sendTelegramMessage(botToken, chatId,
          `✅ <b>Домен добавлен!</b>\n\n🌐 Ваш сайт: <code>${subdomain}.solferno.com</code>\n\n⚠️ Настройка DNS может занять до 24 часов.`
        );
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      // /withdraw - Request withdrawal
      if (text.startsWith('/withdraw ')) {
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('telegram_id', userId)
          .single();

        if (!worker || worker.status !== 'approved') {
          await sendTelegramMessage(botToken, chatId, '❌ У вас нет доступа к этой функции.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const walletAddress = text.replace('/withdraw ', '').trim();
        const balance = parseFloat(worker.balance_sol);

        if (balance < 0.1) {
          await sendTelegramMessage(botToken, chatId, '❌ Минимальная сумма для вывода: 0.1 SOL');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Basic Solana address validation
        if (walletAddress.length < 32 || walletAddress.length > 44) {
          await sendTelegramMessage(botToken, chatId, '❌ Неверный формат адреса кошелька.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // Check for pending withdrawals
        const { data: pendingWithdrawal } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('worker_id', worker.id)
          .eq('status', 'pending')
          .single();

        if (pendingWithdrawal) {
          await sendTelegramMessage(botToken, chatId, '❌ У вас уже есть активная заявка на вывод. Дождитесь её обработки.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        const { data: withdrawal, error } = await supabase
          .from('withdrawal_requests')
          .insert({
            worker_id: worker.id,
            amount_sol: balance,
            wallet_address: walletAddress,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating withdrawal:', error);
          await sendTelegramMessage(botToken, chatId, '❌ Ошибка при создании заявки.');
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        await sendTelegramMessage(botToken, chatId,
          `✅ <b>Заявка на вывод создана!</b>\n\n💰 Сумма: ${balance.toFixed(4)} SOL\n💳 Кошелёк: <code>${walletAddress}</code>\n\nОжидайте обработки администратором.`
        );

        // Notify admins
        if (adminChatId) {
          await sendTelegramMessage(botToken, parseInt(adminChatId),
            `💸 <b>Новая заявка на вывод</b>\n\n👤 ${fullName || 'Без имени'} (@${username || 'нет'})\n💰 Сумма: <b>${balance.toFixed(4)} SOL</b>\n💳 Кошелёк: <code>${walletAddress}</code>`,
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

      // Admin commands
      if (isAdmin(userId)) {
        // /workers - List all workers
        if (text === '/workers') {
          const { data: workers } = await supabase
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

          if (!workers || workers.length === 0) {
            await sendTelegramMessage(botToken, chatId, '📋 Нет зарегистрированных воркеров.');
            return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
          }

          let message = '📋 <b>Список воркеров:</b>\n\n';
          for (const w of workers) {
            const statusEmoji = w.status === 'approved' ? '✅' : w.status === 'pending' ? '⏳' : '🚫';
            message += `${statusEmoji} ${w.telegram_name || 'Без имени'} (@${w.telegram_username || 'нет'}) — ${parseFloat(w.balance_sol).toFixed(4)} SOL\n`;
          }

          await sendTelegramMessage(botToken, chatId, message);
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }

        // /stats - Overall statistics
        if (text === '/stats') {
          const { data: workers } = await supabase.from('workers').select('*').eq('status', 'approved');
          const { data: profits } = await supabase.from('profits').select('amount_sol, admin_share_sol');
          const { data: pendingWithdrawals } = await supabase.from('withdrawal_requests').select('amount_sol').eq('status', 'pending');

          const totalWorkers = workers?.length || 0;
          const totalProfits = profits?.reduce((sum, p) => sum + parseFloat(p.amount_sol), 0) || 0;
          const adminShare = profits?.reduce((sum, p) => sum + parseFloat(p.admin_share_sol), 0) || 0;
          const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount_sol), 0) || 0;

          await sendTelegramMessage(botToken, chatId,
            `📊 <b>Статистика</b>\n\n👥 Активных воркеров: ${totalWorkers}\n💰 Всего профитов: ${totalProfits.toFixed(4)} SOL\n💵 Доля админа (20%): ${adminShare.toFixed(4)} SOL\n⏳ На выплату: ${pendingAmount.toFixed(4)} SOL`
          );
          return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
        }
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