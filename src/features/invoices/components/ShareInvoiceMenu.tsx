'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Share2, Link as LinkIcon, Mail, MessageSquare, Check, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  invoiceId: string;
  workspaceSlug: string;
}

export function ShareInvoiceMenu({ invoiceId, workspaceSlug }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    // Public share route (to be implemented/allowed publicly in future)
    return `${window.location.origin}/share/invoices/${invoiceId}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link Copied',
        description: 'Public share link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  const handleFutureShare = (channel: string) => {
    toast({
      title: 'Sharing coming soon',
      description: `Direct share via ${channel} will be available in a future update.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 focus-visible:ring-2 focus-visible:ring-ring">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* Active: Copy link */}
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4" />
              Copy Share Link
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Future Sharing Options */}
        <DropdownMenuItem
          disabled
          onClick={() => handleFutureShare('Email')}
          className="gap-2 text-muted-foreground"
        >
          <Mail className="h-4 w-4" />
          Email Invoice
          <span className="ml-auto text-[10px] border rounded px-1">Soon</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled
          onClick={() => handleFutureShare('WhatsApp')}
          className="gap-2 text-muted-foreground"
        >
          <MessageSquare className="h-4 w-4" />
          WhatsApp Share
          <span className="ml-auto text-[10px] border rounded px-1">Soon</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled
          onClick={() => handleFutureShare('SMS')}
          className="gap-2 text-muted-foreground"
        >
          <Phone className="h-4 w-4" />
          SMS Link
          <span className="ml-auto text-[10px] border rounded px-1">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
