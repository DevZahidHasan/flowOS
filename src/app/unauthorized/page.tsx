import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-500 border border-red-500/30 shadow-lg shadow-red-500/10">
            <ShieldX className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">Access Denied</CardTitle>
          <CardDescription className="text-slate-400">
            You do not have permission to access this area.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-slate-300 leading-relaxed">
          The page or operation you are trying to reach is restricted. Please verify you are logged in to the correct workspace account or have appropriate privileges.
        </CardContent>
        <CardFooter className="flex justify-center gap-3 w-full">
          <Link href="/" className="w-full">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
