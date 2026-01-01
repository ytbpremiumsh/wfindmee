import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function StickyAd() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const { data: settings } = useSiteSettings();

  const adsenseEnabled = settings?.adsense?.enabled;
  const adsSettings = (settings as any)?.ads_display;
  const showStickyAd = adsSettings?.sticky_ad_enabled !== false;

  useEffect(() => {
    // Check session storage for closed state
    const closed = sessionStorage.getItem('sticky_ad_closed');
    if (closed === 'true') {
      setIsClosed(true);
    }
  }, []);

  const handleClose = () => {
    setIsClosed(true);
    sessionStorage.setItem('sticky_ad_closed', 'true');
  };

  if (isClosed || !showStickyAd) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 bg-muted/50 border border-dashed border-border rounded-lg p-3 text-center">
            {adsenseEnabled ? (
              <div className="min-h-[60px] flex items-center justify-center">
                <p className="text-xs text-muted-foreground">
                  [Google AdSense - Sticky Banner]
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Iklan - Sticky Footer Ad
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
