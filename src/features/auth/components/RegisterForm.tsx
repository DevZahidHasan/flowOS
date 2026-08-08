'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupSchemaType } from '../types';
import { signupAction } from '../actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupSchemaType) => {
    setLoading(true);
    const res = await signupAction(values);
    
    if (res.error) {
      toast({
        title: 'Registration Failed',
        description: res.error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Account Created',
        description: 'Your registration was submitted successfully and is pending administrator approval.',
      });
      router.push('/account/pending');
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/30">
          <span className="text-xl font-bold text-white">F</span>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-100">Create your Account</CardTitle>
        <CardDescription className="text-slate-400 font-medium">
          Start operating your business with FlowOS
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[44px]"
              disabled={loading}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@business.com"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[44px]"
              disabled={loading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[44px]"
              disabled={loading}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[44px]"
              disabled={loading}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Creating Account...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-400 hover:underline font-semibold">
              Sign In
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
