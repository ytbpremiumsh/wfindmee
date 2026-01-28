import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/hooks/useQuizzes';
import { AdBanner } from '@/components/ads/AdBanner';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const QuizIframe = () => {
  const { id } = useParams<{ id: string }>();
  const { data: quiz, isLoading } = useQuiz(id);
  const { data: settings } = useSiteSettings();
  
  const adsenseSettings = settings?.adsense;
  const showAds = adsenseSettings?.enabled && adsenseSettings?.script_code;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || !quiz.is_iframe || !quiz.iframe_url) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Quiz tidak ditemukan</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Minimal Header */}
      <div className="flex-shrink-0 h-12 bg-background border-b border-border flex items-center px-4">
        <Link 
          to={`/quiz/${id}`} 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Kembali</span>
        </Link>
        <h1 className="flex-1 text-center font-semibold text-sm truncate px-4">{quiz.title}</h1>
        <div className="w-10" />
      </div>

      {/* Ad Banner - Top */}
      {showAds && (
        <div className="flex-shrink-0 bg-muted/30 py-2">
          <AdBanner />
        </div>
      )}

      {/* Iframe - Takes All Remaining Space */}
      <iframe
        src={quiz.iframe_url}
        title={quiz.title}
        className="flex-1 w-full border-0"
        allowFullScreen
      />
    </div>
  );
};

export default QuizIframe;
