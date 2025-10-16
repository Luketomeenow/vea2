import { supabase } from '@/lib/supabase';

export interface Invoice {
  id: string;
  organization_id: string;
  customer_id: string;
  project_id: string | null;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  organization_id: string;
  project_id: string | null;
  user_id: string | null;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receipt_url: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

async function getUserOrganizationId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();
  return data?.organization_id || null;
}

export const getInvoices = async (userId: string): Promise<Invoice[]> => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return [];
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', orgId)
    .order('issue_date', { ascending: false });
  return data || [];
};

export const getExpenses = async (userId: string): Promise<Expense[]> => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return [];
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('organization_id', orgId)
    .order('expense_date', { ascending: false });
  return data || [];
};

export const getFinancialSummary = async (userId: string) => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return null;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, total_amount')
    .eq('organization_id', orgId);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, status')
    .eq('organization_id', orgId);

  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0) || 0;
  const pendingInvoices = invoices?.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total_amount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const profit = totalRevenue - totalExpenses;

  return { totalRevenue, pendingInvoices, totalExpenses, profit };
};



