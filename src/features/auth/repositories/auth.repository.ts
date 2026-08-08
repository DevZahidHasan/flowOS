import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { LoginInput, SignupInput } from '@/types/auth';
import { UserProfile } from '@/types/global';
import type { Database } from '@/types/database';

export class AuthRepository {
  async login(input: LoginInput): Promise<Result<{ userId: string }>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password || '',
      });

      if (error) {
        return fail(AppErrorFactory.unauthorized(error.message, 'AUTH_INVALID_CREDENTIALS'));
      }

      if (!data.user) {
        return fail(AppErrorFactory.unauthorized('User session not found', 'AUTH_NO_USER'));
      }

      return ok({ userId: data.user.id });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async signup(input: SignupInput): Promise<Result<{ userId: string }>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password || '',
        options: {
          data: {
            full_name: input.fullName,
          },
        },
      });

      if (error) {
        return fail(AppErrorFactory.badRequest(error.message, 'AUTH_SIGNUP_FAILED'));
      }

      if (!data.user) {
        return fail(AppErrorFactory.internal('User creation failed', 'AUTH_NO_USER_CREATED'));
      }

      return ok({ userId: data.user.id });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async logout(): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'AUTH_LOGOUT_FAILED'));
      }
      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getCurrentUserProfile(): Promise<Result<UserProfile | null>> {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return ok(null);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return fail(AppErrorFactory.internal(error?.message || 'Profile not found', 'PROFILE_FETCH_FAILED'));
      }

      const profileRow = data as Database['public']['Tables']['profiles']['Row'];

      const profile: UserProfile = {
        id: profileRow.id,
        fullName: profileRow.full_name,
        email: profileRow.email,
        avatarUrl: profileRow.avatar_url,
        platformRole: profileRow.platform_role,
        accountStatus: profileRow.account_status,
        isApproved: profileRow.is_approved,
        canCreateWorkspace: profileRow.can_create_workspace,
        createdAt: profileRow.created_at,
      };

      return ok(profile);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
