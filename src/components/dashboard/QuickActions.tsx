import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quickActions = [
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Start a new project',
    icon: <Target className="h-4 w-4" />,
    variant: 'default' as const,
    category: 'create'
  },
  {
    id: 'add-customer',
    title: 'Add Customer',
    description: 'Add new customer',
    icon: <Users className="h-4 w-4" />,
    variant: 'outline' as const,
    category: 'create'
  },
  {
    id: 'create-invoice',
    title: 'Create Invoice',
    description: 'Generate new invoice',
    icon: <FileText className="h-4 w-4" />,
    variant: 'outline' as const,
    category: 'financial'
  },
  {
    id: 'schedule-meeting',
    title: 'Schedule Meeting',
    description: 'Book a meeting',
    icon: <Calendar className="h-4 w-4" />,
    variant: 'outline' as const,
    category: 'productivity'
  },
];

const insights = [
  {
    id: '1',
    title: 'Revenue Opportunity',
    description: 'Follow up with 3 pending proposals',
    value: '$15,000',
    type: 'revenue',
    urgency: 'high'
  },
  {
    id: '2',
    title: 'Project Risk',
    description: '2 projects approaching deadline',
    value: '48h',
    type: 'deadline',
    urgency: 'medium'
  },
  {
    id: '3',
    title: 'Growth Metric',
    description: 'Customer satisfaction up 15%',
    value: '+15%',
    type: 'growth',
    urgency: 'low'
  },
];

export function QuickActions() {
  const { toast } = useToast();

  const handleAction = (actionId: string, title: string) => {
    toast({
      title: `${title} initiated`,
      description: "This would open the respective form/modal",
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'growth':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive" className="ml-2">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="ml-2">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="ml-2">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-white/70">Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleAction(action.id, action.title)}
              >
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <span className="text-xs opacity-80">{action.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Smart Insights</CardTitle>
          <CardDescription className="text-white/70">AI-powered business recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => {
                  toast({
                    title: insight.title,
                    description: "This would show detailed insights",
                  });
                }}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">{insight.title}</p>
                      {getUrgencyBadge(insight.urgency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{insight.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




