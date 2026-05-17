import Header from './Header';
import Hero from './Hero';
import StatusCheck from './StatusCheck';

interface LandingPageProps {
  onStartApplication: () => void;
}

export default function LandingPage({ onStartApplication }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero onStart={onStartApplication} />
      <StatusCheck />
    </div>
  );
}
