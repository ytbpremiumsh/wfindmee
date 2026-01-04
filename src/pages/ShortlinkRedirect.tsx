import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseUserAgent } from '@/hooks/useShortlinks';

const ShortlinkRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirect = async () => {
      if (!code) {
        navigate('/');
        return;
      }

      try {
        // Fetch the shortlink
        const { data: shortlink, error: fetchError } = await supabase
          .from('shortlinks')
          .select('*')
          .eq('short_code', code)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!shortlink) {
          setError('Shortlink tidak ditemukan atau sudah tidak aktif');
          return;
        }

        // Parse user agent
        const userAgent = navigator.userAgent;
        const { deviceType, browser, os } = parseUserAgent(userAgent);

        // Record the click (don't wait for it to complete)
        supabase
          .from('shortlink_clicks')
          .insert({
            shortlink_id: shortlink.id,
            user_agent: userAgent,
            device_type: deviceType,
            browser,
            os,
            referer: document.referrer || null,
          })
          .then(() => {
            // Update click count
            supabase
              .from('shortlinks')
              .update({ click_count: (shortlink.click_count || 0) + 1 })
              .eq('id', shortlink.id);
          });

        // Redirect to target URL
        window.location.href = shortlink.target_url;
      } catch (err) {
        console.error('Redirect error:', err);
        setError('Terjadi kesalahan saat memproses shortlink');
      }
    };

    redirect();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Mengalihkan...</p>
    </div>
  );
};

export default ShortlinkRedirect;
