import Navbar from "../components/Navbar.jsx";
import UploadForm from "../components/UploadForm.jsx";
import PredictionResult from "../components/PredictionResult.jsx";
import AnnotationPanel from "../components/AnnotationPanel.jsx";
import HistoryTable from "../components/HistoryTable.jsx";
import GuidelineReminders from "../components/GuidelineReminders.jsx";
import FollowUpPlanner from "../components/FollowUpPlanner.jsx";

const Dashboard = () => (
  <>
    <Navbar />
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 lg:grid-cols-2">
          <UploadForm />
          <PredictionResult />
        </div>
        <FollowUpPlanner />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnnotationPanel />
        <HistoryTable />
        <GuidelineReminders />
      </section>
    </main>
  </>
);

export default Dashboard;

