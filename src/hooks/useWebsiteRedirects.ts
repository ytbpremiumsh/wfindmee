import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WebsiteRedirect {
  id: string;
  name: string;
  source_domain: string;
  target_url: string;
  is_active: boolean;
  redirect_type: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useWebsiteRedirects() {
  return useQuery({
    queryKey: ['website_redirects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_redirects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WebsiteRedirect[];
    },
  });
}

export function useWebsiteRedirect(sourceDomain: string | undefined) {
  return useQuery({
    queryKey: ['website_redirect', sourceDomain],
    queryFn: async () => {
      if (!sourceDomain) return null;
      const { data, error } = await supabase
        .from('website_redirects')
        .select('*')
        .eq('source_domain', sourceDomain)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as WebsiteRedirect | null;
    },
    enabled: !!sourceDomain,
  });
}

export function useCreateWebsiteRedirect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (redirect: Omit<WebsiteRedirect, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('website_redirects')
        .insert(redirect)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website_redirects'] });
      toast({ title: 'Website redirect berhasil dibuat' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Gagal membuat redirect', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateWebsiteRedirect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteRedirect> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_redirects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website_redirects'] });
      toast({ title: 'Redirect berhasil diupdate' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Gagal update redirect', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteWebsiteRedirect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_redirects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website_redirects'] });
      toast({ title: 'Redirect berhasil dihapus' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Gagal hapus redirect', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}
