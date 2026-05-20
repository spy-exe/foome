import { ComoFunciona } from '@/components/ComoFunciona';
import { Features } from '@/components/Features';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ComoFunciona />
      </main>
    </>
  );
}
