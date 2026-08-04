'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QueueToken } from '../types';
import { createQueueTokenAction, updateQueueTokenStatusAction } from '../actions/queue.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Ticket, Clock } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  workspaceId: string;
  initialTokens: QueueToken[];
}

export function QueueDisplay({ workspaceId, initialTokens }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<QueueToken[]>(initialTokens);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingTokenId, setActionLoadingTokenId] = useState<string | null>(null);

  const nowServing = tokens.find((t) => t.status === 'SERVING');
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const completedTokens = tokens.filter((t) => t.status === 'COMPLETED');

  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await createQueueTokenAction({
      workspaceId,
      customerName,
      customerPhone,
      serviceName,
    });

    setLoading(false);

    if (res.error) {
      toast({
        title: 'Failed to issue token',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    setCustomerName('');
    setCustomerPhone('');
    setServiceName('');
    setIsModalOpen(false);

    setTokens((prev) => [...prev, res.data]);
    router.refresh();
  };

  const handleStatusChange = async (tokenId: string, status: QueueToken['status']) => {
    setActionLoadingTokenId(tokenId);
    const res = await updateQueueTokenStatusAction({
      workspaceId,
      tokenId,
      status,
    });
    setActionLoadingTokenId(null);

    if (res.error) {
      toast({
        title: 'Status Update Failed',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, status } : t))
    );
    router.refresh();
  };

  const handleCallNext = async () => {
    if (waitingTokens.length === 0) return;
    const nextToken = waitingTokens[0];
    await handleStatusChange(nextToken.id, 'SERVING');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Live Queue Monitor</h2>
          <p className="text-muted-foreground mt-1">Manage real-time customer tokens and waiting list</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleCallNext}
            disabled={waitingTokens.length === 0}
            className="flex-1 sm:flex-none"
          >
            🔊 Call Next Token
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            🎟️ Issue Token
          </Button>
        </div>
      </div>

      {/* Main Grid: Now Serving Hero + Waiting List */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Now Serving Hero Display */}
        <Card className="md:col-span-1 shadow-md relative overflow-hidden bg-primary/5 border-primary/20">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex h-3 w-3 rounded-full bg-primary animate-ping" />
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-primary">
              Now Serving Token
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {nowServing ? (
              <div className="space-y-3">
                <div className="inline-block rounded-2xl bg-background border px-6 py-4 shadow-sm">
                  <span className="text-5xl font-extrabold text-foreground tracking-wider">
                    {nowServing.tokenNumber}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{nowServing.customerName}</h3>
                  <p className="text-xs text-muted-foreground">{nowServing.serviceName || 'General Service'}</p>
                </div>
                <div className="pt-2 flex justify-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(nowServing.id, 'COMPLETED')}
                    disabled={actionLoadingTokenId !== null}
                    className="px-4"
                  >
                    {actionLoadingTokenId === nowServing.id ? 'Completing...' : 'Complete Service ✓'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <EmptyState
                  icon={Clock}
                  title="Nobody is being served"
                  description="The next issued token will appear here automatically."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting List Column */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b mb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Waiting Queue</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {waitingTokens.length} customer(s) waiting in line
              </CardDescription>
            </div>
            <Badge variant="secondary">{waitingTokens.length} Waiting</Badge>
          </CardHeader>
          <CardContent>
            {waitingTokens.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Ticket}
                  title="Queue is empty"
                  description="Issue a new token to begin serving customers."
                  action={
                    <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto min-h-[44px]">
                      Issue Token
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {waitingTokens.map((token, idx) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border bg-background hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground font-bold text-sm">
                        {token.tokenNumber}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{token.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {token.serviceName || 'General'} • Position #{idx + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={actionLoadingTokenId !== null}
                        onClick={() => handleStatusChange(token.id, 'SERVING')}
                      >
                        {actionLoadingTokenId === token.id ? 'Calling...' : 'Call'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoadingTokenId !== null}
                        onClick={() => handleStatusChange(token.id, 'CANCELLED')}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {actionLoadingTokenId === token.id ? '...' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Token Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Queue Token</DialogTitle>
            <DialogDescription>
              Generate a new token for a waiting customer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleIssueToken} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qCustName">Customer Name</Label>
              <Input
                id="qCustName"
                placeholder="e.g. David Miller"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qPhone">Phone Number (Optional)</Label>
              <Input
                id="qPhone"
                placeholder="+1 (555) 000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qService">Requested Service (Optional)</Label>
              <Input
                id="qService"
                placeholder="e.g. Consultation / Repair"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Issuing...' : 'Generate Token'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
