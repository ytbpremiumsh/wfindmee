import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizQuestions } from '@/hooks/useQuizQuestions';
import { PopularQuizzesSidebar } from '@/components/quiz/PopularQuizzesSidebar';
import { RecommendedQuizzes } from '@/components/quiz/RecommendedQuizzes';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const categoryLabels: Record<string, string> = {
  kepribadian: 'Kepribadian',
  fun: 'Fun',
  mbti: 'MBTI',
  karir: 'Karir',
  hubungan: 'Hubungan',
  kesehatan: 'Kesehatan',
  lainnya: 'Lainnya',
};

const QuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading } = useQuiz(id);
  const { data: questions } = useQuizQuestions(id);
  const { data: settings } = useSiteSettings();

  // Get ad count settings for quiz page
  const adSettings = (settings as any)?.ad_placements?.quiz || { count: 2 };
  const adCount = adSettings.count || 2;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz tidak ditemukan</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const category = quiz.category || 'lainnya';
  const questionCount = questions?.length || 0;

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={quiz.banner_url || quiz.thumbnail_url || '/placeholder.svg'}
          alt={quiz.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Larger Column */}
          <div className="lg:col-span-2">
            {/* Main Card */}
            <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
              {/* Category Badge */}
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                {categoryLabels[category] || category}
              </span>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{quiz.title}</h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.estimated_time || 5} menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>{questionCount} pertanyaan</span>
                </div>
              </div>

              {/* Description */}
              <div 
                className="prose prose-sm max-w-none mb-8 text-muted-foreground leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ 
                  __html: quiz.description || quiz.short_description || 'Quiz menarik untuk kamu!' 
                }}
              />

              {/* CTA with Ads */}
              <div className="space-y-4">
                {adCount >= 1 && <AdBanner slot="quiz-before-start" />}
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full md:w-auto"
                  onClick={() => navigate(`/quiz/${id}/terms`)}
                >
                  <Play className="h-5 w-5" />
                  Mulai Quiz
                </Button>
                
                {adCount >= 2 && <AdBanner slot="quiz-after-start" />}
              </div>
            </div>

            {/* Recommended Quizzes Section */}
            <div className="mt-8 bg-card rounded-2xl shadow-lg p-6">
              <RecommendedQuizzes 
                currentQuizId={id} 
                currentCategory={category}
              />
            </div>

            {/* Ad Banner Below */}
            {adCount >= 3 && (
              <div className="mt-6">
                <AdBanner slot="quiz-detail" />
              </div>
            )}
          </div>

          {/* Sidebar - Smaller Column */}
          <div className="lg:col-span-1">
            {/* Popular Quizzes */}
            <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-4">
              <PopularQuizzesSidebar currentQuizId={id} />
              
              {/* Sidebar Ad */}
              {adCount >= 4 && (
                <div className="mt-6 pt-6 border-t">
                  <AdBanner slot="quiz-sidebar" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizDetail;
