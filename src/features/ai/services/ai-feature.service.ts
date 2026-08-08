import { aiService } from '@/lib/ai/ai.service';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { Result, fail, ok } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { 
  CarePlannerInput, ServiceCatalogInput, ServiceCatalogOutput, ServiceCatalogOutputSchema,
  MarketingInput, MarketingOutput, MarketingOutputSchema, 
  MeetingNotesOutput, MeetingNotesOutputSchema, CRMInsightsOutput, CRMInsightsOutputSchema 
} from '../types';

export class AIFeatureService {
  private workspaceService: WorkspaceService;

  constructor(workspaceService?: WorkspaceService) {
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertAIModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'ai');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('AI Assistant module is disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async generateCarePlan(workspaceId: string, input: CarePlannerInput): Promise<Result<string>> {
    const check = await this.assertAIModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    const workspaceRes = await this.workspaceService.getWorkspaceById(workspaceId);
    const industry = workspaceRes.data?.industryType || 'General Service';

    const prompt = `You are a professional care and post-treatment planner for a business in the "${industry}" sector. 
Generate a comprehensive, client-friendly Care & Post-Treatment Guide based on the following details:
- Client Name: ${input.clientName}
- Treatment/Service Received: ${input.treatmentReceived}
- Client Condition/Specifics: ${input.conditionDetails}
${input.specialInstructions ? `- Special Requests/Notes: ${input.specialInstructions}` : ''}
- Tone: ${input.tone} (make it feel highly reassuring and helpful)

Respond ONLY with a clear, well-structured Markdown document containing:
1. Executive Care Overview (Warm greeting and summary of the treatment benefits)
2. Immediate Post-Care Instructions (The first 24-48 hours rules: what to do, what to avoid)
3. Ongoing Home Care & Daily Routine (Long-term habits, cleaning/maintenance instructions, recommended routines)
4. Recommended Products or Supplies (Specific product categories that aid recovery or maintain results)
5. Warning Signs & FAQs (When to call the shop/clinic, normal vs. abnormal symptoms)
6. Next Recommended Appointment (Timeline suggestion for follow-up or touchup)

Do not wrap it in JSON. Return the raw Markdown text.`;

    return aiService.generateText(prompt);
  }

  async generateServiceCatalog(workspaceId: string, input: ServiceCatalogInput): Promise<Result<ServiceCatalogOutput>> {
    const check = await this.assertAIModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    const workspaceRes = await this.workspaceService.getWorkspaceById(workspaceId);
    const industry = workspaceRes.data?.industryType || 'General Service';

    const prompt = `You are a product developer and business operations advisor for a company in the "${industry}" sector.
Generate a list of 3 highly appealing, optimized new services for our service catalog based on:
- Focus/Keyword/Category: ${input.serviceKeyword}
- Target Clientele: ${input.targetClientele}
- Pricing Tier: ${input.pricingLevel}
${input.additionalPreferences ? `- Additional Preferences: ${input.additionalPreferences}` : ''}

Generate a JSON object conforming exactly to this schema:
{
  "suggestedServices": [
    {
      "name": "Catchy service name that appeals to clients in the ${industry} sector",
      "category": "Broad catalog category name",
      "description": "Engaging client-facing description highlighting key benefits and experience. Keep under 200 characters.",
      "durationMinutes": number (suggested service length in minutes, e.g., 30, 45, 60, 90),
      "suggestedPrice": number (suggested price in USD matching the ${input.pricingLevel} pricing level)
    }
  ]
}`;

    return aiService.generateJSON(prompt, ServiceCatalogOutputSchema);
  }

  async generateMarketingCopy(workspaceId: string, input: MarketingInput): Promise<Result<MarketingOutput>> {
    const check = await this.assertAIModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    const workspaceRes = await this.workspaceService.getWorkspaceById(workspaceId);
    const industry = workspaceRes.data?.industryType || 'General Service';

    const prompt = `You are a professional marketing copywriter and social media director for a business in the "${industry}" sector. 
Generate high-converting marketing copy based on these details:
- Product/Service Name: ${input.productName}
- Description: ${input.description}
${input.offerDiscount ? `- Offer/Discount: ${input.offerDiscount}` : ''}
- Target Audience: ${input.targetAudience}
- Platform: ${input.platform}
- Tone: ${input.tone}
- Desired Length: ${input.length}

Generate a JSON object conforming exactly to this schema:
{
  "mainCopy": "The primary copy text with emojis and formatted lines. Ensure it uses typical phrasing, terminology, and hashtags relevant to the ${industry} industry.",
  "cta": "A strong call to action phrase tailored to this promo",
  "hashtags": ["list", "of", "relevant", "hashtags", "including", "industry", "specific", "ones"],
  "shortVariation": "An optional short, punchy version under 150 characters for SMS or stories"
}`;

    return aiService.generateJSON(prompt, MarketingOutputSchema);
  }

  async extractTasksFromNotes(workspaceId: string, notes: string): Promise<Result<MeetingNotesOutput>> {
    const check = await this.assertAIModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    const workspaceRes = await this.workspaceService.getWorkspaceById(workspaceId);
    const industry = workspaceRes.data?.industryType || 'General Service';

    const prompt = `You are an AI assistant integrated into a business dashboard for a company in the "${industry}" sector.
Extract actionable tasks from the following meeting/discussion notes:

--- NOTES START ---
${notes}
--- NOTES END ---

Output a JSON object containing a list of tasks. For each task, extract:
- title: clear task name
- description: concise details of what needs to be done
- priority: one of "Low", "Medium", "High", "Urgent"
- category: one of "Operations", "Administration", "Finance", "Sales", "Marketing", "HR", "IT", "Maintenance", "Cleaning", "General" (Prefer categories matching typical workflows in the ${industry} sector)
- dueDate: Optional due date if explicitly mentioned in format "YYYY-MM-DD", otherwise null.

Format schema:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "Low" | "Medium" | "High" | "Urgent",
      "category": "string",
      "dueDate": "string" | null
    }
  ]
}`;

    return aiService.generateJSON(prompt, MeetingNotesOutputSchema);
  }

  async generateCustomerInsights(
    workspaceId: string,
    customerData: {
      fullName: string;
      totalVisits: number;
      lifetimeSpent: number;
      notes: string[];
      appointmentHistory: string[];
    }
  ): Promise<Result<CRMInsightsOutput>> {
    const check = await this.assertAIModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    const workspaceRes = await this.workspaceService.getWorkspaceById(workspaceId);
    const industry = workspaceRes.data?.industryType || 'General Service';

    const prompt = `You are an expert CRM consultant specializing in customer retention and LTV growth for local businesses in the "${industry}" industry. 
Analyze the following customer profile to generate actionable business insights:
- Customer Name: ${customerData.fullName}
- Total Visits: ${customerData.totalVisits}
- Lifetime Spent: $${customerData.lifetimeSpent}
- Internal Staff Notes: ${customerData.notes.join(' | ') || 'None'}
- Past Appointment Services: ${customerData.appointmentHistory.join(', ') || 'None'}

Provide a JSON object with:
{
  "keySummary": "A concise 1-2 sentence summary of this customer's profile, value, and key interests in our ${industry} services.",
  "importantBehavior": "Key observations about their visit patterns, spending habits, or specific service preferences.",
  "suggestedFollowUp": "1 specific, actionable step our team can take (e.g. recommend a specific hair treatment, send a booking link for service maintenance, follow up on a medical note) to retain or upsell this client."
}`;

    return aiService.generateJSON(prompt, CRMInsightsOutputSchema);
  }
}
