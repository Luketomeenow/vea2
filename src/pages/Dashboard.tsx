import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICards } from "@/components/dashboard/KPICards";
import { RevenueChart } from "@/components/dashboard/widgets/RevenueChart";
import { TaskCompletionChart } from "@/components/dashboard/widgets/TaskCompletionChart";
import { QuickActions } from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <KPICards />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <TaskCompletionChart />
        </div>
        
        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;




