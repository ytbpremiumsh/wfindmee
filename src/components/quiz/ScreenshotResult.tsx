import { CheckCircle, XCircle, Sparkles, Star, Trophy } from 'lucide-react';

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
        className="bg-card p-2 flex items-center justify-center"
        style={{ 
          width: '100%',
          maxWidth: '360px',
          minHeight: '640px',
          maxHeight: '640px',
          overflow: 'hidden',
          margin: '0 auto'
        }}
      >
        <img
          src={result.image_url}
          alt={result.title}
          className="max-w-full h-auto object-contain rounded-lg"
          style={{ maxHeight: '620px' }}
        />
      </div>
    );
  }

  return (
    <div 
      id="screenshot-result"
      className={`bg-gradient-to-br ${gradient} p-3 flex flex-col rounded-xl`}
      style={{ 
        width: '100%',
        maxWidth: '360px',
        minHeight: '560px',
        maxHeight: '560px',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Quiz Title */}
      {quizTitle && (
        <div className="text-center mb-1">
          <span className="text-white/60 text-[9px] uppercase tracking-wide">{quizTitle}</span>
        </div>
      )}

      {/* Avatar */}
      {result.twitter_username && (
        <div className="flex justify-center mb-2">
          <img 
            src={`https://unavatar.io/x/${result.twitter_username}`}
            alt={result.twitter_username}
            className="w-12 h-12 rounded-full border-2 border-white/30 shadow-md object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-white text-center px-3">
        {/* Personality Type Badge */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-[10px] font-semibold mb-1.5">
          <Sparkles className="h-2.5 w-2.5" />
          {result.personality_type}
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold mb-1.5 leading-snug">{result.title}</h1>

        {/* Description */}
        <p className="text-white/80 text-[11px] leading-relaxed line-clamp-3 mb-2 max-w-[300px]">
          {result.description}
        </p>

        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="w-full grid grid-cols-2 gap-1.5 mt-auto">
            {strengths.length > 0 && (
              <div className="bg-white/15 backdrop-blur rounded-md p-1.5">
                <h3 className="text-[8px] font-semibold flex items-center justify-center gap-0.5 mb-0.5 uppercase tracking-wide">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Kelebihan
                </h3>
                <ul className="text-[8px] text-white/75 space-y-0">
                  {strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="truncate leading-tight">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="bg-white/15 backdrop-blur rounded-md p-1.5">
                <h3 className="text-[8px] font-semibold flex items-center justify-center gap-0.5 mb-0.5 uppercase tracking-wide">
                  <XCircle className="h-2.5 w-2.5" />
                  Kelemahan
                </h3>
                <ul className="text-[8px] text-white/75 space-y-0">
                  {weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="truncate leading-tight">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-2 pt-1.5 border-t border-white/15">
        <span className="text-white/40 text-[8px] font-medium">wfind.me</span>
      </div>
    </div>
  );
}
