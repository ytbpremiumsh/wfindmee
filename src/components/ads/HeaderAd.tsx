import { useEffect, useRef } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function HeaderAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useSiteSettings();
  
  const adsenseEnabled = settings?.adsense?.enabled;
  const headerHtml = (settings?.adsense as any)?.header_html;

  useEffect(() => {
    if (adsenseEnabled && headerHtml && adRef.current) {
      // Clear previous content
      adRef.current.innerHTML = '';
      
      // Create a container for the ad
      const container = document.createElement('div');
      container.innerHTML = headerHtml;
      
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
  }, [adsenseEnabled, headerHtml]);

  if (!adsenseEnabled || !headerHtml) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden px-2 py-2 md:px-4 md:py-4">
      <div className="container mx-auto">
        <div 
          ref={adRef}
          className="w-full overflow-hidden"
          style={{ minHeight: '50px' }}
        />
      </div>
    </div>
  );
}
