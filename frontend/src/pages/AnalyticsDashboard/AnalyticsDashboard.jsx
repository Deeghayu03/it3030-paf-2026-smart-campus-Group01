import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
  PieChart, Pie, Legend
} from "recharts";
import ticketService from "../../services/ticketService";
import "./AnalyticsDashboard.css";

// ─── Color maps ───────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  OPEN:        "#3b9eff",
  IN_PROGRESS: "#f0a500",
  RESOLVED:    "#2dd4a0",
  CLOSED:      "#555d7a",
  REJECTED:    "#ff4d6d",
};

const PRIORITY_COLORS = {
  LOW:      "#2dd4a0",
  MEDIUM:   "#f0a500",
  HIGH:     "#ff8c42",
  CRITICAL: "#ff4d6d",
};

const CATEGORY_COLOR = "#5b8cff";

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ad-tooltip">
      <p className="ad-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="ad-tooltip-val" style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Stat card with count-up animation ───────────────────────────────────────
function StatCard({ label, value, sub, accent, delay = 0 }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const end = value;
    const duration = 800;
    const step = Math.max(1, Math.ceil(end / (duration / 16)));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplayed(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="ad-stat-card" style={{ animationDelay: `${delay}ms` }}>
      {accent && <div className="ad-stat-accent" style={{ background: accent }} />}
      <p className="ad-stat-label">{label}</p>
      <p className="ad-stat-value">
        {typeof value === "number" ? displayed : value ?? "—"}
      </p>
      {sub && <p className="ad-stat-sub">{sub}</p>}
    </div>
  );
}

// ─── Chart section wrapper ────────────────────────────────────────────────────
function ChartSection({ title, children, delay = 0 }) {
  return (
    <div className="ad-chart-section" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="ad-section-title">{title}</h2>
      {children}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ticketService.getStats();
        setStats(data);
      } catch (e) {
        setError("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="ad-loading">
      <div className="ad-spinner" />
      <span>Loading analytics...</span>
    </div>
  );

  if (error) return (
    <div className="ad-error"><p>{error}</p></div>
  );

  if (!stats) return null;

  const { overview, byStatus, byPriority, byCategory, trend, avgResolutionHours } = stats;

  // Transform for charts
  const statusData = Object.entries(byStatus || {})
    .map(([name, value]) => ({ name: name.replace("_", " "), value, fill: STATUS_COLORS[name] || "#555" }))
    .filter(d => d.value > 0);

  const priorityData = Object.entries(byPriority || {})
    .map(([name, value]) => ({ name, value, fill: PRIORITY_COLORS[name] || "#555" }));

  const categoryData = Object.entries(byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.replace("_", " "), value }));

  const trendData = (trend || []).map(d => ({
    date: d.date?.slice(5),   // "01-15" from "2024-01-15"
    count: d.count,
  }));

  const slaBreachRate = overview.total > 0
    ? Math.round((overview.slaBreached / overview.total) * 100) : 0;

  const resolvedRate = overview.total > 0
    ? Math.round(((overview.resolved + overview.closed) / overview.total) * 100) : 0;

  return (
    <div className="ad-root">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Analytics</h1>
          <p className="ad-subtitle">Module C — maintenance &amp; incident overview</p>
        </div>
        <div className="ad-header-badge">Last 30 days</div>
      </div>

      {/* ── Overview stat cards ──────────────────────────────────────── */}
      <div className="ad-stats-grid">
        <StatCard label="Total tickets"       value={overview.total}      accent="#5b8cff" delay={0}   />
        <StatCard label="Open"                value={overview.open}       accent="#3b9eff" delay={60}  />
        <StatCard label="In progress"         value={overview.inProgress} accent="#f0a500" delay={120} />
        <StatCard label="Resolved"            value={overview.resolved}   accent="#2dd4a0" delay={180} />
        <StatCard
          label="SLA breach rate"
          value={`${slaBreachRate}%`}
          sub={`${overview.slaBreached} breached`}
          accent="#ff4d6d"
          delay={240}
        />
        <StatCard
          label="Resolution rate"
          value={`${resolvedRate}%`}
          sub="resolved + closed"
          accent="#2dd4a0"
          delay={300}
        />
        <StatCard
          label="Avg resolution time"
          value={avgResolutionHours != null ? `${avgResolutionHours}h` : "N/A"}
          sub="hours per ticket"
          accent="#5b8cff"
          delay={360}
        />
        <StatCard label="Rejected" value={overview.rejected} accent="#ff4d6d" delay={420} />
      </div>

      {/* ── Charts row 1 ────────────────────────────────────────────── */}
      <div className="ad-charts-row">

        {/* Status donut */}
        <ChartSection title="Tickets by status" delay={100}>
          <div className="ad-chart-wrap" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: "#6e7592" }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>

        {/* Priority bar */}
        <ChartSection title="Tickets by priority" delay={150}>
          <div className="ad-chart-wrap" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6e7592" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6e7592" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>
      </div>

      {/* ── Trend line chart ─────────────────────────────────────────── */}
      <ChartSection title="Ticket volume — last 30 days" delay={200}>
        <div className="ad-chart-wrap" style={{ height: 220 }}>
          {trendData.length === 0 ? (
            <div className="ad-chart-empty">No trend data available yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6e7592" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#6e7592" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
                <Line
                  type="monotone" dataKey="count" name="Tickets"
                  stroke="#5b8cff" strokeWidth={2}
                  dot={{ r: 3, fill: "#5b8cff", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#5b8cff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartSection>

      {/* ── Category horizontal bar ──────────────────────────────────── */}
      <ChartSection title="Tickets by category" delay={250}>
        <div className="ad-chart-wrap" style={{ height: Math.max(200, categoryData.length * 36) }}>
          {categoryData.length === 0 ? (
            <div className="ad-chart-empty">No category data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryData}
                margin={{ top: 0, right: 40, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6e7592" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6e7592" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" name="Tickets" fill={CATEGORY_COLOR} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartSection>

    </div>
  );
}
