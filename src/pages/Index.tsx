import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TokenCreatorForm from '@/components/TokenCreatorForm';
import FeaturesSection from '@/components/FeaturesSection';
import LiquiditySection from '@/components/LiquiditySection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Index = () => {
  useScrollReveal();

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background noise">
      <Header />
      <main>
        <HeroSection />
        <TokenCreatorForm />
        <FeaturesSection />
        <LiquiditySection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;