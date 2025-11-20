import { useState } from "react";
import { usePrediction } from "../context/PredictionContext.jsx";

const AnnotationPanel = () => {
  const [note, setNote] = useState("");
  const { annotations, addAnnotation, pushNotification } = usePrediction();

  const handleSave = (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    addAnnotation(note.trim());
    pushNotification({ type: "info", message: "Annotation saved locally." });
    setNote("");
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">Manual notes</h3>
      <p className="text-xs text-slate-500">
        Capture impressions before escalating to radiology.
      </p>

      <form className="mt-4 space-y-3" onSubmit={handleSave}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: Bilateral crackles, saturation 92%..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none"
          rows={3}
        />
        <button
          type="submit"
          className="w-full rounded-xl border border-brand bg-brand/10 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/20"
        >
          Save note
        </button>
      </form>

      {annotations.length > 0 && (
        <ul className="mt-4 space-y-2">
          {annotations.slice(-3).map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600"
            >
              <p>{item.note}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AnnotationPanel;

