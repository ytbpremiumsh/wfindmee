import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/quiz/QuizCard';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useBanners } from '@/hooks/useBanners';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function HeroSection() {
  const { data: quizzes, isLoading } = useQuizzes(true);
  const { data: banners, isLoading: bannersLoading } = useBanners();
  const featuredQuizzes = quizzes?.filter(q => q.is_featured) || [];
  
  // Get active banners
  const activeBanners = banners?.filter(b => b.is_active) || [];

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Banner Carousel */}
        {activeBanners.length > 0 && (
          <div className="mb-8">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {activeBanners.map((banner) => (
                  <CarouselItem key={banner.id} className="basis-full">
                    <Link 
                      to={banner.link_url || '#'}
                      className="block relative aspect-[21/9] sm:aspect-[3/1] overflow-hidden rounded-2xl group"
                    >
                      <img
                        src={banner.image_url || '/placeholder.svg'}
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold line-clamp-1">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-sm sm:text-base opacity-90 line-clamp-1 mt-1">{banner.subtitle}</p>
                        )}
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {activeBanners.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 sm:left-4" />
                  <CarouselNext className="right-2 sm:right-4" />
                </>
              )}
            </Carousel>
          </div>
        )}

        {/* Featured Quizzes */}
        {featuredQuizzes.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">✨ Quiz Populer</h2>
              <Link to="/quizzes">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredQuizzes.map((quiz) => (
                  <CarouselItem key={quiz.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <QuizCard quiz={quiz} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </Carousel>
          </>
        )}
      </div>
    </section>
  );
}
