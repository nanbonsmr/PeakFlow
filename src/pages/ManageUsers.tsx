import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { Users, Shield, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserRow from "@/components/admin/UserRow";
import { cn } from "@/lib/utils";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
}

const ManageUsers = () => {
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [users, setUsers] = useState<UserRole[]>([]);
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
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching users", description: error.message, variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setLoadingData(false);
  };

  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "user") => {
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
    if (error) {
      toast({ title: "Error updating user role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User role updated successfully" });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((userRole) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return userRole.user_id.toLowerCase().includes(query) || userRole.role.toLowerCase().includes(query);
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  if (loading || adminLoading || loadingData) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading users...</p>
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
            <div className="animate-fade-in">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground mt-1 text-sm">Manage user roles and permissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-dashboard-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-dashboard-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminCount}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userCount}</p>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by ID or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-dashboard-card border-dashboard-border"
              />
            </div>

            {/* Table */}
            <div className="bg-dashboard-card rounded-2xl border border-dashboard-border overflow-hidden shadow-sm overflow-x-auto animate-fade-in">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-dashboard-bg hover:bg-dashboard-bg border-dashboard-border">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="text-right font-semibold">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Users className="h-12 w-12 opacity-50" />
                          <p className="font-medium">{searchQuery ? "No users match your search" : "No users yet"}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userRole) => (
                      <UserRow key={userRole.id} userRole={userRole} currentUserId={user?.id} onUpdateRole={handleUpdateUserRole} />
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

export default ManageUsers;
