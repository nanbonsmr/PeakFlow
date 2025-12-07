import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ImageIcon } from "lucide-react";

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  author: string;
  read_time: string;
  published: boolean;
}

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ArticleForm;
  onFormChange: (form: ArticleForm) => void;
  onSave: () => void;
  saving: boolean;
  isEditing: boolean;
}

const categories = [
  { value: "general", label: "General" },
  { value: "wellness", label: "Wellness" },
  { value: "travel", label: "Travel" },
  { value: "creativity", label: "Creativity" },
  { value: "growth", label: "Growth" },
  { value: "lifestyle", label: "Lifestyle" },
];

const ArticleDialog = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  saving,
  isEditing,
}: ArticleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isEditing ? "Edit Article" : "Create New Article"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image Preview */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50">
            {form.image_url ? (
              <img
                src={form.image_url}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2" />
                <p className="text-sm">Add an image URL below</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              placeholder="Enter an engaging article title"
              className="rounded-xl text-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-medium">
                Author
              </Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => onFormChange({ ...form, author: e.target.value })}
                placeholder="Author name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(value) => onFormChange({ ...form, category: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="image_url"
                value={form.image_url}
                onChange={(e) => onFormChange({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="read_time" className="text-sm font-medium">
                Read Time
              </Label>
              <Input
                id="read_time"
                value={form.read_time}
                onChange={(e) => onFormChange({ ...form, read_time: e.target.value })}
                placeholder="5 min read"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => onFormChange({ ...form, excerpt: e.target.value })}
              placeholder="A brief summary that hooks readers..."
              className="rounded-xl resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => onFormChange({ ...form, content: e.target.value })}
              placeholder="Write your article content here..."
              className="rounded-xl resize-none font-mono text-sm"
              rows={8}
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, published: checked })
                }
              />
              <Label htmlFor="published" className="cursor-pointer">
                <span className="font-medium">
                  {form.published ? "Published" : "Draft"}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {form.published
                    ? "Article will be visible to everyone"
                    : "Only you can see this article"}
                </span>
              </Label>
            </div>
            <Button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl px-6"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? "Update Article" : "Publish Article"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleDialog;
