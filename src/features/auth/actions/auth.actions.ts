'use server';

import { AuthService } from '../services/auth.service';
import { loginSchema, signupSchema } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

const authService = new AuthService();

export async function loginAction(formData: unknown): Promise<Result<{ userId: string }>> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid input'));
  }

  return authService.login(parsed.data);
}

export async function signupAction(formData: unknown): Promise<Result<{ userId: string }>> {
  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid input'));
  }

  return authService.signup(parsed.data);
}

export async function logoutAction(): Promise<Result<boolean>> {
  return authService.logout();
}
