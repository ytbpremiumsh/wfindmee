import { Database } from '@/integrations/supabase/types';
import { QuizCard } from '@/components/quiz/QuizCard';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

interface QuizGridProps {
  quizzes: Quiz[];
  title?: string;
  showFilter?: boolean;
}

export function QuizGrid({ quizzes, title, showFilter = false }: QuizGridProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada quiz tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
