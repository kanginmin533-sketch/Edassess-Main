// frontend/src/components/MajorPicker.jsx
import { majorsFor } from '../utils/majors';

/**
 * Button group para sa pagpili ng major ng department (CTE o CIT).
 * Para sa instructor pages (gumagamit ng inst-* classes).
 */
export default function MajorPicker({ department, value, onChange, label = 'Major' }) {
  const majors = majorsFor(department);

  return (
    <div className="inst-form-group">
      <label className="inst-form-label">
        {label} <span className="inst-form-label-sub">· {department || 'no department'} majors</span>
      </label>
      {majors.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'var(--inst-text-muted)' }}>
          No majors available for your department.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {majors.map((m) => (
            <button
              key={m}
              type="button"
              className={`inst-btn inst-btn-sm ${value === m ? 'inst-btn-primary' : 'inst-btn-secondary'}`}
              onClick={() => onChange(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}