import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { QuizGrid } from '@/components/home/QuizGrid';
import { AdBanner } from '@/components/ads/AdBanner';
import { useQuizzes } from '@/hooks/useQuizzes';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: quizzes, isLoading } = useQuizzes(true); // Only published quizzes

  const featuredQuizzes = quizzes?.filter(q => q.is_featured) || [];
  const allQuizzes = quizzes || [];

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Ad Banner */}
      <div className="container mx-auto px-4 mb-8">
        <AdBanner slot="hero-bottom" />
      </div>

      {/* Featured Quizzes */}
      {isLoading ? (
        <section className="py-12">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {featuredQuizzes.length > 0 && (
            <QuizGrid 
              quizzes={featuredQuizzes} 
              title="✨ Quiz Populer" 
            />
          )}

          {/* Ad Banner between sections */}
          <div className="container mx-auto px-4 my-8">
            <AdBanner slot="mid-content" />
          </div>

          {/* All Quizzes */}
          <QuizGrid 
            quizzes={allQuizzes} 
            title="🧠 Semua Quiz" 
          />
        </>
      )}
    </Layout>
  );
};

export default Index;
