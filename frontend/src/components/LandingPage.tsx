import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import FeaturedGrants from './FeaturedGrants';
import StatusCheck from './StatusCheck';
import Footer from './Footer';

interface LandingPageProps {
  onStartApplication: () => void;
}

export default function LandingPage({ onStartApplication }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <Header />
      <main>
        <Hero onStart={onStartApplication} />
        <HowItWorks />
        <FeaturedGrants />
        <StatusCheck />
      </main>
      <Footer />
    </div>
  );
}
