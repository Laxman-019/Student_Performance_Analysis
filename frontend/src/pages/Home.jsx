import { Link } from "react-router-dom";
import {
  FaGraduationCap, FaRegEdit, FaRobot, FaBolt, FaArrowRight, FaMagic, FaBalanceScale, FaChartBar,
} from "react-icons/fa";
import PageCard from "../components/PageCard";

export default function Home() {
  return (
    <PageCard
      badge={<FaGraduationCap />}
      title="Student Exam Performance Indicator"
      subtitle="A machine learning model that predicts a student's maths score from their background and their reading and writing results."
      style={{ maxWidth: 640 }}
    >
      <div className="features">
        <div className="feature"><b><FaRegEdit /></b>Simple form</div>
        <div className="feature"><b><FaRobot /></b>ML powered</div>
        <div className="feature"><b><FaBolt /></b>Instant result</div>
      </div>

      <ol className="steps">
        <li>Enter the student's profile and school details</li>
        <li>Add the reading and writing scores</li>
        <li>Get the predicted maths score instantly</li>
      </ol>

      <Link className="btn" to="/predict">Start Prediction <FaArrowRight /></Link>
      <Link className="btn secondary" to="/estimate"><FaMagic /> Quick Estimate (no scores needed)</Link>
      <Link className="btn secondary" to="/compare"><FaBalanceScale /> Compare Two Students</Link>
      <Link className="btn secondary" to="/insights"><FaChartBar /> Explore the Data</Link>
    </PageCard>
  );
}
