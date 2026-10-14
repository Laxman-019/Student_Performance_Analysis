import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Scatter } from "react-chartjs-2";
import { FaChartBar, FaInfoCircle, FaArrowRight } from "react-icons/fa";
import PageCard from "../components/PageCard";
import { ErrorAlert } from "../components/ui";
import { COLORS } from "../chartSetup";
import { getInsights } from "../api";

const groupedData = (g) => ({
  labels: g.labels,
  datasets: ["math", "reading", "writing"].map((k) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    data: g[k],
    backgroundColor: COLORS[k],
    borderRadius: 6,
  })),
});

const groupedOptions = (horizontal) => ({
  indexAxis: horizontal ? "y" : "x",
  scales: horizontal ? { x: { min: 40, max: 85 } } : { y: { min: 40, max: 85 } },
  plugins: { legend: { position: "bottom" } },
});

function GroupChart({ title, g, horizontal }) {
  return (
    <div className="chart-box">
      <h3>{title}</h3>
      <Bar data={groupedData(g)} options={groupedOptions(horizontal)} />
    </div>
  );
}

export default function Insights() {
  const [D, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInsights().then(setD).catch((err) => setError(err.message));
  }, []);

  const subtitle = D
    ? `What ${D.total} real student records tell us about exam scores.`
    : "Loading the dataset...";

  return (
    <PageCard badge={<FaChartBar />} title="Explore the Data" subtitle={subtitle} wide>
      <ErrorAlert message={error} />

      {D && (
        <>
          <div className="stat-grid">
            <div className="stat"><b>{D.total}</b><span>Students</span></div>
            <div className="stat"><b>{D.avg.math}</b><span>Avg maths</span></div>
            <div className="stat"><b>{D.avg.reading}</b><span>Avg reading</span></div>
            <div className="stat"><b>{D.avg.writing}</b><span>Avg writing</span></div>
          </div>

          <div className="section-title">Maths score spread</div>
          <div className="chart-box">
            <Bar
              data={{
                labels: D.hist.labels,
                datasets: [{ label: "Students", data: D.hist.counts, backgroundColor: COLORS.math, borderRadius: 6 }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: "Maths score range" } },
                  y: { title: { display: true, text: "Students" } },
                },
              }}
            />
          </div>

          <div className="section-title">Do reading skills predict maths?</div>
          <div className="chart-box">
            <Scatter
              data={{
                datasets: [{
                  label: "Student",
                  data: D.scatter,
                  backgroundColor: "rgba(37,99,235,0.45)",
                  pointRadius: 3,
                }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { min: 0, max: 100, title: { display: true, text: "Reading score" } },
                  y: { min: 0, max: 100, title: { display: true, text: "Maths score" } },
                },
              }}
            />
          </div>
          <p className="insight">
            Correlation with maths: reading <b>{D.corr_reading}</b>, writing <b>{D.corr_writing}</b>.
            Values close to 1 mean strong students tend to be strong in both.
          </p>

          <div className="section-title">Average score by group</div>
          <div className="chart-grid">
            <GroupChart title="Test preparation" g={D.prep} />
            <GroupChart title="Lunch type" g={D.lunch} />
            <GroupChart title="Gender" g={D.gender} />
            <GroupChart title="Race / Ethnicity" g={D.race} />
          </div>
          <GroupChart title="Parental education" g={D.parent} horizontal />

          <p className="note">
            <FaInfoCircle /> These are averages of a sample dataset. Differences between groups describe
            the data, not any individual student, and do not prove cause and effect.
          </p>
          <Link className="btn secondary" to="/predict">Try a prediction <FaArrowRight /></Link>
        </>
      )}
    </PageCard>
  );
}
