import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

/**
 * Send an X-ray image to the FastAPI server for prediction.
 * @param {File} file
 * @returns {Promise<{prediction: string, probability: number}>}
 */
export async function predictPneumonia(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export default api;

