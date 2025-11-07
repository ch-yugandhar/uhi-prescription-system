import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import VersionHistory from './components/VersionHistory';
import DoctorManagement from './components/DoctorManagement';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const initialFormState = {
    prescriptionId: '',
    selectedDoctorId: '', 
    doctorInfo: { 
        name: '', 
        qualification: '',
        regdNo: '',
        clinicAddress: ''
    },
    patientInfo: { 
        name: '', 
        age: '', 
        gender: '',
        patientId: ''
    },
    vitals: { 
        height: '', 
        weight: '', 
        temp: '', 
        hr: '', 
        bp: '' 
    },
    diagnosis: { 
        current: '',
        currentICD: '',
        known: '' 
    },
    allergy: 'No allergy reported yet',
    notes: '',
    instructions: '',
    footerText: '',
    validTillDate: '',
    examination: {
        nutritionalAssessment: '',
        otherFindings: ''
    },
    complaints: {
        symptoms: '',
        duration: ''
    },
    history: {
        personal: '',
        family: '',
        lastUpdated: new Date()
    },
    medications: [{ 
        name: '', 
        composition: '',
        morning: '0',
        afternoon: '0',
        evening: '0',
        night: '0',
        timing: 'After food',
        duration: '', 
        quantity: '' 
    }]
};

