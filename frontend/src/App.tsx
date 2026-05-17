import { ApplicationProvider, useApplication } from './context/ApplicationContext';
import LandingPage from './components/LandingPage';
import Step1EntityEligibility from './components/Step1EntityEligibility';
import Step2Financials from './components/Step2Financials';
import Step3Documents from './components/Step3Documents';
import EligibilityDashboard from './components/EligibilityDashboard';
import ApplicationDraft from './components/ApplicationDraft';

function AppRouter() {
  const { view, setView } = useApplication();

  switch (view) {
    case 'step1': return <Step1EntityEligibility />;
    case 'step2': return <Step2Financials />;
    case 'step3': return <Step3Documents />;
    case 'results': return <EligibilityDashboard />;
    case 'draft': return <ApplicationDraft />;
    default: return <LandingPage onStartApplication={() => setView('step1')} />;
  }
}

export default function App() {
  return (
    <ApplicationProvider>
      <AppRouter />
    </ApplicationProvider>
  );
}
