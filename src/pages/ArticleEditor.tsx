import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/useSwipe";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import DashboardTopBar from "@/components/admin/DashboardTopBar";
import SwipeIndicator from "@/components/admin/SwipeIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  ImageIcon,
  Link2,
  ImagePlus,
  Heading1,
  Heading2,
  Heading3,
  ArrowLeft,
  Save,
  Upload,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { value: "general", label: "General" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "tech", label: "Tech Tips" },
  { value: "growth", label: "Personal Growth" },
];

const generateSlugFromTitle = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
};

const generateMetaDescription = (content: string, excerpt: string) => {
  if (excerpt && excerpt.length >= 50) return excerpt.substring(0, 160);
  const stripped = content.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
  return stripped.substring(0, 160);
};

const generateKeywords = (title: string, category: string, content: string) => {
  const words = `${title} ${category} ${content.replace(/<[^>]*>/g, "")}`
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, 10);
  return words.join(", ");
};

const ArticleEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(isEditing);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "general",
    image_url: "",
    author: "",
    read_time: "5 min read",
    published: false,
    slug: "",
    meta_description: "",
    meta_keywords: "",
  });

  // Swipe gestures
  const handleSwipeRight = useCallback(() => {
    if (isMobile && !mobileMenuOpen) setMobileMenuOpen(true);
  }, [isMobile, mobileMenuOpen]);
  const handleSwipeLeft = useCallback(() => {
    if (isMobile && mobileMenuOpen) setMobileMenuOpen(false);
  }, [isMobile, mobileMenuOpen]);
  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight, threshold: 50, edgeWidth: 30 });

  // Auth guard
  useEffect(() => {
    if (loading || adminLoading) return;
    if (!user) navigate("/auth");
    else if (!isAdmin) {
      toast({ title: "Access denied", description: "You don't have admin privileges.", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, loading, adminLoading, navigate, toast]);

  // Load article for editing
  useEffect(() => {
    if (isEditing && isAdmin) {
      const fetchArticle = async () => {
        const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
        if (error || !data) {
          toast({ title: "Article not found", variant: "destructive" });
          navigate("/manage/articles");
          return;
        }
        setForm({
          title: data.title,
          excerpt: data.excerpt || "",
          content: data.content || "",
          category: data.category,
          image_url: data.image_url || "",
          author: data.author,
          read_time: data.read_time || "5 min read",
          published: data.published,
          slug: (data as any).slug || "",
          meta_description: (data as any).meta_description || "",
          meta_keywords: (data as any).meta_keywords || "",
        });
        setLoadingArticle(false);
      };
      fetchArticle();
    }
  }, [id, isAdmin, isEditing, navigate, toast]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlugFromTitle(prev.title) }));
    }
  }, [form.title, isEditing]);

  // Auto-generate meta description
  useEffect(() => {
    if (form.content || form.excerpt) {
      const autoMeta = generateMetaDescription(form.content, form.excerpt);
      const autoKeywords = generateKeywords(form.title, form.category, form.content);
      setForm((prev) => ({
        ...prev,
        meta_description: prev.meta_description || autoMeta,
        meta_keywords: prev.meta_keywords || autoKeywords,
      }));
    }
  }, [form.content, form.excerpt, form.title, form.category]);

  const uploadImage = async (file: File, folder: string = "content") => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage.from("article-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from("article-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadImage(file, "covers");
      setForm({ ...form, image_url: url });
      toast({ title: "Cover image uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, "content");
      insertAtCursor(`\n<img src="${url}" alt="${file.name.split('.')[0]}" />\n`);
      toast({ title: "Image inserted!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setImagePopoverOpen(false);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = form.content.substring(0, start) + text + form.content.substring(end);
    setForm((prev) => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      insertAtCursor(`\n<img src="${imageUrl}" alt="${imageAlt || "Image"}" />\n`);
      setImageUrl("");
      setImageAlt("");
      setImagePopoverOpen(false);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      insertAtCursor(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      setLinkUrl("");
      setLinkText("");
      setLinkPopoverOpen(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", description: "Please enter a title.", variant: "destructive" });
      return;
    }
    setSaving(true);

    // Auto-generate SEO fields if empty
    const metaDesc = form.meta_description || generateMetaDescription(form.content, form.excerpt);
    const metaKeys = form.meta_keywords || generateKeywords(form.title, form.category, form.content);
    const slug = form.slug || generateSlugFromTitle(form.title);

    const articleData: Record<string, any> = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      category: form.category,
      image_url: form.image_url.trim() || null,
      author: form.author.trim() || "Anonymous",
      read_time: form.read_time.trim() || "5 min read",
      published: form.published,
      slug,
      meta_description: metaDesc,
      meta_keywords: metaKeys,
    };

    const { error } = isEditing
      ? await supabase.from("articles").update(articleData).eq("id", id)
      : await supabase.from("articles").insert([articleData]);

    if (error) {
      toast({ title: `Error ${isEditing ? "updating" : "creating"} article`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Article ${isEditing ? "updated" : "created"} successfully`, description: "SEO metadata has been automatically generated." });
      navigate("/manage/articles");
    }
    setSaving(false);
  };

  if (loading || adminLoading || loadingArticle) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <SwipeIndicator visible={isMobile && !mobileMenuOpen} />
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className={cn("flex-1 transition-all duration-300 flex flex-col", "lg:ml-64", sidebarCollapsed && "lg:ml-20")}>
        <DashboardTopBar onMenuClick={() => setMobileMenuOpen(true)} searchQuery="" onSearchChange={() => {}} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 animate-fade-in">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/manage/articles")} className="rounded-xl">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    {isEditing ? "Edit Article" : "Create New Article"}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {isEditing ? "Update your article details" : "Write and publish a new article"}
                  </p>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl px-6 gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEditing ? "Update" : "Publish"}
              </Button>
            </div>

            {/* Editor Content */}
            <div className="space-y-6 animate-fade-in">
              {/* Cover Image with Upload */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50 group">
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <p className="text-sm">Add a cover image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="gap-2"
                  >
                    {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Image
                  </Button>
                </div>
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageUpload}
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title <span className="text-destructive">*</span></Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter an engaging article title" className="rounded-xl text-lg font-medium" />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  SEO Slug
                </Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-from-title" className="rounded-xl text-sm font-mono" />
                <p className="text-xs text-muted-foreground">URL: /article/{form.slug || "your-article-slug"}</p>
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm font-medium">Author</Label>
                  <Input id="author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image URL & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-sm font-medium">Cover Image URL</Label>
                  <Input id="image_url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Or paste a URL here" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="read_time" className="text-sm font-medium">Read Time</Label>
                  <Input id="read_time" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} placeholder="5 min read" className="rounded-xl" />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="A brief summary that hooks readers..." className="rounded-xl resize-none" rows={3} />
              </div>

              {/* Content with Toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5">
                          <Heading1 className="h-4 w-4" /> Heading
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => insertAtCursor("\n<h1></h1>\n")}>
                          <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertAtCursor("\n<h2></h2>\n")}>
                          <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertAtCursor("\n<h3></h3>\n")}>
                          <Heading3 className="h-4 w-4 mr-2" /> Heading 3
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5">
                          <ImagePlus className="h-4 w-4" /> Image
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Insert Image</h4>
                          
                          {/* Upload option */}
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleContentImageUpload}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="gap-2 w-full"
                            >
                              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                              {uploading ? "Uploading..." : "Upload from device"}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">Max 5MB • JPG, PNG, WebP</p>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-popover px-2 text-muted-foreground">or paste URL</span></div>
                          </div>

                          <div className="space-y-2">
                            <Input id="img-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="img-alt" className="text-xs">Alt Text (SEO)</Label>
                            <Input id="img-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Describe the image for SEO" className="h-8 text-sm" />
                          </div>
                          <Button onClick={handleInsertImage} disabled={!imageUrl} size="sm" className="w-full">Insert Image</Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5">
                          <Link2 className="h-4 w-4" /> Link
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Insert Link</h4>
                          <div className="space-y-2">
                            <Label htmlFor="link-text" className="text-xs">Link Text</Label>
                            <Input id="link-text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Click here" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="link-url" className="text-xs">URL</Label>
                            <Input id="link-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                          </div>
                          <Button onClick={handleInsertLink} disabled={!linkUrl || !linkText} size="sm" className="w-full">Insert Link</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Textarea
                  ref={contentRef}
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your article content here. Use the buttons above to insert images and links between paragraphs..."
                  className="rounded-xl resize-none font-mono text-sm"
                  rows={20}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Position your cursor where you want to insert, then use the Heading, Image, or Link buttons.
                </p>
              </div>

              {/* SEO Section */}
              <div className="space-y-4 border border-border rounded-xl p-4 sm:p-6 bg-card/50">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">SEO Settings</h3>
                  <span className="text-xs text-muted-foreground">(Auto-generated if left empty)</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description" className="text-sm font-medium">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Auto-generated from content..."
                    className="rounded-xl resize-none text-sm"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">{form.meta_description.length}/160 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords" className="text-sm font-medium">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={form.meta_keywords}
                    onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                    placeholder="Auto-generated from content..."
                    className="rounded-xl text-sm"
                  />
                </div>

                {/* SEO Preview */}
                <div className="border border-border rounded-lg p-4 bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Google Search Preview</p>
                  <p className="text-blue-600 text-base font-medium truncate">
                    {form.title || "Article Title"} | PeakFlow
                  </p>
                  <p className="text-green-700 text-xs truncate">
                    peakflow-blog.netlify.app/article/{form.slug || "your-article-slug"}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {form.meta_description || form.excerpt || "Article description will appear here..."}
                  </p>
                </div>
              </div>

              {/* Publish Toggle & Save */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Switch id="published" checked={form.published} onCheckedChange={(checked) => setForm({ ...form, published: checked })} />
                  <Label htmlFor="published" className="cursor-pointer">
                    <span className="font-medium">{form.published ? "Published" : "Draft"}</span>
                    <span className="text-xs text-muted-foreground block">
                      {form.published ? "Article will be visible to everyone" : "Only you can see this article"}
                    </span>
                  </Label>
                </div>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl px-6 gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isEditing ? "Update" : "Publish"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArticleEditor;
