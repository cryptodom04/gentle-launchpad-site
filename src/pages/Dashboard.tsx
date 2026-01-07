import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import VisitsChart from '@/components/VisitsChart';
import DepositsChart from '@/components/DepositsChart';
import { 
  Users, 
  Eye, 
  Globe, 
  Clock, 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  Tablet,
  TrendingUp,
  MapPin,
  Activity,
  Shield,
  LogOut,
  BarChart3,
  Wallet
} from 'lucide-react';

interface PageVisit {
  id: string;
  created_at: string;
  visitor_ip: string | null;
  page_path: string;
  visitor_country: string | null;
  visitor_country_code: string | null;
  visitor_city: string | null;
  referrer: string | null;
  user_agent: string | null;
  session_id: string | null;
  worker_subdomain: string | null;
}

const getFlag = (countryCode: string | null): string => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('ru-RU', {
    timeZone: 'Europe/Kiev',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('ru-RU', {
    timeZone: 'Europe/Kiev',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDeviceType = (userAgent: string | null): 'desktop' | 'mobile' | 'tablet' => {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getDeviceIcon = (type: 'desktop' | 'mobile' | 'tablet') => {
  switch (type) {
    case 'mobile': return <Smartphone className="w-4 h-4" />;
    case 'tablet': return <Tablet className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visits, setVisits] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueIPs: 0,
    todayVisits: 0,
    countries: 0
  });

  const handleLogin = () => {
    if (password === '1488') {
      setIsAuthenticated(true);
      setError('');
      sessionStorage.setItem('dashboard_auth', 'true');
    } else {
      setError('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dashboard_auth');
    setPassword('');
  };

  useEffect(() => {
    if (sessionStorage.getItem('dashboard_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      if (data) {
        setVisits(data);
        
        const uniqueIPs = new Set(data.map(v => v.visitor_ip).filter(Boolean));
        const uniqueCountries = new Set(data.map(v => v.visitor_country_code).filter(Boolean));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayVisits = data.filter(v => new Date(v.created_at) >= today).length;

        setStats({
          totalVisits: data.length,
          uniqueIPs: uniqueIPs.size,
          todayVisits,
          countries: uniqueCountries.size
        });
      }
    } catch (err) {
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVisits();

      const channel = supabase
        .channel('page_visits_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'page_visits'
          },
          (payload) => {
            console.log('New visit:', payload);
            const newVisit = payload.new as PageVisit;
            
            setVisits((prev) => {
              const updated = [newVisit, ...prev].slice(0, 500);
              
              const uniqueIPs = new Set(updated.map(v => v.visitor_ip).filter(Boolean));
              const uniqueCountries = new Set(updated.map(v => v.visitor_country_code).filter(Boolean));
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const todayVisits = updated.filter(v => new Date(v.created_at) >= today).length;

              setStats({
                totalVisits: updated.length,
                uniqueIPs: uniqueIPs.size,
                todayVisits,
                countries: uniqueCountries.size
              });

              return updated;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-4">
        <div className="absolute inset-0 grid-bg opacity-30" />
        
        <Card className="w-full max-w-md relative glass-strong border-border/50 shadow-2xl">
          <div className="absolute inset-0 rounded-lg gradient-border" />
          
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold gradient-text">SolFerno CRM</CardTitle>
              <p className="text-muted-foreground mt-2">Введите пароль для доступа</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="h-12 text-center bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
              {error && (
                <p className="text-destructive text-center text-sm animate-fade-in">{error}</p>
              )}
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-semibold"
            >
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold gradient-text">SolFerno Analytics</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Real-time visitor tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button 
                onClick={fetchVisits} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-border/50 hover:bg-secondary/50 h-8 sm:h-9 px-2 sm:px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Обновить</span>
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-8 sm:h-9 px-2"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="glass border-border/30 hover:border-primary/30 transition-colors group">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">Всего визитов</p>
                  <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 gradient-text">{stats.totalVisits}</p>
                </div>
                <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span>Последние 500 записей</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-border/30 hover:border-accent/30 transition-colors group">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">Уникальных IP</p>
                  <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{stats.uniqueIPs}</p>
                </div>
                <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Activity className="w-3.5 h-3.5 text-accent" />
                <span>Уникальные посетители</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-border/30 hover:border-primary/30 transition-colors group">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Сегодня</p>
                  <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{stats.todayVisits}</p>
                </div>
                <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span>За текущий день</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-border/30 hover:border-accent/30 transition-colors group">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Стран</p>
                  <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{stats.countries}</p>
                </div>
                <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>География аудитории</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="visits" className="space-y-3 sm:space-y-4">
          <ScrollArea className="w-full pb-1">
            <TabsList className="bg-secondary/50 border border-border/30 p-0.5 h-auto inline-flex w-auto min-w-full sm:w-full gap-0.5">
              <TabsTrigger 
                value="visits" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-sm flex items-center gap-1"
              >
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Логи
              </TabsTrigger>
              <TabsTrigger 
                value="deposits" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-sm flex items-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Деп
              </TabsTrigger>
              <TabsTrigger 
                value="chart" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-sm flex items-center gap-1"
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Стат
              </TabsTrigger>
              <TabsTrigger 
                value="countries"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-sm flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Страны</span>
                <span className="xs:hidden">🌍</span>
              </TabsTrigger>
              <TabsTrigger 
                value="devices"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-sm flex items-center gap-1"
              >
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Устройства</span>
                <span className="xs:hidden">💻</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Visits Tab - First */}
          <TabsContent value="visits" className="mt-3 sm:mt-4">
            <Card className="glass border-border/30">
              <CardHeader className="border-b border-border/30 py-2 sm:pb-4 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-lg font-semibold">Логи посещений</CardTitle>
                  <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs py-0.5">
                    {visits.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] sm:h-[500px]">
                  {/* Mobile Card View - Compact */}
                  <div className="block sm:hidden p-2 space-y-1.5">
                    {visits.map((visit) => {
                      const deviceType = getDeviceType(visit.user_agent);
                      return (
                        <div 
                          key={visit.id}
                          className="p-2 rounded-lg bg-secondary/20 border border-border/20 flex items-center gap-2"
                        >
                          <span className="text-base flex-shrink-0">{getFlag(visit.visitor_country_code)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-medium truncate">{visit.visitor_country || '?'}</span>
                              <span className="text-[10px] text-muted-foreground">{visit.visitor_city || ''}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="font-mono">{formatTime(visit.created_at)}</span>
                              <span>•</span>
                              <span className="truncate">{visit.page_path}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-muted-foreground">
                            {getDeviceIcon(deviceType)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Desktop Table View */}
                  <Table className="hidden sm:table">
                    <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="w-[180px] font-semibold">Локация</TableHead>
                        <TableHead className="font-semibold">Дата/время</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">IP адрес</TableHead>
                        <TableHead className="font-semibold">Страница</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Устройство</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit, index) => {
                        const deviceType = getDeviceType(visit.user_agent);
                        return (
                          <TableRow 
                            key={visit.id} 
                            className="border-border/20 hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getFlag(visit.visitor_country_code)}</span>
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">{visit.visitor_country || 'Unknown'}</span>
                                  {visit.visitor_city && (
                                    <span className="text-xs text-muted-foreground">{visit.visitor_city}</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs">{formatDate(visit.created_at)}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded font-mono">
                                {visit.visitor_ip || 'N/A'}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs py-0">
                                {visit.page_path}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                {getDeviceIcon(deviceType)}
                                <span className="text-xs capitalize">{deviceType}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {visits.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Activity className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">Нет данных</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <RefreshCw className="w-6 h-6 animate-spin mb-3 opacity-50" />
                      <p className="text-sm">Загрузка...</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="mt-3 sm:mt-4">
            <DepositsChart />
          </TabsContent>

          {/* Chart/Stats Tab */}
          <TabsContent value="chart" className="mt-3 sm:mt-4">
            <VisitsChart />
          </TabsContent>

          {/* Countries Tab */}
          <TabsContent value="countries" className="mt-3 sm:mt-4">
            <Card className="glass border-border/30">
              <CardHeader className="border-b border-border/30 py-2 sm:pb-4 px-3 sm:px-6">
                <CardTitle className="text-sm sm:text-lg font-semibold">По странам</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <div className="space-y-1.5 sm:space-y-2">
                  {(() => {
                    const countryStats: Record<string, { count: number; code: string; name: string }> = {};
                    visits.forEach(v => {
                      const code = v.visitor_country_code || 'unknown';
                      const name = v.visitor_country || 'Unknown';
                      if (!countryStats[code]) {
                        countryStats[code] = { count: 0, code, name };
                      }
                      countryStats[code].count++;
                    });
                    
                    const sorted = Object.values(countryStats).sort((a, b) => b.count - a.count);
                    const maxCount = sorted[0]?.count || 1;

                    return sorted.slice(0, 10).map(({ code, name, count }) => (
                      <div 
                        key={code} 
                        className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-secondary/30"
                      >
                        <span className="text-base sm:text-lg">{getFlag(code === 'unknown' ? null : code)}</span>
                        <span className="text-[11px] sm:text-sm font-medium truncate flex-1">{name}</span>
                        <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${(count / maxCount) * 100}%`,
                              background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))`
                            }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono w-8 text-right">
                          {count}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="mt-3 sm:mt-4">
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
                visits.forEach(v => {
                  const device = getDeviceType(v.user_agent);
                  deviceStats[device]++;
                });
                
                const total = visits.length || 1;

                const devices = [
                  { key: 'desktop', name: 'PC', icon: Monitor, count: deviceStats.desktop },
                  { key: 'mobile', name: 'Моб', icon: Smartphone, count: deviceStats.mobile },
                  { key: 'tablet', name: 'Планш', icon: Tablet, count: deviceStats.tablet }
                ];

                return devices.map(({ key, name, icon: Icon, count }) => (
                  <Card key={key} className="glass border-border/30">
                    <CardContent className="p-2 sm:p-4">
                      <div className="flex flex-col items-center text-center">
                        <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2" />
                        <p className="text-lg sm:text-2xl font-bold">{count}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                          {((count / total) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
