import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSwipe } from "@/hooks/useSwipe";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import DashboardTopBar from "@/components/admin/DashboardTopBar";
import SwipeIndicator from "@/components/admin/SwipeIndicator";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ArticleRow from "@/components/admin/ArticleRow";
import { cn } from "@/lib/utils";

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

const ManageArticles = () => {
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSwipeRight = useCallback(() => {
    if (isMobile && !mobileMenuOpen) setMobileMenuOpen(true);
  }, [isMobile, mobileMenuOpen]);
  const handleSwipeLeft = useCallback(() => {
    if (isMobile && mobileMenuOpen) setMobileMenuOpen(false);
  }, [isMobile, mobileMenuOpen]);
  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight, threshold: 50, edgeWidth: 30 });

  useEffect(() => {
    if (loading || adminLoading) return;
    if (!user) navigate("/auth");
    else if (!isAdmin) {
      toast({ title: "Access denied", description: "You don't have admin privileges.", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, loading, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) fetchArticles();
  }, [isAdmin]);

  const fetchArticles = async () => {
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching articles", description: error.message, variant: "destructive" });
    } else {
      setArticles(data || []);
    }
    setLoadingData(false);
  };

  const handleEditArticle = (article: Article) => navigate(`/manage/edit/${article.id}`);

  const handleDeleteArticle = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting article", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article deleted successfully" });
      fetchArticles();
    }
  };

  const handleTogglePublish = async (article: Article) => {
    const { error } = await supabase.from("articles").update({ published: !article.published }).eq("id", article.id);
    if (error) {
      toast({ title: "Error updating article", description: error.message, variant: "destructive" });
    } else {
      fetchArticles();
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(query))
    );
  });

  const publishedCount = articles.filter((a) => a.published).length;
  const draftCount = articles.filter((a) => !a.published).length;

  if (loading || adminLoading || loadingData) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <SwipeIndicator visible={isMobile && !mobileMenuOpen} />
      <DashboardSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      <div className={cn("flex-1 transition-all duration-300 flex flex-col", "lg:ml-64", sidebarCollapsed && "lg:ml-20")}>
        <DashboardTopBar onMenuClick={() => setMobileMenuOpen(true)} searchQuery="" onSearchChange={() => {}} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Articles</h1>
                <p className="text-muted-foreground mt-1 text-sm">Manage your blog articles</p>
              </div>
              <Button onClick={() => navigate("/manage/new")} className="rounded-xl shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto bg-dashboard-accent hover:bg-dashboard-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-dashboard-accent/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-dashboard-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{articles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Articles</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles by title, category, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-dashboard-card border-dashboard-border"
              />
            </div>

            {/* Table */}
            <div className="bg-dashboard-card rounded-2xl border border-dashboard-border overflow-hidden shadow-sm overflow-x-auto animate-fade-in">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-dashboard-bg hover:bg-dashboard-bg border-dashboard-border">
                    <TableHead className="font-semibold">Article</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Author</TableHead>
                    <TableHead className="font-semibold">Read Time</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <FileText className="h-12 w-12 opacity-50" />
                          <p className="font-medium">{searchQuery ? "No articles match your search" : "No articles yet"}</p>
                          <p className="text-sm">{searchQuery ? "Try a different search term" : "Create your first article to get started"}</p>
                          {!searchQuery && (
                            <Button onClick={() => navigate("/manage/new")} variant="outline" className="mt-2 rounded-xl">
                              <Plus className="h-4 w-4 mr-2" /> Create Article
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <ArticleRow key={article.id} article={article} onEdit={handleEditArticle} onDelete={handleDeleteArticle} onTogglePublish={handleTogglePublish} />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageArticles;
