import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];
type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert'];
type QuizQuestionUpdate = Database['public']['Tables']['quiz_questions']['Update'];

type QuizOption = Database['public']['Tables']['quiz_options']['Row'];
type QuizOptionInsert = Database['public']['Tables']['quiz_options']['Insert'];

export interface QuestionWithOptions extends QuizQuestion {
  quiz_options: QuizOption[];
}

export function useQuizQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz_questions', quizId],
    queryFn: async () => {
      if (!quizId) return [];
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_options (*)
        `)
        .eq('quiz_id', quizId)
        .order('question_order', { ascending: true });
      
      if (error) throw error;
      return data as QuestionWithOptions[];
    },
    enabled: !!quizId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ question, options }: { 
      question: QuizQuestionInsert; 
      options: Omit<QuizOptionInsert, 'question_id'>[];
    }) => {
      // Insert question
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert(question)
        .select()
        .single();
      
      if (questionError) throw questionError;
      
      // Insert options
      if (options.length > 0) {
        const optionsWithQuestionId = options.map(opt => ({
          ...opt,
          question_id: questionData.id,
        }));
        
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsWithQuestionId);
        
        if (optionsError) throw optionsError;
      }
      
      return questionData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz_questions', variables.question.quiz_id] });
      toast({
        title: 'Berhasil!',
        description: 'Pertanyaan berhasil ditambahkan.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menambah pertanyaan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      questionId, 
      quizId,
      question, 
      options 
    }: { 
      questionId: string;
      quizId: string;
      question: QuizQuestionUpdate; 
      options: Omit<QuizOptionInsert, 'question_id'>[];
    }) => {
      // Update question
      const { error: questionError } = await supabase
        .from('quiz_questions')
        .update(question)
        .eq('id', questionId);
      
      if (questionError) throw questionError;
      
      // Delete old options
      const { error: deleteError } = await supabase
        .from('quiz_options')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;
      
      // Insert new options
      if (options.length > 0) {
        const optionsWithQuestionId = options.map(opt => ({
          ...opt,
          question_id: questionId,
        }));
        
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsWithQuestionId);
        
        if (optionsError) throw optionsError;
      }
      
      return { quizId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz_questions', data.quizId] });
      toast({
        title: 'Berhasil!',
        description: 'Pertanyaan berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal memperbarui pertanyaan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionId, quizId }: { questionId: string; quizId: string }) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);
      
      if (error) throw error;
      return { quizId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz_questions', data.quizId] });
      toast({
        title: 'Berhasil!',
        description: 'Pertanyaan berhasil dihapus.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menghapus pertanyaan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
