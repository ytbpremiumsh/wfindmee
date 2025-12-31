import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Quiz, QuizCategory } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizCardProps {
  quiz: Quiz;
}

const categoryLabels: Record<QuizCategory, string> = {
  personality: 'Kepribadian',
  fun: 'Fun',
  mbti: 'MBTI',
  love: 'Cinta',
  career: 'Karir',
};

const categoryBadgeClass: Record<QuizCategory, string> = {
  personality: 'category-badge-personality',
  fun: 'category-badge-fun',
  mbti: 'category-badge-mbti',
  love: 'category-badge-love',
  career: 'category-badge-career',
};

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <article className="quiz-card group">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={quiz.thumbnail}
          alt={quiz.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("category-badge", categoryBadgeClass[quiz.category])}>
            {categoryLabels[quiz.category]}
          </span>
        </div>

        {/* Featured indicator */}
        {quiz.isFeatured && (
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
          {quiz.shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{quiz.estimatedTime} menit</span>
            <span className="mx-1">•</span>
            <span>{quiz.questionCount} soal</span>
          </div>

          <Link to={`/quiz/${quiz.id}`}>
            <Button variant="ghost" size="sm" className="group/btn -mr-2">
              Detail
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
