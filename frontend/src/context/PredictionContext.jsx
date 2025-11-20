import { createContext, useContext, useState } from "react";

const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const pushNotification = (payload) => {
    setNotifications((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 4000);
  };

  const updatePrediction = (data) => {
    const entry = {
      id: crypto.randomUUID(),
      ...data,
      timestamp: new Date().toISOString(),
    };
    setResult(data);
    setHistory((prev) => [entry, ...prev].slice(0, 5));
    setError(null);
  };

  const addAnnotation = (note) => {
    setAnnotations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), note, createdAt: new Date().toISOString() },
    ]);
  };

  return (
    <PredictionContext.Provider
      value={{
        result,
        updatePrediction,
        history,
        annotations,
        addAnnotation,
        notifications,
        pushNotification,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error("usePrediction must be used within PredictionProvider");
  }
  return context;
};

