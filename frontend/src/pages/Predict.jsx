import { useState } from "react";
import { predict } from "../api";
import { OPTIONS, LABELS } from "../options";

const initial = {
  gender: "female",
  race_ethnicity: "group B",
  parental_level_of_education: "bachelor's degree",
  lunch: "standard",
  test_preparation_course: "none",
  reading_score: "",
  writing_score: "",
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand-500 focus:outline-none";

export default function Predict() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await predict(form));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-semibold text-brand-700">
        Student Exam Performance Indicator
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {Object.keys(OPTIONS).map((name) => (
          <label key={name} className="block">
            <span className="mb-1 block text-sm text-slate-600">{LABELS[name]}</span>
            <select name={name} value={form[name]} onChange={onChange} className={fieldClass}>
              {OPTIONS[name].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}

        {["reading_score", "writing_score"].map((name) => (
          <label key={name} className="block">
            <span className="mb-1 block text-sm text-slate-600">
              {name === "reading_score" ? "Reading score" : "Writing score"} (0-100)
            </span>
            <input
              type="number" name={name} value={form[name]} onChange={onChange}
              required min="0" max="100" className={fieldClass}
            />
          </label>
        ))}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Predicting..." : "Predict Math Score"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg bg-brand-50 p-4">
          <p className="text-lg">
            Predicted math score: <strong>{result.score}</strong> ({result.grade}) · {result.remark}
          </p>
          <p className="text-sm text-slate-500">
            Likely range {result.low}-{result.high} · top {result.top_pct}% overall
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {result.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}