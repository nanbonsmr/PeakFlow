import Header from "@/components/Header";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const Productivity = () => {
  const { articles: productivityArticles, loading } = useArticles("productivity");

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEO 
        title="Productivity"
        description="Master your time, optimize your workflow, and achieve more with less stress. Discover proven strategies, tools, and frameworks to boost your efficiency."
        canonical="https://peakflow-blog.netlify.app/productivity"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Productivity", url: "/productivity" },
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            Productivity
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Master your time, optimize your workflow, and achieve more with less stress. 
            Discover proven strategies, tools, and frameworks to boost your efficiency and focus.
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
          ) : productivityArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productivityArticles.map((article, index) => (
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
              <p className="text-lg">No productivity articles published yet.</p>
              <p className="text-sm mt-2">Check back soon for new content!</p>
            </div>
          )}
        </section>

        {/* Featured Content */}
        <section className="mt-16 rounded-2xl bg-card p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Art of Getting Things Done</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Productivity isn't about doing more—it's about doing what matters most. In a world full of 
                distractions, the ability to focus and execute effectively is a superpower.
              </p>
              <p>
                From time-blocking techniques and task management systems to deep work strategies and 
                automation tools, we share actionable insights that help you work smarter. Whether you're 
                a solo entrepreneur, remote worker, or team leader, these principles will transform how 
                you approach your work.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Productivity;
