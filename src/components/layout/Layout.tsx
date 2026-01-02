import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  const { data: settings } = useSiteSettings();
  
  const adsenseEnabled = settings?.adsense?.enabled;
  const adsSettings = (settings as any)?.ads_display;
  const showStickyAd = adsSettings?.sticky_ad_enabled !== false && adsenseEnabled;
  
  // Add bottom padding when sticky ad is visible
  const stickyAdPadding = showStickyAd ? 'pb-24' : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${stickyAdPadding}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
