import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
const navLinks = [{
  name: 'Home',
  href: '/#home',
  isPage: false
}, {
  name: 'Create',
  href: '/create',
  isPage: true
}, {
  name: 'Launched',
  href: '/launched',
  isPage: true
}, {
  name: 'Liquidity',
  href: '/liquidity',
  isPage: true
}, {
  name: 'Features',
  href: '/#features',
  isPage: false
}, {
  name: 'FAQ',
  href: '/faq',
  isPage: true
}];
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
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
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isPage: boolean) => {
    e.preventDefault();
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
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" onClick={e => handleNavClick(e, '/#home', false)} className="flex items-center group">
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
              {navLinks.map(link => <a key={link.name} href={link.href} onClick={e => handleNavClick(e, link.href, link.isPage)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300">
                  {link.name}
                </a>)}
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
          </nav>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center gap-2">
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
        {isMenuOpen && <nav className="lg:hidden mt-4 p-4 rounded-2xl glass-strong animate-fade-in">
            {navLinks.map((link, index) => <a key={link.name} href={link.href} onClick={e => {
          handleNavClick(e, link.href, link.isPage);
          setIsMenuOpen(false);
        }} className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all" style={{
          animationDelay: `${index * 50}ms`
        }}>
                {link.name}
              </a>)}
          </nav>}
      </div>
    </header>;
};
export default Header;