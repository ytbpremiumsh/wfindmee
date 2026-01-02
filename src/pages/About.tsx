import { Layout } from '@/components/layout/Layout';
import { Brain, Heart, Target, Sparkles } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'Quiz Berbasis Psikologi',
      description: 'Quiz kami dirancang berdasarkan teori psikologi kepribadian untuk memberikan insight yang bermakna.',
    },
    {
      icon: Heart,
      title: 'Untuk Semua Orang',
      description: 'Dari quiz serius seperti MBTI hingga quiz fun, ada sesuatu untuk semua orang.',
    },
    {
      icon: Target,
      title: 'Akurat & Menyenangkan',
      description: 'Kami mengkombinasikan akurasi dengan pengalaman yang menyenangkan.',
    },
    {
      icon: Sparkles,
      title: 'Selalu Update',
      description: 'Quiz baru ditambahkan secara berkala untuk pengalaman yang segar.',
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Tentang <span className="text-gradient-primary">Wfind</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wfind adalah platform quiz kepribadian interaktif yang membantu kamu memahami 
              diri sendiri dengan cara yang menyenangkan. Kami percaya bahwa mengenal diri sendiri 
              adalah langkah pertama untuk menjadi versi terbaik dari diri kita.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Mengapa Wfind?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Misi Kami</h2>
            <p className="text-muted-foreground leading-relaxed">
              Membantu jutaan orang Indonesia untuk lebih memahami diri sendiri melalui quiz 
              kepribadian yang akurat, menyenangkan, dan mudah diakses. Kami berkomitmen untuk 
              terus mengembangkan konten berkualitas yang memberikan insight bermakna bagi 
              setiap penggunanya.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
