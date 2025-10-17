import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';

interface UseSupabaseQueryOptions<T> {
  table: string;
  select?: string;
  filter?: {
    column: string;
    value: any;
    operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in';
  }[];
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  single?: boolean;
  realtime?: boolean;
}

export function useSupabaseQuery<T>(options: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T | T[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(options.table).select(options.select || '*');

      // Apply filters
      if (options.filter) {
        options.filter.forEach(({ column, value, operator = 'eq' }) => {
          query = query[operator](column, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Execute query
      if (options.single) {
        const { data, error } = await query.single();
        setData(data);
        setError(error);
      } else {
        const { data, error } = await query;
        setData(data);
        setError(error);
      }
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchData();

    // Setup realtime subscription if enabled
    let channel: RealtimeChannel | null = null;
    if (options.realtime) {
      channel = supabase
        .channel(`${options.table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: options.table,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchData, options.realtime]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
}

interface UseSupabaseMutationOptions {
  table: string;
  onSuccess?: (data: any) => void;
  onError?: (error: PostgrestError) => void;
}

export function useSupabaseMutation(options: UseSupabaseMutationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const insert = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error } = await supabase
        .from(options.table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      options.onSuccess?.(result);
      return { data: result, error: null };
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      options.onError?.(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error } = await supabase
        .from(options.table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      options.onSuccess?.(result);
      return { data: result, error: null };
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      options.onError?.(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from(options.table).delete().eq('id', id);

      if (error) throw error;
      options.onSuccess?.(id);
      return { error: null };
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      options.onError?.(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    insert,
    update,
    remove,
    loading,
    error,
  };
}

// Hook for chat functionality
export function useChatMessages(sessionId: string | null) {
  const { data: messages, loading, error, refetch } = useSupabaseQuery({
    table: 'chat_messages',
    select: '*',
    filter: sessionId ? [{ column: 'session_id', value: sessionId }] : [],
    orderBy: { column: 'created_at', ascending: true },
    realtime: true,
  });

  const sendMessage = async (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!sessionId) return { data: null, error: new Error('No session ID') };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    return { data, error };
  };

  return {
    messages: messages as any[] | null,
    loading,
    error,
    sendMessage,
    refetch,
  };
}

// Hook for notifications
export function useNotifications(userId: string | null) {
  const { data: notifications, loading, error, refetch } = useSupabaseQuery({
    table: 'notifications',
    select: '*',
    filter: userId ? [{ column: 'user_id', value: userId }] : [],
    orderBy: { column: 'created_at', ascending: false },
    limit: 50,
    realtime: true,
  });

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      refetch();
    }
    return { error };
  };

  const markAllAsRead = async () => {
    if (!userId) return { error: new Error('No user ID') };

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (!error) {
      refetch();
    }
    return { error };
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.read).length
    : 0;

  return {
    notifications: notifications as any[] | null,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}





