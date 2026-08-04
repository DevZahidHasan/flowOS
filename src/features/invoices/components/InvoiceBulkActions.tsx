'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bulkDeleteInvoicesAction, bulkUpdateInvoiceStatusAction } from '../actions/invoice.actions';
import { ChevronDown, Trash, Send, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  workspaceId: string;
  selectedIds: string[];
  onClearSelection: () => void;
}

export function InvoiceBulkActions({ workspaceId, selectedIds, onClearSelection }: Props) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  if (selectedIds.length === 0) return null;

  const handleAction = (
    actionFn: () => Promise<{ error: any }>,
    successMessage: string
  ) => {
    startTransition(async () => {
      const result = await actionFn();
      if (result.error) {
        toast({
          title: "Bulk Action Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: successMessage,
        });
        onClearSelection();
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border shadow-sm">
      <span className="text-sm font-medium whitespace-nowrap px-2">
        {selectedIds.length} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 data-[state=open]:bg-muted" disabled={isPending}>
            Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuItem 
            disabled={isPending}
            onClick={() => handleAction(
              () => bulkUpdateInvoiceStatusAction(workspaceId, selectedIds, 'SENT'),
              "Invoices marked as Sent"
            )}
          >
            <Send className="mr-2 h-4 w-4" /> Mark as Sent
          </DropdownMenuItem>
          <DropdownMenuItem 
            disabled={isPending}
            onClick={() => handleAction(
              () => bulkUpdateInvoiceStatusAction(workspaceId, selectedIds, 'PAID'),
              "Invoices marked as Paid"
            )}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
          </DropdownMenuItem>
          <DropdownMenuItem 
            disabled={isPending}
            onClick={() => handleAction(
              () => bulkUpdateInvoiceStatusAction(workspaceId, selectedIds, 'CANCELLED'),
              "Invoices Cancelled"
            )}
          >
            <XCircle className="mr-2 h-4 w-4" /> Cancel Invoices
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            disabled={isPending}
            className="text-destructive focus:text-destructive"
            onClick={() => handleAction(
              () => bulkDeleteInvoicesAction(workspaceId, selectedIds),
              "Draft invoices deleted"
            )}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete Drafts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
