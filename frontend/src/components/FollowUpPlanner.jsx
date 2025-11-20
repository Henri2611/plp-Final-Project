import { useState } from "react";
import { usePrediction } from "../context/PredictionContext.jsx";

const defaultTasks = [
  { id: crypto.randomUUID(), label: "Re-assess symptoms", completed: false },
  { id: crypto.randomUUID(), label: "Repeat X-ray in 48h", completed: false },
  { id: crypto.randomUUID(), label: "Check inflammatory markers", completed: false },
];

const FollowUpPlanner = () => {
  const [tasks, setTasks] = useState(defaultTasks);
  const [reminders, setReminders] = useState([]);
  const [note, setNote] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const { pushNotification } = usePrediction();

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addReminder = (event) => {
    event.preventDefault();
    if (!note.trim() || !reminderAt) return;
    setReminders((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        note: note.trim(),
        reminderAt,
      },
    ]);
    pushNotification({ type: "info", message: "Follow-up reminder added." });
    setNote("");
    setReminderAt("");
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">Follow-up planner</h3>
      <p className="text-xs text-slate-500">
        Track next steps before handing off or discharging the patient.
      </p>

      <div className="mt-4 space-y-2">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <span className={task.completed ? "line-through text-slate-400" : ""}>
              {task.label}
            </span>
          </label>
        ))}
      </div>

      <form onSubmit={addReminder} className="mt-6 space-y-3">
        <div>
          <label className="text-xs uppercase text-slate-400">Reminder note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Call patient to confirm response to antibiotics"
            className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400">When</label>
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-brand text-white py-2 text-sm font-semibold shadow-brand/40 hover:bg-brand-dark"
        >
          Schedule follow-up
        </button>
      </form>

      {reminders.length > 0 && (
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          {reminders.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <p className="font-medium">{item.note}</p>
              <p className="text-xs text-slate-400">
                {new Date(item.reminderAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FollowUpPlanner;

