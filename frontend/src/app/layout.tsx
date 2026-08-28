import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Dimy',
  description: 'Dimy Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-[#f8fafc] dark:bg-neutral-950 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <I18nProvider>
            {/* Background Mesh Gradient Efeito Fluent/Microsoft - Light Mode */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 dark:hidden">
              <div className="absolute -bottom-[30%] -right-[10%] w-[80%] h-[80%] rounded-[100%] bg-gradient-to-tl from-pink-400/70 via-purple-400/40 to-transparent blur-[100px] opacity-100" />
              <div className="absolute top-[0%] -left-[10%] w-[60%] h-[70%] rounded-[100%] bg-gradient-to-br from-cyan-300/50 via-blue-400/30 to-transparent blur-[120px] opacity-80" />
              <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] rounded-[100%] bg-blue-300/30 blur-[100px] opacity-60" />
            </div>

            {/* Background Glows - Dark Theme (Efeito Bacana) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block bg-gradient-to-br from-neutral-950 via-neutral-900/80 to-neutral-950">
              <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px]" />
              <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>
            
            <div className="relative z-10 flex flex-col min-h-screen">
              <AuthProvider>
                {children}
              </AuthProvider>
            </div>
            <Toaster position="top-center" richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
