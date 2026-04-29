import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import api from '../../api/axiosConfig';
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

    const fetchResources = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/resources');
            setResources(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
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
        fetchResources();
    };

    const clearFilters = () => {
        setFilters({ type: '', status: '', location: '', minCapacity: '' });
        setSearchTerm('');
        fetchResources();
    };

    const handleStatusChange = async (id, status) => {
        try {
            setSavingId(id);
            setError('');
            setMessage('');
            await api.patch(`/resources/${id}/status`, null, { params: { status } });
            setResources((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
            setMessage('Resource status updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change resource status');
        } finally {
            setSavingId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-badge active';
            case 'UNDER_MAINTENANCE': return 'status-badge maintenance';
            case 'OUT_OF_SERVICE': return 'status-badge out';
            default: return 'status-badge';
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
        <>
            <div className="content-container">
                <div className="page">
                    <header className="page-header">
                        <p>View, search, and update campus resource statuses.</p>
                    </header>

                    <div className="page-body">
                        {message && <div className="success-alert"><span className="icon">✓</span> {message}</div>}
                        {error && <div className="error-alert"><span className="icon">⚠</span> {error}</div>}

                        <form className="filters-bar" onSubmit={applyFilters}>
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />

                            <select name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">All Types</option>
                                <option value="LECTURE_HALL">Lecture Hall</option>
                                <option value="LAB">Lab</option>
                                <option value="MEETING_ROOM">Meeting Room</option>
                                <option value="EQUIPMENT">Equipment</option>
                            </select>

                            <select name="status" value={filters.status} onChange={handleFilterChange}>
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

                            <button type="submit" className="filter-btn">Apply</button>
                            <button type="button" className="clear-btn" onClick={clearFilters}>Clear</button>
                        </form>

                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading resources...</p>
                            </div>
                        ) : filteredResources.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📂</div>
                                <h3>No resources available</h3>
                                <p>We couldn't find any resources matching your search or filters.</p>
                                <button className="clear-btn" onClick={clearFilters}>Clear all filters</button>
                            </div>
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
                                                <td className="font-bold">{resource.name}</td>
                                                <td><span className="type-badge">{resource.type?.replaceAll('_', ' ')}</span></td>
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
                                                        onChange={(e) => handleStatusChange(resource.id, e.target.value)}
                                                    >
                                                        <option value="ACTIVE">ACTIVE</option>
                                                        <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                                                        <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TechnicianResourcesPage;