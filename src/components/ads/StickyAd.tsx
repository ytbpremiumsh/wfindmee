import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function StickyAd() {
  const [isClosed, setIsClosed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useSiteSettings();

  const adsenseEnabled = settings?.adsense?.enabled;
  const scriptCode = settings?.adsense?.script_code;
  const adsSettings = (settings as any)?.ads_display;
  const showStickyAd = adsSettings?.sticky_ad_enabled !== false;

  useEffect(() => {
    // Check session storage for closed state
    const closed = sessionStorage.getItem('sticky_ad_closed');
    if (closed === 'true') {
      setIsClosed(true);
    }
  }, []);

  useEffect(() => {
    if (adsenseEnabled && scriptCode && adRef.current && !isClosed) {
      // Clear previous content
      adRef.current.innerHTML = '';
      
      // Create a container for the ad
      const container = document.createElement('div');
      container.innerHTML = scriptCode;
      
      // Extract scripts
      const scripts = container.querySelectorAll('script');
      scripts.forEach((script) => script.remove());
      
      // Append non-script content first
      adRef.current.appendChild(container);
      
      // Then append scripts to execute them
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (script.innerHTML) {
          newScript.innerHTML = script.innerHTML;
        }
        adRef.current?.appendChild(newScript);
      });
    }
  }, [adsenseEnabled, scriptCode, isClosed]);

  const handleClose = () => {
    setIsClosed(true);
    sessionStorage.setItem('sticky_ad_closed', 'true');
  };

  // Don't show if closed, disabled, or no ad code
  if (isClosed || !showStickyAd || !adsenseEnabled || !scriptCode) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div 
            ref={adRef}
            className="flex-1"
          />
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
