import { Result } from '../result/result';
import { GenOptions } from './types';
import { z } from 'zod';

export interface IAIService {
  generateText(prompt: string, options?: GenOptions): Promise<Result<string>>;
  generateJSON<T>(prompt: string, schema: z.Schema<T>, options?: GenOptions): Promise<Result<T>>;
}
