import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { QuizGrid } from '@/components/home/QuizGrid';
import { AdBanner } from '@/components/ads/AdBanner';
import { mockQuizzes } from '@/data/mockQuizzes';

const Index = () => {
  const featuredQuizzes = mockQuizzes.filter(q => q.isFeatured && q.status === 'published');
  const allQuizzes = mockQuizzes.filter(q => q.status === 'published');

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Ad Banner */}
      <div className="container mx-auto px-4 mb-8">
        <AdBanner slot="hero-bottom" />
      </div>

      {/* Featured Quizzes */}
      <QuizGrid 
        quizzes={featuredQuizzes} 
        title="✨ Quiz Populer" 
      />

      {/* Ad Banner between sections */}
      <div className="container mx-auto px-4 my-8">
        <AdBanner slot="mid-content" />
      </div>

      {/* All Quizzes */}
      <QuizGrid 
        quizzes={allQuizzes} 
        title="🧠 Semua Quiz" 
      />
    </Layout>
  );
};

export default Index;
