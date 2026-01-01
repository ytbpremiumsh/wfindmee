import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizQuestions } from '@/hooks/useQuizQuestions';
import { cn } from '@/lib/utils';

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading: quizLoading } = useQuiz(id);
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; scores: Record<string, number> }>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedScores, setSelectedScores] = useState<Record<string, number> | null>(null);

  const isLoading = quizLoading || questionsLoading;

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <Layout showFooter={false}>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz tidak ditemukan atau belum ada pertanyaan</h1>
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasSelected = selectedOption !== null || answers[currentQuestion.id];

  const handleSelectOption = (optionId: string, scores: Record<string, number>) => {
    setSelectedOption(optionId);
    setSelectedScores(scores);
  };

  const handleNext = () => {
    if (!selectedOption && !answers[currentQuestion.id]) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        optionId: selectedOption || answers[currentQuestion.id]?.optionId,
        scores: selectedScores || answers[currentQuestion.id]?.scores || {},
      },
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate total scores
      const totalScores: Record<string, number> = {};
      Object.values(newAnswers).forEach(answer => {
        Object.entries(answer.scores || {}).forEach(([key, value]) => {
          totalScores[key] = (totalScores[key] || 0) + (value as number);
        });
      });
      
      navigate(`/quiz/${id}/result`, { state: { answers: newAnswers, totalScores } });
    } else {
      setCurrentIndex(currentIndex + 1);
      const nextAnswer = answers[questions[currentIndex + 1]?.id];
      setSelectedOption(nextAnswer?.optionId || null);
      setSelectedScores(nextAnswer?.scores || null);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      // Save current selection before going back
      if (selectedOption) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: {
            optionId: selectedOption,
            scores: selectedScores || {},
          },
        });
      }
      setCurrentIndex(currentIndex - 1);
      const prevAnswer = answers[questions[currentIndex - 1]?.id];
      setSelectedOption(prevAnswer?.optionId || null);
      setSelectedScores(prevAnswer?.scores || null);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Progress Header */}
        <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Pertanyaan {currentIndex + 1} dari {questions.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 flex items-center py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Question */}
              <div className="animate-fade-in" key={currentQuestion.id}>
                {/* Optional Question Image */}
                {currentQuestion.image_url && (
                  <div className="flex justify-center mb-6">
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Question" 
                      className="max-h-48 rounded-xl object-cover shadow-md"
                    />
                  </div>
                )}
                
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">
                  {currentQuestion.question_text}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.quiz_options?.map((option) => {
                    const isSelected = selectedOption === option.id || 
                      (!selectedOption && answers[currentQuestion.id]?.optionId === option.id);
                    const scores = (option.personality_scores as Record<string, number>) || {};
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option.id, scores)}
                        className={cn(
                          "w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200",
                          "hover:border-primary/50 hover:bg-primary/5",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected 
                              ? "border-primary bg-primary" 
                              : "border-muted-foreground/30"
                          )}>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm md:text-base",
                            isSelected && "font-medium"
                          )}>
                            {option.option_text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sebelumnya
              </Button>

              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!hasSelected}
              >
                {isLastQuestion ? 'Lihat Hasil' : 'Selanjutnya'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizPlay;
