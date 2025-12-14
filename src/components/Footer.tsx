import { Link } from 'react-router-dom';
import { Hexagon, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-20" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <a href="#home" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg sm:rounded-xl blur-lg opacity-50" />
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Hexagon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <span className="font-bold text-xl sm:text-2xl tracking-tight">
                  Nebula<span className="gradient-text">Forge</span>
                </span>
              </div>
            </a>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              The most powerful token launcher on Solana. Create, deploy, and manage your tokens with zero code and maximum control.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Product</h4>
            <ul className="space-y-3 sm:space-y-4">
              {['Create Token', 'Liquidity Pools', 'Documentation', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Resources</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/blog" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  Blog
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              {['Status', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © 2024 NebulaForge. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;