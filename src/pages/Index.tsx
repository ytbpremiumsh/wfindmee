import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { HeadlineNews } from '@/components/home/HeadlineNews';
import { LatestCarousel } from '@/components/home/LatestCarousel';
import { QuizGrid } from '@/components/home/QuizGrid';
import { HeaderAd } from '@/components/ads/HeaderAd';
import { FooterAd } from '@/components/ads/FooterAd';
import { useQuizzes } from '@/hooks/useQuizzes';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: quizzes, isLoading } = useQuizzes(true);

  const allQuizzes = quizzes || [];

  return (
    <Layout>
      {/* Header Ad */}
      <HeaderAd />

      {/* Featured Quiz Carousel */}
      <HeroSection />

      {/* Headline News Section */}
      <HeadlineNews />

      {/* Latest Carousel */}
      <LatestCarousel />

      {/* All Quizzes */}
      {isLoading ? (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <QuizGrid 
          quizzes={allQuizzes} 
          title="🧠 Semua Quiz" 
        />
      )}

      {/* Footer Ad */}
      <FooterAd />
    </Layout>
  );
};

export default Index;
