import { Instagram, Facebook, Linkedin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-muted via-muted to-card my-12 animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative grid md:grid-cols-2 gap-6 md:gap-12 p-6 md:p-12 lg:p-16">
        {/* Left side - Image */}
        <div className="relative aspect-[4/3] md:aspect-auto rounded-[2rem] overflow-hidden animate-scale-in group">
          <img
            src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1920&q=80"
            alt="Minimal workspace with natural light"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Floating badge */}
          <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-2 animate-float">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Featured Today</span>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="flex flex-col justify-center space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
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
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 pt-4 animate-slide-up stagger-2">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-4 md:px-10 md:py-6 text-base font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto group">
              <span>Join Now</span>
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Button>

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
