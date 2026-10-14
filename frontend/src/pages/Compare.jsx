import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { FaBalanceScale, FaBookOpen, FaPen } from "react-icons/fa";
import PageCard from "../components/PageCard";
import { Select, NumberField } from "../components/Fields";
import { SubmitButton, PrintButton, ErrorAlert } from "../components/ui";
import { useScrollTo } from "../hooks";
import { compare } from "../api";
import { OPT_GENDER, OPT_GROUP, OPT_PARENT, OPT_LUNCH, OPT_PREP } from "../options";

const empty = {
  gender: "",
  race_ethnicity: "",
  parental_level_of_education: "",
  lunch: "",
  test_preparation_course: "",
  reading_score: "",
  writing_score: "",
};

function Student({ title, prefix, data, onChange }) {
  const id = (n) => `${prefix}_${n}`;
  const sel = (name, label, options) => (
    <Select id={id(name)} name={name} label={label} options={options} value={data[name]} onChange={onChange} />
  );
  return (
    <div className="student">
      <h3>{title}</h3>
      {sel("gender", "Gender", OPT_GENDER)}
      {sel("race_ethnicity", "Race / Ethnicity", OPT_GROUP)}
      {sel("parental_level_of_education", "Parental Education", OPT_PARENT)}
      {sel("lunch", "Lunch type", OPT_LUNCH)}
      {sel("test_preparation_course", "Test prep course", OPT_PREP)}
      <NumberField
        id={id("reading_score")} name="reading_score"
        label={<span className="iconic"><FaBookOpen /> Reading (0-100)</span>}
        placeholder="e.g. 72" value={data.reading_score} onChange={onChange}
      />
      <NumberField
        id={id("writing_score")} name="writing_score"
        label={<span className="iconic"><FaPen /> Writing (0-100)</span>}
        placeholder="e.g. 74" value={data.writing_score} onChange={onChange}
      />
    </div>
  );
}

export default function Compare() {
  const [a, setA] = useState(empty);
  const [b, setB] = useState(empty);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useScrollTo(result);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await compare(a, b));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  let content = null;
  if (result) {
    const { a: ra, b: rb, gap } = result;
    const verdict =
      gap > 0 ? `Student A leads by ${gap} points`
      : gap < 0 ? `Student B leads by ${Math.abs(gap)} points`
      : "It's a tie";

    const chartData = {
      labels: ra.subjects.map((s) => s.name).concat(["Average"]),
      datasets: [
        { label: "Student A", data: ra.subjects.map((s) => s.score).concat([ra.average]), backgroundColor: "#2563eb", borderRadius: 6 },
        { label: "Student B", data: rb.subjects.map((s) => s.score).concat([rb.average]), backgroundColor: "#93c5fd", borderRadius: 6 },
      ],
    };

    content = (
      <div className="result" ref={resultRef}>
        <div className="label">Verdict</div>
        <div className="score" style={{ fontSize: "1.6rem" }}>{verdict}</div>

        <table className="subj cmp">
          <thead>
            <tr><th></th><th>Student A</th><th>Student B</th></tr>
          </thead>
          <tbody>
            {ra.subjects.map((sa, i) => {
              const sb = rb.subjects[i];
              return (
                <tr key={sa.name}>
                  <td>{sa.name}{sa.predicted && <em> (predicted)</em>}</td>
                  <td className={sa.score > sb.score ? "win" : ""}>{sa.score} ({sa.grade})</td>
                  <td className={sb.score > sa.score ? "win" : ""}>{sb.score} ({sb.grade})</td>
                </tr>
              );
            })}
            <tr>
              <td><b>Average</b></td>
              <td className={ra.average > rb.average ? "win" : ""}><b>{ra.average}</b> ({ra.overall_grade})</td>
              <td className={rb.average > ra.average ? "win" : ""}><b>{rb.average}</b> ({rb.overall_grade})</td>
            </tr>
            <tr><td>Rank</td><td>Top {ra.top_pct}%</td><td>Top {rb.top_pct}%</td></tr>
            <tr><td>Strongest</td><td>{ra.strongest}</td><td>{rb.strongest}</td></tr>
          </tbody>
        </table>

        <div className="radar-box" style={{ maxWidth: 560 }}>
          <Bar data={chartData} options={{ scales: { y: { min: 0, max: 100 } } }} />
        </div>
        <PrintButton />
      </div>
    );
  }

  return (
    <PageCard
      badge={<FaBalanceScale />}
      title="Compare Two Students"
      subtitle="See who is ahead, subject by subject."
      wide
    >
      <ErrorAlert message={error} />

      <form onSubmit={onSubmit}>
        <div className="compare-grid">
          <Student
            title="Student A" prefix="a" data={a}
            onChange={(e) => setA((s) => ({ ...s, [e.target.name]: e.target.value }))}
          />
          <Student
            title="Student B" prefix="b" data={b}
            onChange={(e) => setB((s) => ({ ...s, [e.target.name]: e.target.value }))}
          />
        </div>
        <SubmitButton loading={loading} idle="Compare" busy="Comparing..." />
      </form>

      {content}
    </PageCard>
  );
}
