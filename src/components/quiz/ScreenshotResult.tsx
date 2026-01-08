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
        className="bg-card p-3 flex items-center justify-center"
        style={{ 
          width: '100%',
          maxWidth: '390px',
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          margin: '0 auto'
        }}
      >
        <img
          src={result.image_url}
          alt={result.title}
          className="max-w-full h-auto object-contain rounded-xl"
          style={{ maxHeight: 'calc(100vh - 24px)' }}
        />
      </div>
    );
  }

  return (
    <div 
      id="screenshot-result"
      className={`bg-gradient-to-br ${gradient} p-4 flex flex-col`}
      style={{ 
        width: '100%',
        maxWidth: '390px',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Quiz Title */}
      {quizTitle && (
        <div className="text-center mb-2">
          <span className="text-white/70 text-xs">{quizTitle}</span>
        </div>
      )}

      {/* Avatar */}
      {result.twitter_username && (
        <div className="flex justify-center mb-3">
          <img 
            src={`https://unavatar.io/x/${result.twitter_username}`}
            alt={result.twitter_username}
            className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-white text-center px-2">
        {/* Personality Type Badge */}
        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-bold mb-2">
          <Sparkles className="h-3 w-3" />
          {result.personality_type}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold mb-2 leading-tight">{result.title}</h1>

        {/* Description */}
        <p className="text-white/85 text-sm leading-relaxed line-clamp-4 mb-3 max-w-[320px]">
          {result.description}
        </p>

        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="w-full grid grid-cols-2 gap-2 mt-auto">
            {strengths.length > 0 && (
              <div className="bg-white/15 backdrop-blur rounded-lg p-2">
                <h3 className="text-[10px] font-semibold flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-3 w-3" />
                  Kelebihan
                </h3>
                <ul className="text-[10px] text-white/80 space-y-0.5">
                  {strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="truncate">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="bg-white/15 backdrop-blur rounded-lg p-2">
                <h3 className="text-[10px] font-semibold flex items-center justify-center gap-1 mb-1">
                  <XCircle className="h-3 w-3" />
                  Kelemahan
                </h3>
                <ul className="text-[10px] text-white/80 space-y-0.5">
                  {weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="truncate">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-3 pt-2 border-t border-white/20">
        <span className="text-white/50 text-[10px]">wfind.me</span>
      </div>
    </div>
  );
}
