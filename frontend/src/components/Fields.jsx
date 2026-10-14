import { Fragment } from "react";
import { cap } from "../options";

export function Select({ id, name, label, options, value, onChange }) {
  return (
    <div className="field">
      <label className="lbl" htmlFor={id}>{label}</label>
      <select id={id} name={name} value={value} onChange={onChange} required>
        <option value="" disabled>Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{cap(o)}</option>
        ))}
      </select>
    </div>
  );
}

export function NumberField({ id, name, label, value, onChange, placeholder }) {
  return (
    <div className="field">
      <label className="lbl" htmlFor={id}>{label}</label>
      <input
        id={id} type="number" name={name} min="0" max="100"
        placeholder={placeholder} value={value} onChange={onChange} required
      />
    </div>
  );
}

export function Toggle({ label, name, value, onChange, options }) {
  return (
    <div className="field">
      <span className="lbl" style={{ display: "block", marginBottom: 6, fontSize: "0.88rem", fontWeight: 600 }}>
        {label}
      </span>
      <div className="toggle">
        {options.map((o, i) => (
          <Fragment key={o.id}>
            <input
              type="radio" id={o.id} name={name} value={o.value}
              checked={value === o.value} onChange={onChange} required={i === 0}
            />
            <label htmlFor={o.id}>{o.text}</label>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
