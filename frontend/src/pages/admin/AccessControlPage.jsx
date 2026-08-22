import { useState, useEffect } from 'react';
import { ShieldCheck, Save } from 'lucide-react';
import { accessApi } from '../../api/accessApi';

const ROLES = ['admin', 'instructor', 'user'];

const DEFAULT_PERMISSIONS = {
  admin: {
    viewDashboard:    true,
    manageUsers:      true,
    configureExams:   true,
    viewReports:      true,
    manageAccess:     true,
    manageSettings:   true,
    takeExams:        false,
    viewReviewModules:true,
  },
  instructor: {
    viewDashboard:     true,
    manageUsers:       false,
    configureExams:    true,
    viewReports:       true,
    manageAccess:      false,
    manageSettings:    false,
    takeExams:         false,
    viewReviewModules: true,
  },
  user: {
    viewDashboard:     true,
    manageUsers:       false,
    configureExams:    false,
    viewReports:       false,
    manageAccess:      false,
    manageSettings:    false,
    takeExams:         true,
    viewReviewModules: true,
  },
};

const PERMISSION_LABELS = {
  viewDashboard:     { label: 'View Dashboard',         desc: 'Access to the main dashboard page' },
  manageUsers:       { label: 'Manage Users',           desc: 'Create, edit, and deactivate user accounts' },
  configureExams:    { label: 'Configure Exams',        desc: 'Set exam rules, time limits, and settings' },
  viewReports:       { label: 'View Reports',           desc: 'Access performance and submission analytics' },
  manageAccess:      { label: 'Manage Access Control',  desc: 'Modify role permissions (this page)' },
  manageSettings:    { label: 'Manage Settings',        desc: 'Edit global system settings' },
  takeExams:         { label: 'Take Exams',             desc: 'Participate in assessments as a student' },
  viewReviewModules: { label: 'View Review Modules',    desc: 'Access LET review materials' },
};

const ROLE_COLORS = {
  admin:      'var(--admin-accent)',
  instructor: 'var(--admin-info)',
  user:       'var(--admin-text-sub)',
};

export default function AccessControlPage() {
  const [perms, setPerms]     = useState(DEFAULT_PERMISSIONS);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      try {
        const data = await accessApi.getPermissions();
        if (data) setPerms(data);
      } catch (err) {
        console.error('Failed to load permissions, using defaults:', err);
      } finally {
        setFetching(false);
      }
    }
    loadPermissions();
  }, []);

  const toggle = (role, perm) => {
    setSaved(false);
    setPerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await accessApi.savePermissions(perms);
      setSaved(true);
    } catch (err) {
      alert(err.message || 'Failed to save permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading permissions...</div>;
  }

  return (
    <>
      {/* Topbar */}
      <div className="admin-topbar">
        <div className="topbar-left">
          <h1>Access Control</h1>
          <p>Mandatory Access Control — define what each role can do</p>
        </div>
        <div className="topbar-right">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={13} />
            {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Role Permission Matrix</h3>
              <p>Toggle access rights per role. Changes apply system-wide immediately after saving.</p>
            </div>
            <div className="stat-card-icon purple">
              <ShieldCheck size={15} />
            </div>
          </div>

          {/* Matrix Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Permission</th>
                  {ROLES.map((role) => (
                    <th key={role} style={{ textAlign: 'center', textTransform: 'capitalize', color: ROLE_COLORS[role] }}>
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMISSION_LABELS).map(([key, { label, desc }]) => (
                  <tr key={key}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--admin-text-muted)' }}>{desc}</div>
                    </td>
                    {ROLES.map((role) => (
                      <td key={role} style={{ textAlign: 'center' }}>
                        <label className="toggle-switch" style={{ margin: '0 auto', display: 'block', width: 40 }}>
                          <input
                            type="checkbox"
                            checked={perms[role][key]}
                            onChange={() => toggle(role, key)}
                            disabled={role === 'admin' && (key === 'manageAccess' || key === 'viewDashboard')}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="save-bar">
            <p>Changes are enforced on next login for affected users.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={loading}
            >
              <Save size={13} />
              {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}