import Dashboard from "./pages/Dashboard.jsx";
import { PredictionProvider } from "./context/PredictionContext.jsx";
import NotificationStack from "./components/NotificationStack.jsx";

const App = () => (
  <PredictionProvider>
    <div className="min-h-screen bg-slate-50">
      <NotificationStack />
      <Dashboard />
    </div>
  </PredictionProvider>
);

export default App;

