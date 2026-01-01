import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  category: string | null;
  status: string | null;
  is_featured: boolean | null;
  views_count: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useArticles(onlyPublished = false) {
  return useQuery({
    queryKey: ['articles', onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (onlyPublished) {
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Article | null;
    },
    enabled: !!id,
  });
}

export function useArticleBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['article-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data as Article | null;
    },
    enabled: !!slug,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (article: {
      title: string;
      slug: string;
      content?: string | null;
      excerpt?: string | null;
      thumbnail_url?: string | null;
      banner_url?: string | null;
      category?: string | null;
      status?: string | null;
      is_featured?: boolean | null;
      created_by?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Berhasil!', description: 'Artikel berhasil dibuat.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Gagal membuat artikel', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Article> & { id: string }) => {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Berhasil!', description: 'Artikel berhasil diperbarui.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Gagal memperbarui artikel', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Berhasil!', description: 'Artikel berhasil dihapus.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Gagal menghapus artikel', description: error.message, variant: 'destructive' });
    },
  });
}
