import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Eye, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  author: string;
  read_time: string | null;
  published: boolean;
  created_at: string;
  image_url: string | null;
}

interface ArticleRowProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (article: Article) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    wellness: "bg-[hsl(var(--tag-wellness))]",
    travel: "bg-[hsl(var(--tag-travel))]",
    creativity: "bg-[hsl(var(--tag-creativity))]",
    growth: "bg-[hsl(var(--tag-growth))]",
    lifestyle: "bg-[hsl(var(--tag-lifestyle))]",
    general: "bg-muted",
  };
  return colors[category] || colors.general;
};

const ArticleRow = ({ article, onEdit, onDelete, onTogglePublish }: ArticleRowProps) => {
  return (
    <TableRow className="group hover:bg-muted/30 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-4">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-12 h-12 rounded-lg object-cover ring-1 ring-border/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-1 max-w-[300px]">
            <p className="font-medium truncate">{article.title}</p>
            {article.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium text-primary capitalize",
            getCategoryColor(article.category)
          )}
        >
          {article.category}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          {article.author}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {article.read_time || "5 min"}
        </div>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onTogglePublish(article)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
            article.published
              ? "bg-accent text-accent-foreground hover:bg-accent/80"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {article.published ? "Published" : "Draft"}
        </button>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(article.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(article)}
            className="rounded-lg hover:bg-accent/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(article.id)}
            className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ArticleRow;
