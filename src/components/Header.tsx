import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X, Rocket } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Create Token', href: '#create' },
  { name: 'Liquidity Pool', href: '#liquidity' },
  { name: 'Features', href: '#features' },
  { name: 'FAQ', href: '#faq' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-sm transition-all group-hover:scale-110">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl">
              Stellar<span className="text-primary">Mint</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center gap-3">
            <Button className="hidden md:flex items-center gap-2 glow-sm">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {link.name}
              </a>
            ))}
            <Button className="w-full mt-4 flex items-center justify-center gap-2">
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