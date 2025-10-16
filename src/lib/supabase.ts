import { createClient } from '@supabase/supabase-js';

// Supabase configuration - TEMPORARY HARDCODED (will move back to .env later)
const supabaseUrl = 'https://kofhwlmffnzpehaoplzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmh3bG1mZm56cGVoYW9wbHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjExOTIsImV4cCI6MjA3NDI5NzE5Mn0.3tkT_PEr30nZpFjk298vT87Et-eviLnz2rR6NZCaNAE';

// Debug logging
console.log('🔧 Supabase Config Check:');
console.log('URL:', supabaseUrl);
console.log('Key loaded:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration error!');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'manager';
          organization_id: string | null;
          phone: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'manager';
          organization_id?: string | null;
          phone?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'manager';
          organization_id?: string | null;
          phone?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          subscription_status: 'active' | 'cancelled' | 'expired';
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'cancelled' | 'expired';
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'cancelled' | 'expired';
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          context: Json;
          created_at: string;
          updated_at: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: Json;
          created_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          description: string | null;
          status: 'active' | 'on_hold' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          spent: number;
          progress: number;
          owner_id: string | null;
          color: string;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          organization_id: string | null;
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
          parent_task_id: string | null;
          order_index: number;
          tags: string[];
          attachments: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          website: string | null;
          tax_id: string | null;
          customer_type: 'individual' | 'business';
          status: 'active' | 'inactive' | 'lead' | 'prospect';
          notes: string | null;
          tags: string[];
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string | null;
          customer_id: string | null;
          project_id: string | null;
          invoice_number: string;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          issue_date: string;
          due_date: string;
          paid_date: string | null;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          currency: string;
          notes: string | null;
          terms: string | null;
          payment_method: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          organization_id: string | null;
          project_id: string | null;
          user_id: string | null;
          category: string;
          description: string | null;
          amount: number;
          currency: string;
          expense_date: string;
          payment_method: string | null;
          receipt_url: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      cash_flow_entries: {
        Row: {
          id: string;
          organization_id: string | null;
          type: 'income' | 'expense';
          category: string;
          description: string | null;
          amount: number;
          currency: string;
          transaction_date: string;
          payment_method: string | null;
          reference_id: string | null;
          reference_type: string | null;
          account: string | null;
          status: 'pending' | 'completed' | 'cancelled';
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          description: string | null;
          start_time: string;
          end_time: string | null;
          duration: number | null;
          billable: boolean;
          hourly_rate: number | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string;
          title: string;
          description: string | null;
          location: string | null;
          event_type: 'meeting' | 'task' | 'reminder' | 'deadline' | 'other';
          start_time: string;
          end_time: string;
          all_day: boolean;
          recurrence_rule: string | null;
          project_id: string | null;
          task_id: string | null;
          color: string;
          reminder_minutes: number | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      documents: {
        Row: {
          id: string;
          organization_id: string | null;
          uploaded_by: string;
          project_id: string | null;
          task_id: string | null;
          customer_id: string | null;
          name: string;
          description: string | null;
          file_type: string;
          file_size: number;
          file_url: string;
          storage_path: string;
          folder_path: string;
          version: number;
          status: 'active' | 'archived' | 'deleted';
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          action_url: string | null;
          read: boolean;
          metadata: Json;
          created_at: string;
        };
      };
    };
    Views: {
      project_statistics: {
        Row: {
          id: string;
          name: string;
          organization_id: string | null;
          status: string;
          budget: number | null;
          spent: number;
          progress: number;
          total_tasks: number;
          completed_tasks: number;
          team_members: number;
          total_hours: number;
        };
      };
      user_productivity: {
        Row: {
          user_id: string;
          full_name: string | null;
          organization_id: string | null;
          assigned_tasks: number;
          completed_tasks: number;
          total_hours: number;
          projects_worked_on: number;
        };
      };
      financial_overview: {
        Row: {
          organization_id: string;
          organization_name: string;
          total_revenue: number;
          outstanding_invoices: number;
          total_expenses: number;
          net_profit: number;
        };
      };
    };
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string;
          p_title: string;
          p_message: string;
          p_type?: 'info' | 'success' | 'warning' | 'error';
          p_action_url?: string;
        };
        Returns: string;
      };
    };
  };
}

// Helper functions for authentication
export const authHelpers = {
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },
};

// Helper function for real-time subscriptions
export const subscribeToTable = <T>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      (payload) => callback(payload.new as T)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export default supabase;

