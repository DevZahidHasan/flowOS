'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/features/crm/types';
import { Service } from '@/features/services/types';
import { createInvoiceAction } from '@/features/invoices/actions/invoice.actions';
import { CreateInvoiceInput } from '@/features/invoices/validations/invoice.schema';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';
import { useToast } from '@/hooks/use-toast';

interface Props {
  workspaceId: string;
  workspaceSlug: string;
  customers: Customer[];
  services: Service[];
}

export function NewInvoiceClientWrapper({ workspaceId, workspaceSlug, customers, services }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: CreateInvoiceInput) => {
    setIsSubmitting(true);
    try {
      const result = await createInvoiceAction(data);
      if (result.error) {
        toast({
          title: "Error creating invoice",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Invoice created",
        description: `Invoice ${result.data.invoice_number} has been created successfully.`,
      });

      // Redirect back to dashboard for now
      router.push(`/${workspaceSlug}`);
      router.refresh();
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InvoiceForm
      workspaceId={workspaceId}
      customers={customers}
      services={services}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
}
