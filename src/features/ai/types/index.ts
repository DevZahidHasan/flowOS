import { z } from 'zod';

// AI Care & Treatment Planner Schema
export const CarePlannerInputSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  treatmentReceived: z.string().min(1, 'Treatment or service received is required'),
  conditionDetails: z.string().min(1, 'Client condition/specific details are required'),
  specialInstructions: z.string().optional(),
  tone: z.string().default('caring'),
});
export type CarePlannerInput = z.infer<typeof CarePlannerInputSchema>;

// AI Service Catalog Generator Schema
export const ServiceCatalogInputSchema = z.object({
  serviceKeyword: z.string().min(1, 'Service keyword or category is required'),
  targetClientele: z.string().min(1, 'Target clientele description is required'),
  pricingLevel: z.enum(['Budget', 'Standard', 'Premium']).default('Standard'),
  additionalPreferences: z.string().optional(),
});
export type ServiceCatalogInput = z.infer<typeof ServiceCatalogInputSchema>;

export const GeneratedServiceSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  durationMinutes: z.number(),
  suggestedPrice: z.number(),
});

export const ServiceCatalogOutputSchema = z.object({
  suggestedServices: z.array(GeneratedServiceSchema),
});
export type ServiceCatalogOutput = z.infer<typeof ServiceCatalogOutputSchema>;

// Marketing Copy Schema
export const MarketingInputSchema = z.object({
  productName: z.string().min(1, 'Product or service name is required'),
  description: z.string().min(1, 'Description is required'),
  offerDiscount: z.string().optional(),
  targetAudience: z.string().min(1, 'Target audience is required'),
  platform: z.enum(['Instagram', 'Facebook', 'Email']),
  tone: z.string().default('engaging'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
});
export type MarketingInput = z.infer<typeof MarketingInputSchema>;

export const MarketingOutputSchema = z.object({
  mainCopy: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  shortVariation: z.string().optional(),
});
export type MarketingOutput = z.infer<typeof MarketingOutputSchema>;

// Meeting Notes -> Tasks Schema
export const ExtractedTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  category: z.string(),
  dueDate: z.string().nullable().optional(),
});

export const MeetingNotesOutputSchema = z.object({
  tasks: z.array(ExtractedTaskSchema),
});
export type MeetingNotesOutput = z.infer<typeof MeetingNotesOutputSchema>;

// CRM Customer Insights Schema
export const CRMInsightsOutputSchema = z.object({
  keySummary: z.string(),
  importantBehavior: z.string(),
  suggestedFollowUp: z.string(),
});
export type CRMInsightsOutput = z.infer<typeof CRMInsightsOutputSchema>;
