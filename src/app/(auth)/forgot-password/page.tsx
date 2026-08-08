'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Log error but show generic message anyway to protect user emails
        console.error(error);
      }

      setSubmitted(true);
      toast({
        title: 'Request Received',
        description: "If an account exists with this email, we've sent password reset instructions.",
      });
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">Reset Password</CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            Enter your email to request a reset link
          </CardDescription>
        </CardHeader>
        {submitted ? (
          <CardContent className="text-center text-sm text-slate-300 leading-relaxed py-6 space-y-4">
            <p>If an account exists with this email, we&apos;ll send password reset instructions shortly.</p>
            <p className="text-xs text-slate-500">Please check your inbox (and spam folder) for the link.</p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@business.com"
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[44px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <Link href="/login" className="inline-flex items-center text-sm text-emerald-400 hover:underline gap-1.5 justify-center">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
