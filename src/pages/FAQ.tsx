import { useState } from 'react';
import { ChevronDown, HelpCircle, Zap, Shield, Coins, Users, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const faqCategories = [
  {
    title: 'Начало работы',
    icon: Zap,
    questions: [
      {
        question: 'Что такое NebulaForge?',
        answer: 'NebulaForge — это платформа для создания токенов на блокчейне Solana. Мы позволяем любому пользователю создать свой собственный SPL токен без необходимости писать код или разбираться в технических деталях.'
      },
      {
        question: 'Как начать создавать токены?',
        answer: 'Просто перейдите на страницу Create, заполните форму с параметрами вашего токена (название, символ, количество), подключите кошелёк Solana и оплатите комиссию. Токен будет создан автоматически.'
      },
      {
        question: 'Нужны ли технические знания?',
        answer: 'Нет! Наша платформа разработана так, чтобы любой человек мог создать токен. Интуитивно понятный интерфейс проведёт вас через весь процесс шаг за шагом.'
      }
    ]
  },
  {
    title: 'Безопасность',
    icon: Shield,
    questions: [
      {
        question: 'Безопасна ли платформа?',
        answer: 'Да, мы используем проверенные смарт-контракты и следуем лучшим практикам безопасности. Все транзакции происходят напрямую в блокчейне Solana, что гарантирует прозрачность и неизменяемость.'
      },
      {
        question: 'Как защищены мои средства?',
        answer: 'Мы никогда не храним ваши приватные ключи. Все операции подписываются в вашем кошельке. Платформа только формирует транзакции, но не имеет доступа к вашим средствам.'
      },
      {
        question: 'Могу ли я потерять токены?',
        answer: 'После создания токены принадлежат только вам и хранятся в вашем кошельке. Потерять их можно только при утере доступа к кошельку, поэтому храните seed-фразу в безопасном месте.'
      }
    ]
  },
  {
    title: 'Токены и комиссии',
    icon: Coins,
    questions: [
      {
        question: 'Сколько стоит создание токена?',
        answer: 'Стоимость создания токена зависит от выбранных параметров. Базовая цена начинается от 0.5 SOL и включает все необходимые операции в блокчейне.'
      },
      {
        question: 'Какие параметры можно настроить?',
        answer: 'Вы можете настроить: название токена, символ (тикер), общее количество, количество десятичных знаков, описание, иконку и метаданные.'
      },
      {
        question: 'Можно ли изменить токен после создания?',
        answer: 'Некоторые параметры (метаданные, иконка) могут быть изменены, если вы сохранили права администратора. Основные параметры (supply, decimals) неизменяемы.'
      }
    ]
  },
  {
    title: 'Сообщество',
    icon: Users,
    questions: [
      {
        question: 'Есть ли поддержка?',
        answer: 'Да! Мы предоставляем поддержку через Telegram и Discord. Наша команда готова ответить на любые вопросы и помочь с созданием токенов.'
      },
      {
        question: 'Как связаться с командой?',
        answer: 'Вы можете написать нам в Telegram @nebulaforge_support или присоединиться к нашему Discord серверу. Также доступна email поддержка.'
      }
    ]
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  const toggleItem = (category: string, index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [category]: prev[category] === index ? null : index
    }));
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Центр поддержки</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Часто задаваемые{' '}
              <span className="gradient-text">вопросы</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Найдите ответы на популярные вопросы о создании токенов на Solana
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: '24/7', label: 'Поддержка' },
              { value: '< 5s', label: 'Время создания' },
              { value: '99.9%', label: 'Uptime' },
              { value: '10K+', label: 'Токенов создано' }
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {faqCategories.map((category) => (
              <div key={category.title} className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">{category.title}</h2>
                </div>
                
                <div className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <div 
                      key={index}
                      className="rounded-2xl bg-secondary/30 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(category.title, index)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-medium text-sm sm:text-base pr-4">{faq.question}</span>
                        <ChevronDown 
                          className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                            openItems[category.title] === index && "rotate-180"
                          )}
                        />
                      </button>
                      
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          openItems[category.title] === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <div className="relative z-10">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Не нашли ответ?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Свяжитесь с нашей командой поддержки, и мы ответим в течение 24 часов
              </p>
              <a 
                href="mailto:support@nebulaforge.io"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity"
              >
                Написать в поддержку
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
