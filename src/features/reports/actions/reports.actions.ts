'use server';

import { ReportsService } from '../services/reports.service';
import { reportsFilterSchema, FinancialReportData } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const reportsService = new ReportsService();

export async function getFinancialReportAction(
  workspaceId: string,
  filterType: string,
  customStartDate?: string,
  customEndDate?: string
): Promise<Result<FinancialReportData>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return fail(AppErrorFactory.unauthorized('Authentication required'));
    }

    // Validate the input parameters
    const parsed = reportsFilterSchema.safeParse({
      workspaceId,
      filterType,
      customStartDate,
      customEndDate,
    });

    if (!parsed.success) {
      return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid parameters'));
    }

    const result = await reportsService.getFinancialReport(
      parsed.data.workspaceId,
      parsed.data.filterType,
      parsed.data.customStartDate,
      parsed.data.customEndDate
    );

    return result;
  } catch (err) {
    return fail(AppErrorFactory.fromUnknown(err));
  }
}
