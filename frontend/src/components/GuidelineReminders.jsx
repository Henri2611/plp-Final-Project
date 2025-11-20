import { usePrediction } from "../context/PredictionContext.jsx";

const messages = {
  high: [
    "Check vitals + inflammatory markers before starting antibiotics.",
    "Request radiologist confirmation if no prior imaging available.",
  ],
  medium: [
    "Compare with previous scans to confirm trend.",
    "Consider follow-up X-ray in 24-48h if symptoms persist.",
  ],
  low: [
    "Correlate with clinical presentation before discharge.",
    "Educate patient on warning signs that require re-evaluation.",
  ],
};

const pickMessages = (probability) => {
  if (probability >= 0.8) return messages.high;
  if (probability >= 0.4) return messages.medium;
  return messages.low;
};

const GuidelineReminders = () => {
  const { result } = usePrediction();
  const activeMessages = pickMessages(result?.probability ?? 0.3);

  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-light to-white p-5">
      <p className="text-xs uppercase tracking-wide text-brand-dark">
        Clinical reminders
      </p>
      <h3 className="text-lg font-semibold text-slate-800">
        Next best actions
      </h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        {activeMessages.map((msg) => (
          <li key={msg} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-brand" />
            <span>{msg}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default GuidelineReminders;

