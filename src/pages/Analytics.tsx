import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { RevenueChart } from "@/components/dashboard/widgets/RevenueChart";
import { TaskCompletionChart } from "@/components/dashboard/widgets/TaskCompletionChart";

const Analytics = () => {
  const metrics = [
    { title: "Total Revenue", value: "$124,750", change: "+12%", trend: "up", period: "vs last month", icon: DollarSign, color: "text-green-600" },
    { title: "Customer Growth", value: "23", change: "+15%", trend: "up", period: "this month", icon: Users, color: "text-blue-600" },
    { title: "Conversion Rate", value: "3.2%", change: "-0.5%", trend: "down", period: "vs last month", icon: BarChart3, color: "text-red-600" },
    { title: "Avg Deal Size", value: "$5,420", change: "+8%", trend: "up", period: "vs last quarter", icon: TrendingUp, color: "text-green-600" },
  ];

  const reports = [
    { name: "Monthly Revenue Report", date: "Dec 2024", status: "Ready" },
    { name: "Customer Analysis", date: "Dec 2024", status: "Processing" },
    { name: "Sales Pipeline Review", date: "Nov 2024", status: "Ready" },
    { name: "Marketing ROI Report", date: "Nov 2024", status: "Ready" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-white/70">Business insights and performance metrics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-muted rounded-lg">
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <Badge variant={metric.trend === "up" ? "default" : "destructive"}>
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                  <p className="text-sm text-white/70">{metric.title}</p>
                  <p className="text-xs text-white/50 mt-1">{metric.period}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <TaskCompletionChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-5 h-5 mr-2" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "ABC Corporation", revenue: "$45,200", deals: 12 },
                  { name: "Tech Solutions Inc", revenue: "$32,800", deals: 8 },
                  { name: "Digital Dynamics", revenue: "$28,500", deals: 6 },
                  { name: "Innovation Labs", revenue: "$22,100", deals: 5 }
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.deals} deals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{customer.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <BarChart3 className="w-5 h-5 mr-2" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                    <Badge variant={report.status === "Ready" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;




