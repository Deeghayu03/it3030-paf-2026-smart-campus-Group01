import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import {
    getResources,
    deleteResource,
    createResource,
    updateResource
} from '../../services/resourceService';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../Dashboard/DashboardPage.css';
import './ResourcesPage.css';

const AdminResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [toast, setToast] = useState({ show: false, name: '' });
    const [editingResourceId, setEditingResourceId] = useState(null);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        minCapacity: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        capacity: '',
        location: '',
        availableFrom: '',
        availableTo: '',
        description: ''
    });

    const isSpaceResource =
        formData.type === 'LECTURE_HALL' ||
        formData.type === 'LAB' ||
        formData.type === 'MEETING_ROOM';

    const isTimeValid =
        formData.availableFrom !== '' &&
        formData.availableTo !== '' &&
        formData.availableFrom < formData.availableTo;

    const validate = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.type) errors.type = 'Type is required';
        if (!formData.location.trim()) errors.location = 'Location is required';
        if (isSpaceResource && !formData.capacity) errors.capacity = 'Capacity is required';
        if (!formData.availableFrom) errors.availableFrom = 'Available From is required';
        if (!formData.availableTo) errors.availableTo = 'Available To is required';
        if (formData.availableFrom && formData.availableTo && !isTimeValid)
            errors.availableTo = 'Available To must be later than Available From';
        return errors;
    };

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getResources();
            setResources(response.data);
        } catch (error) {
            console.error('Failed to load resources:', error);
            setError('Failed to load resources. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatType = (type) => {
        if (!type) return 'Not specified';
        return type.replaceAll('_', ' ');
    };

    const formatStatus = (status) => {
        if (!status) return 'Not specified';
        return status.replaceAll('_', ' ');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            status: '',
            minCapacity: ''
        });
    };

    const filteredResources = useMemo(() => {
        return resources.filter((r) => {
            const matchesSearch =
                !filters.search ||
                r.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                r.location?.toLowerCase().includes(filters.search.toLowerCase());

            const matchesType =
                !filters.type || r.type === filters.type;

            const matchesStatus =
                !filters.status || r.status === filters.status;

            const matchesCapacity =
                filters.minCapacity === '' ||
                (r.capacity ?? 0) >= Number(filters.minCapacity);

            return matchesSearch && matchesType && matchesStatus && matchesCapacity;
        });
    }, [resources, filters]);

    const showToast = (name) => {
        setToast({ show: true, name });
        setTimeout(() => setToast({ show: false, name: '' }), 3200);
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;

        try {
            await deleteResource(resourceToDelete.id);
            setResources((prev) => prev.filter((r) => r.id !== resourceToDelete.id));
            showToast(resourceToDelete.name || 'Resource');
            setResourceToDelete(null);
        } catch (error) {
            console.error('Failed to delete resource:', error);
            alert('Failed to delete resource. Please try again.');
            setResourceToDelete(null);
        }
    };

    const handleDownloadResourcePdf = (resource) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Resource Details', 14, 20);

        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

        autoTable(doc, {
            startY: 36,
            head: [['Field', 'Value']],
            body: [
                ['ID', resource.id ?? ''],
                ['Name', resource.name ?? ''],
                ['Type', formatType(resource.type)],
                ['Location', resource.location ?? ''],
                ['Capacity', resource.capacity ?? '—'],
                ['Available From', resource.availableFrom ?? ''],
                ['Available To', resource.availableTo ?? ''],
                ['Status', formatStatus(resource.status)],
                ['Description', resource.description || '—']
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235]
            },
            styles: {
                fontSize: 10,
                cellPadding: 4
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 120 }
            }
        });

        const safeFileName = (resource.name || 'resource')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();

        doc.save(`${safeFileName}_details.pdf`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'type') {
            setFormData((prev) => ({
                ...prev,
                type: value,
                capacity: value === 'EQUIPMENT' ? '' : prev.capacity
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // Clear the error for this field as user types
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            capacity: '',
            location: '',
            availableFrom: '',
            availableTo: '',
            description: ''
        });
        setEditingResourceId(null);
        setFormErrors({});
    };

    const closeForm = () => {
        resetForm();
        setShowForm(false);
    };

    const handleEditClick = (resource) => {
        setEditingResourceId(resource.id);
        setFormData({
            name: resource.name || '',
            type: resource.type || '',
            capacity: resource.capacity ?? '',
            location: resource.location || '',
            availableFrom: resource.availableFrom || '',
            availableTo: resource.availableTo || '',
            description: resource.description || ''
        });
        setFormErrors({});
        setShowForm(true);
        setResourceToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        try {
            setSubmitting(true);

            const payload = {
                ...formData,
                capacity: formData.capacity === '' ? null : Number(formData.capacity)
            };

            if (editingResourceId) {
                const response = await updateResource(editingResourceId, payload);
                const updatedResource = response.data;

                setResources((prev) =>
                    prev.map((resource) =>
                        resource.id === editingResourceId ? updatedResource : resource
                    )
                );

                setSuccessMessage('Resource updated successfully');
            } else {
                const response = await createResource({
                    ...payload,
                    status: 'ACTIVE'
                });
                const createdResource = response.data;

                setResources((prev) => [createdResource, ...prev]);
                setSuccessMessage('Resource created successfully');
            }

            resetForm();
            setShowForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save resource:', error);
            alert(
                error?.response?.data?.message ||
                'Failed to save resource. Please check the form and try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Admin Resources" notificationCount={0}>
            <div className="resources-page">
                <div className={`toast-notification ${toast.show ? 'toast-show' : ''}`}>
                    <div className="toast-icon">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                                d="M2 5l2 2 4-4"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span>"{toast.name}" deleted successfully</span>
                    {toast.show && <div className="toast-progress" />}
                </div>

                <section className="resources-header">
                    <div className="resources-header-top">
                        <div>
                            <h2>Manage Resources</h2>
                            <p>View and manage all campus resources in the system.</p>
                        </div>
                        <button
                            type="button"
                            className="add-resource-btn"
                            onClick={() => {
                                if (showForm && editingResourceId === null) {
                                    closeForm();
                                } else {
                                    resetForm();
                                    setShowForm(true);
                                }
                            }}
                        >
                            {showForm && editingResourceId === null ? 'Close Form' : '+ Add Resource'}
                        </button>
                    </div>
                </section>

                {successMessage && (
                    <div className="resources-message success-message">
                        <p>{successMessage}</p>
                    </div>
                )}

                {showForm && (
                    <section className="resource-form-section">
                        <h3>{editingResourceId ? 'Edit Resource' : 'Create New Resource'}</h3>

                        <form className="resource-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Resource Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter resource name"
                                />
                                {formErrors.name && <small className="error-text">{formErrors.name}</small>}
                            </div>

                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select type</option>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Lab</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
                                {formErrors.type && <small className="error-text">{formErrors.type}</small>}
                            </div>

                            {isSpaceResource && (
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        placeholder="Enter capacity"
                                        min="1"
                                    />
                                    {formErrors.capacity && <small className="error-text">{formErrors.capacity}</small>}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location"
                                />
                                {formErrors.location && <small className="error-text">{formErrors.location}</small>}
                            </div>

                            <div className="form-group">
                                <label>Available From</label>
                                <input
                                    type="time"
                                    name="availableFrom"
                                    value={formData.availableFrom}
                                    onChange={handleInputChange}
                                />
                                {formErrors.availableFrom && <small className="error-text">{formErrors.availableFrom}</small>}
                            </div>

                            <div className="form-group">
                                <label>Available To</label>
                                <input
                                    type="time"
                                    name="availableTo"
                                    value={formData.availableTo}
                                    onChange={handleInputChange}
                                />
                                {formErrors.availableTo && <small className="error-text">{formErrors.availableTo}</small>}
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description"
                                    rows="4"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? editingResourceId
                                            ? 'Updating...'
                                            : 'Creating...'
                                        : editingResourceId
                                            ? 'Update Resource'
                                            : 'Create Resource'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {loading && (
                    <div className="resources-message">
                        <p>Loading resources...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="resources-message error-message">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="resources-filters better-filters">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by resource name or location..."
                                value={filters.search}
                                onChange={handleFilterChange}
                            />

                            <select name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">All types</option>
                                <option value="LECTURE_HALL">Lecture Hall</option>
                                <option value="LAB">Lab</option>
                                <option value="MEETING_ROOM">Meeting Room</option>
                                <option value="EQUIPMENT">Equipment</option>
                            </select>

                            <select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                <option value="OUT_OF_SERVICE">Out of Service</option>
                            </select>

                            <input
                                type="number"
                                name="minCapacity"
                                placeholder="Min capacity"
                                value={filters.minCapacity}
                                onChange={handleFilterChange}
                                min="1"
                            />

                            <button
                                type="button"
                                className="clear-filter-btn"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>
                        </div>

                        <p className="resources-count">
                            Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                        </p>

                        {filteredResources.length === 0 ? (
                            <div className="resources-message">
                                <p>No resources match your filters.</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table className="resource-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Location</th>
                                        <th>Capacity</th>
                                        <th>Available</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredResources.map((resource) => (
                                        <tr key={resource.id}>
                                            <td data-label="Name">{resource.name}</td>
                                            <td data-label="Type">{formatType(resource.type)}</td>
                                            <td data-label="Location">{resource.location}</td>
                                            <td data-label="Capacity">{resource.capacity ?? '—'}</td>
                                            <td data-label="Available">
                                                {resource.availableFrom} – {resource.availableTo}
                                            </td>
                                            <td data-label="Status">
                                                    <span className={`status-badge ${resource.status?.toLowerCase()}`}>
                                                        {formatStatus(resource.status)}
                                                    </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="resource-actions">
                                                    <button
                                                        type="button"
                                                        className="download-btn better-download-btn"
                                                        onClick={() => handleDownloadResourcePdf(resource)}
                                                        title="Download resource details as PDF"
                                                    >
                                                        <Download size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="edit-btn better-edit-btn"
                                                        onClick={() => handleEditClick(resource)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-btn better-delete-btn"
                                                        onClick={() => setResourceToDelete(resource)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {resourceToDelete && (
                    <div className="delete-modal-overlay">
                        <div className="delete-modal">
                            <h3>Delete Resource</h3>
                            <p>
                                Are you sure you want to delete <strong>{resourceToDelete.name}</strong>?
                            </p>
                            <p className="delete-warning">This action cannot be undone.</p>

                            <div className="delete-modal-actions">
                                <button
                                    type="button"
                                    className="modal-no-btn"
                                    onClick={() => setResourceToDelete(null)}
                                >
                                    No
                                </button>
                                <button
                                    type="button"
                                    className="modal-yes-btn"
                                    onClick={confirmDelete}
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminResourcesPage;
