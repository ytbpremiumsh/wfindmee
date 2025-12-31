import { Layout } from '@/components/layout/Layout';
import { QuizGrid } from '@/components/home/QuizGrid';
import { mockQuizzes } from '@/data/mockQuizzes';

const Quizzes = () => {
  const publishedQuizzes = mockQuizzes.filter(q => q.status === 'published');

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
      <QuizGrid quizzes={publishedQuizzes} />
    </Layout>
  );
};

export default Quizzes;
