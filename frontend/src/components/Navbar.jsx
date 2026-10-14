import { NavLink } from "react-router-dom";

const links = [
  ["/", "Home"],
  ["/predict", "Predict"],
  ["/estimate", "Estimate"],
  ["/compare", "Compare"],
  ["/insights", "Explore the Data"],
];

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <span className="font-semibold text-brand-700">Student Performance</span>
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `text-sm ${isActive ? "font-semibold text-brand-700" : "text-slate-500 hover:text-brand-500"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}