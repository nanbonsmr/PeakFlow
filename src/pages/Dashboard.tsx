import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import DashboardTopBar from "@/components/admin/DashboardTopBar";
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
  PenLine,
  UserPlus,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <DashboardSidebar />

      <div className="flex-1 ml-20 lg:ml-64 transition-all duration-300 flex flex-col">
        <DashboardTopBar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
                    Welcome back
                    <span className="inline-block animate-float">👋</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Here's what's happening with your blog today.
                  </p>
                </div>
                <Link to="/admin">
                  <Button className="rounded-xl bg-dashboard-accent hover:bg-dashboard-accent/90 shadow-lg shadow-dashboard-accent/25 transition-all hover:shadow-xl hover:shadow-dashboard-accent/30 gap-2">
                    <PenLine className="h-4 w-4" />
                    New Article
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="animate-slide-up stagger-1">
                <StatCard
                  title="Total Articles"
                  value={articles.length}
                  subtitle={`${publishedArticles} published, ${draftArticles} drafts`}
                  icon={FileText}
                  variant="accent"
                />
              </div>
              <div className="animate-slide-up stagger-2">
                <StatCard
                  title="Published"
                  value={publishedArticles}
                  subtitle="Live on your site"
                  icon={Eye}
                  variant="success"
                />
              </div>
              <div className="animate-slide-up stagger-3">
                <StatCard
                  title="This Month"
                  value={thisMonthArticles}
                  subtitle="New articles created"
                  icon={Calendar}
                  trend={{ value: Math.abs(growthRate), isPositive: growthRate >= 0 }}
                  variant="warning"
                />
              </div>
              <div className="animate-slide-up stagger-4">
                <StatCard
                  title="Subscribers"
                  value={subscribers.length}
                  subtitle={`${activeSubscribers} active subscribers`}
                  icon={Mail}
                  variant="info"
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
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-6">
                <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-dashboard-accent" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/admin"
                    className="flex items-center justify-between p-4 rounded-xl bg-dashboard-accent/5 hover:bg-dashboard-accent/10 border border-transparent hover:border-dashboard-accent/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-dashboard-accent/15 flex items-center justify-center">
                        <PenLine className="h-5 w-5 text-dashboard-accent" />
                      </div>
                      <span className="font-medium">Create Article</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-dashboard-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                  <Link
                    to="/admin?tab=users"
                    className="flex items-center justify-between p-4 rounded-xl bg-dashboard-success/5 hover:bg-dashboard-success/10 border border-transparent hover:border-dashboard-success/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-dashboard-success/15 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-dashboard-success" />
                      </div>
                      <span className="font-medium">Manage Users</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-dashboard-success group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                  <Link
                    to="/admin?tab=subscribers"
                    className="flex items-center justify-between p-4 rounded-xl bg-dashboard-warning/5 hover:bg-dashboard-warning/10 border border-transparent hover:border-dashboard-warning/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-dashboard-warning/15 flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-dashboard-warning" />
                      </div>
                      <span className="font-medium">View Subscribers</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-dashboard-warning group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </div>
              </div>

              {/* Recent Articles */}
              <div className="lg:col-span-2 bg-dashboard-card rounded-2xl border border-dashboard-border p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-dashboard-info" />
                    Recent Articles
                  </h3>
                  <Link
                    to="/admin"
                    className="text-sm text-dashboard-accent hover:underline font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentArticles.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="h-14 w-14 rounded-2xl bg-dashboard-bg flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-7 w-7 opacity-50" />
                      </div>
                      <p className="font-medium">No articles yet</p>
                      <p className="text-sm mt-1">Create your first article to get started</p>
                    </div>
                  ) : (
                    recentArticles.map((article, index) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-dashboard-bg transition-all group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate group-hover:text-dashboard-accent transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground capitalize bg-dashboard-bg px-2 py-0.5 rounded-md">
                              {article.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                            article.published
                              ? "bg-dashboard-success/15 text-dashboard-success"
                              : "bg-dashboard-bg text-muted-foreground"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
              <div className="bg-gradient-to-br from-dashboard-accent/10 via-purple-500/5 to-transparent rounded-2xl p-6 border border-dashboard-accent/20">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-lg shadow-dashboard-accent/25">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-dashboard-success/10 via-emerald-500/5 to-transparent rounded-2xl p-6 border border-dashboard-success/20">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-success to-emerald-400 flex items-center justify-center shadow-lg shadow-dashboard-success/25">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{adminUsers}</p>
                    <p className="text-sm text-muted-foreground font-medium">Admin Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-dashboard-warning/10 via-orange-500/5 to-transparent rounded-2xl p-6 border border-dashboard-warning/20">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-warning to-orange-400 flex items-center justify-center shadow-lg shadow-dashboard-warning/25">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{draftArticles}</p>
                    <p className="text-sm text-muted-foreground font-medium">Pending Drafts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;