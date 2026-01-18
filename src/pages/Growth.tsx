import Header from "@/components/Header";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const Growth = () => {
  const { articles: growthArticles, loading } = useArticles("growth");

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEO 
        title="Personal Growth"
        description="Unlock your potential through continuous learning and self-improvement. Explore strategies for developing new skills and becoming the best version of yourself."
        canonical="https://peakflow-blog.netlify.app/growth"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Personal Growth", url: "/growth" },
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            Personal Growth
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Unlock your potential through continuous learning and self-improvement. 
            Explore strategies for developing new skills, building better habits, and becoming the best version of yourself.
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
          ) : growthArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {growthArticles.map((article, index) => (
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
              <p className="text-lg">No growth articles published yet.</p>
              <p className="text-sm mt-2">Check back soon for new content!</p>
            </div>
          )}
        </section>

        {/* Growth Philosophy */}
        <section className="mt-16 rounded-2xl bg-card p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Path of Continuous Improvement</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Personal growth is a lifelong journey, not a destination. The compound effect of small, 
                consistent improvements leads to remarkable transformations over time.
              </p>
              <p>
                We share learning strategies that accelerate skill acquisition, mindset frameworks that 
                help you overcome limiting beliefs, and practical advice for building resilience. Whether 
                you're learning a new skill, changing careers, or simply striving to be better, these 
                insights will guide your path forward.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Growth;
