import { useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import CommentsSection from "@/components/CommentsSection";
import SEO from "@/components/SEO";
import { useArticle, useRelatedArticles } from "@/hooks/useArticles";
import { Facebook, Twitter, Linkedin, Link2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
const Article = () => {
  const { id } = useParams<{ id: string }>();
  const { article, loading, error } = useArticle(id);
  const { articles: relatedArticles, loading: relatedLoading } = useRelatedArticles(id, article?.category);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="w-full h-[400px] rounded-2xl mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }
  
  if (!article || error) {
    return <Navigate to="/404" replace />;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const getCategoryClass = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes("financ")) return "tag-financing";
    if (normalized.includes("lifestyle")) return "tag-lifestyle";
    if (normalized.includes("community")) return "tag-community";
    if (normalized.includes("wellness")) return "tag-wellness";
    if (normalized.includes("travel")) return "tag-travel";
    if (normalized.includes("creativ")) return "tag-creativity";
    if (normalized.includes("growth")) return "tag-growth";
    return "tag-lifestyle";
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEO 
        title={article.title}
        description={article.excerpt || `Read ${article.title} by ${article.author} on PeakFlow.`}
        type="article"
        image={article.image}
        canonical={`https://echo-perspective.lovable.app/article/${article.id}`}
        article={{
          author: article.author,
          publishedTime: article.date,
          modifiedTime: article.date,
          category: article.category,
        }}
      />
      <Header />
      
      <main>
        {/* Back Navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to articles
          </a>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] mb-12">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          {/* Article Header */}
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryClass(article.category)}`}>
                {article.category}
              </span>
              <span className="text-sm text-muted-foreground">{article.date}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{article.readTime} read</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-8">
                {article.excerpt}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between border-t border-b border-border py-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{article.author}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                  aria-label="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-16 animate-slide-up stagger-2">
            {article.content ? (
              <div 
                className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
              />
            ) : (
              <p className="text-lg leading-relaxed text-muted-foreground">
                {article.excerpt || "No content available."}
              </p>
            )}
          </div>

          {/* Comments Section */}
          <CommentsSection articleId={id!} />

          {/* Mobile Share Buttons */}
          <div className="md:hidden mb-12 pb-12 border-b border-border">
            <p className="text-sm font-semibold mb-4">Share this article</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                <span className="text-sm">Copy link</span>
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="mb-16 rounded-2xl bg-card p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Enjoyed this article?</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to receive more insights like this directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-muted py-16 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8 animate-slide-up">You might also like</h2>
              {relatedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] rounded-[2.5rem]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle, index) => (
                    <div key={relatedArticle.id} className={`animate-slide-up stagger-${Math.min(index + 1, 3)}`}>
                      <ArticleCard 
                        id={relatedArticle.id}
                        title={relatedArticle.title}
                        category={relatedArticle.category}
                        date={relatedArticle.date}
                        image={relatedArticle.image}
                        size="small" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Article;
