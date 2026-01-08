import { useEffect, useRef } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface AdBannerProps {
  slot?: string;
}

export function AdBanner({ slot = 'default' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useSiteSettings();
  
  const adsenseEnabled = settings?.adsense?.enabled;
  const scriptCode = settings?.adsense?.script_code;

  useEffect(() => {
    if (adsenseEnabled && scriptCode && adRef.current) {
      // Clear previous content
      adRef.current.innerHTML = '';
      
      // Create a container for the ad
      const container = document.createElement('div');
      container.innerHTML = scriptCode;
      
      // Extract and execute scripts
      const scripts = container.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy content
        if (script.innerHTML) {
          newScript.innerHTML = script.innerHTML;
        }
        
        // Remove original script from container
        script.remove();
      });
      
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
  }, [adsenseEnabled, scriptCode]);

  // Show real ads if enabled, otherwise show nothing (no dummy)
  if (!adsenseEnabled || !scriptCode) {
    return null;
  }

  return (
    <div 
      ref={adRef}
      className="w-full overflow-hidden"
      data-ad-slot={slot}
      style={{ minHeight: '50px' }}
    />
  );
}
