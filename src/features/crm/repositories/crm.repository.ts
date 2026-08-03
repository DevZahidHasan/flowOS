import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { AddCustomerNoteInput, CreateCustomerInput, Customer, CustomerNote, CustomerTimelineEvent } from '../types';
import type { Database } from '@/types/database';

export class CrmRepository {
  async getWorkspaceCustomers(workspaceId: string): Promise<Result<Customer[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('customers')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'CUSTOMERS_FETCH_FAILED'));
      }

      const rows = (rawData || []) as unknown as Database['public']['Tables']['customers']['Row'][];

      const customers: Customer[] = rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        avatarUrl: r.avatar_url,
        birthday: r.birthday,
        marketingConsent: r.marketing_consent,
        referralSource: r.referral_source,
        preferredStaffName: r.preferred_staff_name,
        preferredServiceName: r.preferred_service_name,
        tags: r.tags || [],
        loyaltyPoints: r.loyalty_points,
        totalVisits: r.total_visits,
        lifetimeSpending: Number(r.lifetime_spending),
        outstandingBalance: Number(r.outstanding_balance),
        lastVisitAt: r.last_visit_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return ok(customers);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getCustomerDetails(workspaceId: string, customerId: string): Promise<Result<{ customer: Customer; notes: CustomerNote[]; timeline: CustomerTimelineEvent[] }>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data: rawCust, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('workspace_id', workspaceId)
        .single();

      if (custErr || !rawCust) {
        return fail(AppErrorFactory.notFound('Customer profile not found', 'CUSTOMER_NOT_FOUND'));
      }

      const { data: rawNotes } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('customer_id', customerId)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      const { data: rawTimeline } = await supabase
        .from('customer_timeline')
        .select('*')
        .eq('customer_id', customerId)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      const r = rawCust as unknown as Database['public']['Tables']['customers']['Row'];
      const customer: Customer = {
        id: r.id,
        workspaceId: r.workspace_id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        avatarUrl: r.avatar_url,
        birthday: r.birthday,
        marketingConsent: r.marketing_consent,
        referralSource: r.referral_source,
        preferredStaffName: r.preferred_staff_name,
        preferredServiceName: r.preferred_service_name,
        tags: r.tags || [],
        loyaltyPoints: r.loyalty_points,
        totalVisits: r.total_visits,
        lifetimeSpending: Number(r.lifetime_spending),
        outstandingBalance: Number(r.outstanding_balance),
        lastVisitAt: r.last_visit_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };

      const noteRows = (rawNotes || []) as unknown as Database['public']['Tables']['customer_notes']['Row'][];
      const notes: CustomerNote[] = noteRows.map((n) => ({
        id: n.id,
        workspaceId: n.workspace_id,
        customerId: n.customer_id,
        authorName: n.author_name,
        note: n.note,
        createdAt: n.created_at,
      }));

      const timeRows = (rawTimeline || []) as unknown as Database['public']['Tables']['customer_timeline']['Row'][];
      const timeline: CustomerTimelineEvent[] = timeRows.map((t) => ({
        id: t.id,
        workspaceId: t.workspace_id,
        customerId: t.customer_id,
        eventType: t.event_type as CustomerTimelineEvent['eventType'],
        title: t.title,
        description: t.description,
        metadata: (t.metadata as Record<string, unknown>) || {},
        createdAt: t.created_at,
      }));

      return ok({ customer, notes, timeline });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createCustomer(input: CreateCustomerInput): Promise<Result<Customer>> {
    try {
      const supabase = await createServerSupabaseClient();

      const insertPayload: Database['public']['Tables']['customers']['Insert'] = {
        workspace_id: input.workspaceId,
        full_name: input.fullName,
        email: input.email || null,
        phone: input.phone || null,
        birthday: input.birthday || null,
        marketing_consent: input.marketingConsent,
        referral_source: input.referralSource || 'Direct',
        preferred_staff_name: input.preferredStaffName || null,
        preferred_service_name: input.preferredServiceName || null,
        tags: input.tags || [],
      };

      const { data: rawData, error } = await supabase
        .from('customers')
        .insert(insertPayload as never)
        .select()
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.badRequest(error?.message || 'Failed to create customer', 'CUSTOMER_CREATE_FAILED'));
      }

      const r = rawData as unknown as Database['public']['Tables']['customers']['Row'];

      // Automatically add "Customer Created" timeline entry
      await supabase.from('customer_timeline').insert({
        workspace_id: input.workspaceId,
        customer_id: r.id,
        event_type: 'CREATED',
        title: 'Customer Profile Created',
        description: `Customer ${r.full_name} joined via ${r.referral_source}.`,
      } as never);

      const customer: Customer = {
        id: r.id,
        workspaceId: r.workspace_id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        avatarUrl: r.avatar_url,
        birthday: r.birthday,
        marketingConsent: r.marketing_consent,
        referralSource: r.referral_source,
        preferredStaffName: r.preferred_staff_name,
        preferredServiceName: r.preferred_service_name,
        tags: r.tags || [],
        loyaltyPoints: r.loyalty_points,
        totalVisits: r.total_visits,
        lifetimeSpending: Number(r.lifetime_spending),
        outstandingBalance: Number(r.outstanding_balance),
        lastVisitAt: r.last_visit_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };

      return ok(customer);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async addNote(input: AddCustomerNoteInput): Promise<Result<CustomerNote>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data: rawData, error } = await supabase
        .from('customer_notes')
        .insert({
          workspace_id: input.workspaceId,
          customer_id: input.customerId,
          author_name: input.authorName,
          note: input.note,
        } as never)
        .select()
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.badRequest(error?.message || 'Failed to add note', 'NOTE_ADD_FAILED'));
      }

      // Automatically record Note Added timeline entry
      await supabase.from('customer_timeline').insert({
        workspace_id: input.workspaceId,
        customer_id: input.customerId,
        event_type: 'NOTE_ADDED',
        title: 'Staff Note Added',
        description: `Note added by ${input.authorName}: "${input.note.substring(0, 50)}..."`,
      } as never);

      const r = rawData as unknown as Database['public']['Tables']['customer_notes']['Row'];

      return ok({
        id: r.id,
        workspaceId: r.workspace_id,
        customerId: r.customer_id,
        authorName: r.author_name,
        note: r.note,
        createdAt: r.created_at,
      });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
