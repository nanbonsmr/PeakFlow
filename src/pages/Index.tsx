import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import FeaturedArticleSelector from "@/components/FeaturedArticleSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedArticle {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
}

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { articles, loading } = useArticles();
  const displayArticles = articles.slice(0, 6);
  const [draftCount, setDraftCount] = useState(0);
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const fetchFeaturedArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, title, excerpt, image_url, category")
      .eq("featured", true)
      .eq("published", true)
      .order("updated_at", { ascending: false });
    
    setFeaturedArticles((data as FeaturedArticle[]) || []);
  };

  useEffect(() => {
    fetchFeaturedArticles();

    // Subscribe to featured article changes
    const featuredChannel = supabase
      .channel("featured-article-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => {
          fetchFeaturedArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(featuredChannel);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchDraftCount = async () => {
      const { count } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("published", false);
      setDraftCount(count || 0);
    };

    fetchDraftCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("articles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => {
          fetchDraftCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSection 
          featuredArticles={featuredArticles}
          isAdmin={isAdmin}
          onEditFeatured={() => setSelectorOpen(true)}
        />

        {/* Featured Article Selector Dialog */}
        <FeaturedArticleSelector
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          onSelect={fetchFeaturedArticles}
          currentFeaturedIds={featuredArticles.map(a => a.id)}
        />

        {/* Intro Section */}
        <IntroSection />

        {/* Featured Articles Grid */}
        <section id="articles" className="py-12">
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Articles</h2>
            <a href="#all" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-muted/60">
              View all →
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-[2.5rem]" />
              ))}
            </div>
          ) : displayArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayArticles.map((article, index) => (
                <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                  <ArticleCard 
                    id={article.id}
                    title={article.title}
                    category={article.category}
                    date={article.date}
                    image={article.image}
                    size="small" 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No articles published yet.</p>
              <p className="text-sm mt-2">Check back soon for new content!</p>
            </div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="relative my-20 rounded-[2.5rem] bg-gradient-to-br from-card via-card to-muted p-12 md:p-16 text-center animate-scale-in overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl" />
          
          <div className="relative max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Stay inspired.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Subscribe to receive our latest articles and insights directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-6 py-4 rounded-full border border-input bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-foreground/60"
              />
              <button className="px-10 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                <span className="flex items-center justify-center gap-2">
                  Subscribe
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Admin Button */}
      {!user ? (
        <Link
          to="/auth"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <Shield className="h-4 w-4" />
          <span>Admin Login</span>
        </Link>
      ) : isAdmin ? (
        <Link
          to="/admin"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <Shield className="h-4 w-4" />
          <span>Admin Dashboard</span>
          {draftCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold animate-pulse">
              {draftCount}
            </span>
          )}
        </Link>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/wellness" className="hover:text-accent transition-colors">Wellness</a></li>
                <li><a href="/travel" className="hover:text-accent transition-colors">Travel</a></li>
                <li><a href="/creativity" className="hover:text-accent transition-colors">Creativity</a></li>
                <li><a href="/growth" className="hover:text-accent transition-colors">Growth</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-accent transition-colors">Our Story</a></li>
                <li><a href="/authors" className="hover:text-accent transition-colors">Authors</a></li>
                <li><a href="/contact" className="hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/style-guide" className="hover:text-accent transition-colors">Style Guide</a></li>
                <li><a href="/#newsletter" className="hover:text-accent transition-colors">Newsletter</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-accent transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {!user ? (
                  <li>
                    <Link to="/auth" className="hover:text-accent transition-colors inline-flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Admin Login
                    </Link>
                  </li>
                ) : isAdmin ? (
                  <li>
                    <Link to="/admin" className="hover:text-accent transition-colors inline-flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Admin Dashboard
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 PeakFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
