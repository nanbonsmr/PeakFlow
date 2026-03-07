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
import { Mail, Download, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import SubscriberRow from "@/components/admin/SubscriberRow";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const ManageSubscribers = () => {
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
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
    if (isAdmin) fetchSubscribers();
  }, [isAdmin]);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching subscribers", description: error.message, variant: "destructive" });
    } else {
      setSubscribers(data || []);
    }
    setLoadingData(false);
  };

  const handleToggleSubscriberActive = async (subscriber: Subscriber) => {
    const { error } = await supabase.from("newsletter_subscribers").update({ is_active: !subscriber.is_active }).eq("id", subscriber.id);
    if (error) {
      toast({ title: "Error updating subscriber", description: error.message, variant: "destructive" });
    } else {
      fetchSubscribers();
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting subscriber", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subscriber removed successfully" });
      fetchSubscribers();
    }
  };

  const handleExportSubscribers = () => {
    if (subscribers.length === 0) {
      toast({ title: "No subscribers", description: "There are no subscribers to export.", variant: "destructive" });
      return;
    }
    const headers = ["Email", "Status", "Subscribed At"];
    const csvContent = [
      headers.join(","),
      ...subscribers.map((s) => [s.email, s.is_active ? "Active" : "Inactive", new Date(s.subscribed_at).toISOString()].join(",")),
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

  const filteredSubscribers = subscribers.filter((subscriber) => {
    if (!searchQuery) return true;
    return subscriber.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeCount = subscribers.filter((s) => s.is_active).length;
  const inactiveCount = subscribers.filter((s) => !s.is_active).length;

  if (loading || adminLoading || loadingData) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading subscribers...</p>
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Subscribers</h1>
                <p className="text-muted-foreground mt-1 text-sm">Manage your newsletter subscribers</p>
              </div>
              <Button
                onClick={handleExportSubscribers}
                variant="outline"
                className="rounded-xl w-full sm:w-auto border-dashboard-border hover:bg-dashboard-bg"
                disabled={subscribers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-dashboard-accent/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-dashboard-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subscribers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inactiveCount}</p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-dashboard-card border-dashboard-border"
              />
            </div>

            {/* Table */}
            <div className="bg-dashboard-card rounded-2xl border border-dashboard-border overflow-hidden shadow-sm overflow-x-auto animate-fade-in">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="bg-dashboard-bg hover:bg-dashboard-bg border-dashboard-border">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Subscribed</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Mail className="h-12 w-12 opacity-50" />
                          <p className="font-medium">{searchQuery ? "No subscribers match your search" : "No subscribers yet"}</p>
                          <p className="text-sm">{searchQuery ? "Try a different search term" : "Subscribers will appear here when they sign up"}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <SubscriberRow key={subscriber.id} subscriber={subscriber} onToggleActive={handleToggleSubscriberActive} onDelete={handleDeleteSubscriber} />
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

export default ManageSubscribers;
