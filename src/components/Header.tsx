import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X, Hexagon } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Create', href: '#create' },
  { name: 'Liquidity', href: '#liquidity' },
  { name: 'Features', href: '#features' },
  { name: 'FAQ', href: '#faq' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight">
                Nebula<span className="gradient-text">Forge</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Solana Tokens</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-1 p-1.5 rounded-2xl glass">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center gap-3">
            <Button 
              className="hidden md:flex items-center gap-2 px-6 py-5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 glow-primary font-semibold"
            >
              <Wallet className="w-4 h-4" />
              Connect
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl glass hover:bg-secondary/80 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 p-4 rounded-2xl glass-strong animate-fade-in">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.name}
              </a>
            ))}
            <Button className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;