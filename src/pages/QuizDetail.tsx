import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizQuestions } from '@/hooks/useQuizQuestions';

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
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={quiz.banner_url || quiz.thumbnail_url || '/placeholder.svg'}
          alt={quiz.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
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

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Card */}
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
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed">
                {quiz.description || quiz.short_description || 'Quiz menarik untuk kamu!'}
              </p>
            </div>

            {/* CTA */}
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full md:w-auto"
              onClick={() => navigate(`/quiz/${id}/terms`)}
            >
              <Play className="h-5 w-5" />
              Mulai Quiz
            </Button>
          </div>

          {/* Ad Banner */}
          <div className="mt-8">
            <AdBanner slot="quiz-detail" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizDetail;
