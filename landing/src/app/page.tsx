import { ComoFunciona } from '@/components/ComoFunciona';
import { Download } from '@/components/Download';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { Screenshots } from '@/components/Screenshots';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ComoFunciona />
        <Screenshots />
        <Download />
      </main>
      <Footer />
    </>
  );
}
