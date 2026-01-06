import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
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
import { CalendarIcon, TrendingUp, Globe, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyStats {
  date: string;
  visits: number;
  uniqueIPs: number;
}

interface CountryStats {
  country: string;
  countryCode: string;
  visits: number;
  flag: string;
}

const getFlag = (countryCode: string | null): string => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const VisitsChart = () => {
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVisits, setTotalVisits] = useState(0);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_visits')
        .select('created_at, visitor_ip, visitor_country, visitor_country_code')
        .gte('created_at', startOfDay(dateFrom).toISOString())
        .lte('created_at', endOfDay(dateTo).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setTotalVisits(data.length);

        // Group by date
        const dateMap = new Map<string, { visits: number; ips: Set<string> }>();
        const countryMap = new Map<string, { visits: number; code: string }>();

        data.forEach(visit => {
          const dateKey = format(new Date(visit.created_at), 'dd.MM');
          
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { visits: 0, ips: new Set() });
          }
          const entry = dateMap.get(dateKey)!;
          entry.visits++;
          if (visit.visitor_ip) {
            entry.ips.add(visit.visitor_ip);
          }

          // Country stats
          const country = visit.visitor_country || 'Unknown';
          if (!countryMap.has(country)) {
            countryMap.set(country, { visits: 0, code: visit.visitor_country_code || '' });
          }
          countryMap.get(country)!.visits++;
        });

        // Convert to arrays
        const dailyArray: DailyStats[] = Array.from(dateMap.entries()).map(([date, stats]) => ({
          date,
          visits: stats.visits,
          uniqueIPs: stats.ips.size
        }));

        const countryArray: CountryStats[] = Array.from(countryMap.entries())
          .map(([country, stats]) => ({
            country,
            countryCode: stats.code,
            visits: stats.visits,
            flag: getFlag(stats.code)
          }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 10);

        setDailyStats(dailyArray);
        setCountryStats(countryArray);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Pickers */}
      <Card className="glass border-border/30">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
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

            <Badge variant="secondary" className="w-fit text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {totalVisits} визитов за период
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Visits Chart */}
        <Card className="glass border-border/30">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Посещения по дням
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
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
                    dataKey="visits"
                    name="Визиты"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisits)"
                  />
                  <Area
                    type="monotone"
                    dataKey="uniqueIPs"
                    name="Уникальные IP"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUnique)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Country Stats Chart */}
        <Card className="glass border-border/30">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              Топ стран
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="country" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={100}
                    tickFormatter={(value) => {
                      const stat = countryStats.find(s => s.country === value);
                      return stat ? `${stat.flag} ${value}` : value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="visits" 
                    name="Визиты"
                    fill="hsl(var(--accent))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country List */}
      <Card className="glass border-border/30">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold">Статистика по странам</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {countryStats.map((stat) => (
              <div 
                key={stat.country}
                className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <span className="text-lg sm:text-2xl">{stat.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{stat.country}</p>
                  <p className="text-xs text-muted-foreground">{stat.visits}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitsChart;
