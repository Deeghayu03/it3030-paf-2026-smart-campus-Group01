import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { getResources } from '../../services/resourceService';
import '../Dashboard/DashboardPage.css';
import './ResourcesPage.css';

const AdminResourcesPage = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        const loadResources = async () => {
            try {
                const data = await getResources();
                setResources(data);
            } catch (error) {
                console.error('Failed to load resources:', error);
            }
        };

        loadResources();
    }, []);

    return (
        <DashboardLayout title="Admin Resources" notificationCount={0}>
            <div className="resources-page">
                <section className="resources-header">
                    <h2>Manage Resources</h2>
                    <p>View and manage all campus resources in the system.</p>
                </section>

                <div className="resource-grid">
                    {resources.map((resource) => (
                        <div className="resource-card" key={resource.id}>
                            <div className="resource-card-header">
                                <h3>{resource.name}</h3>
                                <span className={`status-badge ${resource.status?.toLowerCase()}`}>
                  {resource.status}
                </span>
                            </div>

                            <p><strong>Type:</strong> {resource.type?.replaceAll('_', ' ')}</p>
                            <p><strong>Location:</strong> {resource.location}</p>
                            <p><strong>Capacity:</strong> {resource.capacity ?? 'Not specified'}</p>
                            <p>
                                <strong>Available:</strong> {resource.availableFrom} - {resource.availableTo}
                            </p>

                            {resource.description && (
                                <p className="resource-description">{resource.description}</p>
                            )}

                            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                <button className="btn-primary">Edit</button>
                                <button
                                    className="btn-primary"
                                    style={{ background: '#dc2626', borderColor: '#dc2626' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminResourcesPage;