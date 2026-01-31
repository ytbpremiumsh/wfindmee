import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { slugify, generateUniqueSlug } from '@/lib/slugify';

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

export function useQuiz(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['quiz', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      
      // Check if it's a UUID or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase.from('quizzes').select('*');
      
      if (isUuid) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as Quiz | null;
    },
    enabled: !!idOrSlug,
  });
}

// Helper to get all existing slugs
async function getExistingSlugs(): Promise<string[]> {
  const { data } = await supabase.from('quizzes').select('slug');
  return (data || []).map(q => q.slug).filter(Boolean) as string[];
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quiz: QuizInsert) => {
      // Generate slug from title if not provided
      let slug = quiz.slug;
      if (!slug && quiz.title) {
        const baseSlug = slugify(quiz.title);
        const existingSlugs = await getExistingSlugs();
        slug = generateUniqueSlug(baseSlug, existingSlugs);
      }
      
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ ...quiz, slug })
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
      // If title changed and no slug provided, regenerate slug
      let slug = updates.slug;
      if (updates.title && !slug) {
        const baseSlug = slugify(updates.title);
        const existingSlugs = await getExistingSlugs();
        // Filter out current quiz's slug
        const filteredSlugs = existingSlugs.filter(s => s !== baseSlug);
        slug = generateUniqueSlug(baseSlug, filteredSlugs);
      }
      
      const { data, error } = await supabase
        .from('quizzes')
        .update({ ...updates, ...(slug ? { slug } : {}) })
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
