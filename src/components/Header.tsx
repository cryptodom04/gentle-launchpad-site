import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogIn, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

const navLinks = [{
  name: 'Home',
  href: '/#home',
  isPage: false,
  protected: false
}, {
  name: 'Create',
  href: '/create',
  isPage: true,
  protected: true
}, {
  name: 'Liquidity',
  href: '/liquidity',
  isPage: true,
  protected: false
}, {
  name: 'Features',
  href: '/#features',
  isPage: false,
  protected: false
}, {
  name: 'FAQ',
  href: '/faq',
  isPage: true,
  protected: false
}];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isPage: boolean, isProtected: boolean) => {
    e.preventDefault();
    
    if (isProtected && !user) {
      setShowAuthModal(true);
      return;
    }
    
    if (isPage) {
      navigate(href);
      return;
    }
    const hash = href.replace('/', '');
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" onClick={e => handleNavClick(e, '/#home', false, false)} className="flex items-center gap-2 group">
              <img src="/logo.png" alt="SolFerno" className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight">
                  Sol<span className="gradient-text">Ferno</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Rugpull Launcher </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1 p-1.5 rounded-2xl glass">
                {navLinks.map(link => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={e => handleNavClick(e, link.href, link.isPage, link.protected)} 
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-xl glass hover:bg-secondary/80 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                  ) : (
                    <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              )}

              {/* Auth Button */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-secondary/80 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 transition-all text-sm font-medium text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Войти
                </button>
              )}
            </nav>

            {/* Mobile Right Section */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Auth Button Mobile */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl glass hover:bg-secondary/80 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-accent"
                  aria-label="Login"
                >
                  <LogIn className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Theme Toggle Mobile */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-xl glass hover:bg-secondary/80 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 rounded-xl glass hover:bg-secondary/80 transition-colors">
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
                  onClick={e => {
                    handleNavClick(e, link.href, link.isPage, link.protected);
                    setIsMenuOpen(false);
                  }} 
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all" 
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;