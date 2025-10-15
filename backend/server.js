const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. SETUP ---
const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. CONNECTIONS ---
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected.")).catch(err => console.error(err));
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
});

// ======== PUPPETEER CONFIGURATION FOR DOCKER/AWS ========
const getBrowser = async () => {
    return await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--font-render-hinting=none'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
    });
};
// ======== END PUPPETEER CONFIG ========

// --- 3. DATABASE SCHEMAS ---

const doctorSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    regdNo: { type: String, required: true },
    clinicAddress: { type: String, required: true },
    contactNumber: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

// Admin User Schema
const adminSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Medication Schema
const medicationSchema = new mongoose.Schema({ 
    name: String, 
    composition: String, 
    frequency: String, 
    timing: String, 
    duration: String, 
    quantity: String 
});

// Report Schema (Updated with additional fields)
const reportSchema = new mongoose.Schema({
    prescriptionId: { type: String, required: true },
    doctorInfo: { 
        name: String, 
        qualification: String, 
        regdNo: String, 
        clinicAddress: String 
    },
    patientInfo: { 
        name: String, 
        age: Number, 
        gender: String, 
        patientId: String 
    },
    vitals: { 
        height: Number, 
        weight: Number, 
        temp: Number, 
        hr: Number, 
        bp: String 
    },
    diagnosis: { 
        current: String, 
        known: String 
    },
    allergy: String,
    notes: String,
    // NEW FIELDS ADDED HERE
    examination: { // O/E
        nutritionalAssessment: String,
        otherFindings: String
    },
    complaints: { // C/O
        symptoms: String,
        duration: String
    },
    history: {
        personal: String, // Personal History
        family: String,   // Family History
        lastUpdated: Date
    },
    medications: [medicationSchema],
    hospitalInfo: {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
        hospitalName: { type: String, required: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
        adminName: { type: String, required: true }
    },
    versionInfo: { 
        versionNumber: { type: Number, default: 1 }, 
        isLatest: { type: Boolean, default: true }, 
        parentReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null } 
    },
    pdfUrl: String
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

// --- 4. AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, admin) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.admin = admin;
        next();
    });
};

