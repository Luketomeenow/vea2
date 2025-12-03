import { supabase } from '@/lib/supabase';

export interface KPIData {
  ytdRevenue: number;
  revenueChange: number;
  activeProjects: number;
  projectsChange: number;
  newCustomers: number;
  customersChange: number;
  openInvoices: number;
  invoicesChange: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface TaskStats {
  status: string;
  count: number;
}

// Get KPI data for dashboard
export const getKPIData = async (userId: string): Promise<KPIData | null> => {
  try {
    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      console.warn('No organization found for user');
      return null;
    }

    const orgId = profile.organization_id;

    // Calculate YTD Revenue from cash_flow_entries
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const { data: incomeData } = await supabase
      .from('cash_flow_entries')
      .select('amount, transaction_date')
      .eq('organization_id', orgId)
      .eq('type', 'income')
      .eq('status', 'completed')
      .gte('transaction_date', startOfYear);

    const ytdRevenue = incomeData?.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0) || 0;

    // Calculate last month revenue for comparison
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);

    const { data: lastMonthIncome } = await supabase
      .from('cash_flow_entries')
      .select('amount')
      .eq('organization_id', orgId)
      .eq('type', 'income')
      .eq('status', 'completed')
      .gte('transaction_date', lastMonthStart.toISOString().split('T')[0])
      .lte('transaction_date', lastMonthEnd.toISOString().split('T')[0]);

    const lastMonthRevenue = lastMonthIncome?.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0) || 1;

    // Calculate current month revenue
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    const { data: currentMonthIncome } = await supabase
      .from('cash_flow_entries')
      .select('amount')
      .eq('organization_id', orgId)
      .eq('type', 'income')
      .eq('status', 'completed')
      .gte('transaction_date', currentMonthStart.toISOString().split('T')[0]);

    const currentMonthRevenue = currentMonthIncome?.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0) || 0;
    const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Get Active Projects
    const { data: activeProjects } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    const activeProjectsCount = activeProjects?.length || 0;

    // Get projects created this week for change calculation
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: newProjectsThisWeek } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .gte('created_at', weekAgo.toISOString());

    const projectsChange = newProjectsThisWeek?.length || 0;

    // Get New Customers (total active customers)
    const { data: customers } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    const customersCount = customers?.length || 0;

    // Get customers added this month
    const { data: newCustomersThisMonth } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .gte('created_at', currentMonthStart.toISOString());

    const newCustomersCount = newCustomersThisMonth?.length || 0;
    const customersChange = customersCount > 0 ? (newCustomersCount / customersCount) * 100 : 0;

    // Get Open Invoices (sent but not paid)
    const { data: openInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', orgId)
      .in('status', ['sent', 'overdue']);

    const openInvoicesAmount = openInvoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0) || 0;

    // Calculate change from last week
    const { data: lastWeekOpenInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', orgId)
      .in('status', ['sent', 'overdue'])
      .lte('created_at', weekAgo.toISOString());

    const lastWeekInvoicesAmount = lastWeekOpenInvoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0) || 1;
    const invoicesChange = lastWeekInvoicesAmount > 0 ? ((openInvoicesAmount - lastWeekInvoicesAmount) / lastWeekInvoicesAmount) * 100 : 0;

    return {
      ytdRevenue,
      revenueChange,
      activeProjects: activeProjectsCount,
      projectsChange,
      newCustomers: customersCount,
      customersChange,
      openInvoices: openInvoicesAmount,
      invoicesChange,
    };
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return null;
  }
};

// Get revenue data for chart (last 6 months)
export const getRevenueData = async (userId: string): Promise<RevenueData[]> => {
  try {
    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const orgId = profile.organization_id;
    const months: RevenueData[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const { data: monthlyIncome } = await supabase
        .from('cash_flow_entries')
        .select('amount')
        .eq('organization_id', orgId)
        .eq('type', 'income')
        .eq('status', 'completed')
        .gte('transaction_date', monthStart.toISOString().split('T')[0])
        .lte('transaction_date', monthEnd.toISOString().split('T')[0]);

      const revenue = monthlyIncome?.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0) || 0;
      
      // Target is 110% of revenue (or minimum $50k)
      const target = Math.max(revenue * 1.1, 50000);

      months.push({
        month: monthNames[date.getMonth()],
        revenue: Math.round(revenue),
        target: Math.round(target),
      });
    }

    return months;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
};

// Get task statistics by status
export const getTaskStats = async (userId: string): Promise<TaskStats[]> => {
  try {
    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const orgId = profile.organization_id;

    // Get tasks grouped by status
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('organization_id', orgId);

    if (!tasks) return [];

    // Count tasks by status
    const statusCounts: Record<string, number> = {};
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    // Convert to array format
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return [];
  }
};

// Get recent activity
export const getRecentActivity = async (userId: string, limit: number = 10) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return activities || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};
















