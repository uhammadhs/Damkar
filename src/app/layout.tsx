
"use client"

import { Roboto, Montserrat } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { cn } from '@/lib/utils';

const fontRoboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto',
});

const fontMontserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-montserrat',
});


// This is a client component, so we can't use metadata export
// export const metadata: Metadata = {
//   title: 'SIAP CUTI',
//   description: 'Sistem Informasi Approval Cuti',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SIAP CUTI</title>
        <meta name="description" content="Sistem Informasi Approval Cuti" />
      </head>
      <body className={cn("font-body antialiased", fontRoboto.variable, fontMontserrat.variable)}>
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
