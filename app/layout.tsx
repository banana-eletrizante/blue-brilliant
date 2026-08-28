import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blue Brilliant — Peixonautas',
  description:
    'Blue Brilliant by Peixonautas. Boia inteligente para delimitacao de biodiversidade e deteccao precoce de especies invasoras.',
  openGraph: {
    title: 'Blue Brilliant — Peixonautas',
    description: 'Monitorar o que nao se ve. Proteger o que ainda esta vivo.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
