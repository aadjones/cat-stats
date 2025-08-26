import { PetPersonalityAnalyzer, ErrorBoundary } from './components';

function App() {
  return (
    <ErrorBoundary>
      <PetPersonalityAnalyzer />
    </ErrorBoundary>
  );
}

export default App;
