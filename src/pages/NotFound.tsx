import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to PeakFlow to explore our latest articles."
        noIndex={true}
      />
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-8xl md:text-9xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg" className="rounded-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/search">
                <Search className="w-4 h-4 mr-2" />
                Search Articles
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <h3 className="font-semibold mb-4">Popular Categories</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/productivity" className="px-4 py-2 rounded-full bg-muted hover:bg-accent/20 transition-colors text-sm">
              Productivity
            </Link>
            <Link to="/lifestyle" className="px-4 py-2 rounded-full bg-muted hover:bg-accent/20 transition-colors text-sm">
              Lifestyle
            </Link>
            <Link to="/tech-tips" className="px-4 py-2 rounded-full bg-muted hover:bg-accent/20 transition-colors text-sm">
              Tech Tips
            </Link>
            <Link to="/growth" className="px-4 py-2 rounded-full bg-muted hover:bg-accent/20 transition-colors text-sm">
              Personal Growth
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
