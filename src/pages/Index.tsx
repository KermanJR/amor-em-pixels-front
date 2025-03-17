
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        {/*<Testimonials />*/}
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
