import { AuthRepository } from '../repositories/auth.repository';
import { LoginInput, SignupInput } from '@/types/auth';
import { Result } from '@/lib/result/result';
import { UserProfile } from '@/types/global';

export class AuthService {
  private authRepo: AuthRepository;

  constructor(authRepo?: AuthRepository) {
    this.authRepo = authRepo || new AuthRepository();
  }

  async login(input: LoginInput): Promise<Result<{ userId: string }>> {
    return this.authRepo.login(input);
  }

  async signup(input: SignupInput): Promise<Result<{ userId: string }>> {
    return this.authRepo.signup(input);
  }

  async logout(): Promise<Result<boolean>> {
    return this.authRepo.logout();
  }

  async getCurrentUserProfile(): Promise<Result<UserProfile | null>> {
    return this.authRepo.getCurrentUserProfile();
  }
}
