import { FaPrint, FaExclamationTriangle } from "react-icons/fa";

export function SubmitButton({ loading, idle, busy }) {
  return (
    <button type="submit" className={`btn${loading ? " loading" : ""}`} disabled={loading}>
      {loading ? busy : idle}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn secondary" onClick={() => window.print()}>
      <FaPrint /> Print / Save as PDF
    </button>
  );
}

export function ErrorAlert({ message }) {
  return message ? (
    <div className="alert">
      <FaExclamationTriangle /> <span>{message}</span>
    </div>
  ) : null;
}
