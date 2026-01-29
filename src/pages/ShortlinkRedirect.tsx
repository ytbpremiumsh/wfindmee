import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseUserAgent } from '@/hooks/useShortlinks';

const ShortlinkRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      if (!code) {
        navigate('/', { replace: true });
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

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        if (!shortlink) {
          // Not a valid shortlink, let the app continue to 404
          setIsProcessing(false);
          setError('Shortlink tidak ditemukan atau sudah tidak aktif');
          return;
        }

        // Parse user agent
        const userAgent = navigator.userAgent;
        const { deviceType, browser, os } = parseUserAgent(userAgent);

        // Record the click - the trigger will auto-increment click_count
        try {
          await supabase
            .from('shortlink_clicks')
            .insert({
              shortlink_id: shortlink.id,
              user_agent: userAgent,
              device_type: deviceType,
              browser,
              os,
              referer: document.referrer || null,
            });
        } catch (clickError) {
          // Don't block redirect if click tracking fails
          console.error('Click tracking error:', clickError);
        }

        // Redirect to target URL - supports any domain
        const targetUrl = shortlink.target_url;
        
        // Ensure the URL is valid
        try {
          new URL(targetUrl);
          window.location.href = targetUrl;
        } catch {
          // If no protocol, add https://
          if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            window.location.href = `https://${targetUrl}`;
          } else {
            window.location.href = targetUrl;
          }
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setIsProcessing(false);
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

  // Still loading/processing
  if (isProcessing && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Mengalihkan...</p>
      </div>
    );
  }

  return null;
};

export default ShortlinkRedirect;
