import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  FileText,
  Shield,
  Loader2,
  Eye,
  Calendar,
  Mail,
  Settings,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import ArticleCharts from "@/components/admin/ArticleCharts";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  image_url: string | null;
  author: string;
  read_time: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    const [articlesRes, subscribersRes] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("*"),
    ]);

    if (articlesRes.data) setArticles(articlesRes.data);
    if (subscribersRes.data) setSubscribers(subscribersRes.data);
    setLoadingData(false);
  };

  // Calculate stats
  const publishedArticles = articles.filter((a) => a.published).length;
  const draftArticles = articles.filter((a) => !a.published).length;
  const activeSubscribers = subscribers.filter((s) => s.is_active).length;
  const thisMonthArticles = articles.filter((a) => {
    const articleDate = new Date(a.created_at);
    const now = new Date();
    return (
      articleDate.getMonth() === now.getMonth() &&
      articleDate.getFullYear() === now.getFullYear()
    );
  }).length;

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Overview of your content and users
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full border border-accent/20">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
              <span className="text-xs sm:text-sm font-semibold text-accent">Admin</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-slide-up stagger-1">
            <StatCard
              title="Total Articles"
              value={articles.length}
              subtitle={`${publishedArticles} published, ${draftArticles} drafts`}
              icon={FileText}
              variant="default"
            />
          </div>
          <div className="animate-slide-up stagger-2">
            <StatCard
              title="Published"
              value={publishedArticles}
              subtitle="Live on site"
              icon={Eye}
              variant="accent"
            />
          </div>
          <div className="animate-slide-up stagger-3">
            <StatCard
              title="This Month"
              value={thisMonthArticles}
              subtitle="New articles"
              icon={Calendar}
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="animate-slide-up stagger-4">
            <StatCard
              title="Subscribers"
              value={subscribers.length}
              subtitle={`${activeSubscribers} active`}
              icon={Mail}
            />
          </div>
        </div>

        {/* Charts Section */}
        <ArticleCharts articles={articles} />

        {/* Quick Actions */}
        <div className="mt-8 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/manage">
              <div className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-lg transition-all hover:border-accent/30 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manage Articles</h3>
                      <p className="text-sm text-muted-foreground">Create, edit, delete articles</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link to="/manage?tab=users">
              <div className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-lg transition-all hover:border-accent/30 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manage Users</h3>
                      <p className="text-sm text-muted-foreground">View and manage user roles</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link to="/manage?tab=subscribers">
              <div className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-lg transition-all hover:border-accent/30 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manage Subscribers</h3>
                      <p className="text-sm text-muted-foreground">View and export subscribers</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
