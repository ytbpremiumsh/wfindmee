import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];

export function useQuizzes(onlyPublished = false) {
  return useQuery({
    queryKey: ['quizzes', onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from('quizzes')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (onlyPublished) {
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Quiz[];
    },
  });
}

export function useQuiz(id: string | undefined) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Quiz | null;
    },
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quiz: QuizInsert) => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(quiz)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Berhasil!',
        description: 'Quiz berhasil dibuat.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal membuat quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: QuizUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Berhasil!',
        description: 'Quiz berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal memperbarui quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Berhasil!',
        description: 'Quiz berhasil dihapus.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menghapus quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