function App() {
    const [reports, setReports] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');
    const [activeTab, setActiveTab] = useState('form');
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('admin');
        
        if (token && adminData) {
            const admin = JSON.parse(adminData);
            setCurrentAdmin(admin);
            setIsAuthenticated(true);
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkServerHealth();
            fetchReports();
            fetchDoctors();

            console.log('🔐 Current Admin:', admin);
        } else {
            checkServerHealth();
        }
    }, []);

    const checkServerHealth = async () => {
        try {
            await axios.get(`${API_URL}/health`, { timeout: 5000 });
            setServerStatus('connected');
        } catch (error) {
            setServerStatus('disconnected');
        }
    };

    const fetchReports = async () => {
        try {
            const response = await axios.get(`${API_URL}/reports`);
            setReports(response.data);
            console.log('📋 Fetched reports:', response.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    const handleLogin = (adminData) => {
        setCurrentAdmin(adminData);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        fetchReports();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setCurrentAdmin(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
        setReports([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setFormData(prev => ({ 
                ...prev, 
                [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleMedicationChange = (index, e) => {
        const { name, value } = e.target;
        const newMedications = [...formData.medications];
        newMedications[index][name] = value;
        setFormData(prev => ({ ...prev, medications: newMedications }));
    };

    const addMedication = () => {
        setFormData(prev => ({ 
            ...prev, 
            medications: [...prev.medications, { 
                name: '', 
                composition: '',
                morning: '0',
                afternoon: '0',
                evening: '0',
                night: '0',
                timing: 'After food',
                duration: '', 
                quantity: '' 
            }] 
        }));
    };

    const removeMedication = (index) => {
        if (formData.medications.length > 1) {
            const newMedications = formData.medications.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, medications: newMedications }));
        }
    };
    const fetchDoctors = async () => {
        try {
            const response = await axios.get(`${API_URL}/doctors`);
            setDoctors(response.data);
            console.log('👨‍⚕️ Fetched doctors:', response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        
        try {
            console.log("🔄 Submitting prescription...");
            
            let response;
            if (formData._id) {
                console.log("📝 Updating existing prescription:", formData._id);
                response = await axios.put(`${API_URL}/reports/${formData._id}`, formData, {
                    timeout: 45000
                });
            } else {
                console.log("🆕 Creating new prescription");
                response = await axios.post(`${API_URL}/reports`, formData, {
                    timeout: 45000
                });
            }

            console.log('✅ Prescription operation successful:', response.data);

            const message = formData._id 
                ? `Prescription updated successfully! (Version ${response.data.versionInfo?.versionNumber})` 
                : `Prescription created successfully!`;
            
            setSuccessMessage(message);
            
            await fetchReports();
            setFormData(initialFormState);
            setSelectedReport(null);
            setActiveTab('reports');
            
        } catch (error) {
            console.error("💥 Final error submitting report:", error);
            
            let userMessage = 'Failed to submit prescription. ';
            
            if (error.code === 'ECONNABORTED') {
                userMessage += 'Request timeout. The server might be busy.';
            } else if (error.response) {
                userMessage += error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                userMessage += 'No response from server. Please check if backend is running.';
            } else {
                userMessage += error.message;
            }
            
            alert(userMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (report, format = 'A4') => {
        try {
            const response = await axios.get(`${API_URL}/reports/${report._id}/download/${format}`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prescription-${report.prescriptionId}-${format}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log(`✅ Downloaded prescription in ${format} format`);
        } catch (error) {
            console.error('❌ Download error:', error);
            alert('Failed to download prescription');
        }
    };

    const isEditable = (report) => {
        if (!report || !currentAdmin) return false;
        
        let reportHospitalId;
        if (report.hospitalInfo?.hospitalId) {
            if (typeof report.hospitalInfo.hospitalId === 'object') {
                reportHospitalId = report.hospitalInfo.hospitalId._id;
            } else {
                reportHospitalId = report.hospitalInfo.hospitalId;
            }
        }
        
        const currentHospitalId = currentAdmin.hospital.id;
        
        const isSameHospital = reportHospitalId?.toString() === currentHospitalId?.toString();
        
        const today = new Date().toISOString().slice(0, 10);
        const reportDate = new Date(report.createdAt).toISOString().slice(0, 10);
        const isSameDay = today === reportDate;
        
        const canEdit = isSameHospital && isSameDay;
        
        console.log('✏️ Edit Permission:', {
            prescriptionId: report.prescriptionId,
            isSameHospital,
            isSameDay,
            canEdit
        });
        
        return canEdit;
    };

    const isFromMyHospital = (report) => {
        if (!report || !currentAdmin) return false;
        
        let reportHospitalId;
        if (report.hospitalInfo?.hospitalId) {
            if (typeof report.hospitalInfo.hospitalId === 'object') {
                reportHospitalId = report.hospitalInfo.hospitalId._id;
            } else {
                reportHospitalId = report.hospitalInfo.hospitalId;
            }
        }
        
        const currentHospitalId = currentAdmin.hospital.id;
        
        return reportHospitalId?.toString() === currentHospitalId?.toString();
    };

    const isOldPrescription = (report) => {
        const today = new Date().toISOString().slice(0, 10);
        const reportDate = new Date(report.createdAt).toISOString().slice(0, 10);
        return today !== reportDate;
    };

    const filteredReports = reports.filter(report => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        
        const prescriptionId = report.prescriptionId || '';
        const patientName = report.patientInfo?.name || '';
        const patientId = report.patientInfo?.patientId || '';
        const hospitalName = report.hospitalInfo?.hospitalName || '';
        
        return (
            prescriptionId.toLowerCase().includes(searchLower) ||
            patientName.toLowerCase().includes(searchLower) ||
            patientId.toLowerCase().includes(searchLower) ||
            hospitalName.toLowerCase().includes(searchLower)
        );
    });

    const clearForm = () => {
        setFormData(initialFormState);
        setSelectedReport(null);
        setSuccessMessage('');
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="app">
            {/* Header */}
            <div className="app-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>🏥 UHI Multi-Hospital System</h1>
                        <div className="hospital-info">
                            <strong>{currentAdmin?.hospital?.name}</strong>
                            <span>Logged in as: {currentAdmin?.name}</span>
                            <small>Hospital ID: {currentAdmin?.hospital?.id}</small>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className={`server-status ${serverStatus}`}>
                            {serverStatus === 'connected' ? '✅ Online' : '❌ Offline'}
                        </div>
                        <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="navigation-tabs">
                <button 
                    className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
                    onClick={() => setActiveTab('form')}
                >
                    📝 {formData._id ? 'Edit Prescription' : 'New Prescription'}
                </button>
                <button 
                    className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    📋 All Prescriptions ({reports.length})
                </button>
                <button 
                    className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('doctors')}
                >
                    👨‍⚕️ Manage Doctors
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="success-message">
                    ✅ {successMessage}
                </div>
            )}

            <div className="app-content">
                {/* Form Section */}
                {activeTab === 'form' && (
                    <div className="form-section">
                        <div className="section-header">
                            <h2>{formData._id ? `Edit Prescription (Version ${formData.versionInfo?.versionNumber || 1})` : 'Create New Prescription'}</h2>
                            {formData._id && (
                                <button className="btn btn-secondary" onClick={clearForm}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="prescription-form">
                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <button type="button" className="btn btn-outline" onClick={clearForm}>
                                    🗑️ Clear Form
                                </button>
                                <button type="button" className="btn btn-outline" onClick={() => {
                                    setFormData({
                                        ...initialFormState,
                                        prescriptionId: `RX-${Date.now().toString().slice(-6)}`,
                                        patientInfo: {
                                            ...initialFormState.patientInfo,
                                            patientId: `PID-${Date.now().toString().slice(-4)}`
                                        }
                                    });
                                }}>
                                    🎲 Generate IDs
                                </button>
                            </div>

                            {/* Prescription Info */}
                            <div className="form-section-card">
                                <h3>📄 Prescription Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Prescription ID *</label>
                                        <input 
                                            name="prescriptionId" 
                                            value={formData.prescriptionId} 
                                            placeholder="e.g., 234192-2" 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input 
                                            type="date" 
                                            value={new Date().toISOString().slice(0, 10)}
                                            readOnly 
                                            className="readonly"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Doctor Selection */}
                            <div className="form-section-card">
                                <h3>👨‍⚕️ Doctor Information</h3>
                                <div className="form-group">
                                    <label>Select Doctor *</label>
                                    <select 
                                        name="selectedDoctorId" 
                                        value={formData.selectedDoctorId || ''} 
                                        onChange={(e) => {
                                            const selectedDoctor = doctors.find(d => d._id === e.target.value);
                                            if (selectedDoctor) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    selectedDoctorId: selectedDoctor._id,
                                                    doctorInfo: {
                                                        name: selectedDoctor.name,
                                                        qualification: selectedDoctor.qualification,
                                                        regdNo: selectedDoctor.regdNo,
                                                        clinicAddress: selectedDoctor.clinicAddress
                                                    }
                                                }));
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">Select a doctor</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor._id} value={doctor._id}>
                                                {doctor.name} - {doctor.specialization} ({doctor.qualification})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {formData.doctorInfo && (
                                    <div className="doctor-preview">
                                        <h4>Selected Doctor Details:</h4>
                                        <p><strong>Name:</strong> {formData.doctorInfo.name}</p>
                                        <p><strong>Qualification:</strong> {formData.doctorInfo.qualification}</p>
                                        <p><strong>Registration:</strong> {formData.doctorInfo.regdNo}</p>
                                        <p><strong>Address:</strong> {formData.doctorInfo.clinicAddress}</p>
                                    </div>
                                )}
                            </div>

                            {/* Patient Information */}
                            <div className="form-section-card">
                                <h3>👤 Patient Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Patient Name *</label>
                                        <input 
                                            name="patientInfo.name" 
                                            value={formData.patientInfo.name} 
                                            placeholder="Full Name" 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Patient ID</label>
                                        <input 
                                            name="patientInfo.patientId" 
                                            value={formData.patientInfo.patientId} 
                                            placeholder="e.g., 3891" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input 
                                            name="patientInfo.age" 
                                            value={formData.patientInfo.age} 
                                            placeholder="Age" 
                                            type="number" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select 
                                            name="patientInfo.gender" 
                                            value={formData.patientInfo.gender} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                            <option value="O">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Vital Signs */}
                            <div className="form-section-card">
                                <h3>📊 Vital Signs</h3>
                                <div className="form-grid compact">
                                    <div className="form-group">
                                        <label>Height (cm)</label>
                                        <input 
                                            name="vitals.height" 
                                            value={formData.vitals.height} 
                                            placeholder="163" 
                                            type="number" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight (kg)</label>
                                        <input 
                                            name="vitals.weight" 
                                            value={formData.vitals.weight} 
                                            placeholder="59" 
                                            type="number" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Temp (°F)</label>
                                        <input 
                                            name="vitals.temp" 
                                            value={formData.vitals.temp} 
                                            placeholder="98.6" 
                                            type="number" 
                                            step="0.1"
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>HR (BPM)</label>
                                        <input 
                                            name="vitals.hr" 
                                            value={formData.vitals.hr} 
                                            placeholder="72" 
                                            type="number" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>BP (mmHg)</label>
                                        <input 
                                            name="vitals.bp" 
                                            value={formData.vitals.bp} 
                                            placeholder="120-80" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div className="form-section-card">
                                <h3>🩺 Diagnosis</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Current Diagnosis</label>
                                        <textarea 
                                            name="diagnosis.current" 
                                            value={formData.diagnosis.current} 
                                            placeholder="e.g., Cholera due to Vibrio cholerae..." 
                                            rows="3"
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ICD Code (optional)</label>
                                        <input 
                                            name="diagnosis.currentICD" 
                                            value={formData.diagnosis.currentICD} 
                                            placeholder="e.g., A00.0" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Known Diagnosis</label>
                                        <textarea 
                                            name="diagnosis.known" 
                                            value={formData.diagnosis.known} 
                                            placeholder="e.g., DM, PTB" 
                                            rows="3"
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Allergies</label>
                                    <input 
                                        name="allergy" 
                                        value={formData.allergy} 
                                        placeholder="No allergy reported yet" 
                                        onChange={handleInputChange} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Clinical Notes</label>
                                    <textarea 
                                        name="notes" 
                                        value={formData.notes} 
                                        placeholder="Enter clinical notes and observations..." 
                                        rows="4"
                                        onChange={handleInputChange} 
                                    />
                                </div>
                            </div>

                            {/* Examination Section */}
                            <div className="form-section-card">
                                <h3>🔍 Examination (O/E)</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nutritional Assessment</label>
                                        <input 
                                            name="examination.nutritionalAssessment" 
                                            value={formData.examination.nutritionalAssessment} 
                                            placeholder="e.g., Slim, Normal, Overweight" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Other Findings</label>
                                        <input 
                                            name="examination.otherFindings" 
                                            value={formData.examination.otherFindings} 
                                            placeholder="Additional examination notes" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Complaints Section */}
                            <div className="form-section-card">
                                <h3>📋 Complaints (C/O)</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Symptoms</label>
                                        <input 
                                            name="complaints.symptoms" 
                                            value={formData.complaints.symptoms} 
                                            placeholder="e.g., Sputum, Shortness of Breath" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration</label>
                                        <input 
                                            name="complaints.duration" 
                                            value={formData.complaints.duration} 
                                            placeholder="e.g., 2 Day(s)" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="form-section-card">
                                <h3>📖 History</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Personal History</label>
                                        <input 
                                            name="history.personal" 
                                            value={formData.history.personal} 
                                            placeholder="e.g., Not a smoker" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Family History</label>
                                        <input 
                                            name="history.family" 
                                            value={formData.history.family} 
                                            placeholder="e.g., PTB" 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Updated</label>
                                        <input 
                                            type="date" 
                                            name="history.lastUpdated" 
                                            value={formData.history.lastUpdated ? new Date(formData.history.lastUpdated).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Medications */}
                            <div className="form-section-card medication-section">
                                <div className="medication-header">
                                    <h3>💊 Medications</h3>
                                    <span className="medication-count">
                                        {formData.medications.length} medication(s)
                                    </span>
                                </div>
                                
                                {formData.medications.map((med, index) => (
                                    <div key={index} className="medication-row">
                                        <div className="med-row-number">#{index + 1}</div>
                                        <div className="med-row-content">
                                            <div className="med-row-grid">
                                                <div className="form-group">
                                                    <label>Medicine Name</label>
                                                    <input 
                                                        name="name" 
                                                        placeholder="e.g., P-650 TABLET" 
                                                        value={med.name} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Composition</label>
                                                    <input 
                                                        name="composition" 
                                                        placeholder="e.g., Paracetamol 650mg" 
                                                        value={med.composition} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="frequency-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '10px 0'}}>
                                                <div className="form-group">
                                                    <label>Morning (MN)</label>
                                                    <input 
                                                        name="morning" 
                                                        placeholder="0" 
                                                        type="number"
                                                        min="0"
                                                        value={med.morning} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Afternoon (AF)</label>
                                                    <input 
                                                        name="afternoon" 
                                                        placeholder="0" 
                                                        type="number"
                                                        min="0"
                                                        value={med.afternoon} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Evening (EN)</label>
                                                    <input 
                                                        name="evening" 
                                                        placeholder="0" 
                                                        type="number"
                                                        min="0"
                                                        value={med.evening} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Night (NT)</label>
                                                    <input 
                                                        name="night" 
                                                        placeholder="0" 
                                                        type="number"
                                                        min="0"
                                                        value={med.night} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="med-row-grid">
                                                <div className="form-group">
                                                    <label>Timing</label>
                                                    <select 
                                                        name="timing" 
                                                        value={med.timing} 
                                                        onChange={(e) => handleMedicationChange(index, e)}
                                                    >
                                                        <option value="After food">After food</option>
                                                        <option value="Before food">Before food</option>
                                                        <option value="With food">With food</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Duration</label>
                                                    <input 
                                                        name="duration" 
                                                        placeholder="e.g., 5 days" 
                                                        value={med.duration} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Quantity</label>
                                                    <input 
                                                        name="quantity" 
                                                        placeholder="e.g., 15 Tablet(s)" 
                                                        value={med.quantity} 
                                                        onChange={(e) => handleMedicationChange(index, e)} 
                                                    />
                                                </div>
                                            </div>
                                            {formData.medications.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeMedication(index)}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                <button type="button" className="btn btn-add" onClick={addMedication}>
                                    ➕ Add Another Medication
                                </button>
                            </div>

                            {/* Instructions Section */}
                            <div className="form-section-card">
                                <h3>📋 Instructions</h3>
                                <div className="form-group">
                                    <label>Instructions for Patient</label>
                                    <textarea 
                                        name="instructions" 
                                        value={formData.instructions} 
                                        placeholder="Enter special instructions for the patient (e.g., dietary advice, precautions, follow-up instructions)" 
                                        rows="4"
                                        onChange={handleInputChange} 
                                    />
                                </div>
                            </div>

                            {/* Footer & Validity Section */}
                            <div className="form-section-card">
                                <h3>📄 Footer & Validity</h3>
                                <div className="form-group">
                                    <label>Footer Text (Multi-language supported)</label>
                                    <textarea 
                                        name="footerText" 
                                        value={formData.footerText} 
                                        placeholder="Enter footer text in any language (e.g., Tamil, Hindi, English)" 
                                        rows="3"
                                        onChange={handleInputChange} 
                                    />
                                    <small style={{color: '#666', fontSize: '0.9em', marginTop: '5px', display: 'block'}}>
                                        ℹ️ This text will appear at the bottom of the prescription. UTF-8 encoding supports all languages.
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Valid Till Date</label>
                                    <input 
                                        type="date" 
                                        name="validTillDate" 
                                        value={formData.validTillDate ? new Date(formData.validTillDate).toISOString().split('T')[0] : ''} 
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleInputChange} 
                                    />
                                    <small style={{color: '#666', fontSize: '0.9em', marginTop: '5px', display: 'block'}}>
                                        ℹ️ Leave empty to use default (30 days from today)
                                    </small>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={clearForm}
                                    disabled={loading}
                                >
                                    Clear Form
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn submit-btn" 
                                    disabled={loading || serverStatus === 'disconnected'}
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading"></div>
                                            {formData._id ? 'Updating...' : 'Generating...'}
                                        </>
                                    ) : (
                                        formData._id ? '📝 Update Prescription' : '✨ Generate Prescription'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Reports Section */}
                {activeTab === 'reports' && (
                    <div className="reports-section">
                        <div className="reports-header">
                            <h2>📋 All Prescription Records</h2>
                            <div className="reports-controls">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search by ID, name, patient ID, or hospital..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setActiveTab('form')}
                                >
                                    ➕ New Prescription
                                </button>
                            </div>
                        </div>

                        <div className="reports-stats">
                            <div className="stat-card">
                                <div className="stat-number">{reports.length}</div>
                                <div className="stat-label">Total Prescriptions</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {reports.filter(r => isEditable(r)).length}
                                </div>
                                <div className="stat-label">Editable by You</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {reports.filter(r => isFromMyHospital(r)).length}
                                </div>
                                <div className="stat-label">From Your Hospital</div>
                            </div>
                        </div>

                        <div className="reports-list">
                            {filteredReports.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h3>No prescriptions found</h3>
                                    <p>
                                        {searchTerm ? 
                                            'No prescriptions match your search. Try different keywords.' : 
                                            'Get started by creating your first prescription.'
                                        }
                                    </p>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setActiveTab('form')}
                                    >
                                        Create First Prescription
                                    </button>
                                </div>
                            ) : (
                                filteredReports.map(report => {
                                    const fromMyHospital = isFromMyHospital(report);
                                    const editable = isEditable(report);
                                    const isOld = isOldPrescription(report);
                                    
                                    let statusText = '👁️ View Only';
                                    let statusClass = 'status-locked';
                                    
                                    if (editable) {
                                        statusText = '✏️ Editable';
                                        statusClass = 'status-editable';
                                    } else if (fromMyHospital && isOld) {
                                        statusText = '🔒 Locked (Old)';
                                        statusClass = 'status-locked';
                                    } else if (fromMyHospital) {
                                        statusText = '👁️ View Only (Your Hospital)';
                                        statusClass = 'status-locked';
                                    }
                                    
                                    return (
                                        <div 
                                            key={report._id} 
                                            className={`report-card ${selectedReport?._id === report._id ? 'selected' : ''}`}
                                            onClick={() => setSelectedReport(report)}
                                        >
                                            <div className="report-header">
                                                <div>
                                                    <h4>📄 {report.prescriptionId}</h4>
                                                    <div className="hospital-badge">
                                                        🏥 {report.hospitalInfo?.hospitalName || 'Unknown Hospital'}
                                                        {fromMyHospital && ' (Your Hospital)'}
                                                    </div>
                                                </div>
                                                <span className={`status-badge ${statusClass}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <div className="report-content">
                                                <div className="patient-info">
                                                    <strong>👤 {report.patientInfo?.name || 'Unknown Patient'}</strong>
                                                    <span>{report.patientInfo?.age || 'N/A'}yr / {report.patientInfo?.gender || 'N/A'}</span>
                                                </div>
                                                <div className="report-meta">
                                                    <span>🆔 {report.patientInfo?.patientId || 'N/A'}</span>
                                                    <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                                                    <span>👨‍⚕️ {report.hospitalInfo?.adminName || 'Unknown Admin'}</span>
                                                    {report.versionInfo && (
                                                        <span>🔢 v{report.versionInfo.versionNumber}</span>
                                                    )}
                                                </div>
                                                <div className="medication-preview">
                                                    {(report.medications || []).slice(0, 2).map((med, idx) => (
                                                        <span key={idx} className="med-tag">{med.name}</span>
                                                    ))}
                                                    {(report.medications || []).length > 2 && (
                                                        <span className="med-tag more">+{(report.medications || []).length - 2} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Report Details Sidebar */}
                        {selectedReport && (
                            <div className="report-details-overlay">
                                <div className="report-details">
                                    <div className="details-header">
                                        <div>
                                            <h3>Prescription Details</h3>
                                            <div className="hospital-badge large">
                                                🏥 {selectedReport.hospitalInfo?.hospitalName || 'Unknown Hospital'}
                                                {isFromMyHospital(selectedReport) && ' (Your Hospital)'}
                                            </div>
                                        </div>
                                        <button 
                                            className="btn btn-close"
                                            onClick={() => setSelectedReport(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    
                                    <div className="details-content">
                                        <div className="detail-group">
                                            <label>Status</label>
                                            <div className="detail-value">
                                                <span className={`status-badge ${isEditable(selectedReport) ? 'status-editable' : 'status-locked'}`}>
                                                    {isEditable(selectedReport) ? '✏️ Editable' : 
                                                     isFromMyHospital(selectedReport) ? '🔒 Locked' : '👁️ View Only'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Prescription ID</label>
                                            <div className="detail-value">{selectedReport.prescriptionId}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Version</label>
                                            <div className="detail-value">
                                                Version {selectedReport.versionInfo?.versionNumber || 1}
                                                {selectedReport.versionInfo?.isLatest && ' (Latest)'}
                                            </div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Patient</label>
                                            <div className="detail-value">
                                                {selectedReport.patientInfo?.name || 'Unknown Patient'} ({selectedReport.patientInfo?.age || 'N/A'}yr / {selectedReport.patientInfo?.gender || 'N/A'})
                                            </div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Patient ID</label>
                                            <div className="detail-value">{selectedReport.patientInfo?.patientId || 'N/A'}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Created By</label>
                                            <div className="detail-value">
                                                {selectedReport.hospitalInfo?.adminName || 'Unknown Admin'} 
                                                <br/>
                                                <small>from {selectedReport.hospitalInfo?.hospitalName || 'Unknown Hospital'}</small>
                                            </div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Date Created</label>
                                            <div className="detail-value">
                                                {new Date(selectedReport.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Current Diagnosis</label>
                                            <div className="detail-value">{selectedReport.diagnosis?.current || 'N/A'}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Known Diagnosis</label>
                                            <div className="detail-value">{selectedReport.diagnosis?.known || 'N/A'}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Allergies</label>
                                            <div className="detail-value">{selectedReport.allergy || 'N/A'}</div>
                                        </div>
                                        <div className="detail-group">
                                            <label>Medications</label>
                                            <div className="medications-list">
                                                {(selectedReport.medications || []).map((med, index) => (
                                                    <div key={index} className="medication-item">
                                                        <strong>{med.name}</strong>
                                                        <span>{med.composition}</span>
                                                        <small>{med.frequency} • {med.timing} • {med.duration} • {med.quantity}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedReport.notes && (
                                            <div className="detail-group">
                                                <label>Clinical Notes</label>
                                                <div className="detail-value notes">{selectedReport.notes}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="details-actions">
                                        <div className="download-options">
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => handleDownload(selectedReport, 'A4')}
                                            >
                                                📄 Download A4
                                            </button>
                                            <button 
                                                className="btn btn-outline"
                                                onClick={() => handleDownload(selectedReport, 'A5')}
                                            >
                                                📄 Download A5
                                            </button>
                                        </div>
                                        <button 
                                            className="btn btn-info"
                                            onClick={() => setShowVersionHistory(true)}
                                        >
                                            📚 Version History
                                        </button>
                                        {isEditable(selectedReport) && (
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => {
                                                    setFormData(selectedReport);
                                                    setActiveTab('form');
                                                    setSelectedReport(null);
                                                }}
                                            >
                                                ✏️ Edit Prescription
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                )}
                {/* Doctors Management Section */}
                {activeTab === 'doctors' && (
                    <DoctorManagement />
                )}

                {/* Version History Modal */}
                {showVersionHistory && selectedReport && (
                    <VersionHistory 
                        report={selectedReport}
                        onClose={() => setShowVersionHistory(false)}
                        onVersionSelect={(version) => {
                            setFormData(version);
                            setActiveTab('form');
                            setShowVersionHistory(false);
                            setSelectedReport(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default App;