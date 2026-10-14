import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap, FaMale, FaFemale, FaUtensils, FaAppleAlt, FaBan, FaCheckCircle,
  FaBookOpen, FaPen, FaArrowLeft,
} from "react-icons/fa";
import PageCard from "../components/PageCard";
import ReportResult from "../components/ReportResult";
import { Select, NumberField, Toggle } from "../components/Fields";
import { SubmitButton, ErrorAlert } from "../components/ui";
import { useScrollTo } from "../hooks";
import { predict } from "../api";
import { OPT_GROUP, OPT_PARENT } from "../options";

const empty = {
  gender: "",
  race_ethnicity: "",
  parental_level_of_education: "",
  lunch: "",
  test_preparation_course: "",
  reading_score: "",
  writing_score: "",
};

const withIcon = (Icon, text) => (
  <span className="iconic"><Icon /> {text}</span>
);

export default function Predict() {
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
      setResult(await predict(form));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard
      badge={<FaGraduationCap />}
      title="Exam Performance Predictor"
      subtitle="Fill in the details below to estimate the maths score."
    >
      <ErrorAlert message={error} />

      <form onSubmit={onSubmit}>
        <div className="section-title">Student profile</div>

        <Toggle
          label="Gender" name="gender" value={form.gender} onChange={onChange}
          options={[
            { id: "g_male", value: "male", text: withIcon(FaMale, "Male") },
            { id: "g_female", value: "female", text: withIcon(FaFemale, "Female") },
          ]}
        />

        <div className="row">
          <Select
            id="race_ethnicity" name="race_ethnicity" label="Race / Ethnicity"
            options={OPT_GROUP} value={form.race_ethnicity} onChange={onChange}
          />
          <Select
            id="parental_level_of_education" name="parental_level_of_education"
            label="Parental Education" options={OPT_PARENT}
            value={form.parental_level_of_education} onChange={onChange}
          />
        </div>

        <div className="section-title">School details</div>

        <Toggle
          label="Lunch type" name="lunch" value={form.lunch} onChange={onChange}
          options={[
            { id: "l_std", value: "standard", text: withIcon(FaUtensils, "Standard") },
            { id: "l_free", value: "free/reduced", text: withIcon(FaAppleAlt, "Free / reduced") },
          ]}
        />
        <Toggle
          label="Test preparation course" name="test_preparation_course"
          value={form.test_preparation_course} onChange={onChange}
          options={[
            { id: "t_none", value: "none", text: withIcon(FaBan, "None") },
            { id: "t_done", value: "completed", text: withIcon(FaCheckCircle, "Completed") },
          ]}
        />

        <div className="section-title">Scores</div>

        <div className="row">
          <NumberField
            id="reading_score" name="reading_score"
            label={<span className="iconic"><FaBookOpen /> Reading (0-100)</span>}
            placeholder="e.g. 72" value={form.reading_score} onChange={onChange}
          />
          <NumberField
            id="writing_score" name="writing_score"
            label={<span className="iconic"><FaPen /> Writing (0-100)</span>}
            placeholder="e.g. 74" value={form.writing_score} onChange={onChange}
          />
        </div>

        <SubmitButton loading={loading} idle="Predict Maths Score" busy="Predicting..." />
      </form>

      {result && <ReportResult result={result} innerRef={resultRef} />}

      <Link className="link" to="/"><FaArrowLeft /> Back to home</Link>
    </PageCard>
  );
}
