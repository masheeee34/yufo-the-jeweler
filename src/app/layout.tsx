import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SmoothScroll } from '../components/SmoothScroll';
import { getSettings } from '../lib/settings';

// Polices hébergées dans le projet (versions variables « latin », licence OFL) :
// la compilation ne dépend plus de Google Fonts.
const cinzel = localFont({
  src: './fonts/cinzel.woff2',
  weight: '400 900',
  variable: '--font-cinzel',
  display: 'swap',
});

const playfair = localFont({
  src: './fonts/playfair.woff2',
  weight: '400 900',
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = localFont({
  src: './fonts/jakarta.woff2',
  weight: '200 800',
  variable: '--font-sans',
  display: 'swap',
});

// Titre, description et icône d'onglet réglables depuis Management › General (relus toutes les 60 s).
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { site } = getSettings();
  return {
    title: site.title,
    description: site.description,
    icons: { icon: site.favicon },
  };
}

export const viewport: Viewport = {
  themeColor: '#151515',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${playfair.variable} ${plusJakarta.variable} dark`}>
      <body className="bg-[#151515] text-[#E3E3E3] font-sans antialiased selection:bg-white selection:text-black min-h-screen relative">
        <SmoothScroll />
        {/* Subtle Film Grain Noise Texture Overlay to eliminate flat digital CSS feel */}
        <div 
          className="fixed inset-0 pointer-events-none z-50 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
        {children}
      </body>
    </html>
  );
}
