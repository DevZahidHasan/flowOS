import Image from 'next/image';
import { Workspace } from '@/types/global';

export interface InvoicingBrandingSettings {
  companyName: string;
  companyLogoUrl: string | null;
  businessAddress: string;
  email: string;
  phone: string;
  website: string;
  taxNumber?: string;
  thankYouMessage?: string;
}

interface Props {
  workspace: Workspace;
  moduleSettings?: Record<string, unknown>;
}

export function getBrandingSettings(workspace: Workspace, settings?: Record<string, unknown>): InvoicingBrandingSettings {
  return {
    companyName: (settings?.companyName as string) || workspace.name,
    companyLogoUrl: (settings?.companyLogoUrl as string) || workspace.logoUrl || null,
    businessAddress: (settings?.businessAddress as string) || '123 Business Rd, Suite 100, Metropolis, NY 10001',
    email: (settings?.email as string) || `billing@${workspace.slug}.com`,
    phone: (settings?.phone as string) || '+1 (555) 019-2834',
    website: (settings?.website as string) || `www.${workspace.slug}.com`,
    taxNumber: (settings?.taxNumber as string) || 'US-123456789',
    thankYouMessage: (settings?.thankYouMessage as string) || 'Thank you for your business!',
  };
}

export function InvoiceBranding({ workspace, moduleSettings }: Props) {
  const branding = getBrandingSettings(workspace, moduleSettings);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b">
      {/* Company Logo and Name */}
      <div className="flex items-center gap-3">
        {branding.companyLogoUrl ? (
          <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-background flex items-center justify-center">
            <Image
              src={branding.companyLogoUrl}
              alt={branding.companyName}
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-lg border border-primary/20">
            {branding.companyName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            {branding.companyName}
          </h2>
          {branding.taxNumber && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Tax ID: {branding.taxNumber}
            </p>
          )}
        </div>
      </div>

      {/* Company Contact & Address */}
      <div className="text-xs text-muted-foreground sm:text-right space-y-1">
        <p className="font-medium text-foreground whitespace-pre-line leading-relaxed">
          {branding.businessAddress}
        </p>
        <p>{branding.email}</p>
        <p>{branding.phone}</p>
        <p>{branding.website}</p>
      </div>
    </div>
  );
}
