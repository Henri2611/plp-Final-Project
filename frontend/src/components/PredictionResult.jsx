import { usePrediction } from "../context/PredictionContext.jsx";

const ProbabilityBar = ({ probability }) => (
  <div className="mt-4">
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>0%</span>
      <span>100%</span>
    </div>
    <div className="mt-1 h-3 rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full ${
          probability >= 0.5 ? "bg-rose-500" : "bg-emerald-500"
        }`}
        style={{ width: `${Math.round(probability * 100)}%` }}
      />
    </div>
  </div>
);

const PredictionResult = () => {
  const { result, isLoading, error } = usePrediction();

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Latest Reading</h2>
      <p className="text-sm text-slate-500">AI-assisted classification</p>

      {isLoading && (
        <p className="mt-8 animate-pulse text-sm text-slate-500">
          Processing X-ray...
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {result ? (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs uppercase text-slate-400">Prediction</p>
            <p
              className={`text-3xl font-bold ${
                result.prediction === "Positive"
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {result.prediction}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Confidence</p>
            <p className="text-2xl font-semibold text-slate-800">
              {(result.probability * 100).toFixed(1)}%
            </p>
            <ProbabilityBar probability={result.probability} />
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Clinical notes</p>
            <p>
              Cross-check with patient vitals before prescribing antibiotics.
              Consider follow-up CT if symptoms persist beyond 72 hours.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Upload an image to see AI insights here.
        </div>
      )}
    </section>
  );
};

export default PredictionResult;