// --- 5. UPDATED PDF HTML TEMPLATE WITH PROPER MULTI-PAGE SUPPORT ---
const generatePrescriptionHTML = (data) => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    
    const validTill = new Date();
    validTill.setMonth(validTill.getMonth() + 1);
    const validTillDate = validTill.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    // Format patient name with title
    const getPatientTitle = (gender, name) => {
        if (gender === 'F') return `Ms. ${name}`;
        if (gender === 'M') return `Mr. ${name}`;
        return name;
    };

    const patientTitle = getPatientTitle(data.patientInfo?.gender, data.patientInfo?.name || 'Patient Name');

    // Format last updated date
    const lastUpdated = data.history?.lastUpdated 
        ? new Date(data.history.lastUpdated).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
        : currentDate;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Prescription</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            background-color: #fff;
            line-height: 1.4;
        }

        .prescription-container {
            padding: 0;
        }

        .header-section {
            margin-bottom: 20px;
        }

        .patient-section {
            margin-bottom: 15px;
        }

        .vitals-section {
            margin-bottom: 15px;
        }

        .diagnosis-section {
            margin-bottom: 20px;
        }

        .medications-section {
            margin-bottom: 20px;
        }

        .footer-section {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
        }

        /* Page break support */
        .page-break {
            page-break-after: always;
            break-after: page;
        }

        .no-break {
            page-break-inside: avoid;
        }

        /* Table styles */
        .bordered-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .bordered-table th,
        .bordered-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .medications-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .medications-table th,
        .medications-table td {
            border: 1px solid #ddd;
            padding: 8px;
            vertical-align: top;
        }

        .medications-table thead th {
            background-color: #e9e9e9;
            text-align: center;
            font-weight: bold;
        }

        @media print {
            .page-break {
                page-break-after: always;
            }
            .no-break {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="prescription-container">
        <!-- Header Information -->
        <div class="header-section no-break">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 80px; vertical-align: top;">
                        <div style="width: 60px; height: 60px; background: #e9e9e9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #2c5aa0;">🏥</div>
                    </td>
                    <td style="vertical-align: top;">
                        <h1 style="margin: 0; font-size: 18pt; color: #333;">${data.doctorInfo?.name || 'Dr. Doctor Name'}</h1>
                        <p style="margin: 2px 0; font-size: 9pt; color: #555;">${data.doctorInfo?.qualification || 'Education Qualification, Speciality'}</p>
                        <p style="margin: 2px 0; font-size: 9pt; color: #555;">${data.doctorInfo?.regdNo || 'Tamil Nadu Medical Council REGD. No. 00000'}</p>
                        <p style="margin: 2px 0; font-size: 9pt; color: #555;">${data.doctorInfo?.clinicAddress || 'Clinic Address and Pincode with Clinic Time Slots'}</p>
                        <div style="background: #f0f0f0; padding: 4px 8px; border-radius: 3px; display: inline-block; margin-top: 4px;">
                            <strong>Hospital:</strong> ${data.hospitalInfo?.hospitalName || 'Unknown Hospital'}
                        </div>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 15px 0;">
        </div>

        <!-- Patient Information -->
        <div class="patient-section no-break">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                    <td style="font-size: 12pt; font-weight: bold;">${patientTitle}, ${data.patientInfo?.age || ''}yr / ${data.patientInfo?.gender || ''}</td>
                    <td style="text-align: right; font-weight: bold; font-size: 12pt;">${currentDate}</td>
                </tr>
                <tr>
                    <td style="padding-top: 4px; font-size: 10pt;">Patient ID: ${data.patientInfo?.patientId || 'N/A'}</td>
                    <td style="padding-top: 4px; text-align: right; font-size: 10pt;">Prescription ID: ${data.prescriptionId}</td>
                </tr>
            </table>
        </div>

        <!-- Vital Signs -->
        <div class="vitals-section no-break">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 20%; padding: 6px; border: 1px solid #ddd; text-align: center;"><strong>Ht:</strong> ${data.vitals?.height || ''} <span style="color:#777;">(cm)</span></td>
                    <td style="width: 20%; padding: 6px; border: 1px solid #ddd; text-align: center;"><strong>Wt:</strong> ${data.vitals?.weight || ''} <span style="color:#777;">(kg)</span></td>
                    <td style="width: 20%; padding: 6px; border: 1px solid #ddd; text-align: center;"><strong>Temp:</strong> ${data.vitals?.temp || ''} <span style="color:#777;">(F)</span></td>
                    <td style="width: 20%; padding: 6px; border: 1px solid #ddd; text-align: center;"><strong>HR:</strong> ${data.vitals?.hr || ''} <span style="color:#777;">(BPM)</span></td>
                    <td style="width: 20%; padding: 6px; border: 1px solid #ddd; text-align: center;"><strong>BP:</strong> ${data.vitals?.bp || ''} <span style="color:#777;">(mm Hg)</span></td>
                </tr>
            </table>
        </div>

        <!-- Diagnosis Information -->
        <div class="diagnosis-section no-break">
            <table class="bordered-table">
                <tr style="background-color: #f9f9f9;">
                    <td style="width: 150px;"><strong>Current Diagnosis</strong></td>
                    <td>${data.diagnosis?.current || 'No current diagnosis provided'}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                    <td><strong>Known Diagnosis</strong></td>
                    <td>${data.diagnosis?.known || 'No known diagnosis provided'}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <p style="margin: 4px 0;"><strong>Allergy:</strong> ${data.allergy || 'No allergy reported yet'}</p>
                        <p style="margin: 4px 0;"><strong>O/E:</strong> ${data.examination?.nutritionalAssessment ? `Nutritional Assessment: ${data.examination.nutritionalAssessment}` : 'No examination notes provided'}${data.examination?.otherFindings ? `, ${data.examination.otherFindings}` : ''}</p>
                        <p style="margin: 4px 0;"><strong>C/O:</strong> ${data.complaints?.symptoms ? `${data.complaints.symptoms}${data.complaints?.duration ? `: ${data.complaints.duration}` : ''}` : 'No complaints provided'}</p>
                        <p style="margin: 4px 0;"><strong>Personal History:</strong> ${data.history?.personal || 'Not specified'} • <strong>Family History:</strong> ${data.history?.family || 'Not specified'} [Updated at: ${lastUpdated}]</p>
                    </td>
                </tr>
                ${data.notes ? `
                <tr style="background-color: #f9f9f9;">
                    <td colspan="2">
                        <strong>Notes:</strong>
                        <p style="margin: 4px 0;">${data.notes}</p>
                    </td>
                </tr>
                ` : ''}
            </table>
        </div>

        <!-- Medications Section -->
        <div class="medications-section">
            <table class="medications-table">
                <thead>
                    <tr>
                        <th style="width: 5%; text-align: center; font-size: 16pt;">℞</th>
                        <th style="width: 45%; text-align: left;">Medicine & Composition</th>
                        <th style="width: 20%; text-align: center;">Frequency<br><span style="font-size: 8pt;">(MN - AF - EN - NT)</span></th>
                        <th style="width: 15%; text-align: center;">Duration</th>
                        <th style="width: 15%; text-align: center;">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${(data.medications || []).map((med, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f9f9f9'};">
                        <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                        <td>
                            <strong>${med.name || ''}</strong><br>
                            <span style="font-size: 9pt; color: #555;">${med.composition || ''}</span>
                        </td>
                        <td style="text-align: center;">
                            ${med.frequency || ''}<br>
                            <span style="font-size: 9pt; color: #555;">${med.timing || 'After food'}</span>
                        </td>
                        <td style="text-align: center;">${med.duration || ''}</td>
                        <td style="text-align: center;">${med.quantity || ''}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Footer Section -->
        <div class="footer-section no-break">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; font-size: 9pt;">
                <tbody>
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 6px; background-color: #e9e9e9;">
                            Doctor generated this prescription, and issued digitally
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 6px; text-align: center;">
                            Take medications as prescribed and follow up if symptoms persist
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 6px; background-color: #e9e9e9; font-weight: bold;">
                            ஏதேனும் எதிர்பாராத விளைவுகள் தென்பட்டால் உடனே அணுகவும்
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 8px; font-size: 8pt;">
                            <strong>குறிப்பு:</strong> மூக்கு அல்லது வாய் வழியாக சுவாச சிகிச்சை மருந்துகளை (Nasal Spray, Inhalers - MDI, DPI, Nebulization) உபயோகித்த பிறகு வெதுவெதுப்பான நீரில் சிறிது உப்பு கலந்து, தொண்டையைக் கொப்பளிப்பது நல்லது (Gargling Daily).
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 40%; background-color: #777; color: white; padding: 8px; font-weight: bold; text-align: center; vertical-align: middle;">
                            Valid till: ${validTillDate}
                        </td>
                        <td style="text-align: right; padding: 8px; vertical-align: middle;">
                            <div style="width: 120px; height: 40px; background: #f0f0f0; border: 1px dashed #ccc; display: inline-flex; align-items: center; justify-content: center; color: #666;">
                                Doctor Signature
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
};

// --- 6. AUTHENTICATION ROUTES ---

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Hospital Registration
app.post('/api/hospitals/register', async (req, res) => {
    try {
        const { name, email, address, phone, registrationNumber, adminName, adminEmail, adminPassword } = req.body;

        // Check if hospital already exists
        const existingHospital = await Hospital.findOne({ 
            $or: [{ email }, { registrationNumber }] 
        });
        if (existingHospital) {
            return res.status(400).json({ message: 'Hospital already registered' });
        }

        // Create hospital
        const hospital = new Hospital({
            name, email, address, phone, registrationNumber
        });
        await hospital.save();

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = new Admin({
            hospitalId: hospital._id,
            name: adminName,
            email: adminEmail,
            password: hashedPassword
        });
        await admin.save();

        res.status(201).json({ 
            message: 'Hospital registered successfully',
            hospital: { id: hospital._id, name: hospital.name }
        });

    } catch (error) {
        console.error('Hospital registration error:', error);
        res.status(500).json({ message: 'Error registering hospital', error: error.message });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email }).populate('hospitalId');
        if (!admin || !admin.isActive) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        const token = jwt.sign(
            { 
                id: admin._id, 
                hospitalId: admin.hospitalId._id,
                hospitalName: admin.hospitalId.name,
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                hospital: {
                    id: admin.hospitalId._id,
                    name: admin.hospitalId.name
                },
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
});

// Get current admin profile
app.get('/api/admin/profile', authenticateToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).populate('hospitalId');
        res.json({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            hospital: {
                id: admin.hospitalId._id,
                name: admin.hospitalId.name,
                address: admin.hospitalId.address
            },
            role: admin.role,
            lastLogin: admin.lastLogin
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// --- DOCTOR MANAGEMENT ROUTES ---

// Get all doctors for current hospital
app.get('/api/doctors', authenticateToken, async (req, res) => {
    try {
        const doctors = await Doctor.find({ 
            hospitalId: req.admin.hospitalId,
            isActive: true 
        }).sort({ name: 1 });
        
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching doctors", error: error.message });
    }
});

// Add new doctor to hospital
app.post('/api/doctors', authenticateToken, async (req, res) => {
    try {
        const { name, qualification, specialization, regdNo, clinicAddress, contactNumber, email } = req.body;

        // Check if doctor with same registration number already exists in this hospital
        const existingDoctor = await Doctor.findOne({
            hospitalId: req.admin.hospitalId,
            regdNo: regdNo
        });

        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor with this registration number already exists in your hospital' });
        }

        const doctor = new Doctor({
            hospitalId: req.admin.hospitalId,
            name,
            qualification,
            specialization,
            regdNo,
            clinicAddress,
            contactNumber,
            email
        });

        await doctor.save();
        res.status(201).json({ message: 'Doctor added successfully', doctor });

    } catch (error) {
        res.status(500).json({ message: "Error adding doctor", error: error.message });
    }
});

// Update doctor
app.put('/api/doctors/:id', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ 
            _id: req.params.id, 
            hospitalId: req.admin.hospitalId 
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const { name, qualification, specialization, regdNo, clinicAddress, contactNumber, email, isActive } = req.body;
        
        doctor.name = name || doctor.name;
        doctor.qualification = qualification || doctor.qualification;
        doctor.specialization = specialization || doctor.specialization;
        doctor.regdNo = regdNo || doctor.regdNo;
        doctor.clinicAddress = clinicAddress || doctor.clinicAddress;
        doctor.contactNumber = contactNumber || doctor.contactNumber;
        doctor.email = email || doctor.email;
        doctor.isActive = isActive !== undefined ? isActive : doctor.isActive;

        await doctor.save();
        res.json({ message: 'Doctor updated successfully', doctor });

    } catch (error) {
        res.status(500).json({ message: "Error updating doctor", error: error.message });
    }
});

// Delete doctor (soft delete)
app.delete('/api/doctors/:id', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ 
            _id: req.params.id, 
            hospitalId: req.admin.hospitalId 
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.isActive = false;
        await doctor.save();

        res.json({ message: 'Doctor deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: "Error deleting doctor", error: error.message });
    }
});

// --- 7. PRESCRIPTION ROUTES ---

// CREATE a report
app.post('/api/reports', authenticateToken, async (req, res) => {
    let browser;
    let pdfBuffer;
    
    try {
        console.log("📝 Starting prescription creation...");
        const reportData = req.body;
        
        // Add hospital information to report
        reportData.hospitalInfo = {
            hospitalId: req.admin.hospitalId,
            hospitalName: req.admin.hospitalName,
            adminId: req.admin.id,
            adminName: req.admin.name
        };

        // Validate required fields
        if (!reportData.prescriptionId || !reportData.patientInfo?.name) {
            return res.status(400).json({ 
                message: "Prescription ID and Patient Name are required" 
            });
        }

        console.log("🖨️ Launching Puppeteer for PDF generation...");
        try {
            // ======== CHANGED: USING getBrowser() FOR DOCKER/AWS ========
            browser = await getBrowser();
            // ======== END CHANGE ========
            
            const page = await browser.newPage();
            
            console.log("📄 Generating PDF content...");
            const htmlContent = generatePrescriptionHTML(reportData);
                
            await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
            
            console.log("📤 Generating PDF buffer...");

            // Create simple header and footer templates for Puppeteer
            const headerTemplate = `
                <div style="width: 100%; font-size: 8pt; text-align: center; padding: 8px; border-bottom: 1px solid #ccc; color: #666;">
                    <strong>${reportData.hospitalInfo?.hospitalName || 'UHI Hospital'}</strong> - Medical Prescription
                </div>
            `;

            const footerTemplate = `
                <div style="width: 100%; font-size: 8pt; color: #666; padding: 8px; text-align: center; border-top: 1px solid #ccc;">
                    <span style="float: left;">PID: ${reportData.patientInfo?.patientId || 'N/A'}</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> • ${reportData.prescriptionId}</span>
                    <span style="float: right;">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
            `;

            pdfBuffer = await page.pdf({ 
                format: 'A4',
                printBackground: true,
                margin: { top: '100px', right: '20px', bottom: '80px', left: '20px' },
                displayHeaderFooter: true,
                headerTemplate: headerTemplate,
                footerTemplate: footerTemplate,
                timeout: 30000
            });

            await browser.close();
            browser = null;
            console.log("✅ PDF generated successfully");
        } catch (puppeteerError) {
            console.error("❌ Puppeteer failed:", puppeteerError);
            if (browser) {
                await browser.close().catch(console.error);
                browser = null;
            }
            throw new Error('PDF generation failed.');
        }

        let pdfUrl;

        // Try S3 upload only if credentials are available AND pdfBuffer exists
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && pdfBuffer) {
            try {
                console.log("☁️ Uploading to AWS S3...");
                const pdfKey = `prescriptions/${reportData.prescriptionId}-${Date.now()}.pdf`;
                const command = new PutObjectCommand({ 
                    Bucket: process.env.AWS_BUCKET_NAME, 
                    Key: pdfKey, 
                    Body: pdfBuffer, 
                    ContentType: 'application/pdf'
                });
                
                await s3Client.send(command);
                pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
                console.log("✅ PDF uploaded to S3:", pdfUrl);
            } catch (s3Error) {
                console.error("❌ S3 upload failed, using local storage:", s3Error.message);
                // Fallback to base64 storage in database
                pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
            }
        } else {
            console.log("⚠️ Using local PDF storage (no S3)");
            pdfUrl = pdfBuffer ? `data:application/pdf;base64,${pdfBuffer.toString('base64')}` : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        }

        // Remove _id from the data to avoid duplicate key errors
        const { _id, ...cleanReportData } = reportData;
        
        const newReport = new Report({ 
            ...cleanReportData, 
            pdfUrl 
        });
        
        await newReport.save();
        console.log("💾 Report saved to database");

        res.status(201).json(newReport);

    } catch (error) {
        console.error("❌ Error creating report:", error);
        
        if (browser) {
            await browser.close().catch(console.error);
        }
        
        let errorMessage = "Error creating report";
        if (error.name === 'TimeoutError') {
            errorMessage = "PDF generation timeout. Please try again.";
        } else if (error.name === 'CredentialsProviderError') {
            errorMessage = "AWS credentials issue. Check your .env file.";
        } else if (error.code === 'NetworkingError') {
            errorMessage = "Network error. Check your internet connection.";
        }
        
        res.status(500).json({ 
            message: errorMessage, 
            error: error.message
        });
    }
});

// GET all latest reports (All hospitals can see all reports)
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        const reports = await Report.find({ 'versionInfo.isLatest': true })
            .populate('hospitalInfo.hospitalId', 'name address')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
});

// GET single report by ID
app.get('/api/reports/:id', authenticateToken, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('hospitalInfo.hospitalId', 'name address');
        
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Error fetching report", error: error.message });
    }
});

