import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import './globals.css';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  'your-google-client-id.apps.googleusercontent.com';

export const metadata = {
  title: 'ReachInbox — Email Scheduler Dashboard',
  description: 'Production-grade cold email job scheduler and queue dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F9FAFB] text-gray-900 antialiased font-sans">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
          <Toaster richColors position="top-right" />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
