import { Button } from '@/components/ui/button';
import { logoutFormAction } from '@/features/auth/actions/auth.actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-500 border border-red-500/30 shadow-lg shadow-red-500/10">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">Account Suspended</CardTitle>
          <CardDescription className="text-slate-400">
            Your account access is suspended.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-slate-300 leading-relaxed">
          Your FlowOS account has been suspended by a platform administrator. Please contact FlowOS support to resolve your account status.
        </CardContent>
        <CardFooter className="flex justify-center">
          <form action={logoutFormAction} className="w-full">
            <Button type="submit" variant="outline" className="w-full border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
