import { useRef, useState } from "react";
import { predictPneumonia } from "../services/api.js";
import { usePrediction } from "../context/PredictionContext.jsx";

const UploadForm = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const { updatePrediction, setIsLoading, setError, pushNotification } =
    usePrediction();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select an X-ray image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await predictPneumonia(file);
      updatePrediction(data);
      pushNotification({
        type: "success",
        message: `Prediction ready: ${data.prediction}`,
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload failed. Try again.");
      pushNotification({
        type: "error",
        message: "Upload failed. Check the image and retry.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm"
    >
      <p className="text-lg font-medium text-slate-800">
        Upload a chest X-ray
      </p>
      <p className="text-sm text-slate-500">
        Supported formats: PNG, JPG, JPEG. Max 10 MB.
      </p>

      <label
        htmlFor="xray"
        className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:bg-slate-100"
      >
        <span className="text-sm font-medium text-brand-dark">
          Click to select or drag & drop
        </span>
        <input
          ref={fileInputRef}
          id="xray"
          name="xray"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {preview && (
        <img
          src={preview}
          alt="X-ray preview"
          className="mt-4 max-h-64 w-full rounded-lg object-contain"
        />
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-xl bg-brand text-white py-3 font-semibold shadow-lg shadow-brand/40 transition hover:bg-brand-dark"
      >
        Analyze X-ray
      </button>
    </form>
  );
};

export default UploadForm;

