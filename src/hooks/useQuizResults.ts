import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type QuizResult = Database['public']['Tables']['quiz_results']['Row'];
type QuizResultInsert = Database['public']['Tables']['quiz_results']['Insert'];
type QuizResultUpdate = Database['public']['Tables']['quiz_results']['Update'];

export function useQuizResults(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz_results', quizId],
    queryFn: async () => {
      if (!quizId) return [];
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('quiz_id', quizId)
        .order('min_score', { ascending: true });
      
      if (error) throw error;
      return data as QuizResult[];
    },
    enabled: !!quizId,
  });
}

export function useCreateResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (result: QuizResultInsert) => {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert(result)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz_results', data.quiz_id] });
      toast({
        title: 'Berhasil!',
        description: 'Hasil quiz berhasil ditambahkan.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menambah hasil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quizId, ...updates }: QuizResultUpdate & { id: string; quizId: string }) => {
      const { data, error } = await supabase
        .from('quiz_results')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, quizId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz_results', data.quizId] });
      toast({
        title: 'Berhasil!',
        description: 'Hasil quiz berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal memperbarui hasil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quizId }: { id: string; quizId: string }) => {
      const { error } = await supabase
        .from('quiz_results')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { quizId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz_results', data.quizId] });
      toast({
        title: 'Berhasil!',
        description: 'Hasil quiz berhasil dihapus.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menghapus hasil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
