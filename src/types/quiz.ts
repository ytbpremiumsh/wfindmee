export type QuizCategory = 'personality' | 'fun' | 'mbti' | 'love' | 'career';

export type QuizStatus = 'draft' | 'published';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  banner?: string;
  category: QuizCategory;
  estimatedTime: number; // in minutes
  questionCount: number;
  status: QuizStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  order: number;
  question: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  scores: PersonalityScore[];
}

export interface PersonalityScore {
  personalityType: string;
  score: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  personalityType: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  image?: string;
  isAIGenerated: boolean;
}

export interface UserQuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, string>; // questionId -> optionId
  result: QuizResult;
  completedAt: string;
}
