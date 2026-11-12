import { AiSection } from './components/sections/AiSection';
import { CaseStudy } from './components/sections/CaseStudy';
import { Footer } from './components/sections/Footer';
import { Funnel } from './components/sections/Funnel';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';
import { Method } from './components/sections/Method';
import { MobileCtaBar } from './components/sections/MobileCtaBar';
import { Pillars } from './components/sections/Pillars';
import { QuoteSection } from './components/sections/QuoteSection';
import { Tracking } from './components/sections/Tracking';

export default function App() {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-ink focus:shadow-panel"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <CaseStudy />
        <Funnel />
        <Tracking />
        <Pillars />
        <Method />
        <AiSection />
        <QuoteSection />
      </main>
      <Footer />
      <MobileCtaBar />
    </>
  );
}
