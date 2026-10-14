import { useState } from "react";
import { Link } from "react-router-dom";
import { FaMagic, FaExclamationTriangle } from "react-icons/fa";
import PageCard from "../components/PageCard";
import { Select } from "../components/Fields";
import { SubmitButton, PrintButton, ErrorAlert } from "../components/ui";
import { useScrollTo } from "../hooks";
import { estimate } from "../api";
import { OPT_GENDER, OPT_GROUP, OPT_PARENT, OPT_LUNCH, OPT_PREP } from "../options";

const empty = {
  gender: "",
  race_ethnicity: "",
  parental_level_of_education: "",
  lunch: "",
  test_preparation_course: "",
};

export default function Estimate() {
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useScrollTo(result);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await estimate(form));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, options) => (
    <Select id={name} name={name} label={label} options={options} value={form[name]} onChange={onChange} />
  );

  return (
    <PageCard
      badge={<FaMagic />}
      title="Quick Estimate"
      subtitle="No exam scores yet? Estimate maths, reading and writing from background details alone."
    >
      <ErrorAlert message={error} />

      <form onSubmit={onSubmit}>
        <div className="row">
          {field("gender", "Gender", OPT_GENDER)}
          {field("race_ethnicity", "Race / Ethnicity", OPT_GROUP)}
        </div>
        <div className="row">
          {field("parental_level_of_education", "Parental Education", OPT_PARENT)}
          {field("lunch", "Lunch type", OPT_LUNCH)}
        </div>
        {field("test_preparation_course", "Test preparation course", OPT_PREP)}
        <SubmitButton loading={loading} idle="Estimate all scores" busy="Estimating..." />
      </form>

      {result && (
        <div className="result" ref={resultRef}>
          <div className="label">Estimated average</div>
          <div className="score">{result.average}<small> / 100</small></div>
          <div className="chips">
            <span className="chip grade">Grade {result.grade}</span>
            <span className="chip">{result.remark}</span>
          </div>

          {result.rows.map((r) => (
            <div className="est-row" key={r.name}>
              <div className="est-head">
                <span>{r.name}</span>
                <span>
                  <b>{r.score}</b>{" "}
                  <small>(likely {r.low}-{r.high}, class avg {r.avg})</small>
                </span>
              </div>
              <div className="bar"><span style={{ width: `${r.score}%` }} /></div>
            </div>
          ))}

          <p className="note">
            <FaExclamationTriangle /> Background alone explains only about {result.explained}% of score
            differences, so treat these as rough estimates. For a sharper result, use the{" "}
            <Link to="/predict">Full Report</Link> with reading and writing scores.
          </p>
          <PrintButton />
        </div>
      )}
    </PageCard>
  );
}