// UPDATE a report (Only creating hospital can edit on same day)
app.put('/api/reports/:id', authenticateToken, async (req, res) => {
    let browser;
    let pdfBuffer;
    
    try {
        const reportToUpdate = await Report.findById(req.params.id);
        if (!reportToUpdate) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Check if current admin is from the creating hospital
        const isCreatingHospital = reportToUpdate.hospitalInfo.hospitalId.toString() === req.admin.hospitalId;
        
        const today = new Date().toISOString().slice(0, 10);
        const reportDate = reportToUpdate.createdAt.toISOString().slice(0, 10);
        
        // Only allow editing if same hospital AND same day
        if (!isCreatingHospital) {
            return res.status(403).json({ 
                message: "You can only edit prescriptions created by your hospital" 
            });
        }
        
        if (today !== reportDate) {
            return res.status(403).json({ 
                message: "Editing is only allowed on the same day." 
            });
        }

        // Mark current version as not latest
        await Report.findByIdAndUpdate(reportToUpdate._id, { 
            $set: { 'versionInfo.isLatest': false } 
        });

        const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

        // ======== CHANGED: USING getBrowser() FOR DOCKER/AWS ========
        browser = await getBrowser();
        // ======== END CHANGE ========
        
        const page = await browser.newPage();
        
        console.log("📄 Generating PDF content...");
        const htmlContent = generatePrescriptionHTML(updateData);
            
        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
        
        console.log("📤 Generating PDF buffer...");
        pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
            timeout: 30000
        });

        await browser.close();
        browser = null;
        console.log("✅ PDF generated successfully");

        let pdfUrl;
        
        // Upload to S3 if credentials available
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && pdfBuffer) {
            try {
                const pdfKey = `prescriptions/${updateData.prescriptionId}-${Date.now()}-v${reportToUpdate.versionInfo.versionNumber + 1}.pdf`;
                const command = new PutObjectCommand({ 
                    Bucket: process.env.AWS_BUCKET_NAME, 
                    Key: pdfKey, 
                    Body: pdfBuffer, 
                    ContentType: 'application/pdf'
                });
                await s3Client.send(command);
                pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
            } catch (s3Error) {
                console.error("S3 upload failed, using local storage:", s3Error.message);
                pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
            }
        } else {
            pdfUrl = pdfBuffer ? `data:application/pdf;base64,${pdfBuffer.toString('base64')}` : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        }

        // Determine parent report ID for version tracking
        const parentReportId = reportToUpdate.versionInfo.parentReportId || reportToUpdate._id;

        const newVersion = new Report({
            ...updateData,
            pdfUrl: pdfUrl,
            hospitalInfo: reportToUpdate.hospitalInfo, // Keep original hospital info
            versionInfo: {
                versionNumber: reportToUpdate.versionInfo.versionNumber + 1,
                isLatest: true,
                parentReportId: parentReportId,
            },
        });

        await newVersion.save();
        
        console.log(`✅ Version ${newVersion.versionInfo.versionNumber} created for prescription ${updateData.prescriptionId}`);
        
        res.status(200).json(newVersion);
    } catch (error) {
        console.error("❌ Error updating report:", error);
        if (browser) await browser.close().catch(console.error);
        res.status(500).json({ message: "Error updating report", error: error.message });
    }
});

