import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  organization_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_by: string | null;
  due_date: string | null;
  completed_at: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskWithProject extends Task {
  project_name?: string;
}

// Get all tasks for user's organization
export const getTasks = async (userId: string): Promise<TaskWithProject[]> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          name
        )
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map the data to include project_name
    const tasksWithProject = tasks?.map(task => ({
      ...task,
      project_name: task.projects?.name
    })) || [];

    return tasksWithProject;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// Create new task
export const createTask = async (userId: string, taskData: Partial<Task>): Promise<Task | null> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        organization_id: profile.organization_id,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

// Update task
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

// Delete task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

// Toggle task status (done/not done)
export const toggleTaskStatus = async (taskId: string, currentStatus: string): Promise<boolean> => {
  try {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const updates: any = {
      status: newStatus,
    };

    if (newStatus === 'done') {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = null;
    }

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error toggling task status:', error);
    return false;
  }
};



