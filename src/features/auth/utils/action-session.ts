import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export async function getWorkspaceActionSession(workspaceId: string): Promise<Result<{ userId: string }>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return fail(AppErrorFactory.unauthorized('User session not found'));
    }

    // Optional: We can add an explicit database check here to verify the user belongs to the workspaceId.
    // However, our RLS policies on Supabase strictly enforce workspace membership for all read/write operations.
    // So returning the user ID here is sufficient for basic authentication; Supabase RLS handles authorization.

    return ok({ userId: user.id });
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}
