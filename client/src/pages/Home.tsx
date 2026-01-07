import Layout from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { useDashboardStats, useIntelligenceSuggestions } from "@/hooks/use-dashboard";
import { 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  AlertTriangle,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSyncOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for the chart since we don't have a specific endpoint for history yet
const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export default function Home() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: suggestions, isLoading: isLoadingSuggestions } = useIntelligenceSuggestions();
  const syncMutation = useSyncOrders();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your seller performance</p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()} 
          disabled={syncMutation.isPending}
          className="shadow-lg shadow-primary/20 hover:shadow-primary/30"
        >
          {syncMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RotateCcw className="w-4 h-4 mr-2" />
          )}
          Sync with Flipkart
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={ShoppingCart} 
          trend="12%" 
          trendUp={true}
        />
        <StatsCard 
          title="Pending Dispatch" 
          value={stats?.pendingDispatch || 0} 
          icon={Package} 
          className="border-orange-200 bg-orange-50/30"
        />
        <StatsCard 
          title="Total Sales" 
          value={`₹${stats?.totalSales.toLocaleString() || 0}`} 
          icon={IndianRupee} 
          trend="8%" 
          trendUp={true}
        />
        <StatsCard 
          title="Low Stock Items" 
          value={stats?.lowStockCount || 0} 
          icon={AlertTriangle} 
          className={stats?.lowStockCount ? "border-red-200 bg-red-50/30" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="col-span-1 lg:col-span-2 glass-panel border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="glass-panel border-none shadow-md bg-gradient-to-br from-white to-indigo-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions?.length ? (
              <div className="space-y-4">
                {suggestions.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white border border-indigo-100 shadow-sm text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-indigo-700 capitalize">{item.type} Alert</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        item.priority === 'high' ? 'bg-red-100 text-red-600' : 
                        item.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{item.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No urgent insights at the moment. Good job!</p>
              </div>
            )}
            <Button variant="ghost" className="w-full mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              Ask AI Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
import { RotateCcw } from "lucide-react";
