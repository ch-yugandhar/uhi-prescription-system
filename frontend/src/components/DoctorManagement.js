import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function DoctorManagement() {
    const [doctors, setDoctors] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        qualification: '',
        specialization: '',
        regdNo: '',
        clinicAddress: '',
        contactNumber: '',
        email: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get(`${API_URL}/doctors`);
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            alert('Failed to fetch doctors');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingDoctor) {
                await axios.put(`${API_URL}/doctors/${editingDoctor._id}`, formData);
                alert('Doctor updated successfully!');
            } else {
                await axios.post(`${API_URL}/doctors`, formData);
                alert('Doctor added successfully!');
            }
            
            setShowForm(false);
            setEditingDoctor(null);
            setFormData({
                name: '',
                qualification: '',
                specialization: '',
                regdNo: '',
                clinicAddress: '',
                contactNumber: '',
                email: ''
            });
            fetchDoctors();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save doctor');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name,
            qualification: doctor.qualification,
            specialization: doctor.specialization,
            regdNo: doctor.regdNo,
            clinicAddress: doctor.clinicAddress,
            contactNumber: doctor.contactNumber || '',
            email: doctor.email || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (doctorId) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            try {
                await axios.delete(`${API_URL}/doctors/${doctorId}`);
                alert('Doctor deleted successfully!');
                fetchDoctors();
            } catch (error) {
                alert('Failed to delete doctor');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingDoctor(null);
        setFormData({
            name: '',
            qualification: '',
            specialization: '',
            regdNo: '',
            clinicAddress: '',
            contactNumber: '',
            email: ''
        });
    };

    return (
        <div className="doctor-management">
            <div className="section-header">
                <h2>👨‍⚕️ Doctor Management</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                >
                    ➕ Add Doctor
                </button>
            </div>

            {showForm && (
                <div className="form-section-card">
                    <h3>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Doctor Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label>Qualification *</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="MBBS, MD, etc."
                                />
                            </div>
                            <div className="form-group">
                                <label>Specialization *</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Cardiology, Neurology, etc."
                                />
                            </div>
                            <div className="form-group">
                                <label>Registration Number *</label>
                                <input
                                    type="text"
                                    name="regdNo"
                                    value={formData.regdNo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Tamil Nadu Medical Council REGD. No. 00000"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Clinic Address *</label>
                                <textarea
                                    name="clinicAddress"
                                    value={formData.clinicAddress}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    placeholder="Clinic address with pincode and timings"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    placeholder="+91 9876543210"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="doctor@hospital.com"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="doctors-list">
                <h3>Hospital Doctors ({doctors.length})</h3>
                {doctors.length === 0 ? (
                    <div className="empty-state">
                        <p>No doctors added yet. Add your first doctor to get started.</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {doctors.map(doctor => (
                            <div key={doctor._id} className="doctor-card">
                                <div className="doctor-info">
                                    <h4>👨‍⚕️ {doctor.name}</h4>
                                    <p><strong>Qualification:</strong> {doctor.qualification}</p>
                                    <p><strong>Specialization:</strong> {doctor.specialization}</p>
                                    <p><strong>Registration:</strong> {doctor.regdNo}</p>
                                    <p><strong>Address:</strong> {doctor.clinicAddress}</p>
                                    {doctor.contactNumber && <p><strong>Contact:</strong> {doctor.contactNumber}</p>}
                                    {doctor.email && <p><strong>Email:</strong> {doctor.email}</p>}
                                </div>
                                <div className="doctor-actions">
                                    <button 
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleEdit(doctor)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(doctor._id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorManagement;