import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        hospitalName: '',
        hospitalEmail: '',
        hospitalAddress: '',
        hospitalPhone: '',
        registrationNumber: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/admin/login`, {
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('admin', JSON.stringify(response.data.admin));
            
            setMessage('Login successful!');
            setTimeout(() => onLogin(response.data.admin), 1000);

        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await axios.post(`${API_URL}/hospitals/register`, {
                name: formData.hospitalName,
                email: formData.hospitalEmail,
                address: formData.hospitalAddress,
                phone: formData.hospitalPhone,
                registrationNumber: formData.registrationNumber,
                adminName: formData.adminName,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword
            });

            setMessage('Hospital registered successfully! You can now login.');
            setIsLogin(true);
            setFormData({
                email: '', password: '', hospitalName: '', hospitalEmail: '',
                hospitalAddress: '', hospitalPhone: '', registrationNumber: '',
                adminName: '', adminEmail: '', adminPassword: ''
            });

        } catch (error) {
            setMessage(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🏥 UHI Multi-Hospital System</h1>
                    <p>{isLogin ? 'Admin Login' : 'Hospital Registration'}</p>
                </div>

                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="tab-buttons">
                    <button 
                        className={`tab-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button 
                        className={`tab-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register Hospital
                    </button>
                </div>

                {isLogin ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="register-form">
                        <div className="form-section">
                            <h3>Hospital Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Hospital Name *</label>
                                    <input
                                        type="text"
                                        name="hospitalName"
                                        value={formData.hospitalName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Apollo Hospital"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Registration Number *</label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="HSP-12345"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hospital Email *</label>
                                    <input
                                        type="email"
                                        name="hospitalEmail"
                                        value={formData.hospitalEmail}
                                        onChange={handleChange}
                                        required
                                        placeholder="contact@hospital.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hospital Phone *</label>
                                    <input
                                        type="tel"
                                        name="hospitalPhone"
                                        value={formData.hospitalPhone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Hospital Address *</label>
                                    <textarea
                                        name="hospitalAddress"
                                        value={formData.hospitalAddress}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        placeholder="Full hospital address with pincode"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Admin Account</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Admin Name *</label>
                                    <input
                                        type="text"
                                        name="adminName"
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Admin Email *</label>
                                    <input
                                        type="email"
                                        name="adminEmail"
                                        value={formData.adminEmail}
                                        onChange={handleChange}
                                        required
                                        placeholder="admin@hospital.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        name="adminPassword"
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Hospital'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;