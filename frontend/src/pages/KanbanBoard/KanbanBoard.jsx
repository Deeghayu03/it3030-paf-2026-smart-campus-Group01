import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ticketService from "../../services/ticketService";
import "./KanbanBoard.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "OPEN",        label: "Open",        color: "col-open",        accent: "#3b9eff" },
  { id: "IN_PROGRESS", label: "In Progress", color: "col-inprogress",  accent: "#f0a500" },
  { id: "RESOLVED",    label: "Resolved",    color: "col-resolved",    accent: "#2dd4a0" },
  { id: "CLOSED",      label: "Closed",      color: "col-closed",      accent: "#7c8299" },
];

const PRIORITY_META = {
  LOW:      { label: "Low",      cls: "p-low"      },
  MEDIUM:   { label: "Medium",   cls: "p-medium"   },
  HIGH:     { label: "High",     cls: "p-high"     },
  CRITICAL: { label: "Critical", cls: "p-critical" },
};

const CATEGORY_ICONS = {
  ELECTRICAL: "⚡", PLUMBING: "🔧", IT_HARDWARE: "💻",
  IT_SOFTWARE: "⌨", HVAC: "❄", STRUCTURAL: "🏗",
  FURNITURE: "🪑", SECURITY: "🔒", CLEANING: "🧹", OTHER: "📋",
};

// ─── Ticket Card ─────────────────────────────────────────────────────────────

function TicketCard({ ticket, isDragging, onDragStart, onDragEnd, onClick }) {
  const p = PRIORITY_META[ticket.priority] || {};
  const icon = CATEGORY_ICONS[ticket.category] || "📋";
  const isOverdue = ticket.slaBreached;
  const isNearDeadline = !isOverdue && ticket.slaDeadline &&
    (new Date(ticket.slaDeadline) - new Date()) < 2 * 3600 * 1000;

  return (
    <div
      className={`kb-card ${isDragging ? "kb-card--dragging" : ""} ${isOverdue ? "kb-card--overdue" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Priority stripe */}
      <div className={`kb-card-stripe ${p.cls}`} />

      <div className="kb-card-body">
        {/* Header row */}
        <div className="kb-card-header">
          <span className="kb-cat-icon">{icon}</span>
          <span className="kb-card-id">#{ticket.id}</span>
          {isOverdue && <span className="kb-sla-badge kb-sla-breached">SLA</span>}
          {isNearDeadline && !isOverdue && <span className="kb-sla-badge kb-sla-warn">⏱</span>}
        </div>

        {/* Title */}
        <h3 className="kb-card-title">{ticket.title || ticket.description}</h3>

        {/* Location */}
        <p className="kb-card-location">{ticket.location}</p>

        {/* Footer */}
        <div className="kb-card-footer">
          <span className={`kb-priority ${p.cls}`}>{p.label}</span>
          <span className="kb-category">{ticket.category?.replace("_", " ")}</span>
          {ticket.assignedToName && (
            <span className="kb-assignee" title={ticket.assignedToName}>
              {ticket.assignedToName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({ column, tickets, draggingId, onDragStart, onDragEnd, onDrop, onDragOver, onCardClick }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e) => {
    setIsOver(false);
    onDrop(e, column.id);
  };

  return (
    <div
      className={`kb-column ${column.color} ${isOver ? "kb-column--over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="kb-col-header">
        <div className="kb-col-header-left">
          <div className="kb-col-dot" style={{ background: column.accent }} />
          <span className="kb-col-title">{column.label}</span>
        </div>
        <span className="kb-col-count">{tickets.length}</span>
      </div>

      {/* Drop zone indicator */}
      {isOver && draggingId && (
        <div className="kb-drop-indicator" style={{ borderColor: column.accent }} />
      )}

      {/* Cards */}
      <div className="kb-cards-list">
        {tickets.length === 0 && !isOver && (
          <div className="kb-empty-col">No tickets</div>
        )}
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            isDragging={draggingId === ticket.id}
            onDragStart={(e) => onDragStart(e, ticket)}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick(ticket.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Status Update Modal ──────────────────────────────────────────────────────

function StatusUpdateModal({ ticket, targetStatus, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  const needsReason = ["REJECTED", "RESOLVED"].includes(targetStatus);

  return (
    <div className="kb-modal-backdrop" onClick={onCancel}>
      <div className="kb-modal" onClick={e => e.stopPropagation()}>
        <h2 className="kb-modal-title">Confirm status change</h2>
        <p className="kb-modal-subtitle">
          Move <strong>#{ticket?.id} — {ticket?.title || ticket?.description}</strong> to{" "}
          <span className={`kb-modal-status status-${targetStatus?.toLowerCase()}`}>
            {targetStatus?.replace("_", " ")}
          </span>?
        </p>

        {needsReason && (
          <div className="kb-modal-field">
            <label className="kb-modal-label">
              {targetStatus === "REJECTED" ? "Rejection reason" : "Resolution notes"}
              <span className="required">*</span>
            </label>
            <textarea
              className="kb-modal-textarea"
              placeholder={targetStatus === "REJECTED"
                ? "Explain why this ticket is being rejected..."
                : "Describe how the issue was resolved..."}
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>
        )}

        <div className="kb-modal-actions">
          <button className="kb-btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="kb-btn-confirm"
            onClick={() => onConfirm(reason)}
            disabled={loading || (needsReason && !reason.trim())}
          >
            {loading ? "Updating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export default function KanbanBoard({ currentUser }) {
  const navigate = useNavigate();
  const [tickets, setTickets]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [draggingTicket, setDraggingTicket] = useState(null);
  const [pendingMove, setPendingMove]       = useState(null);
  const [updating, setUpdating]             = useState(false);
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery]       = useState("");
  const [toast, setToast]                   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getAllTickets();
      // getAllTickets returns an axios response; extract .data
      const data = response?.data ?? response;
      setTickets(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const handleDragStart = (e, ticket) => {
    setDraggingTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("ticketId", String(ticket.id));
  };

  const handleDragEnd = () => setDraggingTicket(null);

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggingTicket || draggingTicket.status === targetStatus) return;
    setPendingMove({ ticket: draggingTicket, targetStatus });
    setDraggingTicket(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  // ── Confirm status update ─────────────────────────────────────────────────

  const confirmMove = async (reason) => {
    if (!pendingMove) return;
    const { ticket, targetStatus } = pendingMove;
    setUpdating(true);
    try {
      // ticketService uses `updateStatus` (not updateTicketStatus)
      await ticketService.updateStatus(ticket.id, {
        status: targetStatus,
        reason: reason || undefined,
      });

      // Optimistic UI update — no extra fetch needed
      setTickets(prev => prev.map(t =>
        t.id === ticket.id ? { ...t, status: targetStatus } : t
      ));

      showToast(`Ticket #${ticket.id} moved to ${targetStatus.replace("_", " ")}`);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update ticket status", "error");
    } finally {
      setUpdating(false);
      setPendingMove(null);
    }
  };

  // ── Filter & group ────────────────────────────────────────────────────────

  const filtered = tickets.filter(t => {
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    if (filterCategory !== "ALL" && t.category !== filterCategory) return false;
    const q = searchQuery.toLowerCase();
    if (q && !(t.title || t.description || "").toLowerCase().includes(q) &&
        !t.location?.toLowerCase().includes(q)) return false;
    return true;
  });

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filtered.filter(t => t.status === col.id);
    return acc;
  }, {});

  const categories = [...new Set(tickets.map(t => t.category))].filter(Boolean);

  if (loading) return (
    <div className="kb-loading">
      <div className="kb-spinner" />
      <span>Loading board...</span>
    </div>
  );

  if (error) return (
    <div className="kb-error">
      <p>{error}</p>
      <button onClick={load}>Retry</button>
    </div>
  );

  return (
    <div className="kb-root">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="kb-header">
        <div className="kb-header-left">
          <h1 className="kb-title">Ticket board</h1>
          <span className="kb-total">{filtered.length} tickets</span>
        </div>

        <div className="kb-filters">
          <input
            id="kb-search"
            className="kb-search"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <select id="kb-filter-priority" className="kb-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="ALL">All priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select id="kb-filter-category" className="kb-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="ALL">All categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.replace("_", " ")}</option>
            ))}
          </select>

          <button id="kb-refresh-btn" className="kb-refresh" onClick={load} title="Refresh">↺</button>
        </div>
      </div>

      {/* ── Board ───────────────────────────────────────────────────── */}
      <div className="kb-board">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tickets={grouped[col.id] || []}
            draggingId={draggingTicket?.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onCardClick={(id) => navigate(`/tickets/${id}`)}
          />
        ))}
      </div>

      {/* ── Status update modal ──────────────────────────────────────── */}
      {pendingMove && (
        <StatusUpdateModal
          ticket={pendingMove.ticket}
          targetStatus={pendingMove.targetStatus}
          onConfirm={confirmMove}
          onCancel={() => setPendingMove(null)}
          loading={updating}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────── */}
      {toast && (
        <div className={`kb-toast kb-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
