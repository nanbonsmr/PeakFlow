import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Users,
  FileText,
  Loader2,
  Mail,
  Download,
  ArrowLeft,
} from "lucide-react";
import ArticleRow from "@/components/admin/ArticleRow";
import UserRow from "@/components/admin/UserRow";
import SubscriberRow from "@/components/admin/SubscriberRow";
import ArticleDialog from "@/components/admin/ArticleDialog";
import { Link } from "react-router-dom";

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

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const Manage = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [savingArticle, setSavingArticle] = useState(false);

  const defaultTab = searchParams.get("tab") || "articles";

  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "general",
    image_url: "",
    author: "",
    read_time: "5 min read",
    published: false,
  });

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
      fetchArticles();
      fetchUsers();
      fetchSubscribers();
    }
  }, [isAdmin]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching articles",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
    }
    setLoadingData(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
  };

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching subscribers",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubscribers(data || []);
    }
  };

  const handleToggleSubscriberActive = async (subscriber: Subscriber) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: !subscriber.is_active })
      .eq("id", subscriber.id);

    if (error) {
      toast({
        title: "Error updating subscriber",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchSubscribers();
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting subscriber",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Subscriber removed successfully" });
      fetchSubscribers();
    }
  };

  const handleExportSubscribers = () => {
    if (subscribers.length === 0) {
      toast({
        title: "No subscribers",
        description: "There are no subscribers to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Email", "Status", "Subscribed At"];
    const csvContent = [
      headers.join(","),
      ...subscribers.map((s) =>
        [
          s.email,
          s.is_active ? "Active" : "Inactive",
          new Date(s.subscribed_at).toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Subscribers exported successfully" });
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: "",
      excerpt: "",
      content: "",
      category: "general",
      image_url: "",
      author: "",
      read_time: "5 min read",
      published: false,
    });
    setEditingArticle(null);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content || "",
      category: article.category,
      image_url: article.image_url || "",
      author: article.author,
      read_time: article.read_time || "5 min read",
      published: article.published,
    });
    setIsArticleDialogOpen(true);
  };

  const handleSaveArticle = async () => {
    if (!articleForm.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the article.",
        variant: "destructive",
      });
      return;
    }

    setSavingArticle(true);

    const articleData = {
      title: articleForm.title.trim(),
      excerpt: articleForm.excerpt.trim() || null,
      content: articleForm.content.trim() || null,
      category: articleForm.category,
      image_url: articleForm.image_url.trim() || null,
      author: articleForm.author.trim() || "Anonymous",
      read_time: articleForm.read_time.trim() || "5 min read",
      published: articleForm.published,
    };

    if (editingArticle) {
      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", editingArticle.id);

      if (error) {
        toast({
          title: "Error updating article",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Article updated successfully" });
        fetchArticles();
        setIsArticleDialogOpen(false);
        resetArticleForm();
      }
    } else {
      const { error } = await supabase.from("articles").insert([articleData]);

      if (error) {
        toast({
          title: "Error creating article",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Article created successfully" });
        fetchArticles();
        setIsArticleDialogOpen(false);
        resetArticleForm();
      }
    }

    setSavingArticle(false);
  };

  const handleDeleteArticle = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting article",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Article deleted successfully" });
      fetchArticles();
    }
  };

  const handleTogglePublish = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({ published: !article.published })
      .eq("id", article.id);

    if (error) {
      toast({
        title: "Error updating article",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchArticles();
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "user") => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "User role updated successfully" });
      fetchUsers();
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading...</p>
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
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight">
                Content Management
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Manage articles, users, and subscribers
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-4 sm:space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full sm:w-auto overflow-x-auto">
              <TabsTrigger
                value="articles"
                className="rounded-lg sm:rounded-xl px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-lg sm:rounded-xl px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className="rounded-lg sm:rounded-xl px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Subscribers
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={() => {
                resetArticleForm();
                setIsArticleDialogOpen(true);
              }}
              className="rounded-xl shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </div>

          <TabsContent value="articles" className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <FileText className="h-12 w-12 opacity-50" />
                          <p className="font-medium">No articles yet</p>
                          <p className="text-sm">Create your first article to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        onEdit={handleEditArticle}
                        onDelete={handleDeleteArticle}
                        onTogglePublish={handleTogglePublish}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="text-right font-semibold">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Users className="h-12 w-12 opacity-50" />
                          <p className="font-medium">No users yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((userRole) => (
                      <UserRow
                        key={userRole.id}
                        userRole={userRole}
                        currentUserId={user?.id}
                        onUpdateRole={handleUpdateUserRole}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleExportSubscribers}
                variant="outline"
                className="rounded-xl w-full sm:w-auto"
                disabled={subscribers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Subscribed</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Mail className="h-12 w-12 opacity-50" />
                          <p className="font-medium">No subscribers yet</p>
                          <p className="text-sm">Subscribers will appear here when they sign up</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber) => (
                      <SubscriberRow
                        key={subscriber.id}
                        subscriber={subscriber}
                        onToggleActive={handleToggleSubscriberActive}
                        onDelete={handleDeleteSubscriber}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ArticleDialog
        open={isArticleDialogOpen}
        onOpenChange={(open) => {
          setIsArticleDialogOpen(open);
          if (!open) resetArticleForm();
        }}
        form={articleForm}
        onFormChange={setArticleForm}
        onSave={handleSaveArticle}
        saving={savingArticle}
        isEditing={!!editingArticle}
      />
    </div>
  );
};

export default Manage;
