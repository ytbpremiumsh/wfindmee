import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { useQuiz } from '@/hooks/useQuizzes';

const QuizIframe = () => {
  const { id } = useParams<{ id: string }>();
  const { data: quiz, isLoading } = useQuiz(id);

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quiz || !quiz.is_iframe || !quiz.iframe_url) {
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

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to={`/quiz/${id}`} 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Link>
              <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">{quiz.title}</h1>
              <a 
                href={quiz.iframe_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Buka di Tab Baru</span>
              </a>
            </div>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="container mx-auto px-4 py-4">
          <AdBanner slot="iframe-top" />
        </div>

        {/* Iframe Container - Full Width */}
        <div className="flex-1 w-full px-2 sm:px-4 pb-4">
          <div className="bg-card rounded-xl overflow-hidden shadow-lg h-full min-h-[70vh]">
            <iframe
              src={quiz.iframe_url}
              title={quiz.title}
              className="w-full h-full min-h-[70vh]"
              style={{ border: 'none' }}
              allowFullScreen
            />
          </div>
        </div>

        {/* Ad Banner Bottom */}
        <div className="container mx-auto px-4 py-4">
          <AdBanner slot="iframe-bottom" />
        </div>
      </div>
    </Layout>
  );
};

export default QuizIframe;