// --- 8. DOWNLOAD ROUTES ---

// Download prescription in specific format
app.get('/api/reports/:id/download/:format', authenticateToken, async (req, res) => {
    let browser;
    
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const format = req.params.format || 'A4'; // A4 or A5
        
        console.log(`📥 Generating PDF download in ${format} format...`);
        
        // ======== CHANGED: USING getBrowser() FOR DOCKER/AWS ========
        browser = await getBrowser();
        // ======== END CHANGE ========
        
        const page = await browser.newPage();
        
        const htmlContent = generatePrescriptionHTML(report.toObject());
            
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ 
            format: format,
            printBackground: true,
            margin: format === 'A5' 
                ? { top: '10px', right: '10px', bottom: '10px', left: '10px' }
                : { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });
        await browser.close();
        browser = null;

        // Set response headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="prescription-${report.prescriptionId}-${format}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.send(pdfBuffer);
        
        console.log(`✅ PDF download generated in ${format} format`);
        
    } catch (error) {
        console.error("❌ Error generating PDF download:", error);
        if (browser) await browser.close().catch(console.error);
        res.status(500).json({ message: "Error generating PDF download", error: error.message });
    }
});

// --- 9. VERSION HISTORY ROUTES ---

// GET version history for a prescription
app.get('/api/reports/:id/versions', authenticateToken, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Get the root parent ID for this prescription
        const parentReportId = report.versionInfo.parentReportId || report._id;
        
        console.log(`🔍 Fetching versions for parent ID: ${parentReportId}`);
        
        // Find all versions that belong to this prescription family
        const versions = await Report.find({
            $or: [
                { _id: parentReportId }, // The original version
                { 'versionInfo.parentReportId': parentReportId } // All child versions
            ]
        })
        .populate('hospitalInfo.hospitalId', 'name address')
        .sort({ 'versionInfo.versionNumber': 1 }); // Sort by version number

        console.log(`📚 Found ${versions.length} versions`);
        
        res.json(versions);
    } catch (error) {
        console.error("❌ Error fetching version history:", error);
        res.status(500).json({ message: "Error fetching version history", error: error.message });
    }
});

