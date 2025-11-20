import { usePrediction } from "../context/PredictionContext.jsx";

const typeStyles = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-300",
  error: "bg-rose-100 text-rose-700 border-rose-300",
  info: "bg-blue-100 text-blue-700 border-blue-300",
};

const NotificationStack = () => {
  const { notifications } = usePrediction();

  if (!notifications.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {notifications.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[220px] rounded-xl border px-4 py-3 shadow-lg ${
            typeStyles[toast.type] ?? typeStyles.info
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationStack;

