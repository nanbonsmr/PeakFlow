import Header from "@/components/Header";
import SEO from "@/components/SEO";
import ArticleCard from "@/components/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";

const TechTips = () => {
  const { articles: techArticles, loading } = useArticles("tech");

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEO 
        title="Tech Tips"
        description="Stay ahead with the latest tools, apps, and digital strategies. Learn how to leverage technology to work smarter and simplify your digital life."
        canonical="https://peakflow-blog.netlify.app/tech-tips"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tech Tips", url: "/tech-tips" },
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            Tech Tips
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Stay ahead with the latest tools, apps, and digital strategies. 
            Learn how to leverage technology to work smarter, automate tasks, and simplify your digital life.
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
          ) : techArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techArticles.map((article, index) => (
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
              <p className="text-lg">No tech articles published yet.</p>
              <p className="text-sm mt-2">Check back soon for new content!</p>
            </div>
          )}
        </section>

        {/* Tech Philosophy */}
        <section className="mt-16 rounded-2xl bg-card p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Technology That Works For You</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Technology should simplify your life, not complicate it. The right tools can automate 
                repetitive tasks, streamline your workflow, and free up time for what matters most.
              </p>
              <p>
                From productivity apps and note-taking systems to automation workflows and AI tools, 
                we review and recommend only what we've tested ourselves. No sponsored content, no 
                fluff—just honest insights to help you build a tech stack that actually works.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TechTips;
