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
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', key)
        .maybeSingle();
      
      if (existing) {
        // Update existing setting
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ 
            setting_value: value as unknown as import('@/integrations/supabase/types').Json,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);
        
        if (updateError) throw updateError;
      } else {
        // Insert new setting
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert({ 
            setting_key: key, 
            setting_value: value as unknown as import('@/integrations/supabase/types').Json 
          });
        
        if (insertError) throw insertError;
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
