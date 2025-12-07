import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
}

interface UserRowProps {
  userRole: UserRole;
  currentUserId: string | undefined;
  onUpdateRole: (userId: string, newRole: "admin" | "user") => void;
}

const UserRow = ({ userRole, currentUserId, onUpdateRole }: UserRowProps) => {
  const isCurrentUser = userRole.user_id === currentUserId;

  return (
    <TableRow className="group hover:bg-muted/30 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              userRole.role === "admin" ? "bg-accent/20" : "bg-muted"
            )}
          >
            {userRole.role === "admin" ? (
              <Shield className="h-5 w-5 text-accent" />
            ) : (
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <p className="font-mono text-sm truncate max-w-[200px]">
              {userRole.user_id.slice(0, 8)}...{userRole.user_id.slice(-4)}
            </p>
            {isCurrentUser && (
              <span className="text-xs text-accent font-medium">You</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            userRole.role === "admin"
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {userRole.role === "admin" && <Shield className="h-3 w-3" />}
          {userRole.role.charAt(0).toUpperCase() + userRole.role.slice(1)}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(userRole.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </TableCell>
      <TableCell className="text-right">
        <Select
          value={userRole.role}
          onValueChange={(value: "admin" | "user") =>
            onUpdateRole(userRole.user_id, value)
          }
          disabled={isCurrentUser}
        >
          <SelectTrigger
            className={cn(
              "w-[110px] rounded-xl",
              isCurrentUser && "opacity-50 cursor-not-allowed"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">
              <span className="flex items-center gap-2">
                <UserIcon className="h-3.5 w-3.5" />
                User
              </span>
            </SelectItem>
            <SelectItem value="admin">
              <span className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
