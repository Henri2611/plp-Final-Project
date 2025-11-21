import axios from "axios";

// Use relative path when served from same origin, or env var if set
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

/**
 * Send an X-ray image to the FastAPI proxy which calls Hugging Face.
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

