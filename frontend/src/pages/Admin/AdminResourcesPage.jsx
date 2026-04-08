import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout/AdminDashboardLayout";
import Button from "../../components/ui/Button/Button";
import { ROUTES } from "../../constants/routes";

const AdminResourcesPage = () => {
    const navigate = useNavigate();

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const fetchResources = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get("http://localhost:8080/api/resources", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setResources(response.data || []);
        } catch (err) {
            console.error("Failed to fetch resources:", err);
            setError("Failed to load resources.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this resource?");
        if (!confirmed) return;

        try {
            setDeletingId(id);

            await axios.delete(`http://localhost:8080/api/resources/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setResources((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete resource.");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredResources = useMemo(() => {
        return resources.filter((resource) => {
            const matchesSearch =
                resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.location?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType =
                typeFilter === "ALL" ? true : resource.type === typeFilter;

            const matchesStatus =
                statusFilter === "ALL" ? true : resource.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [resources, searchTerm, typeFilter, statusFilter]);

    return (
        <AdminDashboardLayout title="Manage Resources" notificationCount={0}>
            <div className="dashboard-page">
                <section className="welcome-banner">
                    <div className="welcome-content">
                        <h2>Manage Campus Resources</h2>
                        <p>View, search, filter, and manage all campus facilities and assets.</p>
                    </div>
                    <div className="welcome-emoji">🏛️</div>
                </section>

                <section
                    className="stats-section"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
                >
                    <div className="stat-card" style={{ borderTopColor: "#2563EB" }}>
                        <div className="stat-header">
                            <span className="stat-icon">📦</span>
                            <h3 className="stat-title">Total Resources</h3>
                        </div>
                        <div className="stat-value">{resources.length}</div>
                        <p className="stat-subtitle">All saved resources</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: "#10B981" }}>
                        <div className="stat-header">
                            <span className="stat-icon">✅</span>
                            <h3 className="stat-title">Active</h3>
                        </div>
                        <div className="stat-value">
                            {resources.filter((r) => r.status === "ACTIVE").length}
                        </div>
                        <p className="stat-subtitle">Available resources</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: "#F59E0B" }}>
                        <div className="stat-header">
                            <span className="stat-icon">🛠️</span>
                            <h3 className="stat-title">Out of Service</h3>
                        </div>
                        <div className="stat-value">
                            {resources.filter((r) => r.status === "OUT_OF_SERVICE").length}
                        </div>
                        <p className="stat-subtitle">Unavailable resources</p>
                    </div>
                </section>

                <h3 className="section-title">Resource Controls</h3>

                <section
                    className="module-card"
                    style={{
                        borderTopColor: "#2563EB",
                        padding: "24px",
                        background: "#fff",
                        borderRadius: "16px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "16px",
                            marginBottom: "20px",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search by name or location"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={inputStyle}
                        />

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="ALL">All Types</option>
                            <option value="LECTURE_HALL">Lecture Hall</option>
                            <option value="LAB">Lab</option>
                            <option value="MEETING_ROOM">Meeting Room</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>

                        <div>
                            <Button
                                label="Add New Resource"
                                onClick={() => navigate(ROUTES.ADMIN_ADD_RESOURCE)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={errorStyle}>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <p>Loading resources...</p>
                    ) : filteredResources.length === 0 ? (
                        <p>No resources found.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={tableStyle}>
                                <thead>
                                <tr>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Capacity</th>
                                    <th style={thStyle}>Location</th>
                                    <th style={thStyle}>Availability</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredResources.map((resource) => (
                                    <tr key={resource.id}>
                                        <td style={tdStyle}>{resource.name}</td>
                                        <td style={tdStyle}>{formatLabel(resource.type)}</td>
                                        <td style={tdStyle}>{resource.capacity}</td>
                                        <td style={tdStyle}>{resource.location}</td>
                                        <td style={tdStyle}>
                                            {resource.availableFrom} - {resource.availableTo}
                                        </td>
                                        <td style={tdStyle}>
                        <span
                            style={{
                                ...badgeStyle,
                                backgroundColor:
                                    resource.status === "ACTIVE" ? "#DCFCE7" : "#FEE2E2",
                                color:
                                    resource.status === "ACTIVE" ? "#166534" : "#B91C1C",
                            }}
                        >
                          {formatLabel(resource.status)}
                        </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                <button
                                                    type="button"
                                                    style={actionButtonStyle}
                                                    onClick={() =>
                                                        navigate(`/admin/resources/edit/${resource.id}`)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    style={{ ...actionButtonStyle, backgroundColor: "#DC2626" }}
                                                    onClick={() => handleDelete(resource.id)}
                                                    disabled={deletingId === resource.id}
                                                >
                                                    {deletingId === resource.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AdminDashboardLayout>
    );
};

const formatLabel = (value) => {
    if (!value) return "";
    return value.replaceAll("_", " ");
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #D1D5DB",
    outline: "none",
    fontSize: "14px",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
};

const thStyle = {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #E5E7EB",
    backgroundColor: "#F9FAFB",
    fontSize: "14px",
};

const tdStyle = {
    padding: "14px",
    borderBottom: "1px solid #E5E7EB",
    fontSize: "14px",
    verticalAlign: "middle",
};

const badgeStyle = {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
};

const actionButtonStyle = {
    border: "none",
    backgroundColor: "#2563EB",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
};

const errorStyle = {
    marginBottom: "16px",
    padding: "12px 14px",
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    borderRadius: "10px",
    fontSize: "14px",
};

export default AdminResourcesPage;