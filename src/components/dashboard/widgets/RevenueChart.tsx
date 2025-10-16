import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRevenueData } from "@/services/dashboardService";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--muted-foreground))",
  },
};

export function RevenueChart() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; target: number }>>([]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!user?.id) return;

      setLoading(true);
      const data = await getRevenueData(user.id);
      setRevenueData(data);
      setLoading(false);
    };

    fetchRevenueData();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Revenue Trends</CardTitle>
        <CardDescription className="text-white/70">Monthly revenue vs targets (Last 6 months)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading revenue data...</span>
            </div>
          </div>
        ) : revenueData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-revenue)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-revenue)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="var(--color-target)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "var(--color-target)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No revenue data available. Add some cash flow entries to see your revenue trends.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




