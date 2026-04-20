import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import {
    getResources,
    deleteResource,
    createResource,
    updateResource
} from '../../services/resourceService';
import '../Dashboard/DashboardPage.css';
import './ResourcesPage.css';

const AdminResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [toast, setToast] = useState({ show: false, name: '' });
    const [editingResourceId, setEditingResourceId] = useState(null);

    const [filters, setFilters] = useState({
        location: '',
        type: '',
        status: ''
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

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getResources();
            setResources(data);
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const filteredResources = resources.filter((r) =>
        (!filters.location ||
            r.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.type || r.type === filters.type) &&
        (!filters.status || r.status === filters.status)
    );

    const showToast = (name) => {
        setToast({ show: true, name });
        setTimeout(() => setToast({ show: false, name: '' }), 3200);
    };

    const handleDelete = async (id) => {
        const resource = resources.find((r) => r.id === id);
        try {
            await deleteResource(id);
            setResources((prev) => prev.filter((r) => r.id !== id));
            setConfirmDeleteId(null);
            showToast(resource?.name || 'Resource');
        } catch (error) {
            console.error('Failed to delete resource:', error);
            setConfirmDeleteId(null);
            alert('Failed to delete resource. Please try again.');
        }
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
        setShowForm(true);
        setConfirmDeleteId(null);
    };

    const isSpaceResource =
        formData.type === 'LECTURE_HALL' ||
        formData.type === 'LAB' ||
        formData.type === 'MEETING_ROOM';

    const isTimeValid =
        formData.availableFrom !== '' &&
        formData.availableTo !== '' &&
        formData.availableFrom < formData.availableTo;

    const isFormValid =
        formData.name.trim() !== '' &&
        formData.type !== '' &&
        formData.location.trim() !== '' &&
        formData.availableFrom !== '' &&
        formData.availableTo !== '' &&
        isTimeValid &&
        (!isSpaceResource || formData.capacity !== '');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isTimeValid) {
            alert('Available To must be later than Available From.');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                ...formData,
                capacity: formData.capacity === '' ? null : Number(formData.capacity)
            };

            if (editingResourceId) {
                const updatedResource = await updateResource(editingResourceId, payload);

                setResources((prev) =>
                    prev.map((resource) =>
                        resource.id === editingResourceId ? updatedResource : resource
                    )
                );

                setSuccessMessage('Resource updated successfully');
            } else {
                const createdResource = await createResource({
                    ...payload,
                    status: 'ACTIVE'
                });

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
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Lab</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
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
                                        required
                                    />
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
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Available From</label>
                                <input
                                    type="time"
                                    name="availableFrom"
                                    value={formData.availableFrom}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Available To</label>
                                <input
                                    type="time"
                                    name="availableTo"
                                    value={formData.availableTo}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formData.availableFrom && formData.availableTo && !isTimeValid && (
                                    <small className="error-text">
                                        Available To must be later than Available From.
                                    </small>
                                )}
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
                                    disabled={submitting || !isFormValid}
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
                        <div className="resources-filters">
                            <input
                                type="text"
                                name="location"
                                placeholder="Search by location..."
                                value={filters.location}
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
                                <option value="OUT_OF_SERVICE">Out of Service</option>
                            </select>
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
                                        <th></th>
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
                                                        {resource.status}
                                                    </span>
                                            </td>
                                            <td data-label="Actions">
                                                {confirmDeleteId === resource.id ? (
                                                    <div className="confirm-inline">
                                                            <span className="confirm-text">
                                                                Delete "{resource.name}"? This cannot be undone.
                                                            </span>
                                                        <button
                                                            type="button"
                                                            className="btn-yes"
                                                            onClick={() => handleDelete(resource.id)}
                                                        >
                                                            Yes, delete
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="cancel-btn"
                                                            onClick={() => setConfirmDeleteId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="resource-actions">
                                                        <button
                                                            type="button"
                                                            className="edit-btn"
                                                            onClick={() => handleEditClick(resource)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() => setConfirmDeleteId(resource.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminResourcesPage;