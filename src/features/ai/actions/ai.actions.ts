'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { AIFeatureService } from '../services/ai-feature.service';
import { 
  CarePlannerInput, CarePlannerInputSchema, 
  ServiceCatalogInput, ServiceCatalogInputSchema, ServiceCatalogOutput,
  MarketingInput, MarketingInputSchema, MarketingOutput,
  MeetingNotesOutput, CRMInsightsOutput 
} from '../types';

const aiFeatureService = new AIFeatureService();

async function verifyWorkspaceMembership(workspaceId: string): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const { data: membership, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error || !membership) {
    return fail(AppErrorFactory.forbidden('Access denied. You are not a member of this workspace.', 'WORKSPACE_ACCESS_DENIED'));
  }

  return { data: true, error: null };
}

export async function generateCarePlanAction(workspaceId: string, input: CarePlannerInput): Promise<Result<string>> {
  const membershipCheck = await verifyWorkspaceMembership(workspaceId);
  if (membershipCheck.error) return fail(membershipCheck.error);

  const validation = CarePlannerInputSchema.safeParse(input);
  if (!validation.success) {
    return fail(AppErrorFactory.badRequest('Invalid input parameters: ' + validation.error.message));
  }

  return aiFeatureService.generateCarePlan(workspaceId, validation.data);
}

export async function generateServiceCatalogAction(workspaceId: string, input: ServiceCatalogInput): Promise<Result<ServiceCatalogOutput>> {
  const membershipCheck = await verifyWorkspaceMembership(workspaceId);
  if (membershipCheck.error) return fail(membershipCheck.error);

  const validation = ServiceCatalogInputSchema.safeParse(input);
  if (!validation.success) {
    return fail(AppErrorFactory.badRequest('Invalid input parameters: ' + validation.error.message));
  }

  return aiFeatureService.generateServiceCatalog(workspaceId, validation.data);
}

export async function generateMarketingCopyAction(workspaceId: string, input: MarketingInput): Promise<Result<MarketingOutput>> {
  const membershipCheck = await verifyWorkspaceMembership(workspaceId);
  if (membershipCheck.error) return fail(membershipCheck.error);

  const validation = MarketingInputSchema.safeParse(input);
  if (!validation.success) {
    return fail(AppErrorFactory.badRequest('Invalid input parameters: ' + validation.error.message));
  }

  return aiFeatureService.generateMarketingCopy(workspaceId, validation.data);
}

export async function extractTasksFromNotesAction(workspaceId: string, notes: string): Promise<Result<MeetingNotesOutput>> {
  const membershipCheck = await verifyWorkspaceMembership(workspaceId);
  if (membershipCheck.error) return fail(membershipCheck.error);

  if (!notes || notes.trim().length === 0) {
    return fail(AppErrorFactory.badRequest('Meeting notes cannot be empty.'));
  }

  if (notes.length > 10000) {
    return fail(AppErrorFactory.badRequest('Meeting notes exceed maximum allowed character limit (10,000).'));
  }

  return aiFeatureService.extractTasksFromNotes(workspaceId, notes);
}

export async function generateCustomerInsightsAction(
  workspaceId: string,
  customerData: {
    fullName: string;
    totalVisits: number;
    lifetimeSpent: number;
    notes: string[];
    appointmentHistory: string[];
  }
): Promise<Result<CRMInsightsOutput>> {
  const membershipCheck = await verifyWorkspaceMembership(workspaceId);
  if (membershipCheck.error) return fail(membershipCheck.error);

  if (!customerData.fullName) {
    return fail(AppErrorFactory.badRequest('Customer name is required for insights.'));
  }

  const truncatedData = {
    fullName: customerData.fullName,
    totalVisits: customerData.totalVisits,
    lifetimeSpent: customerData.lifetimeSpent,
    notes: (customerData.notes || []).slice(0, 10),
    appointmentHistory: (customerData.appointmentHistory || []).slice(0, 10),
  };

  return aiFeatureService.generateCustomerInsights(workspaceId, truncatedData);
}
