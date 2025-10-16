import { supabase } from '@/lib/supabase';

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  spent: number | null;
  progress: number;
  owner_id: string | null;
  color: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  activeProjects: number;
  completedThisMonth: number;
  totalBudget: number;
  totalSpent: number;
}

// Get all projects for user's organization
export const getProjects = async (userId: string): Promise<Project[]> => {
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

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Get project statistics
export const getProjectStats = async (userId: string): Promise<ProjectStats | null> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return null;
    }

    const orgId = profile.organization_id;

    // Get active projects count
    const { data: activeProjects } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    // Get completed projects this month
    const monthStart = new Date();
    monthStart.setDate(1);
    const { data: completedProjects } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('updated_at', monthStart.toISOString());

    // Get total budget and spent
    const { data: budgetData } = await supabase
      .from('projects')
      .select('budget, spent')
      .eq('organization_id', orgId);

    const totalBudget = budgetData?.reduce((sum, p) => sum + (parseFloat(p.budget?.toString() || '0')), 0) || 0;
    const totalSpent = budgetData?.reduce((sum, p) => sum + (parseFloat(p.spent?.toString() || '0')), 0) || 0;

    return {
      activeProjects: activeProjects?.length || 0,
      completedThisMonth: completedProjects?.length || 0,
      totalBudget,
      totalSpent,
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return null;
  }
};

// Create new project
export const createProject = async (userId: string, projectData: Partial<Project>): Promise<Project | null> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        organization_id: profile.organization_id,
        owner_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

// Update project
export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
};

// Delete project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};



