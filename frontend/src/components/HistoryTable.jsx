import { usePrediction } from "../context/PredictionContext.jsx";

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const HistoryTable = () => {
  const { history } = usePrediction();

  if (!history.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        No prior predictions this session.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">Recent scans</h3>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-400">
          <tr>
            <th className="py-2">Time</th>
            <th className="py-2">Prediction</th>
            <th className="py-2">Probability</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id} className="border-t border-slate-100">
              <td className="py-2 text-slate-500">{formatTime(entry.timestamp)}</td>
              <td
                className={`py-2 font-medium ${
                  entry.prediction === "Positive"
                    ? "text-rose-600"
                    : "text-emerald-600"
                }`}
              >
                {entry.prediction}
              </td>
              <td className="py-2 text-slate-700">
                {(entry.probability * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;

