import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const taskData = [
  { day: "Mon", completed: 12, pending: 5 },
  { day: "Tue", completed: 8, pending: 3 },
  { day: "Wed", completed: 15, pending: 7 },
  { day: "Thu", completed: 10, pending: 4 },
  { day: "Fri", completed: 18, pending: 2 },
  { day: "Sat", completed: 6, pending: 1 },
  { day: "Sun", completed: 4, pending: 0 },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--destructive))",
  },
};

export function TaskCompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Task Completion</CardTitle>
        <CardDescription className="text-white/70">Daily task completion vs pending</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}




