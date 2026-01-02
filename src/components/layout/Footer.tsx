import { Link } from 'react-router-dom';
import { Brain, Heart, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <Brain className="h-7 w-7 text-primary" />
              <span className="text-gradient-primary">Wfind</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Temukan kepribadian unikmu melalui quiz interaktif yang menyenangkan. 
              Dari MBTI hingga quiz fun, eksplorasi dirimu sekarang!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/quizzes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Semua Quiz
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wfind. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-accent" /> in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
