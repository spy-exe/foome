import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Foome - Comida boa, na hora certa',
  description:
    'App de delivery de comida. Descubra restaurantes perto de você, peça com um toque e acompanhe seu pedido em tempo real.',
  keywords: ['delivery', 'comida', 'restaurante', 'app', 'react native', 'expo'],
  openGraph: {
    title: 'Foome - Comida boa, na hora certa',
    description: 'Descubra restaurantes, peça com um toque, acompanhe em tempo real.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
