import { supabase } from '@/lib/supabase';

export interface TimeEntry {
  id: string;
  organization_id: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  description: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  billable: boolean;
  hourly_rate: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

async function getUserOrganizationId(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('organization_id').eq('id', userId).single();
  return data?.organization_id || null;
}

export const getTimeEntries = async (userId: string): Promise<TimeEntry[]> => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return [];
  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('organization_id', orgId)
    .order('start_time', { ascending: false });
  return data || [];
};

export const getTimeTrackingSummary = async (userId: string) => {
  const orgId = await getUserOrganizationId(userId);
  if (!orgId) return null;

  const { data } = await supabase
    .from('time_entries')
    .select('duration, billable, hourly_rate')
    .eq('organization_id', orgId);

  const totalHours = data?.reduce((sum, e) => sum + e.duration, 0) || 0;
  const billableHours = data?.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0) || 0;
  const totalRevenue = data?.filter(e => e.billable && e.hourly_rate).reduce((sum, e) => sum + (e.duration / 3600) * (e.hourly_rate || 0), 0) || 0;

  return { totalHours: totalHours / 3600, billableHours: billableHours / 3600, totalRevenue };
};























