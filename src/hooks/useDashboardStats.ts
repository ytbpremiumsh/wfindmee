import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface DailyStats {
  date: string;
  attempts: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      // Get total quizzes
      const { count: totalQuizzes } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true });
      
      // Get published quizzes
      const { count: publishedQuizzes } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      
      // Get total attempts
      const { count: totalAttempts } = await supabase
        .from('user_quiz_attempts')
        .select('*', { count: 'exact', head: true });
      
      // Get total banners
      const { count: totalBanners } = await supabase
        .from('banners')
        .select('*', { count: 'exact', head: true });
      
      // Get recent attempts
      const { data: recentAttempts } = await supabase
        .from('user_quiz_attempts')
        .select(`
          id,
          completed_at,
          quizzes (title),
          quiz_results (title, personality_type)
        `)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      // Get daily stats for the last 14 days
      const today = new Date();
      const fourteenDaysAgo = subDays(today, 13);
      
      const { data: dailyAttemptsData } = await supabase
        .from('user_quiz_attempts')
        .select('completed_at')
        .gte('completed_at', fourteenDaysAgo.toISOString())
        .order('completed_at', { ascending: true });
      
      // Aggregate by day
      const dailyMap = new Map<string, number>();
      
      // Initialize all 14 days with 0
      for (let i = 0; i < 14; i++) {
        const date = format(subDays(today, 13 - i), 'yyyy-MM-dd');
        dailyMap.set(date, 0);
      }
      
      // Count attempts per day
      dailyAttemptsData?.forEach((attempt) => {
        const date = format(new Date(attempt.completed_at), 'yyyy-MM-dd');
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });
      
      const dailyStats: DailyStats[] = Array.from(dailyMap.entries()).map(([date, attempts]) => ({
        date,
        attempts,
      }));
      
      return {
        totalQuizzes: totalQuizzes ?? 0,
        publishedQuizzes: publishedQuizzes ?? 0,
        totalAttempts: totalAttempts ?? 0,
        totalBanners: totalBanners ?? 0,
        recentAttempts: recentAttempts ?? [],
        dailyStats,
      };
    },
  });
}
