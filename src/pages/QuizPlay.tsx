import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { mockQuizzes, mockQuestions, mockResults } from '@/data/mockQuizzes';
import { cn } from '@/lib/utils';

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quiz = mockQuizzes.find(q => q.id === id);
  const questions = mockQuestions.filter(q => q.quizId === id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!quiz || questions.length === 0) {
    return (
      <Layout showFooter={false}>
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasSelected = selectedOption !== null || answers[currentQuestion.id];

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (!selectedOption && !answers[currentQuestion.id]) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOption || answers[currentQuestion.id],
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate result and navigate
      navigate(`/quiz/${id}/result`, { state: { answers: newAnswers } });
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(answers[questions[currentIndex + 1]?.id] || null);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      // Save current selection before going back
      if (selectedOption) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: selectedOption,
        });
      }
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(answers[questions[currentIndex - 1]?.id] || null);
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
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
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
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option.id || 
                      (!selectedOption && answers[currentQuestion.id] === option.id);
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option.id)}
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
                            {option.text}
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
