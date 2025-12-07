import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Star, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  featured: boolean;
}

interface FeaturedArticleSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: () => void;
  currentFeaturedId?: string;
}

const FeaturedArticleSelector = ({
  open,
  onOpenChange,
  onSelect,
  currentFeaturedId,
}: FeaturedArticleSelectorProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchArticles();
    }
  }, [open]);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, excerpt, image_url, category, featured")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const handleSetFeatured = async (articleId: string) => {
    setSaving(true);
    
    // First, unset all featured articles
    const { error: unsetError } = await supabase
      .from("articles")
      .update({ featured: false })
      .eq("featured", true);

    if (unsetError) {
      toast({
        title: "Error",
        description: "Failed to update featured article",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Then set the new featured article
    const { error: setError } = await supabase
      .from("articles")
      .update({ featured: true })
      .eq("id", articleId);

    if (setError) {
      toast({
        title: "Error",
        description: "Failed to set featured article",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Featured article updated",
      });
      onSelect();
      onOpenChange(false);
    }
    setSaving(false);
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Select Featured Article
          </DialogTitle>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No published articles found</p>
              <p className="text-sm mt-1">Create and publish articles first</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-muted/50 ${
                  article.featured
                    ? "border-accent bg-accent/5"
                    : "border-border/50"
                }`}
                onClick={() => handleSetFeatured(article.id)}
              >
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Star className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{article.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {article.excerpt || "No excerpt"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                    {article.category}
                  </span>
                  {article.featured && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                      <Check className="h-3 w-3" />
                      Current
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {saving && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedArticleSelector;
