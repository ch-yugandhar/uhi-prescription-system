import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function VersionHistory({ report, onClose, onVersionSelect }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVersionHistory();
    }, [report]);

    const fetchVersionHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/reports/${report._id}/versions`);
            setVersions(response.data);
        } catch (error) {
            console.error("Error fetching version history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>📚 Version History - {report.prescriptionId}</h3>
                    <button className="btn btn-close" onClick={onClose}>✕</button>
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading"></div>
                            <p>Loading version history...</p>
                        </div>
                    ) : (
                        <div className="versions-list">
                            {versions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h4>No version history found</h4>
                                    <p>This prescription has only one version.</p>
                                </div>
                            ) : (
                                versions.map(version => (
                                    <div key={version._id} className="version-card">
                                        <div className="version-header">
                                            <div>
                                                <strong>Version {version.versionInfo?.versionNumber}</strong>
                                                <span className="version-date">
                                                    {new Date(version.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <span className={`status-badge ${version.versionInfo?.isLatest ? 'status-editable' : 'status-locked'}`}>
                                                {version.versionInfo?.isLatest ? 'Latest' : 'Previous'}
                                            </span>
                                        </div>
                                        <div className="version-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Format:</span>
                                                <span className="detail-value">{version.format || 'A4'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Created By:</span>
                                                <span className="detail-value">{version.hospitalInfo?.adminName}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Hospital:</span>
                                                <span className="detail-value">{version.hospitalInfo?.hospitalName}</span>
                                            </div>
                                        </div>
                                        <div className="version-actions">
                                            <a 
                                                href={version.pdfUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn btn-sm btn-primary"
                                            >
                                                📄 View PDF
                                            </a>
                                            {version.versionInfo?.isLatest && onVersionSelect && (
                                                <button 
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => onVersionSelect(version)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VersionHistory;