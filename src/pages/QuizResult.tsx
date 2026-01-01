import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizResults } from '@/hooks/useQuizResults';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { 
  renderResultTemplate, 
  StrengthsWeaknessesSection 
} from '@/components/quiz/ResultTemplates';

const QuizResult = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { data: quiz, isLoading: quizLoading } = useQuiz(id);
  const { data: results, isLoading: resultsLoading } = useQuizResults(id);
  const [matchedResult, setMatchedResult] = useState<any>(null);
  
  const totalScores = location.state?.totalScores as Record<string, number> | undefined;
  const answers = location.state?.answers;

  useEffect(() => {
    if (results && results.length > 0 && totalScores) {
      // Find the matching result based on scores
      // Calculate total score
      const totalScore = Object.values(totalScores).reduce((sum, val) => sum + val, 0);
      
      // Find result that matches the score range
      const matched = results.find(r => 
        totalScore >= (r.min_score || 0) && totalScore <= (r.max_score || 999)
      );
      
      if (matched) {
        setMatchedResult(matched);
      } else {
        // Find by highest personality type score
        let maxType = '';
        let maxScore = 0;
        Object.entries(totalScores).forEach(([type, score]) => {
          if (score > maxScore) {
            maxScore = score;
            maxType = type;
          }
        });
        
        const typeMatch = results.find(r => 
          r.personality_type?.toLowerCase() === maxType?.toLowerCase()
        );
        setMatchedResult(typeMatch || results[0]);
      }

      // Save attempt to database
      if (id && answers) {
        saveAttempt();
      }
    } else if (results && results.length > 0) {
      // No scores, just show first result
      setMatchedResult(results[0]);
    }
  }, [results, totalScores]);

  const saveAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('user_quiz_attempts').insert({
        quiz_id: id,
        user_id: user?.id || null,
        answers: answers || {},
        scores: totalScores || {},
        result_id: matchedResult?.id || null,
      });
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const isLoading = quizLoading || resultsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quiz || !matchedResult) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Hasil tidak ditemukan</h1>
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

  const handleShare = (platform: 'whatsapp' | 'twitter' | 'copy') => {
    const shareText = `Hasil Quiz ${quiz.title}: Saya adalah ${matchedResult.title}! Coba juga quiz ini di`;
    const shareUrl = window.location.origin + `/quiz/${id}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link berhasil disalin!",
          description: "Bagikan ke teman-temanmu",
        });
        break;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Ad Banner Top */}
          <div className="mb-6">
            <AdBanner slot="result-top" />
          </div>

          {/* Result Card - Using Template System */}
          <div className="animate-scale-in">
            {renderResultTemplate(matchedResult)}
            
            {/* Strengths & Weaknesses */}
            <StrengthsWeaknessesSection result={matchedResult} />
          </div>

          {/* Share Buttons */}
          <div className="bg-card rounded-2xl p-6 mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Bagikan hasil ke teman-temanmu!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('whatsapp')}
                className="gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter/X
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('copy')}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Salin Link
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to={`/quiz/${id}/terms`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Ulangi Quiz
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="default" className="w-full">
                Quiz Lainnya
              </Button>
            </Link>
          </div>

          {/* Ad Banner */}
          <div className="mt-8">
            <AdBanner slot="result-bottom" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizResult;
