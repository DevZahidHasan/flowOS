'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        window.location.href = '/';
      } else {
        setErrorMsg('Please check your email to confirm your account before logging in.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card text-card-foreground">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/30">
          <span className="text-xl font-bold text-white">F</span>
        </div>
        <CardTitle className="text-2xl font-bold gradient-text">Welcome Back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Log in to your FlowOS workspace account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm" role="alert">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have a workspace?{' '}
            <a href="/signup" className="text-primary hover:underline font-semibold">
              Create one now
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
