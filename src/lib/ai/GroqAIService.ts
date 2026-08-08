import Groq from 'groq-sdk';
import { Result, ok, fail } from '../result/result';
import { AppErrorFactory } from '../errors/app-error';
import { IAIService } from './IAIService';
import { GenOptions, DEFAULT_AI_MODEL } from './types';
import { z } from 'zod';

export class GroqAIService implements IAIService {
  private client: Groq | null = null;

  private getClient(): Result<Groq> {
    if (this.client) return ok(this.client);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_groq_api_key_here')) {
      return fail(AppErrorFactory.internal(
        'Groq API key is missing or not configured. Please add GROQ_API_KEY to your environment variables.',
        'AI_NOT_CONFIGURED'
      ));
    }

    try {
      this.client = new Groq({ apiKey });
      return ok(this.client);
    } catch (err) {
      return fail(AppErrorFactory.internal(
        'Failed to initialize Groq client: ' + String(err),
        'AI_INIT_FAILED'
      ));
    }
  }

  async generateText(prompt: string, options?: GenOptions): Promise<Result<string>> {
    const clientRes = this.getClient();
    if (clientRes.error) return fail(clientRes.error);
    const groq = clientRes.data;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: options?.model || DEFAULT_AI_MODEL,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        return fail(AppErrorFactory.internal('Groq API returned an empty text response.', 'AI_EMPTY_RESPONSE'));
      }

      return ok(responseText);
    } catch (err) {
      return fail(AppErrorFactory.internal(
        'AI generation failed: ' + (err instanceof Error ? err.message : String(err)),
        'AI_GENERATION_FAILED'
      ));
    }
  }

  async generateJSON<T>(prompt: string, schema: z.Schema<T>, options?: GenOptions): Promise<Result<T>> {
    const clientRes = this.getClient();
    if (clientRes.error) return fail(clientRes.error);
    const groq = clientRes.data;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are a precise data extractor. You must respond ONLY with a valid JSON object matching the requested schema. Do not output markdown, reasoning, backticks, or any conversational text.' 
          },
          { role: 'user', content: prompt }
        ],
        model: options?.model || DEFAULT_AI_MODEL,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        return fail(AppErrorFactory.internal('Groq API returned an empty JSON response.', 'AI_EMPTY_RESPONSE'));
      }

      let parsedData: unknown;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        return fail(AppErrorFactory.internal(
          'Failed to parse AI response as JSON. Raw response: ' + responseText,
          'AI_INVALID_JSON'
        ));
      }

      const validationRes = schema.safeParse(parsedData);
      if (!validationRes.success) {
        return fail(AppErrorFactory.internal(
          'AI response did not match validation schema: ' + validationRes.error.message,
          'AI_VALIDATION_FAILED'
        ));
      }

      return ok(validationRes.data);
    } catch (err) {
      return fail(AppErrorFactory.internal(
        'AI generation failed: ' + (err instanceof Error ? err.message : String(err)),
        'AI_GENERATION_FAILED'
      ));
    }
  }
}
