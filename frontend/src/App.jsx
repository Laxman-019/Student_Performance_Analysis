import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Estimate from "./pages/Estimate";
import Compare from "./pages/Compare";
import Insights from "./pages/Insights";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </main>
    </div>
  );
}