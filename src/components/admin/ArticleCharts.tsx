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
import { FileText, TrendingUp, PieChartIcon } from "lucide-react";

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
  wellness: "hsl(280, 30%, 55%)",
  travel: "hsl(195, 50%, 50%)",
  creativity: "hsl(330, 40%, 55%)",
  growth: "hsl(50, 45%, 50%)",
  lifestyle: "hsl(140, 20%, 50%)",
  general: "hsl(0, 0%, 50%)",
};

const STATUS_COLORS = {
  published: "hsl(140, 20%, 50%)",
  draft: "hsl(0, 0%, 60%)",
};

const ArticleCharts = ({ articles }: ArticleChartsProps) => {
  // Articles over time (last 6 months)
  const timelineData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    
    // Count articles per month
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

  // Articles by category
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
        fill: CATEGORY_COLORS[name] || CATEGORY_COLORS.general,
      }))
      .sort((a, b) => b.value - a.value);
  }, [articles]);

  // Published vs Draft
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
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-accent">
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
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-accent">{payload[0].value} articles</p>
        </div>
      );
    }
    return null;
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Timeline Chart */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Articles Over Time</h3>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(140, 20%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(140, 20%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="articles"
                stroke="hsl(140, 20%, 50%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorArticles)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Pie Chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Status</h3>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
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
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="lg:col-span-3 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Articles by Category</h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
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
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                barSize={24}
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
