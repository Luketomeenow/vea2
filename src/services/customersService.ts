import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  organization_id: string;
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
  created_at: string;
  updated_at: string;
}

// Get all customers for user's organization
export const getCustomers = async (userId: string): Promise<Customer[]> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return customers || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// Create new customer
export const createCustomer = async (userId: string, customerData: Partial<Customer>): Promise<Customer | null> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found');
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) throw error;

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    return null;
  }
};

// Update customer
export const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
};

// Delete customer
export const deleteCustomer = async (customerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};
















