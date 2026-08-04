'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/features/crm/types';
import { Service } from '@/features/services/types';
import { createInvoiceAction } from '../actions/invoice.actions';
import { CreateInvoiceInput } from '../validations/invoice.schema';
import { InvoiceForm } from './InvoiceForm';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Props {
  workspaceId: string;
  customers: Customer[];
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateInvoiceSheet({ workspaceId, customers, services, isOpen, onClose, onSuccess }: Props) {
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
        description: `Invoice ${result.data.invoice_number} has been drafted successfully.`,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
        Using w-full on mobile (acts like a full screen/bottom sheet) 
        and sm:max-w-3xl for desktop (right-side sheet).
      */}
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto bg-background p-0 sm:p-6" side="right">
        <SheetHeader className="p-6 sm:p-0 mb-6 border-b sm:border-0 sticky top-0 bg-background/95 backdrop-blur z-10">
          <SheetTitle className="text-2xl font-bold tracking-tight">Create Invoice</SheetTitle>
        </SheetHeader>
        
        <div className="px-6 sm:px-0 pb-12">
          <InvoiceForm
            workspaceId={workspaceId}
            customers={customers}
            services={services}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
