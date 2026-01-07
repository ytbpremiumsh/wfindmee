import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { HeadlineNews } from '@/components/home/HeadlineNews';
import { LatestCarousel } from '@/components/home/LatestCarousel';
import { QuizGrid } from '@/components/home/QuizGrid';
import { HeaderAd } from '@/components/ads/HeaderAd';
import { FooterAd } from '@/components/ads/FooterAd';
import { AdBanner } from '@/components/ads/AdBanner';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: quizzes, isLoading } = useQuizzes(true);
  const { data: settings } = useSiteSettings();

  const allQuizzes = quizzes || [];
  
  // Get ad count settings for home page
  const adSettings = (settings as any)?.ad_placements?.home || { count: 2 };
  const adCount = adSettings.count || 2;

  return (
    <Layout>
      {/* Header Ad */}
      {adCount >= 1 && <HeaderAd />}

      {/* Featured Quiz Carousel */}
      <HeroSection />

      {/* Headline News Section */}
      <HeadlineNews />

      {/* Middle Ad */}
      {adCount >= 2 && (
        <div className="container mx-auto px-4 py-4">
          <AdBanner slot="home-middle" />
        </div>
      )}

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
      {adCount >= 3 && <FooterAd />}
    </Layout>
  );
};

export default Index;
