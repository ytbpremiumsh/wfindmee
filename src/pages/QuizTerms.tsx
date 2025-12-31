import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { mockQuizzes } from '@/data/mockQuizzes';

const QuizTerms = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quiz = mockQuizzes.find(q => q.id === id);

  if (!quiz) {
    return (
      <Layout>
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

  const terms = [
    {
      icon: CheckCircle2,
      title: 'Tidak Ada Jawaban Benar/Salah',
      description: 'Semua jawaban valid! Pilih yang paling menggambarkan dirimu.',
    },
    {
      icon: Sparkles,
      title: 'Jawab Sesuai Dirimu',
      description: 'Jujurlah pada diri sendiri untuk hasil yang akurat.',
    },
    {
      icon: AlertCircle,
      title: 'Bersifat Hiburan',
      description: 'Hasil quiz ini untuk insight dan hiburan, bukan diagnosis profesional.',
    },
  ];

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            {/* Back Button */}
            <Link to={`/quiz/${id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Detail Quiz
            </Link>

            {/* Card */}
            <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 animate-scale-in">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Sebelum Memulai</h1>
                <p className="text-muted-foreground">
                  Baca ketentuan berikut untuk pengalaman terbaik
                </p>
              </div>

              {/* Terms List */}
              <div className="space-y-4 mb-8">
                {terms.map((term, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <term.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{term.title}</h3>
                      <p className="text-sm text-muted-foreground">{term.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Info */}
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
                <span>⏱️ {quiz.estimatedTime} menit</span>
                <span>•</span>
                <span>❓ {quiz.questionCount} pertanyaan</span>
              </div>

              {/* CTA */}
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full"
                onClick={() => navigate(`/quiz/${id}/play`)}
              >
                Mulai Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizTerms;
