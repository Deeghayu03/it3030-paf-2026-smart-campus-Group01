import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import './TechnicianResourcesPage.css';

const TechnicianResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        type: '',
        status: '',
        location: '',
        minCapacity: '',
    });

    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = 'http://localhost:8080/api/resources';

    const fetchResources = async (customFilters = filters) => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            const params = {};
            if (customFilters.type) params.type = customFilters.type;
            if (customFilters.status) params.status = customFilters.status;
            if (customFilters.location.trim()) params.location = customFilters.location.trim();
            if (customFilters.minCapacity !== '') {
                params.minCapacity = Number(customFilters.minCapacity);
            }

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            });

            setResources(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchResources(filters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            type: '',
            status: '',
            location: '',
            minCapacity: '',
        };

        setFilters(clearedFilters);
        setSearchTerm('');
        fetchResources(clearedFilters);
    };

    const handleStatusChange = async (id, status) => {
        try {
            setSavingId(id);
            setError('');
            setMessage('');

            const token = localStorage.getItem('token');

            await axios.patch(
                `${API_URL}/${id}/status`,
                null,
                {
                    params: { status },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setResources((prevResources) =>
                prevResources.map((resource) =>
                    resource.id === id ? { ...resource, status } : resource
                )
            );

            setMessage('Resource status updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change resource status');
        } finally {
            setSavingId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'status-badge active';
            case 'UNDER_MAINTENANCE':
                return 'status-badge maintenance';
            case 'OUT_OF_SERVICE':
                return 'status-badge out';
            default:
                return 'status-badge';
        }
    };

    const filteredResources = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return resources;

        return resources.filter((resource) => {
            const nameMatch = resource.name?.toLowerCase().includes(search);
            const locationMatch = resource.location?.toLowerCase().includes(search);

            return nameMatch || locationMatch;
        });
    }, [resources, searchTerm]);

    return (
        <DashboardLayout title="Technician Resources" notificationCount={2}>
            <div className="technician-resources-page">
                <div className="page-header">
                    <h2>Resource Management</h2>
                    <p>View, search, filter, and update resource statuses from one place.</p>
                </div>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form className="filters-bar" onSubmit={applyFilters}>
                    <input
                        type="text"
                        placeholder="Search by resource name or location"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Types</option>
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="LAB">Lab</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="EQUIPMENT">Equipment</option>
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                        <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                    </select>

                    <input
                        type="text"
                        name="location"
                        placeholder="Filter by location"
                        value={filters.location}
                        onChange={handleFilterChange}
                    />

                    <input
                        type="number"
                        name="minCapacity"
                        placeholder="Minimum capacity"
                        value={filters.minCapacity}
                        onChange={handleFilterChange}
                        min="1"
                    />

                    <button type="submit" className="filter-btn">
                        Apply Filters
                    </button>

                    <button
                        type="button"
                        className="clear-btn"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>
                </form>

                {loading ? (
                    <div className="loading-box">Loading resources...</div>
                ) : filteredResources.length === 0 ? (
                    <div className="empty-box">No resources found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="resources-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Capacity</th>
                                <th>Available From</th>
                                <th>Available To</th>
                                <th>Current Status</th>
                                <th>Change Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredResources.map((resource) => (
                                <tr key={resource.id}>
                                    <td>{resource.name}</td>
                                    <td>{resource.type}</td>
                                    <td>{resource.location}</td>
                                    <td>{resource.capacity ?? '-'}</td>
                                    <td>{resource.availableFrom}</td>
                                    <td>{resource.availableTo}</td>
                                    <td>
                                            <span className={getStatusClass(resource.status)}>
                                                {resource.status?.replaceAll('_', ' ')}
                                            </span>
                                    </td>
                                    <td>
                                        <select
                                            className="status-dropdown"
                                            value={resource.status || 'ACTIVE'}
                                            disabled={savingId === resource.id}
                                            onChange={(e) =>
                                                handleStatusChange(resource.id, e.target.value)
                                            }
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="UNDER_MAINTENANCE">
                                                UNDER MAINTENANCE
                                            </option>
                                            <option value="OUT_OF_SERVICE">
                                                OUT OF SERVICE
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TechnicianResourcesPage;