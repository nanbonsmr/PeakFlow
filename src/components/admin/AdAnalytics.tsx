import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from "recharts";
import { Eye, MousePointerClick, TrendingUp, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdEvent {
  id: string;
  ad_slot_name: string;
  event_type: "impression" | "click";
  created_at: string;
}

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const SLOT_COLORS = [
  "hsl(250, 90%, 65%)",
  "hsl(195, 70%, 55%)",
  "hsl(330, 60%, 60%)",
  "hsl(50, 70%, 50%)",
  "hsl(160, 60%, 50%)",
];

const AdAnalytics = () => {
  const [events, setEvents] = useState<AdEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data } = await (supabase.from as any)("ad_events")
        .select("id, ad_slot_name, event_type, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(10000);
      if (!cancelled) {
        setEvents((data as AdEvent[]) || []);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [days]);

  const totals = useMemo(() => {
    const imp = events.filter(e => e.event_type === "impression").length;
    const clk = events.filter(e => e.event_type === "click").length;
    const ctr = imp > 0 ? (clk / imp) * 100 : 0;
    return { imp, clk, ctr };
  }, [events]);

  const timeline = useMemo(() => {
    const buckets: Record<string, { date: string; impressions: number; clicks: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key.slice(5), impressions: 0, clicks: 0 };
    }
    events.forEach(e => {
      const key = e.created_at.slice(0, 10);
      if (buckets[key]) {
        if (e.event_type === "impression") buckets[key].impressions++;
        else buckets[key].clicks++;
      }
    });
    return Object.values(buckets);
  }, [events, days]);

  const bySlot = useMemo(() => {
    const map: Record<string, { name: string; impressions: number; clicks: number; ctr: number }> = {};
    events.forEach(e => {
      const name = e.ad_slot_name.replace(/_/g, " ");
      if (!map[name]) map[name] = { name, impressions: 0, clicks: 0, ctr: 0 };
      if (e.event_type === "impression") map[name].impressions++;
      else map[name].clicks++;
    });
    return Object.values(map)
      .map(s => ({ ...s, ctr: s.impressions > 0 ? +(s.clicks / s.impressions * 100).toFixed(2) : 0 }))
      .sort((a, b) => b.impressions - a.impressions);
  }, [events]);

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-dashboard-card border-dashboard-border rounded-2xl animate-fade-in">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-dashboard-accent" />
            Ad Performance Analytics
          </CardTitle>
          <CardDescription>Impressions, clicks and CTR across your ad slots</CardDescription>
        </div>
        <div className="flex gap-1 bg-dashboard-bg rounded-xl p-1">
          {RANGES.map(r => (
            <Button
              key={r.label}
              variant="ghost"
              size="sm"
              onClick={() => setDays(r.days)}
              className={cn(
                "h-7 px-3 rounded-lg text-xs",
                days === r.days && "bg-dashboard-accent text-white hover:bg-dashboard-accent/90 hover:text-white"
              )}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-dashboard-border p-4 bg-dashboard-bg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Eye className="h-4 w-4" /> Impressions
            </div>
            <p className="text-2xl font-bold">{totals.imp.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-dashboard-border p-4 bg-dashboard-bg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <MousePointerClick className="h-4 w-4" /> Clicks
            </div>
            <p className="text-2xl font-bold">{totals.clk.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-dashboard-border p-4 bg-dashboard-bg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <TrendingUp className="h-4 w-4" /> CTR
            </div>
            <p className="text-2xl font-bold">{totals.ctr.toFixed(2)}%</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-dashboard-accent" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No ad activity recorded in this range yet. Data will appear once visitors view your articles.
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(330, 60%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(330, 60%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dashboard-border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="impressions" name="Impressions" stroke="hsl(250, 90%, 65%)" strokeWidth={2} fill="url(#impGrad)" />
                  <Area type="monotone" dataKey="clicks" name="Clicks" stroke="hsl(330, 60%, 60%)" strokeWidth={2} fill="url(#clkGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Per slot breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Performance by Slot</h4>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySlot} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dashboard-border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={120} className="capitalize" />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="impressions" name="Impressions" radius={[0, 6, 6, 0]} barSize={14}>
                      {bySlot.map((_, i) => <Cell key={i} fill={SLOT_COLORS[i % SLOT_COLORS.length]} />)}
                    </Bar>
                    <Bar dataKey="clicks" name="Clicks" radius={[0, 6, 6, 0]} barSize={14} fill="hsl(330, 60%, 60%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-dashboard-border">
                      <th className="py-2 font-medium">Slot</th>
                      <th className="py-2 font-medium text-right">Impressions</th>
                      <th className="py-2 font-medium text-right">Clicks</th>
                      <th className="py-2 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bySlot.map(s => (
                      <tr key={s.name} className="border-b border-dashboard-border/50">
                        <td className="py-2 capitalize font-medium">{s.name}</td>
                        <td className="py-2 text-right">{s.impressions.toLocaleString()}</td>
                        <td className="py-2 text-right">{s.clicks.toLocaleString()}</td>
                        <td className="py-2 text-right">{s.ctr.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdAnalytics;
