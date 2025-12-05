import { useState } from 'react';
import { Menu, X, ExternalLink, Activity } from 'lucide-react';
import xandeumLogo from '@/assets/xandeum-logo.png';

const navLinks = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Docs', href: 'https://docs.xandeum.network', external: true },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={xandeumLogo} alt="Xandeum" className="h-8 w-8" />
            <span className="text-xl font-bold">
              <span className="text-gradient">Xandeum</span>
              <span className="text-muted-foreground ml-1.5 font-medium">Analytics</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 text-sm font-medium"
              >
                {link.label}
                {link.external && <ExternalLink className="h-3 w-3" />}
              </a>
            ))}
          </div>

          {/* Right Side: Price Ticker (Replaces Wallet) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border/50 text-xs font-mono text-muted-foreground">
              <Activity className="h-3 w-3 text-primary" />
              <span>XAND: $0.042</span>
              <span className="text-success">+2.4%</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;