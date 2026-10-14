export default function PageCard({ badge, title, subtitle, wide, style, children }) {
  return (
    <div className={`card${wide ? " wide" : ""}`} style={style}>
      <div className="badge">{badge}</div>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      {children}
    </div>
  );
}
