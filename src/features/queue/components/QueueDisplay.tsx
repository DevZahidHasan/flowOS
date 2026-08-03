'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueueToken } from '../types';
import { createQueueTokenAction, updateQueueTokenStatusAction } from '../actions/queue.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  workspaceId: string;
  initialTokens: QueueToken[];
}

export function QueueDisplay({ workspaceId, initialTokens }: Props) {
  const router = useRouter();
  const [tokens, setTokens] = useState<QueueToken[]>(initialTokens);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      alert(res.error.message);
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
    const res = await updateQueueTokenStatusAction({
      workspaceId,
      tokenId,
      status,
    });

    if (res.error) {
      alert(res.error.message);
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Live Queue Monitor</h2>
          <p className="text-xs text-slate-400">Manage real-time customer tokens and waiting list</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleCallNext}
            disabled={waitingTokens.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold min-h-[44px] flex-1 sm:flex-none"
          >
            🔊 Call Next Token
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="min-h-[44px] flex-1 sm:flex-none border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            🎟️ Issue Token
          </Button>
        </div>
      </div>

      {/* Main Grid: Now Serving Hero + Waiting List */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Now Serving Hero Display */}
        <Card className="md:col-span-1 border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-purple-400">
              Now Serving Token
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {nowServing ? (
              <div className="space-y-3">
                <div className="inline-block rounded-2xl bg-purple-500/20 border border-purple-500/40 px-6 py-4 shadow-inner">
                  <span className="text-5xl font-extrabold text-white tracking-wider">
                    {nowServing.tokenNumber}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{nowServing.customerName}</h3>
                  <p className="text-xs text-slate-400">{nowServing.serviceName || 'General Service'}</p>
                </div>
                <div className="pt-2 flex justify-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(nowServing.id, 'COMPLETED')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] text-xs font-semibold px-4"
                  >
                    Complete Service ✓
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <span className="text-4xl block">⏳</span>
                <p className="text-sm font-semibold text-slate-300">No token currently serving</p>
                <p className="text-xs text-slate-500">Click &quot;Call Next Token&quot; to serve waiting customers.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting List Column */}
        <Card className="md:col-span-2 border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-white">Waiting Queue</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {waitingTokens.length} customer(s) waiting in line
              </CardDescription>
            </div>
            <Badge variant="default">{waitingTokens.length} Waiting</Badge>
          </CardHeader>
          <CardContent>
            {waitingTokens.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Queue is empty. Issue a token to get started.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {waitingTokens.map((token, idx) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-slate-950/60 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-800 text-purple-300 font-bold text-sm border border-purple-500/20">
                        {token.tokenNumber}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{token.customerName}</p>
                        <p className="text-xs text-slate-400">
                          {token.serviceName || 'General'} • Position #{idx + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusChange(token.id, 'SERVING')}
                        className="min-h-[44px] text-xs"
                      >
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(token.id, 'CANCELLED')}
                        className="min-h-[44px] text-xs text-red-400 hover:bg-red-500/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Token Mobile Bottom Sheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Issue Queue Token</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueToken} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="qCustName">Customer Name</Label>
                <Input
                  id="qCustName"
                  placeholder="e.g. David Miller"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qPhone">Phone Number (Optional)</Label>
                <Input
                  id="qPhone"
                  placeholder="+1 (555) 000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qService">Requested Service (Optional)</Label>
                <Input
                  id="qService"
                  placeholder="e.g. Consultation / Repair"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="min-h-[44px]">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="min-h-[44px]">
                  {loading ? 'Issuing...' : 'Generate Token'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
