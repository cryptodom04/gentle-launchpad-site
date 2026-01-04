import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, TrendingUp, Wallet, RefreshCw, DollarSign, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyDeposits {
  date: string;
  totalSol: number;
  count: number;
  adminShare: number;
  workerShare: number;
}

interface Profit {
  id: string;
  created_at: string;
  amount_sol: number;
  amount_usd: number | null;
  worker_share_sol: number;
  admin_share_sol: number;
  sender_address: string;
  tx_signature: string;
}

const DepositsChart = () => {
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [dailyStats, setDailyStats] = useState<DailyDeposits[]>([]);
  const [recentDeposits, setRecentDeposits] = useState<Profit[]>([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    totalSol: 0,
    totalUsd: 0,
    count: 0,
    adminShare: 0,
    workerShare: 0
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profits')
        .select('*')
        .gte('created_at', startOfDay(dateFrom).toISOString())
        .lte('created_at', endOfDay(dateTo).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setRecentDeposits(data.slice(0, 50));

        // Calculate totals
        const totalSol = data.reduce((sum, d) => sum + Number(d.amount_sol), 0);
        const totalUsd = data.reduce((sum, d) => sum + (Number(d.amount_usd) || 0), 0);
        const adminShare = data.reduce((sum, d) => sum + Number(d.admin_share_sol), 0);
        const workerShare = data.reduce((sum, d) => sum + Number(d.worker_share_sol), 0);

        setTotals({
          totalSol,
          totalUsd,
          count: data.length,
          adminShare,
          workerShare
        });

        // Group by date
        const dateMap = new Map<string, DailyDeposits>();

        data.forEach(deposit => {
          const dateKey = format(new Date(deposit.created_at), 'dd.MM');
          
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { 
              date: dateKey, 
              totalSol: 0, 
              count: 0,
              adminShare: 0,
              workerShare: 0
            });
          }
          const entry = dateMap.get(dateKey)!;
          entry.totalSol += Number(deposit.amount_sol);
          entry.adminShare += Number(deposit.admin_share_sol);
          entry.workerShare += Number(deposit.worker_share_sol);
          entry.count++;
        });

        // Convert to array and sort by date
        const dailyArray = Array.from(dateMap.values()).reverse();
        setDailyStats(dailyArray);
      }
    } catch (err) {
      console.error('Error fetching deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo]);

  // Realtime subscription for new deposits
  useEffect(() => {
    const channel = supabase
      .channel('profits_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profits'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateFrom, dateTo]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value.toFixed(4)} SOL</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      timeZone: 'Europe/Kiev',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <Card className="glass border-border/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">От:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] sm:w-[160px] justify-start text-left font-normal border-border/50",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : 'Выберите'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">До:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] sm:w-[160px] justify-start text-left font-normal border-border/50",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd.MM.yyyy') : 'Выберите'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={fetchStats} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-border/50"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border/30 hover:border-primary/30 transition-colors group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Всего SOL</p>
                <p className="text-xl sm:text-3xl font-bold mt-1 gradient-text">{totals.totalSol.toFixed(4)}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 hover:border-accent/30 transition-colors group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Депозитов</p>
                <p className="text-xl sm:text-3xl font-bold mt-1">{totals.count}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 hover:border-primary/30 transition-colors group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Админ доля</p>
                <p className="text-xl sm:text-3xl font-bold mt-1">{totals.adminShare.toFixed(4)}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 hover:border-accent/30 transition-colors group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Воркер доля</p>
                <p className="text-xl sm:text-3xl font-bold mt-1">{totals.workerShare.toFixed(4)}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Deposits Chart */}
        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Депозиты по дням (SOL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalSol"
                      name="Сумма SOL"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDeposits)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deposits Count Chart */}
        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" />
              Количество депозитов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      name="Депозитов"
                      fill="hsl(var(--accent))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deposits Table */}
      <Card className="glass border-border/30">
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Последние депозиты</CardTitle>
            <Badge variant="secondary" className="font-mono">
              {recentDeposits.length} записей
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="font-semibold">Дата</TableHead>
                  <TableHead className="font-semibold">Сумма SOL</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Админ</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Воркер</TableHead>
                  <TableHead className="font-semibold">Отправитель</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">TX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeposits.map((deposit) => (
                  <TableRow 
                    key={deposit.id} 
                    className="border-border/20 hover:bg-secondary/30 transition-colors"
                  >
                    <TableCell className="text-sm">
                      {formatTime(deposit.created_at)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{Number(deposit.amount_sol).toFixed(4)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground">{Number(deposit.admin_share_sol).toFixed(4)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground">{Number(deposit.worker_share_sol).toFixed(4)}</span>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-secondary/50 px-2 py-1 rounded">
                        {shortenAddress(deposit.sender_address)}
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <a 
                        href={`https://solscan.io/tx/${deposit.tx_signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {shortenAddress(deposit.tx_signature)}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
                {recentDeposits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Нет депозитов за выбранный период
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositsChart;
