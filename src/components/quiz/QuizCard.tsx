import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

interface QuizCardProps {
  quiz: Quiz;
}

const categoryLabels: Record<string, string> = {
  kepribadian: 'Kepribadian',
  fun: 'Fun',
  mbti: 'MBTI',
  karir: 'Karir',
  hubungan: 'Hubungan',
  kesehatan: 'Kesehatan',
  lainnya: 'Lainnya',
};

const categoryBadgeClass: Record<string, string> = {
  kepribadian: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  fun: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  mbti: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  karir: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  hubungan: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  kesehatan: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  lainnya: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export function QuizCard({ quiz }: QuizCardProps) {
  const category = quiz.category || 'lainnya';
  
  return (
    <article className="quiz-card group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={quiz.thumbnail_url || '/placeholder.svg'}
          alt={quiz.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", categoryBadgeClass[category])}>
            {categoryLabels[category] || category}
          </span>
        </div>

        {/* Featured indicator */}
        {quiz.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {quiz.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {(quiz.short_description || quiz.description || 'Quiz menarik untuk kamu!').replace(/<[^>]*>/g, '')}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{quiz.estimated_time || 5} menit</span>
          </div>

          <Link to={`/quiz/${quiz.id}`}>
            <Button variant="ghost" size="sm" className="group/btn -mr-2">
              Mulai Quiz
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
