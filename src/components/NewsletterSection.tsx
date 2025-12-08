import { useState } from "react";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "Invalid email",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already on our mailing list.",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Welcome aboard!",
          description: "You've successfully subscribed to our newsletter.",
        });
      }
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 p-8 md:p-12 my-16 animate-fade-in">
        <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold font-serif">You're on the list!</h3>
          <p className="text-muted-foreground max-w-md">
            Thank you for subscribing. We'll keep you updated with the latest articles and insights.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 p-8 md:p-12 my-16 animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Content */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <Mail className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Newsletter</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
            Stay inspired with{" "}
            <span className="relative inline-block text-accent">
              PeakFlow
              <span className="absolute -bottom-1 left-0 right-0 h-2 bg-accent/20 -skew-x-3 -z-10 rounded" />
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Join our community and receive weekly insights on wellness, creativity, travel, and personal growth delivered straight to your inbox.
          </p>
        </div>
        
        {/* Right side - Form */}
        <div className="relative">
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl pl-5 pr-14 text-base bg-background/80 backdrop-blur-sm border-border/50 focus:border-accent transition-colors"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !email}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground transition-all hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-left">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;