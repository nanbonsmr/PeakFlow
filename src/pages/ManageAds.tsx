import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSwipe } from "@/hooks/useSwipe";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import DashboardTopBar from "@/components/admin/DashboardTopBar";
import SwipeIndicator from "@/components/admin/SwipeIndicator";
import { cn } from "@/lib/utils";
import { Loader2, MonitorPlay, Plus, Trash2, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdSetting {
  id: string;
  ad_slot_name: string;
  ad_client: string;
  ad_slot: string;
  ad_format: string;
  is_enabled: boolean;
  custom_style: string | null;
}

const ManageAds = () => {
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [ads, setAds] = useState<AdSetting[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [globalAdClient, setGlobalAdClient] = useState("");

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
    if (isAdmin) fetchAds();
  }, [isAdmin]);

  const fetchAds = async () => {
    const { data, error } = await supabase.from("ad_settings").select("*").order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Error fetching ads", description: error.message, variant: "destructive" });
    } else {
      const adData = (data || []) as AdSetting[];
      setAds(adData);
      if (adData.length > 0 && adData[0].ad_client) {
        setGlobalAdClient(adData[0].ad_client);
      }
    }
    setLoadingData(false);
  };

  const handleUpdateAd = async (ad: AdSetting) => {
    setSaving(ad.id);
    const { error } = await supabase
      .from("ad_settings")
      .update({
        ad_client: globalAdClient || ad.ad_client,
        ad_slot: ad.ad_slot,
        ad_format: ad.ad_format,
        is_enabled: ad.is_enabled,
      })
      .eq("id", ad.id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ad slot saved successfully" });
      fetchAds();
    }
    setSaving(null);
  };

  const handleApplyClientToAll = async () => {
    if (!globalAdClient.trim()) return;
    const { error } = await supabase
      .from("ad_settings")
      .update({ ad_client: globalAdClient })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Publisher ID applied to all slots" });
      fetchAds();
    }
  };

  const handleAddSlot = async () => {
    const name = `custom_slot_${Date.now()}`;
    const { error } = await supabase
      .from("ad_settings")
      .insert({ ad_slot_name: name, ad_client: globalAdClient, ad_format: "auto" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "New ad slot added" });
      fetchAds();
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase.from("ad_settings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ad slot deleted" });
      fetchAds();
    }
  };

  const updateAdLocal = (id: string, field: keyof AdSetting, value: string | boolean) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const enabledCount = ads.filter(a => a.is_enabled).length;

  if (loading || adminLoading || loadingData) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center shadow-glow">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading ad settings...</p>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Ad Management</h1>
                <p className="text-muted-foreground mt-1 text-sm">Configure Google AdSense ads for your blog</p>
              </div>
              <Button onClick={handleAddSlot} className="rounded-xl shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto bg-dashboard-accent hover:bg-dashboard-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-dashboard-accent/10 flex items-center justify-center">
                  <MonitorPlay className="h-6 w-6 text-dashboard-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ads.length}</p>
                  <p className="text-sm text-muted-foreground">Total Slots</p>
                </div>
              </div>
              <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MonitorPlay className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enabledCount}</p>
                  <p className="text-sm text-muted-foreground">Active Slots</p>
                </div>
              </div>
            </div>

            {/* Global Publisher ID */}
            <Card className="bg-dashboard-card border-dashboard-border rounded-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Google AdSense Publisher ID</CardTitle>
                <CardDescription>Your AdSense publisher ID (ca-pub-XXXXX) will be applied to all ad slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={globalAdClient}
                    onChange={e => setGlobalAdClient(e.target.value)}
                    className="flex-1 rounded-xl bg-dashboard-bg border-dashboard-border"
                  />
                  <Button onClick={handleApplyClientToAll} variant="outline" className="rounded-xl">
                    Apply to All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ad Slots */}
            <div className="space-y-4 animate-fade-in">
              {ads.map((ad) => (
                <Card key={ad.id} className="bg-dashboard-card border-dashboard-border rounded-2xl">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-3 w-3 rounded-full",
                          ad.is_enabled ? "bg-green-500" : "bg-muted-foreground/30"
                        )} />
                        <h3 className="font-semibold capitalize">
                          {ad.ad_slot_name.replace(/_/g, " ")}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ad.is_enabled}
                          onCheckedChange={(checked) => updateAdLocal(ad.id, "is_enabled", checked)}
                        />
                        {!["before_content", "after_content"].includes(ad.ad_slot_name) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(ad.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Ad Slot ID</Label>
                        <Input
                          placeholder="1234567890"
                          value={ad.ad_slot}
                          onChange={e => updateAdLocal(ad.id, "ad_slot", e.target.value)}
                          className="rounded-xl bg-dashboard-bg border-dashboard-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Ad Format</Label>
                        <Input
                          placeholder="auto"
                          value={ad.ad_format}
                          onChange={e => updateAdLocal(ad.id, "ad_format", e.target.value)}
                          className="rounded-xl bg-dashboard-bg border-dashboard-border"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUpdateAd(ad)}
                      disabled={saving === ad.id}
                      className="rounded-xl bg-dashboard-accent hover:bg-dashboard-accent/90"
                    >
                      {saving === ad.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <Card className="bg-dashboard-card border-dashboard-border rounded-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1. Sign up for <a href="https://www.google.com/adsense/" target="_blank" rel="noopener noreferrer" className="text-dashboard-accent underline">Google AdSense</a> and get approved.</p>
                <p>2. Enter your Publisher ID (ca-pub-XXXXX) above and click "Apply to All".</p>
                <p>3. Create ad units in AdSense and copy the Slot IDs into each slot above.</p>
                <p>4. Enable the slots you want to show — ads will appear before and after article content.</p>
                <p>5. Make sure the AdSense script is loaded on your site (added automatically via the head tag).</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageAds;
