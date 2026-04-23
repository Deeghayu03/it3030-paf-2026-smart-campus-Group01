import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import './TechnicianResourcesPage.css';

const TechnicianResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_URL = 'http://localhost:8080/api/resources';

    const fetchResources = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
    }, []);

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

    return (
        <DashboardLayout title="Technician Resources" notificationCount={2}>
            <div className="technician-resources-page">
                <div className="page-header">
                    <h2>Resource Management</h2>
                    <p>View all resources and update their status from one place.</p>
                </div>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading-box">Loading resources...</div>
                ) : resources.length === 0 ? (
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
                            {resources.map((resource) => (
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