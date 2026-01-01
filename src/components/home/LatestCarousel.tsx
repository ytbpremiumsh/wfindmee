import { Link } from 'react-router-dom';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useArticles } from '@/hooks/useArticles';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useRef } from 'react';

export function LatestCarousel() {
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes(true);
  const { data: articles, isLoading: articlesLoading } = useArticles(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestQuizzes = quizzes?.slice(0, 8) || [];
  const latestArticles = articles?.slice(0, 4) || [];

  // Combine and interleave
  const items = [
    ...latestQuizzes.map(q => ({ ...q, type: 'quiz' as const })),
    ...latestArticles.map(a => ({ ...a, type: 'article' as const })),
  ].slice(0, 10);

  const isLoading = quizzesLoading || articlesLoading;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="w-72 h-48 rounded-xl shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🆕 Terbaru</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => scroll('left')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((item, idx) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.type === 'quiz' ? `/quiz/${item.id}` : `/artikel/${(item as any).slug}`}
              className="w-72 shrink-0 bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="aspect-video relative">
                {item.thumbnail_url ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">{item.type === 'quiz' ? '🧠' : '📝'}</span>
                  </div>
                )}
                <Badge className="absolute top-2 right-2" variant={item.type === 'quiz' ? 'default' : 'secondary'}>
                  {item.type === 'quiz' ? (item as any).category : 'Artikel'}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                {item.type === 'quiz' && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {(item as any).estimated_time} menit
                  </p>
                )}
                {item.type === 'article' && (item as any).excerpt && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {(item as any).excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
