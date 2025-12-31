import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      
      return {
        totalQuizzes: totalQuizzes ?? 0,
        publishedQuizzes: publishedQuizzes ?? 0,
        totalAttempts: totalAttempts ?? 0,
        totalBanners: totalBanners ?? 0,
        recentAttempts: recentAttempts ?? [],
      };
    },
  });
}
