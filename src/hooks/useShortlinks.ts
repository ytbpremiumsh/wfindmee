import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Shortlink {
  id: string;
  short_code: string;
  target_url: string;
  title: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  click_count: number;
}

export interface ShortlinkClick {
  id: string;
  shortlink_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  referer: string | null;
  clicked_at: string;
}

export function useShortlinks() {
  return useQuery({
    queryKey: ['shortlinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortlinks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Shortlink[];
    },
  });
}

export function useShortlink(shortCode: string | undefined) {
  return useQuery({
    queryKey: ['shortlink', shortCode],
    queryFn: async () => {
      if (!shortCode) return null;
      const { data, error } = await supabase
        .from('shortlinks')
        .select('*')
        .eq('short_code', shortCode)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as Shortlink | null;
    },
    enabled: !!shortCode,
  });
}

export function useShortlinkClicks(shortlinkId: string | undefined) {
  return useQuery({
    queryKey: ['shortlink_clicks', shortlinkId],
    queryFn: async () => {
      if (!shortlinkId) return [];
      const { data, error } = await supabase
        .from('shortlink_clicks')
        .select('*')
        .eq('shortlink_id', shortlinkId)
        .order('clicked_at', { ascending: false });
      
      if (error) throw error;
      return data as ShortlinkClick[];
    },
    enabled: !!shortlinkId,
  });
}

export function useCreateShortlink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shortlink: Omit<Shortlink, 'id' | 'created_at' | 'updated_at' | 'click_count'>) => {
      const { data, error } = await supabase
        .from('shortlinks')
        .insert(shortlink)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      toast({ title: 'Shortlink berhasil dibuat' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Gagal membuat shortlink', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateShortlink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Shortlink> & { id: string }) => {
      const { data, error } = await supabase
        .from('shortlinks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      toast({ title: 'Shortlink berhasil diupdate' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Gagal update shortlink', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteShortlink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shortlinks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      toast({ title: 'Shortlink berhasil dihapus' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Gagal hapus shortlink', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useRecordClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      shortlinkId, 
      clickData 
    }: { 
      shortlinkId: string; 
      clickData: Omit<ShortlinkClick, 'id' | 'shortlink_id' | 'clicked_at'> 
    }) => {
      // Insert click record - trigger will auto-increment click_count
      const { error: clickError } = await supabase
        .from('shortlink_clicks')
        .insert({
          shortlink_id: shortlinkId,
          ...clickData,
        });
      
      if (clickError) throw clickError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
  });
}

// Helper function to parse user agent
export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Device type
  let deviceType = 'Desktop';
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) {
    deviceType = /tablet|ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  // Browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { deviceType, browser, os };
}
