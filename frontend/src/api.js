const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });

export const predict = (payload) => post("/api/predict", payload);
export const estimate = (payload) => post("/api/estimate", payload);
export const compare = (a, b) => post("/api/compare", { a, b });
export const getInsights = () => request("/api/insights");