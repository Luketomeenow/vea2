import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getKPIData } from "@/services/dashboardService";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

function KPICard({ title, value, change, changeType, icon, loading }: KPICardProps) {
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
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className={`flex items-center text-xs ${changeColor} mt-1`}>
              {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
              {change}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function KPICards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    ytdRevenue: 0,
    revenueChange: 0,
    activeProjects: 0,
    projectsChange: 0,
    newCustomers: 0,
    customersChange: 0,
    openInvoices: 0,
    invoicesChange: 0,
  });

  useEffect(() => {
    const fetchKPIData = async () => {
      if (!user?.id) return;

      setLoading(true);
      const data = await getKPIData(user.id);
      
      if (data) {
        setKpiData(data);
      }
      setLoading(false);
    };

    fetchKPIData();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number, suffix: string = '%') => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${suffix}`;
  };

  const kpis = [
    {
      title: "YTD Revenue",
      value: formatCurrency(kpiData.ytdRevenue),
      change: `${formatChange(kpiData.revenueChange)} from last month`,
      changeType: kpiData.revenueChange >= 0 ? 'positive' : 'negative' as const,
      icon: <DollarSign className="w-4 h-4 text-primary" />
    },
    {
      title: "Active Projects",
      value: kpiData.activeProjects.toString(),
      change: `${formatChange(kpiData.projectsChange, '')} this week`,
      changeType: kpiData.projectsChange >= 0 ? 'positive' : 'negative' as const,
      icon: <Target className="w-4 h-4 text-primary" />
    },
    {
      title: "Total Customers",
      value: kpiData.newCustomers.toString(),
      change: `${formatChange(kpiData.customersChange)} new this month`,
      changeType: kpiData.customersChange >= 0 ? 'positive' : 'neutral' as const,
      icon: <Users className="w-4 h-4 text-primary" />
    },
    {
      title: "Open Invoices",
      value: formatCurrency(kpiData.openInvoices),
      change: `${formatChange(kpiData.invoicesChange)} from last week`,
      changeType: kpiData.invoicesChange <= 0 ? 'positive' : 'negative' as const,
      icon: <Calendar className="w-4 h-4 text-primary" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} loading={loading} />
      ))}
    </div>
  );
}




