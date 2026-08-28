import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blue Brilliant — Boia de Monitoramento e Detecção de Espécies Invasoras',
  description:
    'Boia inteligente para delimitação de biodiversidade e detecção precoce de espécies invasoras. Sensoriamento físico-químico, sonar de perímetro e auto-amostrador de eDNA.',
  openGraph: {
    title: 'Blue Brilliant',
    description: 'Monitorar o que não se vê. Proteger o que ainda está vivo.',
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
