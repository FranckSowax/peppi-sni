import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveTicker } from '@/components/landing/LiveTicker';
import { ModuleCards } from '@/components/landing/ModuleCards';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LiveTicker />
      <main className="flex-1">
        <HeroSection />
        <ModuleCards />
      </main>
      <Footer />
    </div>
  );
}
