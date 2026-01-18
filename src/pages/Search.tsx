import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Search as SearchIcon, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["All", "Productivity", "Lifestyle", "Tech Tips", "Personal Growth"];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { articles, loading } = useArticles();

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    setSearchParams(params, { replace: true });
  }, [query, selectedCategory, setSearchParams]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
        article.author.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        article.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  }, [articles, query, selectedCategory]);

  const handleClearSearch = () => {
    setQuery("");
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEO 
        title="Search Articles"
        description="Search through PeakFlow articles on productivity, lifestyle, tech tips, and personal growth."
        canonical="https://peakflow-blog.netlify.app/search"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Search", url: "/search" },
        ]}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Search Articles</h1>

          {/* Search Input */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, content, or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg rounded-full border-border bg-muted/30 focus:bg-background transition-colors"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 animate-slide-up stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 animate-slide-up stagger-2">
          <p className="text-muted-foreground">
            {loading ? (
              "Searching..."
            ) : (
              <>
                Found <span className="font-semibold text-foreground">{filteredArticles.length}</span>{" "}
                {filteredArticles.length === 1 ? "article" : "articles"}
                {query && (
                  <>
                    {" "}for "<span className="font-semibold text-foreground">{query}</span>"
                  </>
                )}
                {selectedCategory !== "All" && (
                  <>
                    {" "}in <span className="font-semibold text-foreground">{selectedCategory}</span>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-[2.5rem]" />
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up stagger-3">
            {filteredArticles.map((article, index) => (
              <div key={article.id} className={`animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
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
          <div className="text-center py-16">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setSelectedCategory("All");
              }}
              className="rounded-full"
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
