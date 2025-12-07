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
import { Loader2, Search, Star, Check, GripVertical } from "lucide-react";
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
  currentFeaturedIds?: string[];
}

const FeaturedArticleSelector = ({
  open,
  onOpenChange,
  onSelect,
  currentFeaturedIds = [],
}: FeaturedArticleSelectorProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchArticles();
      setSelectedIds(currentFeaturedIds);
    }
  }, [open, currentFeaturedIds]);

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

  const toggleSelection = (articleId: string) => {
    setSelectedIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // First, unset all featured articles
    const { error: unsetError } = await supabase
      .from("articles")
      .update({ featured: false })
      .eq("featured", true);

    if (unsetError) {
      toast({
        title: "Error",
        description: "Failed to update featured articles",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Then set the selected articles as featured
    if (selectedIds.length > 0) {
      const { error: setError } = await supabase
        .from("articles")
        .update({ featured: true })
        .in("id", selectedIds);

      if (setError) {
        toast({
          title: "Error",
          description: "Failed to set featured articles",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
    }

    toast({
      title: "Success",
      description: `${selectedIds.length} article${selectedIds.length !== 1 ? "s" : ""} set as featured`,
    });
    onSelect();
    onOpenChange(false);
    setSaving(false);
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Select Featured Articles
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select multiple articles to display in the hero carousel
          </p>
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
            filteredArticles.map((article) => {
              const isSelected = selectedIds.includes(article.id);
              const selectionIndex = selectedIds.indexOf(article.id);

              return (
                <div
                  key={article.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-muted/50 ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border/50"
                  }`}
                  onClick={() => toggleSelection(article.id)}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-xs font-bold">{selectionIndex + 1}</span>
                    )}
                  </div>
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
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize flex-shrink-0">
                    {article.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <p className="text-sm text-muted-foreground">
            {selectedCount} article{selectedCount !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Selection
            </Button>
          </div>
        </div>

        {saving && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedArticleSelector;
