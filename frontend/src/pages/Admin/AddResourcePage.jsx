import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout/AdminDashboardLayout";
import Button from "../../components/ui/Button/Button";
import { ROUTES } from "../../constants/routes";

const initialState = {
    name: "",
    type: "LAB",
    capacity: "",
    location: "",
    availableFrom: "",
    availableTo: "",
    description: "",
};

const AddResourcePage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setServerError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Resource name is required.";
        }

        if (!formData.type) {
            newErrors.type = "Resource type is required.";
        }

        if (formData.type !== "EQUIPMENT") {
            if (!formData.capacity) {
                newErrors.capacity = "Capacity is required.";
            } else if (Number(formData.capacity) < 1) {
                newErrors.capacity = "Capacity must be at least 1.";
            }
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required.";
        }

        if (!formData.availableFrom) {
            newErrors.availableFrom = "Available from time is required.";
        }

        if (!formData.availableTo) {
            newErrors.availableTo = "Available to time is required.";
        }

        if (
            formData.availableFrom &&
            formData.availableTo &&
            formData.availableFrom >= formData.availableTo
        ) {
            newErrors.availableTo = "Available to time must be later than available from time.";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        try {
            setSubmitting(true);
            setServerError("");

            const payload = {
                name: formData.name.trim(),
                type: formData.type,
                location: formData.location.trim(),
                availableFrom: formData.availableFrom,
                availableTo: formData.availableTo,
                description: formData.description.trim(),
            };

            if (formData.type !== "EQUIPMENT") {
                payload.capacity = Number(formData.capacity);
            }
            await axios.post("http://localhost:8080/api/resources", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigate(ROUTES.ADMIN_RESOURCES);
        } catch (err) {
            console.error("Failed to add resource:", err);
            setServerError(
                err?.response?.data?.message || "Failed to create resource."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminDashboardLayout title="Add Resource" notificationCount={0}>
            <div className="dashboard-page">
                <section className="welcome-banner">
                    <div className="welcome-content">
                        <h2>Add New Resource</h2>
                        <p>Create a campus resource with availability, status, and location details.</p>
                    </div>
                    <div className="welcome-emoji">➕</div>
                </section>

                <h3 className="section-title">Resource Information</h3>

                <section
                    className="module-card"
                    style={{
                        borderTopColor: "#10B981",
                        padding: "24px",
                        background: "#fff",
                        borderRadius: "16px",
                    }}
                >
                    {serverError && <div style={errorStyle}>{serverError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={formGridStyle}>
                            <div>
                                <label style={labelStyle}>Resource Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter resource name"
                                    style={inputStyle}
                                />
                                {errors.name && <p style={fieldErrorStyle}>{errors.name}</p>}
                            </div>

                            <div>
                                <label style={labelStyle}>Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Lab</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
                                {errors.type && <p style={fieldErrorStyle}>{errors.type}</p>}
                            </div>

                            <div>
                                {formData.type !== "EQUIPMENT" && (
                                    <div>
                                        <label style={labelStyle}>Capacity</label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            placeholder="Enter capacity"
                                            style={inputStyle}
                                        />
                                        {errors.capacity && <p style={fieldErrorStyle}>{errors.capacity}</p>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={labelStyle}>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter location"
                                    style={inputStyle}
                                />
                                {errors.location && <p style={fieldErrorStyle}>{errors.location}</p>}
                            </div>

                            <div>
                                <label style={labelStyle}>Available From</label>
                                <input
                                    type="time"
                                    name="availableFrom"
                                    value={formData.availableFrom}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                                {errors.availableFrom && (
                                    <p style={fieldErrorStyle}>{errors.availableFrom}</p>
                                )}
                            </div>

                            <div>
                                <label style={labelStyle}>Available To</label>
                                <input
                                    type="time"
                                    name="availableTo"
                                    value={formData.availableTo}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                                {errors.availableTo && (
                                    <p style={fieldErrorStyle}>{errors.availableTo}</p>
                                )}
                            </div>



                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                    rows="4"
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
                            <Button
                                label={submitting ? "Saving..." : "Save Resource"}
                                type="submit"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.ADMIN_RESOURCES)}
                                style={secondaryButtonStyle}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AdminDashboardLayout>
    );
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
};

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #D1D5DB",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
};

const fieldErrorStyle = {
    marginTop: "6px",
    fontSize: "12px",
    color: "#DC2626",
};

const errorStyle = {
    marginBottom: "18px",
    padding: "12px 14px",
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    borderRadius: "10px",
    fontSize: "14px",
};

const secondaryButtonStyle = {
    border: "1px solid #D1D5DB",
    backgroundColor: "#fff",
    color: "#111827",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
};

export default AddResourcePage;