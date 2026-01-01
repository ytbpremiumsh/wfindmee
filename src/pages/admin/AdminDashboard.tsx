import { AdminLayout } from '@/components/admin/AdminLayout';
import { FileQuestion, Users, Eye, Layers, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    { 
      label: 'Total Quiz', 
      value: stats?.totalQuizzes ?? 0, 
      icon: FileQuestion, 
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      label: 'Quiz Published', 
      value: stats?.publishedQuizzes ?? 0, 
      icon: Eye, 
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent'
    },
    { 
      label: 'Quiz Dimainkan', 
      value: stats?.totalAttempts ?? 0, 
      icon: Users, 
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    { 
      label: 'Total Banner', 
      value: stats?.totalBanners ?? 0, 
      icon: Layers, 
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
  ];

  // Format chart data
  const chartData = stats?.dailyStats?.map((item) => ({
    date: format(parseISO(item.date), 'd MMM', { locale: id }),
    fullDate: format(parseISO(item.date), 'd MMMM yyyy', { locale: id }),
    attempts: item.attempts,
  })) || [];

  // Calculate total attempts in the period
  const periodTotal = chartData.reduce((sum, item) => sum + item.attempts, 0);

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold">{stat.value}</p>
            )}
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Stats Chart */}
      <div className="bg-card rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statistik Penggunaan (14 Hari Terakhir)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total: <span className="font-medium text-foreground">{periodTotal}</span> quiz dimainkan
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  className="text-muted-foreground"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
                          <p className="text-sm text-muted-foreground">
                            Quiz dimainkan: <span className="font-medium text-primary">{payload[0].value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAttempts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Belum ada data statistik</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
          <div className="space-y-4">
            {stats.recentAttempts.map((attempt: any) => (
              <div key={attempt.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Seseorang menyelesaikan{' '}
                    <span className="text-primary">{attempt.quizzes?.title || 'Quiz'}</span>
                    {attempt.quiz_results?.personality_type && (
                      <span className="text-muted-foreground"> - Hasil: {attempt.quiz_results.personality_type}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true, locale: id })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Belum ada aktivitas. Buat quiz pertama Anda!
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
