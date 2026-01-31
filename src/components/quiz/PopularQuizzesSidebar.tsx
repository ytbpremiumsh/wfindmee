import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Play } from 'lucide-react';

interface PopularQuiz {
  quiz_id: string;
  attempt_count: number;
  quiz: {
    id: string;
    title: string;
    slug: string | null;
    thumbnail_url: string | null;
    short_description: string | null;
    category: string | null;
  };
}

export function PopularQuizzesSidebar({ currentQuizId }: { currentQuizId?: string }) {
  const { data: popularQuizzes, isLoading } = useQuery({
    queryKey: ['popular-quizzes', currentQuizId],
    queryFn: async () => {
      // Get quiz attempt counts
      const { data: attempts, error: attemptsError } = await supabase
        .from('user_quiz_attempts')
        .select('quiz_id')
        .order('created_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Count attempts per quiz
      const quizCounts = attempts?.reduce((acc, attempt) => {
        acc[attempt.quiz_id] = (acc[attempt.quiz_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get top quiz IDs (excluding current)
      const topQuizIds = Object.entries(quizCounts)
        .filter(([id]) => id !== currentQuizId)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      if (topQuizIds.length === 0) {
        // Fallback: get latest published quizzes
        const { data: latestQuizzes } = await supabase
          .from('quizzes')
          .select('id, title, slug, thumbnail_url, short_description, category')
          .eq('status', 'published')
          .neq('id', currentQuizId || '')
          .order('created_at', { ascending: false })
          .limit(5);

        return (latestQuizzes || []).map(quiz => ({
          quiz_id: quiz.id,
          attempt_count: 0,
          quiz,
        }));
      }

      // Fetch quiz details
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id, title, slug, thumbnail_url, short_description, category')
        .eq('status', 'published')
        .in('id', topQuizIds);

      return topQuizIds
        .map(id => ({
          quiz_id: id,
          attempt_count: quizCounts[id],
          quiz: quizzes?.find(q => q.id === id),
        }))
        .filter(item => item.quiz) as PopularQuiz[];
    },
  });

  const categoryLabels: Record<string, string> = {
    kepribadian: 'Kepribadian',
    fun: 'Fun',
    mbti: 'MBTI',
    karir: 'Karir',
    hubungan: 'Hubungan',
    kesehatan: 'Kesehatan',
    lainnya: 'Lainnya',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Quiz Populer</h3>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!popularQuizzes?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Quiz Populer</h3>
      </div>

      {popularQuizzes.map((item) => (
        <Link
          key={item.quiz_id}
          to={`/quiz/${item.quiz.slug || item.quiz_id}`}
          className="flex gap-3 group hover:bg-secondary/50 rounded-lg p-2 -mx-2 transition-colors"
        >
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
            {item.quiz.thumbnail_url ? (
              <img
                src={item.quiz.thumbnail_url}
                alt={item.quiz.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {item.quiz.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {categoryLabels[item.quiz.category || 'lainnya'] || item.quiz.category}
              </span>
              {item.attempt_count > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {item.attempt_count} dimainkan
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
