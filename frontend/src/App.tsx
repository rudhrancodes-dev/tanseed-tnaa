import { ApplicationProvider, useApplication } from './context/ApplicationContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Step1EntityEligibility from './components/Step1EntityEligibility';
import Step2Financials from './components/Step2Financials';
import Step3Documents from './components/Step3Documents';
import EligibilityDashboard from './components/EligibilityDashboard';
import ApplicationDraft from './components/ApplicationDraft';

function StepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Header />
      {children}
    </div>
  );
}

function AppRouter() {
  const { view, setView } = useApplication();

  switch (view) {
    case 'step1': return <StepLayout><Step1EntityEligibility /></StepLayout>;
    case 'step2': return <StepLayout><Step2Financials /></StepLayout>;
    case 'step3': return <StepLayout><Step3Documents /></StepLayout>;
    case 'results': return <StepLayout><EligibilityDashboard /></StepLayout>;
    case 'draft': return <StepLayout><ApplicationDraft /></StepLayout>;
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
