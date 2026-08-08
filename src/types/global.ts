export type WorkspaceRole = 'owner' | 'manager' | 'staff';

export type PlatformRole = 'platform_admin' | 'platform_support' | 'platform_user';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export type ModuleKey =
  | 'appointments'
  | 'queue'
  | 'crm'
  | 'services'
  | 'staff'
  | 'tasks'
  | 'invoices'
  | 'finance'
  | 'ai';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  platformRole: PlatformRole;
  accountStatus: AccountStatus;
  isApproved: boolean;
  canCreateWorkspace: boolean;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  industryType: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  profile?: UserProfile;
}

export interface WorkspaceModule {
  id: string;
  workspaceId: string;
  moduleKey: ModuleKey;
  isEnabled: boolean;
  settings: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string | null;
  action: string;
  entityName: string;
  entityId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
