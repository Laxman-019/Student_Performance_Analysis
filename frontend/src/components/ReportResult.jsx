import { Radar } from "react-chartjs-2";
import {
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDumbbell, FaBullseye, FaLightbulb,
} from "react-icons/fa";
import { PrintButton } from "./ui";

const radarOptions = { scales: { r: { min: 0, max: 100 } } };

export default function ReportResult({ result, innerRef }) {
  const subj = result.subjects;
  const radarData = {
    labels: subj.map((s) => s.name),
    datasets: [
      {
        label: "This student",
        data: subj.map((s) => s.score),
        backgroundColor: "rgba(37,99,235,0.25)",
        borderColor: "#2563eb",
      },
      {
        label: "Class average",
        data: subj.map((s) => s.avg),
        backgroundColor: "rgba(148,163,184,0.25)",
        borderColor: "#94a3b8",
      },
    ],
  };

  return (
    <div className="result" ref={innerRef}>
      <div className="label">Overall performance</div>
      <div className="score">{result.average}<small> / 100 avg</small></div>
      <div className="bar"><span style={{ width: `${result.average}%` }} /></div>

      <div className="chips">
        <span className="chip grade">Overall grade {result.overall_grade}</span>
        <span className="chip">{result.overall_remark}</span>
        <span className="chip">Top {result.top_pct}% of students</span>
        {result.all_passed ? (
          <span className="chip iconic ok"><FaCheckCircle /> Passed all subjects</span>
        ) : (
          <span className="chip iconic bad"><FaExclamationTriangle /> Failing a subject</span>
        )}
      </div>

      <table className="subj">
        <thead>
          <tr><th>Subject</th><th>Score</th><th>Grade</th><th>Class avg</th><th>Status</th></tr>
        </thead>
        <tbody>
          {subj.map((s) => (
            <tr key={s.name}>
              <td>{s.name}{s.predicted && <em> (predicted)</em>}</td>
              <td><b>{s.score}</b></td>
              <td>{s.grade}</td>
              <td>{s.avg}</td>
              <td>
                {s.passed ? (
                  <span className="iconic ok"><FaCheckCircle /> Pass</span>
                ) : (
                  <span className="iconic bad"><FaTimesCircle /> Fail</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">Total: <b>{result.total}</b> / 300</p>

      <div className="radar-box"><Radar data={radarData} options={radarOptions} /></div>

      <div className="insight">
        <span className="iconic"><FaDumbbell /> Strongest vs class: <b>{result.strongest}</b></span>
        {" "}&nbsp;·&nbsp;{" "}
        <span className="iconic"><FaBullseye /> Needs most work: <b>{result.weakest}</b></span>
      </div>

      <div className="stats">
        <div><b>{result.percentile}%</b>of students scored lower in maths</div>
        <div><b>{result.diff}</b>maths vs class average ({result.class_avg})</div>
        <div><b>{result.low}-{result.high}</b>likely maths range</div>
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>
        <span className="iconic"><FaLightbulb /> How to improve</span>
      </div>
      <ul className="tips">
        {result.tips.map((t) => <li key={t}>{t}</li>)}
      </ul>

      <PrintButton />
      <p className="note">
        Predictions come from a model trained on a learning dataset and are estimates, not guarantees.
      </p>
    </div>
  );
}
