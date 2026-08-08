import { GroqAIService } from './GroqAIService';
import { IAIService } from './IAIService';

export const aiService: IAIService = new GroqAIService();
