import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSwipe } from "@/hooks/useSwipe";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import DashboardTopBar from "@/components/admin/DashboardTopBar";
import StatCard from "@/components/admin/StatCard";
import ArticleCharts from "@/components/admin/ArticleCharts";
import SwipeIndicator from "@/components/admin/SwipeIndicator";
import { FileText, Eye, Calendar, Mail, Users, TrendingUp, Clock, Loader2, ArrowUpRight, PenLine, UserPlus, Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const {
    user,
    isAdmin,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // Swipe gestures for mobile sidebar
  const handleSwipeRight = useCallback(() => {
    if (isMobile && !mobileMenuOpen) {
      setMobileMenuOpen(true);
    }
  }, [isMobile, mobileMenuOpen]);
  const handleSwipeLeft = useCallback(() => {
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);
  useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    edgeWidth: 30
  });
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have admin privileges.",
        variant: "destructive"
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
    const [articlesRes, subscribersRes, usersRes] = await Promise.all([supabase.from("articles").select("*").order("created_at", {
      ascending: false
    }), supabase.from("newsletter_subscribers").select("*"), supabase.from("user_roles").select("*")]);
    if (articlesRes.data) setArticles(articlesRes.data);
    if (subscribersRes.data) setSubscribers(subscribersRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    setLoadingData(false);
  };

  // Calculate stats
  const publishedArticles = articles.filter(a => a.published).length;
  const draftArticles = articles.filter(a => !a.published).length;
  const activeSubscribers = subscribers.filter(s => s.is_active).length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const thisMonthArticles = articles.filter(a => {
    const articleDate = new Date(a.created_at);
    const now = new Date();
    return articleDate.getMonth() === now.getMonth() && articleDate.getFullYear() === now.getFullYear();
  }).length;
  const lastMonthArticles = articles.filter(a => {
    const articleDate = new Date(a.created_at);
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return articleDate.getMonth() === lastMonth && articleDate.getFullYear() === year;
  }).length;
  const growthRate = lastMonthArticles > 0 ? Math.round((thisMonthArticles - lastMonthArticles) / lastMonthArticles * 100) : thisMonthArticles > 0 ? 100 : 0;

  // Filter articles based on search query
  const filteredArticles = articles.filter(article => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return article.title.toLowerCase().includes(query) || article.category.toLowerCase().includes(query) || article.author.toLowerCase().includes(query);
  });
  const recentArticles = filteredArticles.slice(0, 5);
  if (loading || loadingData) {
    return <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <div className="min-h-screen bg-dashboard-bg flex">
      {/* Mobile swipe indicator */}
      <SwipeIndicator visible={isMobile && !mobileMenuOpen} />

      <DashboardSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      <div className={cn("flex-1 transition-all duration-300 flex flex-col", "lg:ml-64", sidebarCollapsed && "lg:ml-20")}>
        <DashboardTopBar onMenuClick={() => setMobileMenuOpen(true)} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
                    Welcome back
                    <span className="inline-block animate-float">👋</span>
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Here's what's happening with your blog today.
                  </p>
                </div>
                <Link to="/manage" className="self-start sm:self-auto">
                  <Button className="rounded-xl bg-dashboard-accent hover:bg-dashboard-accent/90 shadow-lg shadow-dashboard-accent/25 transition-all hover:shadow-xl hover:shadow-dashboard-accent/30 gap-2 text-sm sm:text-base">
                    <PenLine className="h-4 w-4" />
                    New Article
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
              <div className="animate-slide-up stagger-1">
                <StatCard title="Total Articles" value={articles.length} subtitle={`${publishedArticles} published`} icon={FileText} variant="accent" />
              </div>
              <div className="animate-slide-up stagger-2">
                <StatCard title="Published" value={publishedArticles} subtitle="Live on site" icon={Eye} variant="success" />
              </div>
              <div className="animate-slide-up stagger-3">
                <StatCard title="This Month" value={thisMonthArticles} subtitle="New articles" icon={Calendar} trend={{
                value: Math.abs(growthRate),
                isPositive: growthRate >= 0
              }} variant="warning" />
              </div>
              <div className="animate-slide-up stagger-4">
                <StatCard title="Subscribers" value={subscribers.length} subtitle={`${activeSubscribers} active`} icon={Mail} variant="info" />
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-6 sm:mb-8">
              <ArticleCharts articles={articles} />
            </div>

            {/* Quick Actions & Recent Articles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-5 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-dashboard-accent" />
                  Quick Actions
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <Link to="/manage" className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-dashboard-accent/5 hover:bg-dashboard-accent/10 border border-transparent hover:border-dashboard-accent/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-dashboard-accent/15 flex items-center justify-center">
                        <PenLine className="h-4 w-4 sm:h-5 sm:w-5 text-dashboard-accent" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">Manage Articles</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-dashboard-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                  <Link to="/manage?tab=users" className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-dashboard-success/5 hover:bg-dashboard-success/10 border border-transparent hover:border-dashboard-success/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-dashboard-success/15 flex items-center justify-center">
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-dashboard-success" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">Manage Users</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-dashboard-success group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                  <Link to="/manage?tab=subscribers" className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-dashboard-warning/5 hover:bg-dashboard-warning/10 border border-transparent hover:border-dashboard-warning/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-dashboard-warning/15 flex items-center justify-center">
                        <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-dashboard-warning" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">View Subscribers</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-dashboard-warning group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </div>
              </div>

              {/* Recent Articles */}
              
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mt-4 sm:mt-6">
              <div className="bg-gradient-to-br from-dashboard-accent/10 via-purple-500/5 to-transparent rounded-2xl p-4 sm:p-6 border border-dashboard-accent/20">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-lg shadow-dashboard-accent/25">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{users.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-dashboard-success/10 via-emerald-500/5 to-transparent rounded-2xl p-4 sm:p-6 border border-dashboard-success/20">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-dashboard-success to-emerald-400 flex items-center justify-center shadow-lg shadow-dashboard-success/25">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{adminUsers}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Admin Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-dashboard-warning/10 via-orange-500/5 to-transparent rounded-2xl p-4 sm:p-6 border border-dashboard-warning/20">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-dashboard-warning to-orange-400 flex items-center justify-center shadow-lg shadow-dashboard-warning/25">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{draftArticles}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Pending Drafts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};
export default Dashboard;