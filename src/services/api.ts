/**
 * API Service Layer
 * Centralized functions for database operations
 */

import { supabase } from '@/lib/supabase';

// =====================================================
// PROJECTS
// =====================================================

export const projectsApi = {
  getAll: async (organizationId: string) => {
    return await supabase
      .from('projects')
      .select(`
        *,
        owner:profiles!owner_id(id, full_name, email, avatar_url),
        project_members(
          id,
          role,
          user:profiles(id, full_name, email, avatar_url)
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return await supabase
      .from('projects')
      .select(`
        *,
        owner:profiles!owner_id(id, full_name, email, avatar_url),
        project_members(
          id,
          role,
          user:profiles(id, full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single();
  },

  create: async (data: any) => {
    return await supabase.from('projects').insert(data).select().single();
  },

  update: async (id: string, data: any) => {
    return await supabase.from('projects').update(data).eq('id', id).select().single();
  },

  delete: async (id: string) => {
    return await supabase.from('projects').delete().eq('id', id);
  },

  addMember: async (projectId: string, userId: string, role: string = 'member') => {
    return await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: userId, role })
      .select()
      .single();
  },

  removeMember: async (projectId: string, userId: string) => {
    return await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
  },
};

// =====================================================
// TASKS
// =====================================================

export const tasksApi = {
  getAll: async (organizationId: string, filters?: any) => {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name, color),
        assigned_to_user:profiles!assigned_to(id, full_name, email, avatar_url),
        created_by_user:profiles!created_by(id, full_name, email)
      `)
      .eq('organization_id', organizationId);

    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    return await query.order('order_index', { ascending: true });
  },

  getById: async (id: string) => {
    return await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name, color),
        assigned_to_user:profiles!assigned_to(id, full_name, email, avatar_url),
        created_by_user:profiles!created_by(id, full_name, email),
        task_comments(
          *,
          user:profiles(id, full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();
  },

  create: async (data: any) => {
    return await supabase.from('tasks').insert(data).select().single();
  },

  update: async (id: string, data: any) => {
    return await supabase.from('tasks').update(data).eq('id', id).select().single();
  },

  delete: async (id: string) => {
    return await supabase.from('tasks').delete().eq('id', id);
  },

  addComment: async (taskId: string, comment: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase
      .from('task_comments')
      .insert({ task_id: taskId, user_id: user?.id, comment })
      .select()
      .single();
  },
};

// =====================================================
// CUSTOMERS
// =====================================================

export const customersApi = {
  getAll: async (organizationId: string) => {
    return await supabase
      .from('customers')
      .select(`
        *,
        customer_contacts(*)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return await supabase
      .from('customers')
      .select(`
        *,
        customer_contacts(*),
        invoices(*)
      `)
      .eq('id', id)
      .single();
  },

  create: async (data: any) => {
    return await supabase.from('customers').insert(data).select().single();
  },

  update: async (id: string, data: any) => {
    return await supabase.from('customers').update(data).eq('id', id).select().single();
  },

  delete: async (id: string) => {
    return await supabase.from('customers').delete().eq('id', id);
  },

  addContact: async (customerId: string, contact: any) => {
    return await supabase
      .from('customer_contacts')
      .insert({ customer_id: customerId, ...contact })
      .select()
      .single();
  },
};

// =====================================================
// INVOICES
// =====================================================

export const invoicesApi = {
  getAll: async (organizationId: string) => {
    return await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, email),
        project:projects(id, name),
        invoice_items(*)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        project:projects(id, name),
        invoice_items(*)
      `)
      .eq('id', id)
      .single();
  },

  create: async (invoiceData: any, items: any[]) => {
    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) return { data: null, error: invoiceError };

    // Create invoice items
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: invoice.id,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);

    if (itemsError) return { data: null, error: itemsError };

    return { data: invoice, error: null };
  },

  update: async (id: string, data: any) => {
    return await supabase.from('invoices').update(data).eq('id', id).select().single();
  },

  delete: async (id: string) => {
    return await supabase.from('invoices').delete().eq('id', id);
  },

  markAsPaid: async (id: string, paidDate?: string) => {
    return await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: paidDate || new Date().toISOString().split('T')[0],
      })
      .eq('id', id)
      .select()
      .single();
  },
};

// =====================================================
// EXPENSES
// =====================================================

export const expensesApi = {
  getAll: async (organizationId: string, filters?: any) => {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        project:projects(id, name),
        user:profiles(id, full_name, email)
      `)
      .eq('organization_id', organizationId);

    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    return await query.order('expense_date', { ascending: false });
  },

  create: async (data: any) => {
    return await supabase.from('expenses').insert(data).select().single();
  },

  update: async (id: string, data: any) => {
    return await supabase.from('expenses').update(data).eq('id', id).select().single();
  },

  delete: async (id: string) => {
    return await supabase.from('expenses').delete().eq('id', id);
  },

  approve: async (id: string) => {
    return await supabase
      .from('expenses')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
  },

  reject: async (id: string) => {
    return await supabase
      .from('expenses')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();
  },
};