// GET specific version of a report
app.get('/api/reports/:id/version/:versionNumber', authenticateToken, async (req, res) => {
    try {
        const parentReport = await Report.findById(req.params.id);
        if (!parentReport) {
            return res.status(404).json({ message: "Report not found" });
        }

        const parentReportId = parentReport.versionInfo.parentReportId || parentReport._id;
        const versionNumber = parseInt(req.params.versionNumber);
        
        const version = await Report.findOne({
            $or: [
                { _id: parentReportId, 'versionInfo.versionNumber': versionNumber },
                { 'versionInfo.parentReportId': parentReportId, 'versionInfo.versionNumber': versionNumber }
            ]
        })
        .populate('hospitalInfo.hospitalId', 'name address');

        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }

        res.json(version);
    } catch (error) {
        res.status(500).json({ message: "Error fetching version", error: error.message });
    }
});

// Development endpoints (for testing without auth)
app.post('/api/reports/dev', async (req, res) => {
    try {
        console.log("🚀 Using development endpoint (no PDF generation)");
        const reportData = req.body;
        
        // Validate required fields
        if (!reportData.prescriptionId || !reportData.patientInfo?.name) {
            return res.status(400).json({ 
                message: "Prescription ID and Patient Name are required" 
            });
        }

        // Remove _id to avoid duplicate key errors
        const { _id, ...cleanReportData } = reportData;

        // Create a dummy PDF URL for development
        const dummyPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        
        const newReport = new Report({ 
            ...cleanReportData, 
            pdfUrl: dummyPdfUrl,
            hospitalInfo: {
                hospitalId: new mongoose.Types.ObjectId(),
                hospitalName: 'Development Hospital',
                adminId: new mongoose.Types.ObjectId(),
                adminName: 'Dev Admin'
            }
        });
        
        await newReport.save();
        console.log("✅ Development report saved successfully");
        
        res.status(201).json(newReport);
        
    } catch (error) {
        console.error("❌ Error in dev route:", error);
        res.status(500).json({ 
            message: "Error creating report in dev mode", 
            error: error.message 
        });
    }
});

// --- 10. SERVER START (UPDATED FOR DOCKER) ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = app;