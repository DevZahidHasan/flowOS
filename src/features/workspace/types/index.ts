import { z } from 'zod';
import { ModuleKey } from '@/types/global';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  industryType: z.string().min(2, 'Industry type is required'),
});

export const toggleModuleSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  moduleKey: z.string() as z.ZodType<ModuleKey>,
  isEnabled: z.boolean(),
});

export type CreateWorkspaceSchemaType = z.infer<typeof createWorkspaceSchema>;
export type ToggleModuleSchemaType = z.infer<typeof toggleModuleSchema>;
