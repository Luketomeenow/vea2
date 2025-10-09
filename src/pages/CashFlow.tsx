import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CashFlow = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("3months");

  const cashFlowData = [
    { month: 'Jan', income: 45000, expenses: 32000, netFlow: 13000, projected: false },
    { month: 'Feb', income: 52000, expenses: 35000, netFlow: 17000, projected: false },
    { month: 'Mar', income: 48000, expenses: 38000, netFlow: 10000, projected: false },
    { month: 'Apr', income: 55000, expenses: 33000, netFlow: 22000, projected: true },
    { month: 'May', income: 58000, expenses: 36000, netFlow: 22000, projected: true },
    { month: 'Jun', income: 62000, expenses: 38000, netFlow: 24000, projected: true },
  ];

  const currentCashPosition = 85000;
  const projectedCashEnd = 142000;
  const cashBurnRate = 35000;
  const runwayMonths = Math.floor(currentCashPosition / cashBurnRate);

  const upcomingInflows = [
    { client: "TechCorp Solutions", amount: 25000, date: "2024-01-20", confidence: "high" },
    { client: "Innovate Industries", amount: 18000, date: "2024-01-25", confidence: "medium" },
    { client: "StartupCo", amount: 12000, date: "2024-02-01", confidence: "high" },
    { client: "Digital Dynamics", amount: 8000, date: "2024-02-05", confidence: "low" }
  ];

  const upcomingOutflows = [
    { category: "Payroll", amount: 28000, date: "2024-01-30", type: "fixed" },
    { category: "Office Rent", amount: 4500, date: "2024-02-01", type: "fixed" },
    { category: "Software Licenses", amount: 2800, date: "2024-02-03", type: "variable" },
    { category: "Marketing Budget", amount: 5000, date: "2024-02-05", type: "variable" }
  ];

  const scenarios = [
    { name: "Conservative", probability: "90%", endCash: 128000, color: "text-red-500" },
    { name: "Realistic", probability: "70%", endCash: 142000, color: "text-yellow-500" },
    { name: "Optimistic", probability: "30%", endCash: 165000, color: "text-green-500" }
  ];

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "fixed" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cash Flow Forecasting</h1>
              <p className="text-white/70">Predict and manage your business cash flow</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Current Cash Position</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${currentCashPosition.toLocaleString()}</div>
              <p className="text-xs text-white/70">As of today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Projected Cash (3M)</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${projectedCashEnd.toLocaleString()}</div>
              <p className="text-xs text-green-400">+{((projectedCashEnd - currentCashPosition) / currentCashPosition * 100).toFixed(1)}% growth</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Monthly Burn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${cashBurnRate.toLocaleString()}</div>
              <p className="text-xs text-white/70">Average expenses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Cash Runway</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{runwayMonths} months</div>
              <p className="text-xs text-white/70">At current burn rate</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Cash Flow Projection</CardTitle>
            <CardDescription className="text-white/70">Historical data and 3-month forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Income"
                    strokeDasharray="0"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Expenses"
                    strokeDasharray="0"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netFlow" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Net Cash Flow"
                    strokeDasharray="0"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Scenario Analysis</CardTitle>
              <CardDescription className="text-white/70">3-month cash position forecasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenarios.map((scenario, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-white">{scenario.name}</p>
                    <p className="text-sm text-white/70">{scenario.probability} confidence</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${scenario.color}`}>
                      ${scenario.endCash.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <PlusCircle className="w-5 h-5 mr-2 text-green-500" />
                Expected Inflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingInflows.map((inflow, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-white">{inflow.client}</p>
                    <p className="text-sm text-white/70">{new Date(inflow.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">+${inflow.amount.toLocaleString()}</p>
                    <Badge className={getConfidenceColor(inflow.confidence)}>{inflow.confidence}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MinusCircle className="w-5 h-5 mr-2 text-red-500" />
                Planned Outflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingOutflows.map((outflow, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-white">{outflow.category}</p>
                    <p className="text-sm text-white/70">{new Date(outflow.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-400">-${outflow.amount.toLocaleString()}</p>
                    <Badge className={getTypeColor(outflow.type)}>{outflow.type}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashFlow;


