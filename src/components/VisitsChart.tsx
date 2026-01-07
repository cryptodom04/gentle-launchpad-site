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
    <div className="space-y-3 sm:space-y-4">
      {/* Date Pickers - Compact */}
      <Card className="glass border-border/30">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground">От:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[90px] sm:w-[130px] justify-start text-left font-normal border-border/50 text-[10px] sm:text-sm h-7 sm:h-9 px-2",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    {dateFrom ? format(dateFrom, 'dd.MM.yy') : '...'}
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

            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground">До:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[90px] sm:w-[130px] justify-start text-left font-normal border-border/50 text-[10px] sm:text-sm h-7 sm:h-9 px-2",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    {dateTo ? format(dateTo, 'dd.MM.yy') : '...'}
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
              className="border-border/50 h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-sm"
            >
              <RefreshCw className={cn("w-3 h-3 sm:w-4 sm:h-4", loading && "animate-spin")} />
            </Button>

            <Badge variant="secondary" className="text-[10px] sm:text-xs py-0.5 ml-auto">
              {totalVisits} визитов
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Single Chart - Simplified */}
      <Card className="glass border-border/30">
        <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Посещения
          </CardTitle>
        </CardHeader>
        <CardContent className="px-1 sm:px-4 pb-3">
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Визиты"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Simple Country List */}
      <Card className="glass border-border/30">
        <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            Топ стран
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {countryStats.slice(0, 8).map((stat) => (
              <div 
                key={stat.country}
                className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded bg-secondary/30"
              >
                <span className="text-sm sm:text-lg">{stat.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium truncate">{stat.country}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.visits}</p>
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
