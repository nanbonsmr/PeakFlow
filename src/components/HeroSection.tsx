import { useState, useEffect, useCallback, useRef } from "react";
import { Instagram, Facebook, Linkedin, Sparkles, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface FeaturedArticle {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
}

interface HeroSectionProps {
  featuredArticles?: FeaturedArticle[];
  isAdmin?: boolean;
  onEditFeatured?: () => void;
}

const HeroSection = ({ featuredArticles = [], isAdmin, onEditFeatured }: HeroSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const hasFeatures = featuredArticles.length > 0;
  const currentArticle = hasFeatures ? featuredArticles[current] : null;

  return (
    <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-muted via-muted to-card my-12 animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative grid md:grid-cols-2 gap-6 md:gap-12 p-6 md:p-12 lg:p-16">
        {/* Left side - Image Carousel */}
        <div className="relative aspect-[4/3] md:aspect-auto rounded-[2rem] overflow-hidden animate-scale-in group">
          {hasFeatures ? (
            <Carousel 
              setApi={setApi} 
              opts={{ loop: true }} 
              plugins={[autoplayPlugin.current]}
              className="w-full h-full"
            >
              <CarouselContent className="h-full -ml-0">
                {featuredArticles.map((article) => (
                  <CarouselItem key={article.id} className="h-full pl-0">
                    <Link to={`/article/${article.id}`} className="block w-full h-full">
                      <img
                        src={article.image_url || "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1920&q=80"}
                        alt={article.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Carousel Navigation */}
              {count > 1 && (
                <>
                  <Button
                    onClick={scrollPrev}
                    size="icon"
                    variant="ghost"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border/50 hover:bg-background/80 text-foreground z-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={scrollNext}
                    size="icon"
                    variant="ghost"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border/50 hover:bg-background/80 text-foreground z-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </Carousel>
          ) : (
            <img
              src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1920&q=80"
              alt="Minimal workspace with natural light"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Floating badge with dots */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-2 animate-float">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Featured {hasFeatures && count > 1 ? `${current + 1}/${count}` : "Today"}</span>
            </div>

            {/* Dot indicators */}
            {count > 1 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto ${
                      index === current
                        ? "bg-accent w-4"
                        : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Admin Edit Button */}
          {isAdmin && (
            <Button
              onClick={onEditFeatured}
              size="sm"
              className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur-md border border-border/50 hover:bg-background text-foreground shadow-lg z-20"
            >
              {hasFeatures ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Featured ({count})
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Set Featured
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right side - Content */}
        <div className="flex flex-col justify-center space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            {currentArticle ? (
              <div key={currentArticle.id} className="animate-fade-in">
                <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent bg-accent/10 rounded-full mb-4">
                  {currentArticle.category}
                </span>
                <Link to={`/article/${currentArticle.id}`}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight hover:text-accent transition-colors">
                    {currentArticle.title}
                  </h1>
                </Link>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl mt-4">
                  {currentArticle.excerpt}
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight animate-slide-down">
                  Journey Through{" "}
                  <span className="relative inline-block">
                    Life's Spectrum
                    <span className="absolute -bottom-2 left-0 right-0 h-3 bg-accent/20 -skew-x-3 -z-10" />
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1">
                  Welcome to Perspective's Blog: A Realm of Reflection, Inspiration, and Discovery. Where Words Illuminate
                  Paths of Meaning.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 pt-4 animate-slide-up stagger-2">
            {currentArticle ? (
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-4 md:px-10 md:py-6 text-base font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto group">
                <Link to={`/article/${currentArticle.id}`}>
                  <span>Read Article</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-4 md:px-10 md:py-6 text-base font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto group">
                <span>Join Now</span>
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Button>
            )}

            <div className="flex items-center gap-3">
              <a
                href="#instagram"
                className="w-11 h-11 rounded-full border-2 border-border/50 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center hover:scale-110 hover:-translate-y-1 duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#facebook"
                className="w-11 h-11 rounded-full border-2 border-border/50 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center hover:scale-110 hover:-translate-y-1 duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#linkedin"
                className="w-11 h-11 rounded-full border-2 border-border/50 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center hover:scale-110 hover:-translate-y-1 duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
