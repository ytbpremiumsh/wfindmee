import { AdminLayout } from '@/components/admin/AdminLayout';
import { FileQuestion, Users, Eye, Layers } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

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
