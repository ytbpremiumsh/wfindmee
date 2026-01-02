import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/quizzes', label: 'Quiz' },
  { href: '/about', label: 'Tentang' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  
  const branding = (settings as any)?.branding;
  const siteName = branding?.site_name || 'Wfind';
  const logoUrl = branding?.logo_url;

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold group"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-8 object-contain" />
            ) : (
              <div className="relative">
                <Brain className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse-slow" />
              </div>
            )}
            <span className="text-gradient-primary">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/quizzes">
              <Button variant="default" size="sm">
                Mulai Quiz
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2 px-4">
                <Link to="/quizzes" className="flex-1">
                  <Button variant="default" size="sm" className="w-full">
                    Mulai Quiz
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
