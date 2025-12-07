import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const Travel = () => {
  const { articles: travelArticles, loading } = useArticles("travel");

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            Travel & Exploration
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Journey through inspiring destinations, cultural insights, and mindful travel practices. 
            Discover how to explore the world with intention, curiosity, and respect for local communities and environments.
          </p>
        </div>

        {/* Articles Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-[2.5rem]" />
              ))}
            </div>
          ) : travelArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelArticles.map((article, index) => (
                <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 2, 6)}`}>
                  <ArticleCard 
                    id={article.id}
                    title={article.title}
                    category={article.category}
                    date={article.date}
                    image={article.image}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No travel articles published yet.</p>
              <p className="text-sm mt-2">Check back soon for new content!</p>
            </div>
          )}
        </section>

        {/* Travel Philosophy */}
        <section className="mt-16 rounded-2xl bg-card p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Travel Philosophy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Travel is more than visiting new places—it's about opening ourselves to new perspectives, cultures, 
                and ways of being. We believe in slow, intentional travel that prioritizes meaningful connections 
                over checking off bucket list items.
              </p>
              <p>
                Whether you're exploring your own backyard or venturing to distant lands, we share stories and 
                insights that inspire mindful exploration, sustainable practices, and genuine cultural exchange. 
                Join us in discovering that the journey itself is often the most valuable destination.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Travel;
