import { Link } from 'react-router-dom';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useArticles } from '@/hooks/useArticles';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function HeadlineNews() {
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes(true);
  const { data: articles, isLoading: articlesLoading } = useArticles(true);

  const latestQuizzes = quizzes?.slice(0, 4) || [];
  const latestArticles = articles?.slice(0, 3) || [];

  const isLoading = quizzesLoading || articlesLoading;

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl md:col-span-2" />
            <div className="space-y-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const mainQuiz = latestQuizzes[0];
  const sideQuizzes = latestQuizzes.slice(1, 3);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📰 Headline</h2>
          <Link to="/quizzes" className="text-primary hover:underline flex items-center gap-1 text-sm">
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Feature */}
          {mainQuiz && (
            <Link 
              to={`/quiz/${mainQuiz.id}`} 
              className="md:col-span-2 group relative rounded-2xl overflow-hidden bg-card shadow-lg"
            >
              <div className="aspect-[16/9]">
                {mainQuiz.thumbnail_url ? (
                  <img 
                    src={mainQuiz.thumbnail_url} 
                    alt={mainQuiz.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-6xl">🧠</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Badge className="mb-2 bg-primary/90">{mainQuiz.category}</Badge>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {mainQuiz.title}
                </h3>
                <p className="text-white/80 line-clamp-2 mb-3">
                  {mainQuiz.short_description || mainQuiz.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mainQuiz.estimated_time} menit
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Side Items */}
          <div className="space-y-4">
            {sideQuizzes.map(quiz => (
              <Link 
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="flex gap-4 p-4 bg-card rounded-xl hover:shadow-lg transition-shadow group"
              >
                {quiz.thumbnail_url ? (
                  <img 
                    src={quiz.thumbnail_url} 
                    alt={quiz.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🧠</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-1 text-xs">{quiz.category}</Badge>
                  <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quiz.estimated_time} menit
                  </p>
                </div>
              </Link>
            ))}

            {/* Articles */}
            {latestArticles.slice(0, 1).map(article => (
              <Link 
                key={article.id}
                to={`/artikel/${article.slug}`}
                className="flex gap-4 p-4 bg-card rounded-xl hover:shadow-lg transition-shadow group border border-border/50"
              >
                {article.thumbnail_url ? (
                  <img 
                    src={article.thumbnail_url} 
                    alt={article.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                    <span className="text-2xl">📝</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="mb-1 text-xs">Artikel</Badge>
                  <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
