import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <div className="text-center relative z-10">
        <h1 className="mb-4 text-6xl sm:text-8xl font-bold gradient-text">404</h1>
        <p className="mb-6 text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="mb-8 text-sm text-muted-foreground max-w-md mx-auto">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;