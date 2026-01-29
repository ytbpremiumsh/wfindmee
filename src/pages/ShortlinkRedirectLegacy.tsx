import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Legacy route handler for /s/:code URLs
 * Redirects to the new /:code format for backward compatibility
 */
const ShortlinkRedirectLegacy = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Redirect to the new URL format without /s/
      navigate(`/${code}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Mengalihkan...</p>
    </div>
  );
};

export default ShortlinkRedirectLegacy;
