import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>100+ Quiz Kepribadian Menarik</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
            Temukan{' '}
            <span className="text-gradient-hero">
              Kepribadian Unik
            </span>
            mu
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Eksplorasi dirimu melalui quiz interaktif yang menyenangkan. 
            Dari MBTI, tipe cinta, hingga karir ideal - semua tersedia untukmu!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/quizzes">
              <Button variant="hero" size="xl">
                Mulai Quiz Sekarang
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="hero-outline" size="xl">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
                <Brain className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-xs text-muted-foreground">Quiz</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-2">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-xs text-muted-foreground">Pengguna</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-category-mbti/10 text-category-mbti mb-2">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">16</p>
              <p className="text-xs text-muted-foreground">Tipe MBTI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
