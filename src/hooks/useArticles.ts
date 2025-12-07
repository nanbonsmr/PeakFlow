import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Article = Tables<"articles">;

export interface ArticleDisplay {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string | null;
  content: string | null;
  author: string;
  readTime: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mapArticleToDisplay = (article: Article): ArticleDisplay => ({
  id: article.id,
  title: article.title,
  category: article.category,
  date: formatDate(article.created_at),
  image: article.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80",
  excerpt: article.excerpt,
  content: article.content,
  author: article.author,
  readTime: article.read_time || "5 min read",
});

export const useArticles = (category?: string) => {
  const [articles, setArticles] = useState<ArticleDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      if (category) {
        query = query.ilike("category", category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setArticles([]);
      } else {
        setArticles((data || []).map(mapArticleToDisplay));
      }
      setLoading(false);
    };

    fetchArticles();

    // Real-time subscription
    const channel = supabase
      .channel("articles-public-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => {
          fetchArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return { articles, loading, error };
};

export const useArticle = (id: string | undefined) => {
  const [article, setArticle] = useState<ArticleDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        setArticle(null);
      } else if (data) {
        setArticle(mapArticleToDisplay(data));
      } else {
        setArticle(null);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  return { article, loading, error };
};

export const useRelatedArticles = (currentId: string | undefined, category: string | undefined, limit = 3) => {
  const [articles, setArticles] = useState<ArticleDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentId || !category) {
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .ilike("category", category)
        .neq("id", currentId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data && data.length > 0) {
        setArticles(data.map(mapArticleToDisplay));
      } else {
        // Fallback to any articles if no category match
        const { data: fallbackData } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .neq("id", currentId)
          .order("created_at", { ascending: false })
          .limit(limit);
        
        setArticles((fallbackData || []).map(mapArticleToDisplay));
      }
      setLoading(false);
    };

    fetchRelated();
  }, [currentId, category, limit]);

  return { articles, loading };
};
