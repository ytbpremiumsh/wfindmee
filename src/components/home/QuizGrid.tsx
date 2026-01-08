import { Database } from '@/integrations/supabase/types';
import { QuizCard } from '@/components/quiz/QuizCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { useSiteSettings } from '@/hooks/useSiteSettings';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

interface QuizGridProps {
  quizzes: Quiz[];
  title?: string;
  showFilter?: boolean;
}

export function QuizGrid({ quizzes, title, showFilter = false }: QuizGridProps) {
  const { data: settings } = useSiteSettings();
  const adsenseEnabled = settings?.adsense?.enabled;
  
  // Insert ad card after every 6 quizzes
  const getQuizzesWithAds = () => {
    if (!adsenseEnabled) return quizzes.map((quiz, index) => ({ type: 'quiz' as const, quiz, index }));
    
    const result: ({ type: 'quiz'; quiz: Quiz; index: number } | { type: 'ad'; index: number })[] = [];
    quizzes.forEach((quiz, index) => {
      result.push({ type: 'quiz', quiz, index });
      // Add ad after every 6 quizzes
      if ((index + 1) % 6 === 0 && index < quizzes.length - 1) {
        result.push({ type: 'ad', index: index + 1000 });
      }
    });
    return result;
  };

  return (
    <section className="py-6 md:py-12">
      <div className="container mx-auto px-2 md:px-4">
        {title && (
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">{title}</h2>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-muted-foreground text-sm md:text-base">Belum ada quiz tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {getQuizzesWithAds().map((item) => {
              if (item.type === 'ad') {
                return (
                  <div key={`ad-${item.index}`} className="col-span-2 lg:col-span-3 py-2">
                    <AdBanner slot="grid-inline" />
                  </div>
                );
              }
              return <QuizCard key={item.quiz.id} quiz={item.quiz} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
