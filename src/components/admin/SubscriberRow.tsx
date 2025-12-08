import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, CheckCircle, XCircle } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

interface SubscriberRowProps {
  subscriber: Subscriber;
  onToggleActive: (subscriber: Subscriber) => void;
  onDelete: (id: string) => void;
}

const SubscriberRow = ({ subscriber, onToggleActive, onDelete }: SubscriberRowProps) => {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center">
            <Mail className="h-4 w-4 text-accent" />
          </div>
          <span className="font-medium">{subscriber.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={subscriber.is_active ? "default" : "secondary"}
          className={`rounded-full ${subscriber.is_active ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground"}`}
        >
          {subscriber.is_active ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
          ) : (
            <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
          )}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(subscriber)}
            className="rounded-lg"
          >
            {subscriber.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(subscriber.id)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubscriberRow;