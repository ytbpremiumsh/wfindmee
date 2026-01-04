import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Clock, HelpCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  thumbnail_url: string | null;
  short_description: string | null;
  category: string | null;
  estimated_time: number | null;
}

export function RecommendedQuizzes({ 
  currentQuizId, 
  currentCategory 
}: { 
  currentQuizId?: string;
  currentCategory?: string;
}) {
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['recommended-quizzes', currentQuizId, currentCategory],
    queryFn: async () => {
      // First try to get quizzes from the same category
      let query = supabase
        .from('quizzes')
        .select('id, title, thumbnail_url, short_description, category, estimated_time')
        .eq('status', 'published')
        .neq('id', currentQuizId || '')
        .limit(6);

      if (currentCategory && ['kepribadian', 'fun', 'mbti', 'karir', 'hubungan', 'kesehatan', 'lainnya'].includes(currentCategory)) {
        query = query.eq('category', currentCategory as 'kepribadian' | 'fun' | 'mbti' | 'karir' | 'hubungan' | 'kesehatan' | 'lainnya');
      }

      const { data: sameCategory } = await query;

      if (sameCategory && sameCategory.length >= 3) {
        return sameCategory as Quiz[];
      }

      // If not enough, get more from other categories
      const existingIds = sameCategory?.map(q => q.id) || [];
      existingIds.push(currentQuizId || '');

      const { data: otherQuizzes } = await supabase
        .from('quizzes')
        .select('id, title, thumbnail_url, short_description, category, estimated_time')
        .eq('status', 'published')
        .not('id', 'in', `(${existingIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(6 - (sameCategory?.length || 0));

      return [...(sameCategory || []), ...(otherQuizzes || [])] as Quiz[];
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
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Quiz Selanjutnya</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!quizzes?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Quiz Selanjutnya</h3>
        </div>
        <Link to="/quizzes">
          <Button variant="ghost" size="sm" className="gap-1">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            to={`/quiz/${quiz.id}`}
            className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="aspect-video relative overflow-hidden bg-secondary">
              {quiz.thumbnail_url ? (
                <img
                  src={quiz.thumbnail_url}
                  alt={quiz.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                {categoryLabels[quiz.category || 'lainnya'] || quiz.category}
              </span>
            </div>
            <div className="p-4">
              <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {quiz.title}
              </h4>
              {quiz.short_description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {quiz.short_description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{quiz.estimated_time || 5} menit</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
