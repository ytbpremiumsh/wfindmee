import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdsenseSettings {
  enabled: boolean;
  script_code?: string;
  // Legacy fields for backwards compatibility
  client_id?: string;
  header_slot?: string;
  content_slot?: string;
  footer_slot?: string;
}

interface AISettings {
  enabled: boolean;
  provider?: 'lovable' | 'openrouter';
  model?: string;
  openrouter_api_key?: string;
  prompt_template?: string;
  // Legacy field
  api_key?: string;
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
      // First try to update
      const { error: updateError, count } = await supabase
        .from('site_settings')
        .update({ setting_value: value as unknown as import('@/integrations/supabase/types').Json })
        .eq('setting_key', key);
      
      // If no rows were updated, insert instead
      if (updateError || count === 0) {
        const { error: upsertError } = await supabase
          .from('site_settings')
          .upsert({ 
            setting_key: key, 
            setting_value: value as unknown as import('@/integrations/supabase/types').Json 
          }, { onConflict: 'setting_key' });
        
        if (upsertError) throw upsertError;
      }
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
