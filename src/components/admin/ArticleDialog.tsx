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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, ImageIcon, Link2, ImagePlus, Heading1, Heading2, Heading3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef } from "react";

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
  { value: "lifestyle", label: "Lifestyle" },
  { value: "tech", label: "Tech Tips" },
  { value: "growth", label: "Personal Growth" },
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
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = form.content.substring(0, start);
    const after = form.content.substring(end);
    
    const newContent = before + text + after;
    onFormChange({ ...form, content: newContent });
    
    // Restore cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      const imgTag = `\n<img src="${imageUrl}" alt="${imageAlt || 'Image'}" />\n`;
      insertAtCursor(imgTag);
      setImageUrl("");
      setImageAlt("");
      setImagePopoverOpen(false);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      const linkTag = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      insertAtCursor(linkTag);
      setLinkUrl("");
      setLinkText("");
      setLinkPopoverOpen(false);
    }
  };
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
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <Heading1 className="h-4 w-4" />
                      Heading
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => insertAtCursor("\n<h1></h1>\n")}>
                      <Heading1 className="h-4 w-4 mr-2" />
                      Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertAtCursor("\n<h2></h2>\n")}>
                      <Heading2 className="h-4 w-4 mr-2" />
                      Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertAtCursor("\n<h3></h3>\n")}>
                      <Heading3 className="h-4 w-4 mr-2" />
                      Heading 3
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <ImagePlus className="h-4 w-4" />
                      Image
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Insert Image</h4>
                      <div className="space-y-2">
                        <Label htmlFor="img-url" className="text-xs">Image URL</Label>
                        <Input
                          id="img-url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="img-alt" className="text-xs">Alt Text</Label>
                        <Input
                          id="img-alt"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Describe the image"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button 
                        onClick={handleInsertImage} 
                        disabled={!imageUrl}
                        size="sm"
                        className="w-full"
                      >
                        Insert Image
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <Link2 className="h-4 w-4" />
                      Link
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Insert Link</h4>
                      <div className="space-y-2">
                        <Label htmlFor="link-text" className="text-xs">Link Text</Label>
                        <Input
                          id="link-text"
                          value={linkText}
                          onChange={(e) => setLinkText(e.target.value)}
                          placeholder="Click here"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link-url" className="text-xs">URL</Label>
                        <Input
                          id="link-url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button 
                        onClick={handleInsertLink} 
                        disabled={!linkUrl || !linkText}
                        size="sm"
                        className="w-full"
                      >
                        Insert Link
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Textarea
              ref={contentRef}
              id="content"
              value={form.content}
              onChange={(e) => onFormChange({ ...form, content: e.target.value })}
              placeholder="Write your article content here. Use the buttons above to insert images and links between paragraphs..."
              className="rounded-xl resize-none font-mono text-sm"
              rows={10}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Position your cursor where you want to insert, then use the Image or Link buttons.
            </p>
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
