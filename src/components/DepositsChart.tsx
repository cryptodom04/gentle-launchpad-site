import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

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

interface DepositsChartProps {
  password: string;
}

const DepositsChart = ({ password }: DepositsChartProps) => {
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
    if (!password) return;
    
    setLoading(true);
    try {
      // Use edge function to fetch data securely
      const response = await supabase.functions.invoke('dashboard-api', {
        body: { password, action: 'get_profits', limit: 100 },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      const allData = response.data?.data as Profit[] || [];
      
      // Filter by date range
      const data = allData.filter((deposit: Profit) => {
        const depositDate = new Date(deposit.created_at);
        return depositDate >= startOfDay(dateFrom) && depositDate <= endOfDay(dateTo);
      });

      setRecentDeposits(data.slice(0, 50));

      // Calculate totals
      const totalSol = data.reduce((sum: number, d: Profit) => sum + Number(d.amount_sol), 0);
      const totalUsd = data.reduce((sum: number, d: Profit) => sum + (Number(d.amount_usd) || 0), 0);
      const adminShare = data.reduce((sum: number, d: Profit) => sum + Number(d.admin_share_sol), 0);
      const workerShare = data.reduce((sum: number, d: Profit) => sum + Number(d.worker_share_sol), 0);

      setTotals({
        totalSol,
        totalUsd,
        count: data.length,
        adminShare,
        workerShare
      });

      // Group by date
      const dateMap = new Map<string, DailyDeposits>();

      data.forEach((deposit: Profit) => {
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
    } catch (err) {
      console.error('Error fetching deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo, password]);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Date Pickers */}
      <Card className="glass border-border/30">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">От:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[120px] sm:w-[160px] justify-start text-left font-normal border-border/50 text-xs sm:text-sm h-8 sm:h-10",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">До:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[120px] sm:w-[160px] justify-start text-left font-normal border-border/50 text-xs sm:text-sm h-8 sm:h-10",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
              className="border-border/50 h-8 sm:h-10 text-xs sm:text-sm"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2", loading && "animate-spin")} />
              <span className="hidden sm:inline">Обновить</span>
              <span className="sm:hidden">↻</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Deposits Chart */}
        <Card className="glass border-border/30">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Депозиты по дням (SOL)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[250px] sm:h-[300px]">
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
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              Количество депозитов
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[250px] sm:h-[300px]">
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
        <CardHeader className="border-b border-border/30 pb-4 px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold">Последние депозиты</CardTitle>
            <Badge variant="secondary" className="font-mono text-xs">
              {recentDeposits.length} записей
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] sm:h-[400px]">
            {/* Mobile Card View */}
            <div className="block sm:hidden p-3 space-y-2">
              {recentDeposits.map((deposit) => (
                <div 
                  key={deposit.id}
                  className="p-2.5 rounded-lg bg-secondary/20 border border-border/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">{Number(deposit.amount_sol).toFixed(4)} SOL</span>
                    <span className="text-xs text-muted-foreground font-mono">{formatTime(deposit.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">A: {Number(deposit.admin_share_sol).toFixed(3)}</span>
                      <span className="text-muted-foreground">W: {Number(deposit.worker_share_sol).toFixed(3)}</span>
                    </div>
                    <code className="bg-secondary/50 px-1.5 py-0.5 rounded font-mono text-xs">
                      {shortenAddress(deposit.sender_address)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <Table className="hidden sm:table">
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
                <TableRow className="border-border/30">
                  <TableHead className="text-xs font-semibold">Время</TableHead>
                  <TableHead className="text-xs font-semibold">Сумма SOL</TableHead>
                  <TableHead className="text-xs font-semibold">Админ</TableHead>
                  <TableHead className="text-xs font-semibold">Воркер</TableHead>
                  <TableHead className="text-xs font-semibold">Отправитель</TableHead>
                  <TableHead className="text-xs font-semibold">TX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeposits.map((deposit) => (
                  <TableRow key={deposit.id} className="border-border/20">
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {formatTime(deposit.created_at)}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {Number(deposit.amount_sol).toFixed(4)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Number(deposit.admin_share_sol).toFixed(4)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Number(deposit.worker_share_sol).toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">
                        {shortenAddress(deposit.sender_address)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`https://solscan.io/tx/${deposit.tx_signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                      >
                        Открыть ↗
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositsChart;
