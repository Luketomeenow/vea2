// AI Functions Service - Gives AI Assistant access to all dashboard data and actions
import { supabase } from '@/lib/supabase';
import { createTask, getTasks } from './tasksService';
import { createProject, getProjects } from './projectsService';
import { getCustomers } from './customersService';
import { getInvoices, getExpenses, getFinancialSummary } from './financesService';
import { getCashFlowEntries, getCashFlowSummary } from './cashFlowService';
import { getTimeEntries, getTimeTrackingSummary } from './timeTrackingService';
import { getKPIData, getRevenueData } from './dashboardService';

// AI Function Definitions - tells AI what it can do
export const AI_FUNCTIONS = [
  {
    name: 'get_dashboard_overview',
    description: 'Get a complete overview of the business dashboard including KPIs, revenue, tasks, and projects',
    parameters: {}
  },
  {
    name: 'get_projects',
    description: 'Get all projects with their details, status, progress, budget, and deadlines',
    parameters: {}
  },
  {
    name: 'create_project',
    description: 'Create a new project',
    parameters: {
      name: 'string (required) - Project name',
      description: 'string - Project description',
      priority: 'string - low, medium, high, or urgent',
      start_date: 'string - ISO date',
      end_date: 'string - ISO date',
      budget: 'number - Project budget',
    }
  },
  {
    name: 'get_tasks',
    description: 'Get all tasks with their status, priority, assignees, and due dates',
    parameters: {
      status: 'string (optional) - Filter by status: todo, in_progress, review, done, blocked'
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task',
    parameters: {
      title: 'string (required) - Task title',
      description: 'string - Task description',
      priority: 'string - low, medium, high, or urgent',
      status: 'string - todo, in_progress, review, done, or blocked',
      due_date: 'string - ISO date',
      project_id: 'string - Associated project ID',
    }
  },
  {
    name: 'get_customers',
    description: 'Get all customers with their contact info, company details, and status',
    parameters: {
      status: 'string (optional) - Filter by status: active, inactive, lead, or prospect'
    }
  },
  {
    name: 'get_financial_summary',
    description: 'Get financial summary including total revenue, expenses, profit, and pending invoices',
    parameters: {}
  },
  {
    name: 'get_invoices',
    description: 'Get all invoices with their status, amounts, and due dates',
    parameters: {}
  },
  {
    name: 'get_cash_flow',
    description: 'Get cash flow data including income, expenses, and net cash flow',
    parameters: {}
  },
  {
    name: 'get_time_tracking',
    description: 'Get time tracking summary including total hours, billable hours, and revenue',
    parameters: {}
  },
  {
    name: 'analyze_business_health',
    description: 'Analyze overall business health including revenue trends, task completion, and cash flow',
    parameters: {}
  },
];

// Function Implementations
export async function executeFunctionCall(
  functionName: string,
  parameters: any,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🤖 AI executing function: ${functionName}`, parameters);

    switch (functionName) {
      case 'get_dashboard_overview':
        return await getDashboardOverview(userId);

      case 'get_projects':
        return await getProjectsData(userId);

      case 'create_project':
        return await createNewProject(userId, parameters);

      case 'get_tasks':
        return await getTasksData(userId, parameters);

      case 'create_task':
        return await createNewTask(userId, parameters);

      case 'get_customers':
        return await getCustomersData(userId, parameters);

      case 'get_financial_summary':
        return await getFinancialSummaryData(userId);

      case 'get_invoices':
        return await getInvoicesData(userId);

      case 'get_cash_flow':
        return await getCashFlowData(userId);

      case 'get_time_tracking':
        return await getTimeTrackingData(userId);

      case 'analyze_business_health':
        return await analyzeBusinessHealth(userId);

      default:
        return {
          success: false,
          error: `Unknown function: ${functionName}`
        };
    }
  } catch (error: any) {
    console.error(`❌ Error executing ${functionName}:`, error);
    return {
      success: false,
      error: error.message || 'Function execution failed'
    };
  }
}

// === IMPLEMENTATION FUNCTIONS ===

async function getDashboardOverview(userId: string) {
  const [kpis, revenue, tasks, projects] = await Promise.all([
    getKPIData(userId),
    getRevenueData(userId),
    getTasks(userId),
    getProjects(userId),
  ]);

  const tasksByStatus = tasks.reduce((acc: any, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const activeProjects = projects.filter(p => p.status === 'active').length;

  return {
    success: true,
    data: {
      summary: 'Here is your complete dashboard overview:',
      kpis,
      revenue: {
        ytd: kpis?.ytdRevenue || 0,
        trend: revenue.slice(-3), // Last 3 months
      },
      projects: {
        total: projects.length,
        active: activeProjects,
        recent: projects.slice(0, 3).map(p => ({
          name: p.name,
          status: p.status,
          progress: p.progress,
        })),
      },
      tasks: {
        total: tasks.length,
        by_status: tasksByStatus,
        overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
      },
    },
  };
}

async function getProjectsData(userId: string) {
  const projects = await getProjects(userId);
  
  return {
    success: true,
    data: {
      total: projects.length,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        budget: p.budget,
        spent: p.spent,
        start_date: p.start_date,
        end_date: p.end_date,
        tags: p.tags,
      })),
    },
  };
}

async function createNewProject(userId: string, params: any) {
  if (!params.name) {
    return { success: false, error: 'Project name is required' };
  }

  try {
    const projectData = {
      name: params.name,
      description: params.description || '',
      priority: params.priority || 'medium',
      start_date: params.start_date || new Date().toISOString(),
      end_date: params.end_date || null,
      budget: params.budget || 0,
      status: 'active' as const,
      progress: 0,
      spent: 0,
      color: '#3B82F6',
      tags: params.tags || [],
    };

    const newProject = await createProject(userId, projectData);

    if (!newProject) {
      return { 
        success: false, 
        error: 'Failed to create project. Please make sure your account is properly set up.' 
      };
    }

    return {
      success: true,
      data: {
        message: `✅ Project "${newProject.name}" created successfully!`,
        project: newProject,
      },
    };
  } catch (error: any) {
    console.error('Error in createNewProject:', error);
    return {
      success: false,
      error: `Project creation failed: ${error.message}. Please check if your organization is set up correctly.`
    };
  }
}

async function getTasksData(userId: string, params: any) {
  const allTasks = await getTasks(userId);
  
  let tasks = allTasks;
  if (params?.status) {
    tasks = allTasks.filter(t => t.status === params.status);
  }

  const summary = {
    total: tasks.length,
    by_priority: tasks.reduce((acc: any, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {}),
    by_status: tasks.reduce((acc: any, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {}),
  };

  return {
    success: true,
    data: {
      summary,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
        project_name: t.project_name,
        tags: t.tags,
      })),
    },
  };
}

async function createNewTask(userId: string, params: any) {
  if (!params.title) {
    return { success: false, error: 'Task title is required' };
  }

  try {
    const taskData = {
      title: params.title,
      description: params.description || '',
      priority: params.priority || 'medium',
      status: params.status || 'todo',
      due_date: params.due_date || null,
      project_id: params.project_id || null,
      tags: params.tags || [],
    };

    const newTask = await createTask(userId, taskData);

    if (!newTask) {
      return { 
        success: false, 
        error: 'Failed to create task. Please make sure your account is properly set up. You may need to run the organization setup script in Supabase.' 
      };
    }

    return {
      success: true,
      data: {
        message: `✅ Task "${newTask.title}" created successfully!`,
        task: newTask,
      },
    };
  } catch (error: any) {
    console.error('Error in createNewTask:', error);
    return {
      success: false,
      error: `Task creation failed: ${error.message}. Please check if your organization is set up correctly.`
    };
  }
}

async function getCustomersData(userId: string, params: any) {
  const allCustomers = await getCustomers(userId);
  
  let customers = allCustomers;
  if (params?.status) {
    customers = allCustomers.filter(c => c.status === params.status);
  }

  return {
    success: true,
    data: {
      total: customers.length,
      by_status: customers.reduce((acc: any, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}),
      customers: customers.map(c => ({
        name: c.name,
        email: c.email,
        company: c.company,
        city: c.city,
        status: c.status,
        customer_type: c.customer_type,
      })),
    },
  };
}

async function getFinancialSummaryData(userId: string) {
  const summary = await getFinancialSummary(userId);
  
  return {
    success: true,
    data: summary,
  };
}

async function getInvoicesData(userId: string) {
  const invoices = await getInvoices(userId);
  
  const summary = {
    total: invoices.length,
    by_status: invoices.reduce((acc: any, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {}),
    total_amount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    paid_amount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
  };

  return {
    success: true,
    data: {
      summary,
      invoices: invoices.slice(0, 10).map(inv => ({
        invoice_number: inv.invoice_number,
        status: inv.status,
        total_amount: inv.total_amount,
        due_date: inv.due_date,
        issue_date: inv.issue_date,
      })),
    },
  };
}

async function getCashFlowData(userId: string) {
  const summary = await getCashFlowSummary(userId);
  
  return {
    success: true,
    data: summary,
  };
}

async function getTimeTrackingData(userId: string) {
  const summary = await getTimeTrackingSummary(userId);
  
  return {
    success: true,
    data: summary,
  };
}

async function analyzeBusinessHealth(userId: string) {
  const [kpis, financial, cashFlow, tasks, projects] = await Promise.all([
    getKPIData(userId),
    getFinancialSummary(userId),
    getCashFlowSummary(userId),
    getTasks(userId),
    getProjects(userId),
  ]);

  const completionRate = tasks.length > 0 
    ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 
    : 0;

  const projectCompletionRate = projects.length > 0
    ? (projects.filter(p => p.status === 'completed').length / projects.length) * 100
    : 0;

  const profitMargin = financial && financial.totalRevenue > 0
    ? ((financial.profit / financial.totalRevenue) * 100)
    : 0;

  const analysis = {
    overall_health: 'Good', // Will be determined by AI
    metrics: {
      revenue: {
        ytd: kpis?.ytdRevenue || 0,
        change: kpis?.revenueChange || 0,
      },
      profitability: {
        profit: financial?.profit || 0,
        margin: profitMargin.toFixed(1) + '%',
      },
      cash_flow: {
        net: cashFlow?.netCashFlow || 0,
        status: (cashFlow?.netCashFlow || 0) > 0 ? 'Positive' : 'Negative',
      },
      productivity: {
        task_completion: completionRate.toFixed(1) + '%',
        project_completion: projectCompletionRate.toFixed(1) + '%',
        active_projects: projects.filter(p => p.status === 'active').length,
      },
    },
    recommendations: [
      // AI will generate these based on the data
    ],
  };

  return {
    success: true,
    data: analysis,
  };
}

// Helper to format function response for AI
export function formatFunctionResponse(result: any): string {
  if (!result.success) {
    return `❌ Error: ${result.error}`;
  }

  return JSON.stringify(result.data, null, 2);
}

