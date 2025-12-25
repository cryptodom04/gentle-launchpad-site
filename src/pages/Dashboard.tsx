import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Eye, Globe, Clock, RefreshCw } from 'lucide-react';

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
    if (password === 'пидарасина') {
      setIsAuthenticated(true);
      setError('');
      sessionStorage.setItem('dashboard_auth', 'true');
    } else {
      setError('Неверный пароль');
    }
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
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">🔒 Dashboard Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="text-center"
            />
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            📊 SolFerno CRM Dashboard
          </h1>
          <Button 
            onClick={fetchVisits} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего визитов</p>
                <p className="text-2xl font-bold">{stats.totalVisits}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Уникальных IP</p>
                <p className="text-2xl font-bold">{stats.uniqueIPs}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Сегодня</p>
                <p className="text-2xl font-bold">{stats.todayVisits}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Стран</p>
                <p className="text-2xl font-bold">{stats.countries}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits Table */}
        <Card>
          <CardHeader>
            <CardTitle>История посещений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">🏳️</TableHead>
                    <TableHead>Дата и время</TableHead>
                    <TableHead>IP адрес</TableHead>
                    <TableHead>Страна / Город</TableHead>
                    <TableHead>Страница</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Subdomain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => {
                    let referrerDisplay = 'Direct';
                    if (visit.referrer) {
                      try {
                        const url = new URL(visit.referrer);
                        referrerDisplay = url.hostname.replace('www.', '');
                      } catch {
                        referrerDisplay = visit.referrer.substring(0, 30);
                      }
                    }

                    return (
                      <TableRow key={visit.id}>
                        <TableCell className="text-xl">
                          {getFlag(visit.visitor_country_code)}
                        </TableCell>
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {formatDate(visit.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {visit.visitor_ip || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{visit.visitor_country || 'Unknown'}</span>
                            {visit.visitor_city && (
                              <span className="text-xs text-muted-foreground">{visit.visitor_city}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {visit.page_path}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {referrerDisplay}
                        </TableCell>
                        <TableCell className="text-sm">
                          {visit.worker_subdomain && !visit.worker_subdomain.includes('preview') 
                            ? visit.worker_subdomain 
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {visits.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8">
                  Нет данных о посещениях
                </p>
              )}
              
              {loading && (
                <p className="text-center text-muted-foreground py-8">
                  Загрузка...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
