import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import StatCard from "@/components/admin/StatCard";
import ArticleCharts from "@/components/admin/ArticleCharts";
import {
  FileText,
  Eye,
  Calendar,
  Mail,
  Users,
  TrendingUp,
  Clock,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
}

const Dashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
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
    const [articlesRes, subscribersRes, usersRes] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("*"),
      supabase.from("user_roles").select("*"),
    ]);

    if (articlesRes.data) setArticles(articlesRes.data);
    if (subscribersRes.data) setSubscribers(subscribersRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    setLoadingData(false);
  };

  // Calculate stats
  const publishedArticles = articles.filter((a) => a.published).length;
  const draftArticles = articles.filter((a) => !a.published).length;
  const activeSubscribers = subscribers.filter((s) => s.is_active).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  const thisMonthArticles = articles.filter((a) => {
    const articleDate = new Date(a.created_at);
    const now = new Date();
    return (
      articleDate.getMonth() === now.getMonth() &&
      articleDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const lastMonthArticles = articles.filter((a) => {
    const articleDate = new Date(a.created_at);
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return articleDate.getMonth() === lastMonth && articleDate.getFullYear() === year;
  }).length;

  const growthRate = lastMonthArticles > 0 
    ? Math.round(((thisMonthArticles - lastMonthArticles) / lastMonthArticles) * 100)
    : thisMonthArticles > 0 ? 100 : 0;

  const recentArticles = articles.slice(0, 5);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />

      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        <div className="p-6 lg:p-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-serif tracking-tight">
                  Welcome back! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's what's happening with your blog today.
                </p>
              </div>
              <Link to="/admin">
                <Button className="rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Content
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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
                trend={{ value: Math.abs(growthRate), isPositive: growthRate >= 0 }}
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
          <div className="mb-8">
            <ArticleCharts articles={articles} />
          </div>

          {/* Quick Actions & Recent Articles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/admin"
                  className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Create Article</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link
                  to="/admin?tab=users"
                  className="flex items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-medium">Manage Users</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </Link>
                <Link
                  to="/admin?tab=subscribers"
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">View Subscribers</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              </div>
            </div>

            {/* Recent Articles */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Recent Articles</h3>
                <Link
                  to="/admin"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentArticles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No articles yet</p>
                  </div>
                ) : (
                  recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{article.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground capitalize">
                            {article.category}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          article.published
                            ? "bg-accent/20 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-5 border border-accent/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminUsers}</p>
                  <p className="text-sm text-muted-foreground">Admin Users</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-5 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftArticles}</p>
                  <p className="text-sm text-muted-foreground">Pending Drafts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
