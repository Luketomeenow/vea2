import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function KPICard({ title, value, change, changeType, icon }: KPICardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }[changeType];

  const TrendIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : null;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-medium transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className={`flex items-center text-xs ${changeColor} mt-1`}>
          {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards() {
  const kpis = [
    {
      title: "YTD Revenue",
      value: "$124,750",
      change: "+12% from last month",
      changeType: 'positive' as const,
      icon: <DollarSign className="w-4 h-4 text-primary" />
    },
    {
      title: "Active Projects",
      value: "8",
      change: "+2 this week",
      changeType: 'positive' as const,
      icon: <Target className="w-4 h-4 text-primary" />
    },
    {
      title: "New Customers",
      value: "23",
      change: "+15% this month",
      changeType: 'positive' as const,
      icon: <Users className="w-4 h-4 text-primary" />
    },
    {
      title: "Open Invoices",
      value: "$8,450",
      change: "-3% from last week",
      changeType: 'negative' as const,
      icon: <Calendar className="w-4 h-4 text-primary" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}




