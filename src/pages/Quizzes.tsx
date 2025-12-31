import { Layout } from '@/components/layout/Layout';
import { QuizGrid } from '@/components/home/QuizGrid';
import { useQuizzes } from '@/hooks/useQuizzes';
import { Skeleton } from '@/components/ui/skeleton';

const Quizzes = () => {
  const { data: quizzes, isLoading } = useQuizzes(true);

  return (
    <Layout>
      {/* Header */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Semua Quiz
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Temukan berbagai quiz menarik untuk mengeksplorasi kepribadian, minat, dan potensimu!
          </p>
        </div>
      </section>

      {/* Quiz Grid */}
      {isLoading ? (
        <section className="py-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <QuizGrid quizzes={quizzes || []} />
      )}
    </Layout>
  );
};

export default Quizzes;
