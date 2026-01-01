import { CheckCircle, XCircle, Star, Trophy, Sparkles } from 'lucide-react';

interface ResultData {
  personality_type: string;
  title: string;
  description: string;
  strengths?: string[];
  weaknesses?: string[];
  image_url?: string;
  image_mode?: string;
  template_id?: string;
  gradient_id?: string;
}

interface TemplateProps {
  result: ResultData;
}

const GRADIENT_MAP: Record<string, string> = {
  purple: 'from-purple-500 to-pink-500',
  ocean: 'from-blue-500 to-cyan-500',
  sunset: 'from-orange-500 to-red-500',
  forest: 'from-green-500 to-emerald-500',
  gold: 'from-yellow-500 to-amber-500',
  dark: 'from-gray-700 to-gray-900',
};

// Default Card Template
export const DefaultTemplate = ({ result }: TemplateProps) => (
  <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
      <img
        src={result.image_url || '/placeholder.svg'}
        alt={result.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
    </div>
    <div className="p-6 md:p-8 -mt-16 relative">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
        {result.personality_type}
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{result.title}</h1>
      <p className="text-muted-foreground leading-relaxed">{result.description}</p>
    </div>
  </div>
);

// Gradient Hero Template
export const GradientTemplate = ({ result }: TemplateProps) => {
  const gradient = GRADIENT_MAP[result.gradient_id || 'purple'] || GRADIENT_MAP.purple;
  
  return (
    <div className={`rounded-3xl shadow-xl overflow-hidden bg-gradient-to-br ${gradient}`}>
      <div className="p-8 md:p-12 text-white text-center">
        <div className="text-6xl mb-4">
          <Sparkles className="h-16 w-16 mx-auto" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-bold mb-4">
          {result.personality_type}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{result.title}</h1>
        <p className="text-white/80 leading-relaxed max-w-lg mx-auto">{result.description}</p>
      </div>
    </div>
  );
};

// Minimal Clean Template
export const MinimalTemplate = ({ result }: TemplateProps) => (
  <div className="bg-card rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 text-center border-2 border-border">
    <span className="text-xs uppercase tracking-widest text-muted-foreground">
      Kamu adalah
    </span>
    <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4 text-primary">
      {result.title}
    </h1>
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 text-primary text-sm font-medium mb-6">
      {result.personality_type}
    </div>
    <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
      {result.description}
    </p>
  </div>
);

// Badge Style Template
export const BadgeTemplate = ({ result }: TemplateProps) => {
  const gradient = GRADIENT_MAP[result.gradient_id || 'purple'] || GRADIENT_MAP.purple;
  
  return (
    <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
      <div className={`p-8 bg-gradient-to-br ${gradient} flex justify-center`}>
        <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white">
          <Trophy className="h-16 w-16 text-white" />
        </div>
      </div>
      <div className="p-6 md:p-8 text-center -mt-8">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card shadow-lg border text-lg font-bold mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          {result.personality_type}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{result.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{result.description}</p>
      </div>
    </div>
  );
};

// Split Layout Template
export const SplitTemplate = ({ result }: TemplateProps) => {
  const gradient = GRADIENT_MAP[result.gradient_id || 'purple'] || GRADIENT_MAP.purple;
  
  return (
    <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className={`p-8 md:p-12 bg-gradient-to-br ${gradient} flex flex-col justify-center text-white`}>
          <span className="text-sm uppercase tracking-widest opacity-80 mb-2">Tipe Kamu</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{result.personality_type}</h1>
          <p className="text-xl opacity-90">{result.title}</p>
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <p className="text-muted-foreground leading-relaxed">{result.description}</p>
        </div>
      </div>
    </div>
  );
};

// Magazine Style Template
export const MagazineTemplate = ({ result }: TemplateProps) => {
  const gradient = GRADIENT_MAP[result.gradient_id || 'purple'] || GRADIENT_MAP.purple;
  
  return (
    <div className="bg-card rounded-3xl shadow-xl overflow-hidden border">
      <div className="p-6 border-b flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          Quiz Result
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>
      <div className={`p-8 bg-gradient-to-r ${gradient}`}>
        <div className="text-white text-center">
          <div className="text-sm uppercase tracking-widest opacity-80 mb-2">
            {result.personality_type}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{result.title}</h1>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground leading-relaxed text-center italic">
          "{result.description}"
        </p>
      </div>
    </div>
  );
};

// Strengths and Weaknesses Section (shared)
export const StrengthsWeaknessesSection = ({ result }: TemplateProps) => {
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];
  
  if (strengths.length === 0 && weaknesses.length === 0) return null;
  
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {strengths.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Kelebihan
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength: string, index: number) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}
      {weaknesses.length > 0 && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
          <h3 className="font-semibold text-accent mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Kelemahan
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Main template renderer
export const renderResultTemplate = (result: ResultData) => {
  // If custom image mode and has image, use default template
  if (result.image_mode === 'custom' && result.image_url) {
    return <DefaultTemplate result={result} />;
  }
  
  // Otherwise use selected template
  const templateId = result.template_id || 'default';
  
  switch (templateId) {
    case 'gradient':
      return <GradientTemplate result={result} />;
    case 'minimal':
      return <MinimalTemplate result={result} />;
    case 'badge':
      return <BadgeTemplate result={result} />;
    case 'split':
      return <SplitTemplate result={result} />;
    case 'magazine':
      return <MagazineTemplate result={result} />;
    default:
      // For default template without image, use gradient
      if (!result.image_url) {
        return <GradientTemplate result={result} />;
      }
      return <DefaultTemplate result={result} />;
  }
};
