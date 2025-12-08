import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, Layers } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  published: boolean;
  created_at: string;
}

interface ArticleChartsProps {
  articles: Article[];
}

const CATEGORY_COLORS: Record<string, string> = {
  wellness: "hsl(280, 60%, 60%)",
  travel: "hsl(195, 70%, 55%)",
  creativity: "hsl(330, 60%, 60%)",
  growth: "hsl(50, 70%, 50%)",
  lifestyle: "hsl(160, 60%, 50%)",
  general: "hsl(220, 15%, 55%)",
  "tech tips": "hsl(210, 90%, 55%)",
  "personal growth": "hsl(140, 60%, 50%)",
};

const STATUS_COLORS = {
  published: "hsl(160, 70%, 45%)",
  draft: "hsl(220, 15%, 70%)",
};

const ArticleCharts = ({ articles }: ArticleChartsProps) => {
  const timelineData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    
    articles.forEach((article) => {
      const date = new Date(article.created_at);
      const key = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (months[key] !== undefined) {
        months[key]++;
      }
    });
    
    return Object.entries(months).map(([month, count]) => ({
      month,
      articles: count,
    }));
  }, [articles]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    articles.forEach((article) => {
      const cat = article.category || "general";
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    return Object.entries(categories)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: CATEGORY_COLORS[name.toLowerCase()] || CATEGORY_COLORS.general,
      }))
      .sort((a, b) => b.value - a.value);
  }, [articles]);

  const statusData = useMemo(() => {
    const published = articles.filter((a) => a.published).length;
    const draft = articles.filter((a) => !a.published).length;
    
    return [
      { name: "Published", value: published, fill: STATUS_COLORS.published },
      { name: "Draft", value: draft, fill: STATUS_COLORS.draft },
    ];
  }, [articles]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl px-4 py-3 shadow-soft-lg">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-sm text-dashboard-accent font-medium">
            {payload[0].value} articles
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl px-4 py-3 shadow-soft-lg">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-sm text-dashboard-accent font-medium">{payload[0].value} articles</p>
        </div>
      );
    }
    return null;
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline Chart */}
      <div className="lg:col-span-2 bg-dashboard-card rounded-2xl border border-dashboard-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-dashboard-accent/10">
            <TrendingUp className="h-5 w-5 text-dashboard-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Content Growth</h3>
            <p className="text-xs text-muted-foreground">Articles over the last 6 months</p>
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dashboard-border))" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="articles"
                stroke="hsl(250, 90%, 65%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorArticles)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Pie Chart */}
      <div className="bg-dashboard-card rounded-2xl border border-dashboard-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-dashboard-success/10">
            <PieChartIcon className="h-5 w-5 text-dashboard-success" />
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className="text-xs text-muted-foreground">Published vs Draft</p>
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="lg:col-span-3 bg-dashboard-card rounded-2xl border border-dashboard-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-dashboard-warning/10">
            <Layers className="h-5 w-5 text-dashboard-warning" />
          </div>
          <div>
            <h3 className="font-semibold">Categories</h3>
            <p className="text-xs text-muted-foreground">Distribution by category</p>
          </div>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dashboard-border))" horizontal={false} />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                barSize={28}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ArticleCharts;