import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function GoogleAnalytics() {
  const { data: settings } = useSiteSettings();
  const location = useLocation();
  
  const analyticsSettings = (settings as any)?.analytics;
  const isEnabled = analyticsSettings?.ga_enabled;
  const trackingId = analyticsSettings?.ga_tracking_id;

  useEffect(() => {
    if (!isEnabled || !trackingId) return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag"]`);
    if (existingScript) return;

    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', trackingId);

  }, [isEnabled, trackingId]);

  // Track page views on route change
  useEffect(() => {
    if (!isEnabled || !trackingId || !window.gtag) return;

    window.gtag('config', trackingId, {
      page_path: location.pathname + location.search,
    });
  }, [location, isEnabled, trackingId]);

  return null;
}
