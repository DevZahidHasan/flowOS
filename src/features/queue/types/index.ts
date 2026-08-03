import { z } from 'zod';

export type QueueStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

export interface QueueToken {
  id: string;
  workspaceId: string;
  tokenNumber: string;
  customerName: string;
  customerPhone: string | null;
  serviceName: string | null;
  status: QueueStatus;
  estimatedWaitMin: number;
  servedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export const createTokenSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerPhone: z.string().optional().or(z.literal('')),
  serviceName: z.string().optional().or(z.literal('')),
  estimatedWaitMin: z.number().default(15),
});

export const updateTokenStatusSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  tokenId: z.string().uuid('Invalid token ID'),
  status: z.enum(['WAITING', 'SERVING', 'COMPLETED', 'CANCELLED']),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type UpdateTokenStatusInput = z.infer<typeof updateTokenStatusSchema>;
