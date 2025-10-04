import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fontSans } from '@/config/fonts';
import { AppProviders } from '@/components/app-providers';

export const metadata: Metadata = {
  title: 'FixIt | Book trusted local services',
  description: 'FixIt connects households with verified local service providers across cleaning, HVAC, plumbing and more.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProviders>
            <div className="flex min-h-screen flex-col">
              <header className="border-b bg-card/60 backdrop-blur">
                <div className="container-grid flex items-center justify-between py-4">
                  <a href="/" className="text-lg font-semibold">
                    FixIt
                  </a>
                  <nav className="flex items-center gap-3 text-sm font-medium">
                    <a href="/services" className="hover:text-primary">
                      Services
                    </a>
                    <a href="/bookings" className="hover:text-primary">
                      My bookings
                    </a>
                    <a href="/dashboard" className="hover:text-primary">
                      Provider
                    </a>
                    <a href="/admin" className="hover:text-primary">
                      Admin
                    </a>
                    <a
                      href="/auth/login"
                      className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-sm"
                    >
                      Sign in
                    </a>
                  </nav>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="border-t bg-card/60 py-6 text-sm text-muted-foreground">
                <div className="container-grid flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p>&copy; {new Date().getFullYear()} FixIt. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <a href="/privacy" className="hover:text-primary">
                      Privacy
                    </a>
                    <a href="/terms" className="hover:text-primary">
                      Terms
                    </a>
                    <a href="mailto:support@fixit.app" className="hover:text-primary">
                      Support
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </AppProviders>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
