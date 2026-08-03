import { ModuleKey, WorkspaceRole } from './global';

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  industryType: string;
  enabledModules?: ModuleKey[];
}

export interface ToggleModuleInput {
  workspaceId: string;
  moduleKey: ModuleKey;
  isEnabled: boolean;
}

export interface InviteMemberInput {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
}
