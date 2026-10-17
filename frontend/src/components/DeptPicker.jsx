export const DEPT_OPTIONS = [
  { value: 'CIT', label: 'CIT' },
  { value: 'CTE', label: 'CTE' },
  { value: 'BOTH', label: 'Both' },
];

export const deptLabel = (d) => (d === 'BOTH' ? 'Both' : d);

export default function DeptPicker({ value, onChange, label = 'Major is for' }) {
  return (
    <div className="inst-form-group">
      <label className="inst-form-label">
        {label} <span className="inst-form-label-sub">· sinong puwedeng kumuha nito</span>
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        {DEPT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`inst-btn inst-btn-sm ${value === o.value ? 'inst-btn-primary' : 'inst-btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
