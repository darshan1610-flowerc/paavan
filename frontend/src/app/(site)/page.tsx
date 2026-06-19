import Hero from '@/components/Hero';
import FeaturesStrip from '@/components/FeaturesStrip';
import VideoShowcase from '@/components/VideoShowcase';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturesStrip />
      <VideoShowcase />
      <Footer />
    </main>
  );
}
