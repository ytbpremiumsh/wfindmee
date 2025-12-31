import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Banner = Database['public']['Tables']['banners']['Row'];
type BannerInsert = Database['public']['Tables']['banners']['Insert'];
type BannerUpdate = Database['public']['Tables']['banners']['Update'];

export function useBanners(onlyActive = false) {
  return useQuery({
    queryKey: ['banners', onlyActive],
    queryFn: async () => {
      let query = supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Banner[];
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banner: BannerInsert) => {
      const { data, error } = await supabase
        .from('banners')
        .insert(banner)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Berhasil!',
        description: 'Banner berhasil dibuat.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal membuat banner',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: BannerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Berhasil!',
        description: 'Banner berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal memperbarui banner',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Berhasil!',
        description: 'Banner berhasil dihapus.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menghapus banner',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
