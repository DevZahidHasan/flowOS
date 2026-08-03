import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowOS | AI-Powered Business Operating System',
  description: 'Modular Business Operating System for modern enterprises across all industries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
