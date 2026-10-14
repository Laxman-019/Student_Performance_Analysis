import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const css = getComputedStyle(document.documentElement);
const get = (name, fallback) => css.getPropertyValue(name).trim() || fallback;

Chart.defaults.color = get("--text", "#1e293b");
Chart.defaults.borderColor = get("--border", "#dbe4f0");
Chart.defaults.font.family = '"Segoe UI", system-ui, Arial, sans-serif';

export const COLORS = { math: "#2563eb", reading: "#38bdf8", writing: "#818cf8" };
