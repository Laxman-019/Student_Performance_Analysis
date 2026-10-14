import { NavLink } from "react-router-dom";
import {
  FaGraduationCap, FaHome, FaClipboardList, FaMagic, FaBalanceScale, FaChartBar,
} from "react-icons/fa";

const links = [
  ["/", "Home", FaHome],
  ["/predict", "Full Report", FaClipboardList],
  ["/estimate", "Quick Estimate", FaMagic],
  ["/compare", "Compare", FaBalanceScale],
  ["/insights", "Insights", FaChartBar],
];

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand">
          <FaGraduationCap /> Student Performance
        </NavLink>
        <nav className="topnav">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/"} className="navlink">
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