// =====================================================
// TIME TRACKING
// =====================================================

export const timeTrackingApi = {
  getAll: async (userId: string, filters?: any) => {
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        project:projects(id, name, color),
        task:tasks(id, title)
      `)
      .eq('user_id', userId);

    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('start_time', filters.endDate);
    }

    return await query.order('start_time', { ascending: false });
  },

  start: async (data: any) => {
    return await supabase
      .from('time_entries')
      .insert({
        ...data,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();
  },

  stop: async (id: string) => {
    return await supabase
      .from('time_entries')
      .update({ end_time: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  update: async (id: string, data: any) => {
    return await supabase.from('time_entries').update(data).eq('id', id).select().single();
  },

  delete: async (id: string) => {
    return await supabase.from('time_entries').delete().eq('id', id);
  },
};

// =====================================================
// CALENDAR
// =====================================================

export const calendarApi = {
  getEvents: async (userId: string, startDate: string, endDate: string) => {
    return await supabase
      .from('calendar_events')
      .select(`
        *,
        project:projects(id, name, color),
        task:tasks(id, title),
        event_attendees(
          *,
          user:profiles(id, full_name, email, avatar_url)
        )
      `)
      .or(`user_id.eq.${userId},event_attendees.user_id.eq.${userId}`)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });
  },

  create: async (data: any, attendees?: string[]) => {
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert(data)
      .select()
      .single();

    if (eventError) return { data: null, error: eventError };

    if (attendees && attendees.length > 0) {
      const attendeeData = attendees.map(userId => ({
        event_id: event.id,
        user_id: userId,
      }));

      await supabase.from('event_attendees').insert(attendeeData);
    }

    return { data: event, error: null };
  },

  update: async (id: string, data: any) => {
    return await supabase
      .from('calendar_events')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  delete: async (id: string) => {
    return await supabase.from('calendar_events').delete().eq('id', id);
  },
};

// =====================================================
// DOCUMENTS
// =====================================================

export const documentsApi = {
  getAll: async (organizationId: string, filters?: any) => {
    let query = supabase
      .from('documents')
      .select(`
        *,
        uploaded_by_user:profiles!uploaded_by(id, full_name, avatar_url),
        project:projects(id, name),
        task:tasks(id, title)
      `)
      .eq('organization_id', organizationId)
      .neq('status', 'deleted');

    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.taskId) {
      query = query.eq('task_id', filters.taskId);
    }

    return await query.order('created_at', { ascending: false });
  },

  upload: async (file: File, metadata: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${metadata.organization_id}/${Date.now()}_${file.name}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) return { data: null, error: uploadError };

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        ...metadata,
        uploaded_by: user?.id,
        file_url: urlData.publicUrl,
        storage_path: filePath,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    return { data: document, error: docError };
  },

  delete: async (id: string) => {
    // Mark as deleted instead of actually deleting
    return await supabase
      .from('documents')
      .update({ status: 'deleted' })
      .eq('id', id)
      .select()
      .single();
  },

  share: async (documentId: string, userId: string, permission: string = 'view') => {
    return await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        shared_with_user_id: userId,
        permission,
      })
      .select()
      .single();
  },
};

// =====================================================
// CHAT / AI ASSISTANT
// =====================================================

export const chatApi = {
  getSessions: async (userId: string) => {
    return await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
  },

  createSession: async (userId: string, title?: string) => {
    return await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: title || 'New Chat',
      })
      .select()
      .single();
  },

  getMessages: async (sessionId: string) => {
    return await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
  },

  sendMessage: async (sessionId: string, userId: string, content: string, role: 'user' | 'assistant' = 'user') => {
    return await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role,
        content,
      })
      .select()
      .single();
  },

  deleteSession: async (sessionId: string) => {
    return await supabase.from('chat_sessions').delete().eq('id', sessionId);
  },
};

// =====================================================
// ANALYTICS
// =====================================================

export const analyticsApi = {
  getProjectStats: async (organizationId: string) => {
    return await supabase
      .from('project_statistics')
      .select('*')
      .eq('organization_id', organizationId);
  },

  getUserProductivity: async (organizationId: string) => {
    return await supabase
      .from('user_productivity')
      .select('*')
      .eq('organization_id', organizationId);
  },

  getFinancialOverview: async (organizationId: string) => {
    return await supabase
      .from('financial_overview')
      .select('*')
      .eq('organization_id', organizationId)
      .single();
  },

  getCashFlowSummary: async (organizationId: string, months: number = 12) => {
    return await supabase
      .from('cash_flow_summary')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(months);
  },

  logEvent: async (eventData: any) => {
    return await supabase.from('analytics_events').insert(eventData);
  },
};





