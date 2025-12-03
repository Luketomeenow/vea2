import { supabase } from '@/lib/supabase';

export interface CashFlowEntry {
  id: string;
  organization_id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  payment_method: string;
  reference_type: 'invoice' | 'expense' | 'other';
  reference_id: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

async function getUserOrganizationId(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('organization_id').eq('id', userId).single();
  return data?.organization_id || null;
}

export const getCashFlowEntries = async (userId: string): Promise<CashFlowEntry[]> => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return [];
  const { data } = await supabase
    .from('cash_flow_entries')
    .select('*')
    .eq('organization_id', orgId)
    .order('transaction_date', { ascending: false });
  return data || [];
};

export const getCashFlowSummary = async (userId: string) => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return null;

  const { data } = await supabase
    .from('cash_flow_entries')
    .select('type, amount, status')
    .eq('organization_id', orgId)
    .eq('status', 'completed');

  const totalIncome = data?.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalExpenses = data?.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0) || 0;
  const netCashFlow = totalIncome - totalExpenses;

  return { totalIncome, totalExpenses, netCashFlow };
};
















