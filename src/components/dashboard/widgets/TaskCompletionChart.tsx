import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getTaskStats } from "@/services/dashboardService";

const chartConfig = {
  todo: {
    label: "To Do",
    color: "#94A3B8",
  },
  in_progress: {
    label: "In Progress",
    color: "#3B82F6",
  },
  review: {
    label: "Review",
    color: "#F59E0B",
  },
  done: {
    label: "Done",
    color: "#10B981",
  },
  blocked: {
    label: "Blocked",
    color: "#EF4444",
  },
};

const COLORS: Record<string, string> = {
  todo: '#94A3B8',
  in_progress: '#3B82F6',
  review: '#F59E0B',
  done: '#10B981',
  blocked: '#EF4444',
};

export function TaskCompletionChart() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<Array<{ name: string; value: number; status: string }>>([]);

  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!user?.id) return;

      setLoading(true);
      const data = await getTaskStats(user.id);
      
      // Transform data for pie chart
      const chartData = data.map(item => ({
        name: chartConfig[item.status as keyof typeof chartConfig]?.label || item.status,
        value: item.count,
        status: item.status,
      }));
      
      setTaskData(chartData);
      setLoading(false);
    };

    fetchTaskStats();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Task Distribution</CardTitle>
        <CardDescription className="text-white/70">Tasks by status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading task data...</span>
            </div>
          </div>
        ) : taskData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#94A3B8'} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No tasks available. Create some tasks to see the distribution.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




