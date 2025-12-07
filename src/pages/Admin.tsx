import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Users, FileText, Shield, Loader2 } from "lucide-react";

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
  email?: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [savingArticle, setSavingArticle] = useState(false);

  // Article form state
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage articles and users
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Admin</span>
          </div>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="articles"
              className="rounded-lg data-[state=active]:bg-background"
            >
              <FileText className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-lg data-[state=active]:bg-background"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Articles ({articles.length})</h2>
              <Dialog
                open={isArticleDialogOpen}
                onOpenChange={(open) => {
                  setIsArticleDialogOpen(open);
                  if (!open) resetArticleForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif">
                      {editingArticle ? "Edit Article" : "Create New Article"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={articleForm.title}
                        onChange={(e) =>
                          setArticleForm({ ...articleForm, title: e.target.value })
                        }
                        placeholder="Enter article title"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                          id="author"
                          value={articleForm.author}
                          onChange={(e) =>
                            setArticleForm({ ...articleForm, author: e.target.value })
                          }
                          placeholder="Author name"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={articleForm.category}
                          onValueChange={(value) =>
                            setArticleForm({ ...articleForm, category: value })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="wellness">Wellness</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="creativity">Creativity</SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                          id="image_url"
                          value={articleForm.image_url}
                          onChange={(e) =>
                            setArticleForm({ ...articleForm, image_url: e.target.value })
                          }
                          placeholder="https://..."
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="read_time">Read Time</Label>
                        <Input
                          id="read_time"
                          value={articleForm.read_time}
                          onChange={(e) =>
                            setArticleForm({ ...articleForm, read_time: e.target.value })
                          }
                          placeholder="5 min read"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) =>
                          setArticleForm({ ...articleForm, excerpt: e.target.value })
                        }
                        placeholder="Brief summary of the article"
                        className="rounded-xl resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={articleForm.content}
                        onChange={(e) =>
                          setArticleForm({ ...articleForm, content: e.target.value })
                        }
                        placeholder="Full article content..."
                        className="rounded-xl resize-none"
                        rows={6}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="published"
                          checked={articleForm.published}
                          onCheckedChange={(checked) =>
                            setArticleForm({ ...articleForm, published: checked })
                          }
                        />
                        <Label htmlFor="published">Published</Label>
                      </div>
                      <Button
                        onClick={handleSaveArticle}
                        disabled={savingArticle}
                        className="rounded-xl"
                      >
                        {savingArticle ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {editingArticle ? "Update Article" : "Create Article"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No articles yet. Create your first article!
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {article.title}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-muted rounded-full text-xs capitalize">
                            {article.category}
                          </span>
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleTogglePublish(article)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              article.published
                                ? "bg-accent/20 text-accent hover:bg-accent/30"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {article.published ? "Published" : "Draft"}
                          </button>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(article.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditArticle(article)}
                              className="rounded-lg"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="rounded-lg text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-xl font-semibold">Users ({users.length})</h2>

            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No users yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">
                          {userRole.user_id}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              userRole.role === "admin"
                                ? "bg-accent/20 text-accent"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {userRole.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(userRole.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={userRole.role}
                            onValueChange={(value: "admin" | "user") =>
                              handleUpdateUserRole(userRole.user_id, value)
                            }
                            disabled={userRole.user_id === user?.id}
                          >
                            <SelectTrigger className="w-[100px] rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
