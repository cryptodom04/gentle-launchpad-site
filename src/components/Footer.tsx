import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
const Footer = () => {
  return <footer className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-20" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <a href="#home" className="flex items-center mb-4 sm:mb-6">
              <span className="font-bold text-xl sm:text-2xl tracking-tight">
                Sol<span className="gradient-text">Ferno</span>
              </span>
            </a>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">Easy Token Launch & Realistic Terminal Chart Simulation. Profit with Us! 
 </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Product</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/create" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  Create Token
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  API
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Resources</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/blog" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  Learn
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">© 2026 SolFerno. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;