import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdsenseSettings {
  enabled: boolean;
  client_id: string;
  header_slot: string;
  content_slot: string;
  footer_slot: string;
}

interface AISettings {
  enabled: boolean;
  api_key: string;
  model: string;
  prompt_template: string;
}

interface CustomCodeSettings {
  head_code: string;
  footer_code: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      
      const settings: Record<string, unknown> = {};
      data.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });
      
      return settings as {
        adsense?: AdsenseSettings;
        ai?: AISettings;
        custom_code?: CustomCodeSettings;
      };
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value as unknown as import('@/integrations/supabase/types').Json })
        .eq('setting_key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      toast({
        title: 'Berhasil!',
        description: 'Pengaturan berhasil disimpan.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menyimpan pengaturan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
