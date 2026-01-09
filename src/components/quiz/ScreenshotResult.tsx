import { CheckCircle, XCircle, Sparkles } from 'lucide-react';

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
  twitter_username?: string;
}

interface ScreenshotResultProps {
  result: ResultData;
  quizTitle?: string;
}

const GRADIENT_MAP: Record<string, string> = {
  purple: 'from-purple-500 to-pink-500',
  ocean: 'from-blue-500 to-cyan-500',
  sunset: 'from-orange-500 to-red-500',
  forest: 'from-green-500 to-emerald-500',
  gold: 'from-yellow-500 to-amber-500',
  dark: 'from-gray-700 to-gray-900',
};

export function ScreenshotResult({ result, quizTitle }: ScreenshotResultProps) {
  const gradient = GRADIENT_MAP[result.gradient_id || 'purple'] || GRADIENT_MAP.purple;
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];

  // Image only mode
  if (result.image_mode === 'image_only' && result.image_url) {
    return (
      <div 
        id="screenshot-result"
        className="bg-card p-2 flex items-center justify-center w-full"
      >
        <img
          src={result.image_url}
          alt={result.title}
          className="w-full h-auto object-contain rounded-lg max-w-[320px] md:max-w-[400px]"
        />
      </div>
    );
  }

  return (
    <div 
      id="screenshot-result"
      className={`bg-gradient-to-br ${gradient} p-4 md:p-6 flex flex-col rounded-xl w-full max-w-[340px] md:max-w-[420px] mx-auto`}
    >
      {/* Quiz Title */}
      {quizTitle && (
        <div className="text-center mb-2 md:mb-3">
          <span className="text-white/70 text-[10px] md:text-xs uppercase tracking-wider font-medium">
            {quizTitle}
          </span>
        </div>
      )}

      {/* Avatar */}
      {result.twitter_username && (
        <div className="flex justify-center mb-3 md:mb-4">
          <img 
            src={`https://unavatar.io/x/${result.twitter_username}`}
            alt={result.twitter_username}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white/30 shadow-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-white text-center px-2 md:px-4">
        {/* Personality Type Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] md:text-xs font-semibold mb-2 md:mb-3">
          <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
          {result.personality_type}
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 leading-tight">
          {result.title}
        </h1>

        {/* Description */}
        <p className="text-white/85 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 max-w-[300px] md:max-w-[360px]">
          {result.description}
        </p>

        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="w-full grid grid-cols-2 gap-2 md:gap-3 mt-auto">
            {strengths.length > 0 && (
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 md:p-3">
                <h3 className="text-[9px] md:text-[10px] font-semibold flex items-center justify-center gap-1 mb-1 uppercase tracking-wide">
                  <CheckCircle className="h-3 w-3" />
                  Kelebihan
                </h3>
                <ul className="text-[9px] md:text-[10px] text-white/80 space-y-0.5">
                  {strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="truncate leading-snug">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 md:p-3">
                <h3 className="text-[9px] md:text-[10px] font-semibold flex items-center justify-center gap-1 mb-1 uppercase tracking-wide">
                  <XCircle className="h-3 w-3" />
                  Kelemahan
                </h3>
                <ul className="text-[9px] md:text-[10px] text-white/80 space-y-0.5">
                  {weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="truncate leading-snug">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-3 md:mt-4 pt-2 md:pt-3 border-t border-white/20">
        <span className="text-white/50 text-[9px] md:text-[10px] font-medium">wfind.me</span>
      </div>
    </div>
  );
}
