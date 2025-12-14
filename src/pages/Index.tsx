import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TokenCreatorForm from '@/components/TokenCreatorForm';
import FeaturesSection from '@/components/FeaturesSection';
import LiquiditySection from '@/components/LiquiditySection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
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