import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { HeaderAd } from '@/components/ads/HeaderAd';
import { FooterAd } from '@/components/ads/FooterAd';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizResults } from '@/hooks/useQuizResults';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { 
  renderResultTemplate, 
  StrengthsWeaknessesSection 
} from '@/components/quiz/ResultTemplates';
import { ScreenshotResult } from '@/components/quiz/ScreenshotResult';
import { RecommendedQuizzes } from '@/components/quiz/RecommendedQuizzes';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const QuizResult = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { data: quiz, isLoading: quizLoading } = useQuiz(id);
  const { data: results, isLoading: resultsLoading } = useQuizResults(quiz?.id);
  const { data: settings } = useSiteSettings();
  const [matchedResult, setMatchedResult] = useState<any>(null);
  
  const totalScores = location.state?.totalScores as Record<string, number> | undefined;
  const answers = location.state?.answers;
  const twitterUsername = location.state?.twitterUsername as string | undefined;

  // Get ad count settings
  const adSettings = (settings as any)?.ad_placements?.result || { count: 2 };
  const adCount = adSettings.count || 2;

  useEffect(() => {
    if (results && results.length > 0 && totalScores) {
      // Improved scoring algorithm
      // Step 1: Try to find by personality type (highest score)
      const sortedTypes = Object.entries(totalScores)
        .sort(([, a], [, b]) => b - a);
      
      if (sortedTypes.length > 0) {
        const [topType] = sortedTypes[0];
        
        // Find result that matches the top personality type
        const typeMatch = results.find(r => 
          r.personality_type?.toLowerCase() === topType?.toLowerCase()
        );
        
        if (typeMatch) {
          setMatchedResult(typeMatch);
          saveAttempt(typeMatch.id);
          return;
        }
      }
      
      // Step 2: Fallback to score range matching
      const totalScore = Object.values(totalScores).reduce((sum, val) => sum + val, 0);
      
      const rangeMatch = results.find(r => 
        totalScore >= (r.min_score || 0) && totalScore <= (r.max_score || 999)
      );
      
      if (rangeMatch) {
        setMatchedResult(rangeMatch);
        saveAttempt(rangeMatch.id);
        return;
      }
      
      // Step 3: Default to first result
      setMatchedResult(results[0]);
      saveAttempt(results[0].id);
    } else if (results && results.length > 0) {
      // No scores, just show first result
      setMatchedResult(results[0]);
    }
  }, [results, totalScores]);

  const saveAttempt = async (resultId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('user_quiz_attempts').insert({
        quiz_id: quiz?.id,
        user_id: user?.id || null,
        answers: answers || {},
        scores: totalScores || {},
        result_id: resultId || matchedResult?.id || null,
        twitter_username: twitterUsername || null,
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

  return (
    <Layout>
      {/* Header Ad */}
      {adCount >= 1 && <HeaderAd />}
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-12">
        <div className="max-w-md mx-auto">
          {/* Screenshot-friendly Result Card */}
          <div className="mb-6">
            <ScreenshotResult 
              result={{
                ...matchedResult,
                twitter_username: twitterUsername
              }}
              quizTitle={quiz.title}
            />
          </div>

          {/* Compatibility Section - Outside screenshot area */}
          {(matchedResult.best_match_type?.length > 0 || matchedResult.worst_match_type?.length > 0) && (
            <div className="bg-card rounded-2xl p-4 md:p-6 mb-4">
              <h3 className="font-semibold mb-4 text-center text-sm md:text-base">Kompatibilitas</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(matchedResult.best_match_type) && matchedResult.best_match_type.length > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-2">Paling Klik Sama</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {matchedResult.best_match_type.map((type: string) => (
                        <span key={type} className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-[10px] md:text-xs font-medium">
                          {matchedResult.best_match_icon || '💕'} {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(matchedResult.worst_match_type) && matchedResult.worst_match_type.length > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-2">Paling Cekcok Sama</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {matchedResult.worst_match_type.map((type: string) => (
                        <span key={type} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-[10px] md:text-xs font-medium">
                          {matchedResult.worst_match_icon || '💔'} {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Middle Ad */}
          {adCount >= 2 && (
            <div className="my-4">
              <AdBanner slot="result-middle" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link to={`/quiz/${quiz.slug || quiz.id}/terms`} className="flex-1">
              <Button variant="outline" className="w-full gap-2 text-sm">
                <RefreshCw className="h-4 w-4" />
                Ulangi Quiz
              </Button>
            </Link>
            <Link to="/quizzes" className="flex-1">
              <Button variant="default" className="w-full text-sm">
                Quiz Lainnya
              </Button>
            </Link>
          </div>

          {/* Recommended Quizzes */}
          <div className="mb-6">
            <RecommendedQuizzes currentQuizId={id} currentCategory={quiz.category || undefined} />
          </div>

          {/* Ad Banner Bottom */}
          {adCount >= 3 && (
            <div className="mb-4">
              <AdBanner slot="result-bottom" />
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Ad */}
      {adCount >= 4 && <FooterAd />}
    </Layout>
  );
};

export default QuizResult;