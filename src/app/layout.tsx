import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// Load Inter font for non-Apple devices
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Harshal Portfolio',
  description:
    'Interactive portfolio with an AI-powered Memoji that answers questions about me, my skills, and my experience',
  keywords: [
    'Harshal',
    'Portfolio',
    'Developer',
    'AI',
    'Interactive',
    'Memoji',
    'Web Development',
    'Full Stack',
    'Next.js',
    'React',
  ],
  authors: [
    {
      name: 'Harshal',
      url: 'https://harshal.dev',
    },
  ],
  creator: 'Harshal',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://harshal.dev',
    title: 'Harshal Portfolio',
    description:
      'Interactive portfolio with an AI-powered Memoji that answers questions about me',
    siteName: 'Harshal Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harshal Portfolio',
    description:
      'Interactive portfolio with an AI-powered Memoji that answers questions about me',
    creator: '@harshal',
  },
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: 'any',
      },
    ],
    shortcut: '/favicon.png?v=2',
    apple: '/apple-touch-icon.svg?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <Script
          defer
          data-website-id="68e067ba369b1b7f1f096056"
          data-domain="toukoum.fr"
          data-allow-localhost="true"
          src="https://datafa.st/js/script.js"
        ></Script>
      </head>

      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
