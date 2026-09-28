import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { GroupedBarChart } from '../../components/charts/GroupedBarChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { TrendLineChart } from '../../components/charts/TrendLineChart';
import { useApp } from '../../context/AppContext';

export function ReportsAnalytics() {
  const { apiFetch, token } = useApp();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch('/api/reports/summary');
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load report data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) loadSummary();
    else {
      setLoading(false);
      setError('Not signed in');
    }

    return () => { cancelled = true; };
  }, [apiFetch, token]);

  const metrics = summary?.metrics;

  return (
    <div>
      <Topbar
        title="Reports & Analytics"
        subtitle="Complaint trends and resolution performance, live from the database."
      />

      <main className="page-body">
        {error && (
          <div className="card" style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
            Couldn't load live report data ({error}). Showing placeholder figures below.
          </div>
        )}

        {/* KPI Overview Tiles */}
        <div className="stat-grid-4" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-label">Avg Resolution Time</div>
            <div className="stat-number">{loading ? '—' : (metrics?.avgResolutionTime ?? 'N/A')}</div>
            <div className="stat-caption">Across resolved complaints</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Resolution Rate</div>
            <div className="stat-number">{loading ? '—' : (metrics?.resolutionRate ?? 'N/A')}</div>
            <div className="stat-caption">Resolved of all submitted</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Volume</div>
            <div className="stat-number">{loading ? '—' : (metrics?.totalVolume ?? 0)}</div>
            <div className="stat-caption">Complaints on record</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Escalation SLA</div>
            <div className="stat-number">{loading ? '—' : (metrics?.escalationSla ?? 'N/A')}</div>
            <div className="stat-caption">Acknowledged past submission</div>
          </div>
        </div>

        {/* Charts Grid Matching Reference Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}
        >
          {/* Monthly Submissions vs Resolutions */}
          <div className="card">
            <GroupedBarChart data={summary?.monthly} />
          </div>

          {/* Complaints by Category Donut */}
          <div className="card">
            <DonutChart data={summary?.categories} />
          </div>
        </div>

        {/* Resolution Rate Trend Line Chart */}
        <div className="card">
          <TrendLineChart data={summary?.resolutionTrend} />
        </div>
      </main>
    </div>
  );
}

export default ReportsAnalytics;
