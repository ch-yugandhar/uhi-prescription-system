const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected for seeding..."))
    .catch(err => console.error(err));

// Models (same as before)
const Hospital = mongoose.model('Hospital', {
    name: String,
    email: String,
    address: String,
    phone: String,
    registrationNumber: String,
    isActive: Boolean,
    createdAt: Date
});

const Admin = mongoose.model('Admin', {
    hospitalId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: Boolean
});

const Doctor = mongoose.model('Doctor', {
    hospitalId: mongoose.Schema.Types.ObjectId,
    name: String,
    qualification: String,
    specialization: String,
    regdNo: String,
    clinicAddress: String,
    contactNumber: String,
    email: String,
    isActive: Boolean
});

const Report = mongoose.model('Report', {
    prescriptionId: String,
    doctorInfo: Object,
    patientInfo: Object,
    vitals: Object,
    diagnosis: Object,
    allergy: String,
    notes: String,
    examination: Object,
    complaints: Object,
    history: Object,
    medications: Array,
    hospitalInfo: Object,
    versionInfo: Object,
    pdfUrl: String,
    createdAt: Date
});

const seedData = async () => {
    try {
        console.log('🌱 Starting to seed database...');

        // Clear existing data
        await Hospital.deleteMany({});
        await Admin.deleteMany({});
        await Doctor.deleteMany({});
        await Report.deleteMany({});

        // Create Hospitals (same as before)
        const hospitals = [
            {
                name: "Apollo Hospitals",
                email: "info@apollohospitals.com",
                address: "21 Greams Lane, Off Greams Road, Chennai - 600006",
                phone: "+91 44 2829 3333",
                registrationNumber: "HSP-APL-001",
                isActive: true,
                createdAt: new Date()
            },
            {
                name: "Fortis Malar Hospital",
                email: "contact@fortismalar.com",
                address: "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai - 600020",
                phone: "+91 44 2444 2244",
                registrationNumber: "HSP-FRT-002",
                isActive: true,
                createdAt: new Date()
            },
            {
                name: "MIOT International",
                email: "care@miotinternational.com",
                address: "4/112, Mount Poonamallee Road, Manapakkam, Chennai - 600089",
                phone: "+91 44 4200 2288",
                registrationNumber: "HSP-MIOT-003",
                isActive: true,
                createdAt: new Date()
            }
        ];

        const createdHospitals = await Hospital.insertMany(hospitals);
        console.log(`✅ Created ${createdHospitals.length} hospitals`);

        // Create Admins (same as before)
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admins = [
            {
                hospitalId: createdHospitals[0]._id,
                name: "Dr. Rajesh Kumar",
                email: "admin@apollohospitals.com",
                password: hashedPassword,
                role: "admin",
                isActive: true
            },
            {
                hospitalId: createdHospitals[1]._id,
                name: "Dr. Priya Sharma",
                email: "admin@fortismalar.com",
                password: hashedPassword,
                role: "admin",
                isActive: true
            },
            {
                hospitalId: createdHospitals[2]._id,
                name: "Dr. Arvind Patel",
                email: "admin@miotinternational.com",
                password: hashedPassword,
                role: "admin",
                isActive: true
            }
        ];

        const createdAdmins = await Admin.insertMany(admins);
        console.log(`✅ Created ${createdAdmins.length} admins`);

        // Create Doctors for each hospital (same as before)
        const doctors = [
            // Apollo Hospital Doctors
            {
                hospitalId: createdHospitals[0]._id,
                name: "Dr. Senthil Kumar",
                qualification: "MBBS, MD - General Medicine",
                specialization: "General Physician",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12345",
                clinicAddress: "Apollo Hospitals, 21 Greams Lane, Chennai. Timings: 9 AM - 5 PM",
                contactNumber: "+91 9876543210",
                email: "senthil.kumar@apollohospitals.com",
                isActive: true
            },
            {
                hospitalId: createdHospitals[0]._id,
                name: "Dr. Anitha Ravi",
                qualification: "MBBS, MS - Obstetrics & Gynecology",
                specialization: "Gynecologist",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12346",
                clinicAddress: "Apollo Hospitals, 21 Greams Lane, Chennai. Timings: 10 AM - 4 PM",
                contactNumber: "+91 9876543211",
                email: "anitha.ravi@apollohospitals.com",
                isActive: true
            },
            // Fortis Hospital Doctors
            {
                hospitalId: createdHospitals[1]._id,
                name: "Dr. Vikram Singh",
                qualification: "MBBS, DM - Cardiology",
                specialization: "Cardiologist",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12347",
                clinicAddress: "Fortis Malar Hospital, Adyar, Chennai. Timings: 11 AM - 6 PM",
                contactNumber: "+91 9876543212",
                email: "vikram.singh@fortismalar.com",
                isActive: true
            },
            {
                hospitalId: createdHospitals[1]._id,
                name: "Dr. Meena Krishnan",
                qualification: "MBBS, DCH, MD - Pediatrics",
                specialization: "Pediatrician",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12348",
                clinicAddress: "Fortis Malar Hospital, Adyar, Chennai. Timings: 9 AM - 3 PM",
                contactNumber: "+91 9876543213",
                email: "meena.krishnan@fortismalar.com",
                isActive: true
            },
            // MIOT Hospital Doctors
            {
                hospitalId: createdHospitals[2]._id,
                name: "Dr. Ramesh Babu",
                qualification: "MBBS, MS - Orthopedics",
                specialization: "Orthopedic Surgeon",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12349",
                clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 2 PM - 8 PM",
                contactNumber: "+91 9876543214",
                email: "ramesh.babu@miotinternational.com",
                isActive: true
            },
            {
                hospitalId: createdHospitals[2]._id,
                name: "Dr. Lakshmi Venkat",
                qualification: "MBBS, MD - Dermatology",
                specialization: "Dermatologist",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12350",
                clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 10 AM - 5 PM",
                contactNumber: "+91 9876543215",
                email: "lakshmi.venkat@miotinternational.com",
                isActive: true
            }
        ];

        const createdDoctors = await Doctor.insertMany(doctors);
        console.log(`✅ Created ${createdDoctors.length} doctors`);

        // Create MORE Sample Prescriptions (15 total)
        const prescriptions = [
            // Apollo Hospital Prescriptions
            {
                prescriptionId: "RX-2024001",
                doctorInfo: {
                    name: "Dr. Senthil Kumar",
                    qualification: "MBBS, MD - General Medicine",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12345",
                    clinicAddress: "Apollo Hospitals, 21 Greams Lane, Chennai. Timings: 9 AM - 5 PM"
                },
                patientInfo: {
                    name: "Ramesh Kumar",
                    age: 45,
                    gender: "M",
                    patientId: "PID-1001"
                },
                vitals: {
                    height: 170,
                    weight: 75,
                    temp: 98.6,
                    hr: 72,
                    bp: "120/80"
                },
                diagnosis: {
                    current: "Hypertension Stage 1",
                    known: "Type 2 Diabetes"
                },
                allergy: "No known allergies",
                notes: "Patient advised to reduce salt intake and exercise regularly",
                examination: {
                    nutritionalAssessment: "Normal BMI",
                    otherFindings: "Mild obesity noted"
                },
                complaints: {
                    symptoms: "Headache, Dizziness",
                    duration: "2 weeks"
                },
                history: {
                    personal: "Non-smoker, occasional alcohol",
                    family: "Father had hypertension",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Amlong 5mg",
                        composition: "Amlodipine 5mg",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "Glycomet GP 1",
                        composition: "Metformin 500mg + Glimepiride 1mg",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "60 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[0]._id,
                    hospitalName: "Apollo Hospitals",
                    adminId: createdAdmins[0]._id,
                    adminName: "Dr. Rajesh Kumar"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-01-15')
            },
            {
                prescriptionId: "RX-2024002",
                doctorInfo: {
                    name: "Dr. Anitha Ravi",
                    qualification: "MBBS, MS - Obstetrics & Gynecology",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12346",
                    clinicAddress: "Apollo Hospitals, 21 Greams Lane, Chennai. Timings: 10 AM - 4 PM"
                },
                patientInfo: {
                    name: "Priya Sharma",
                    age: 28,
                    gender: "F",
                    patientId: "PID-1002"
                },
                vitals: {
                    height: 162,
                    weight: 58,
                    temp: 98.2,
                    hr: 78,
                    bp: "110/70"
                },
                diagnosis: {
                    current: "Iron Deficiency Anemia",
                    known: "None"
                },
                allergy: "No known allergies",
                notes: "Patient in first trimester. Advised folic acid supplements",
                examination: {
                    nutritionalAssessment: "Underweight",
                    otherFindings: "Pale conjunctiva noted"
                },
                complaints: {
                    symptoms: "Fatigue, Weakness",
                    duration: "1 month"
                },
                history: {
                    personal: "Vegetarian diet",
                    family: "Mother had anemia during pregnancy",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Fefol Vitamins",
                        composition: "Iron + Folic Acid + Vitamin B12",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "180 Tablets"
                    },
                    {
                        name: "Calcium Sandoz",
                        composition: "Calcium Carbonate",
                        frequency: "0-0-1-0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "90 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[0]._id,
                    hospitalName: "Apollo Hospitals",
                    adminId: createdAdmins[0]._id,
                    adminName: "Dr. Rajesh Kumar"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-01-18')
            },
            {
                prescriptionId: "RX-2024003",
                doctorInfo: {
                    name: "Dr. Senthil Kumar",
                    qualification: "MBBS, MD - General Medicine",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12345",
                    clinicAddress: "Apollo Hospitals, 21 Greams Lane, Chennai. Timings: 9 AM - 5 PM"
                },
                patientInfo: {
                    name: "Arun Mehta",
                    age: 35,
                    gender: "M",
                    patientId: "PID-1003"
                },
                vitals: {
                    height: 175,
                    weight: 80,
                    temp: 100.2,
                    hr: 88,
                    bp: "118/76"
                },
                diagnosis: {
                    current: "Viral Fever",
                    known: "None"
                },
                allergy: "No known allergies",
                notes: "Patient advised rest and plenty of fluids",
                examination: {
                    nutritionalAssessment: "Normal",
                    otherFindings: "Throat inflammation present"
                },
                complaints: {
                    symptoms: "Fever, Body ache, Sore throat",
                    duration: "3 days"
                },
                history: {
                    personal: "Non-smoker",
                    family: "No significant family history",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Dolo 650",
                        composition: "Paracetamol 650mg",
                        frequency: "1-1-1-1",
                        timing: "After food",
                        duration: "5 days",
                        quantity: "20 Tablets"
                    },
                    {
                        name: "Vitamin C",
                        composition: "Ascorbic Acid 500mg",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "10 days",
                        quantity: "10 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[0]._id,
                    hospitalName: "Apollo Hospitals",
                    adminId: createdAdmins[0]._id,
                    adminName: "Dr. Rajesh Kumar"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-01-22')
            },
            // Fortis Hospital Prescriptions
            {
                prescriptionId: "RX-2024004",
                doctorInfo: {
                    name: "Dr. Vikram Singh",
                    qualification: "MBBS, DM - Cardiology",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12347",
                    clinicAddress: "Fortis Malar Hospital, Adyar, Chennai. Timings: 11 AM - 6 PM"
                },
                patientInfo: {
                    name: "Geetha Lakshmi",
                    age: 62,
                    gender: "F",
                    patientId: "PID-2001"
                },
                vitals: {
                    height: 155,
                    weight: 68,
                    temp: 98.4,
                    hr: 85,
                    bp: "140/90"
                },
                diagnosis: {
                    current: "Coronary Artery Disease",
                    known: "Hypertension, High Cholesterol"
                },
                allergy: "Penicillin",
                notes: "Patient scheduled for angiography next week",
                examination: {
                    nutritionalAssessment: "Overweight",
                    otherFindings: "Mild edema in lower extremities"
                },
                complaints: {
                    symptoms: "Chest pain, Shortness of breath",
                    duration: "1 month"
                },
                history: {
                    personal: "Former smoker, quit 5 years ago",
                    family: "Mother had heart disease",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Ecosprin 75mg",
                        composition: "Aspirin 75mg",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "Lifetime",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "Atorva 20mg",
                        composition: "Atorvastatin 20mg",
                        frequency: "0-0-1-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "Cardivas 6.25mg",
                        composition: "Carvedilol 6.25mg",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "60 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[1]._id,
                    hospitalName: "Fortis Malar Hospital",
                    adminId: createdAdmins[1]._id,
                    adminName: "Dr. Priya Sharma"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-01-20')
            },
            {
                prescriptionId: "RX-2024005",
                doctorInfo: {
                    name: "Dr. Meena Krishnan",
                    qualification: "MBBS, DCH, MD - Pediatrics",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12348",
                    clinicAddress: "Fortis Malar Hospital, Adyar, Chennai. Timings: 9 AM - 3 PM"
                },
                patientInfo: {
                    name: "Rohit Sharma",
                    age: 8,
                    gender: "M",
                    patientId: "PID-2002"
                },
                vitals: {
                    height: 125,
                    weight: 25,
                    temp: 101.5,
                    hr: 95,
                    bp: "100/65"
                },
                diagnosis: {
                    current: "Acute Bronchitis",
                    known: "Asthma"
                },
                allergy: "Dust mites",
                notes: "Parents advised to use humidifier and ensure proper hydration",
                examination: {
                    nutritionalAssessment: "Normal for age",
                    otherFindings: "Wheezing present on auscultation"
                },
                complaints: {
                    symptoms: "Cough, Fever, Breathing difficulty",
                    duration: "4 days"
                },
                history: {
                    personal: "History of asthma since age 5",
                    family: "Father has asthma",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Asthalin Syrup",
                        composition: "Salbutamol 2mg/5ml",
                        frequency: "1-1-1-1",
                        timing: "After food",
                        duration: "7 days",
                        quantity: "100ml Syrup"
                    },
                    {
                        name: "Augmentin Duo",
                        composition: "Amoxicillin + Clavulanic Acid",
                        frequency: "1-1-1-0",
                        timing: "After food",
                        duration: "5 days",
                        quantity: "60ml Syrup"
                    },
                    {
                        name: "Zedex Syrup",
                        composition: "Levocetirizine 2.5mg/5ml",
                        frequency: "0-0-1-0",
                        timing: "After food",
                        duration: "5 days",
                        quantity: "60ml Syrup"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[1]._id,
                    hospitalName: "Fortis Malar Hospital",
                    adminId: createdAdmins[1]._id,
                    adminName: "Dr. Priya Sharma"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-01-25')
            },
            {
                prescriptionId: "RX-2024006",
                doctorInfo: {
                    name: "Dr. Vikram Singh",
                    qualification: "MBBS, DM - Cardiology",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12347",
                    clinicAddress: "Fortis Malar Hospital, Adyar, Chennai. Timings: 11 AM - 6 PM"
                },
                patientInfo: {
                    name: "Suresh Reddy",
                    age: 55,
                    gender: "M",
                    patientId: "PID-2003"
                },
                vitals: {
                    height: 168,
                    weight: 82,
                    temp: 98.6,
                    hr: 92,
                    bp: "150/95"
                },
                diagnosis: {
                    current: "Hypertension Stage 2",
                    known: "Diabetes, Obesity"
                },
                allergy: "No known allergies",
                notes: "Patient advised lifestyle modifications and regular BP monitoring",
                examination: {
                    nutritionalAssessment: "Obese",
                    otherFindings: "Central obesity prominent"
                },
                complaints: {
                    symptoms: "Headache, Visual disturbances",
                    duration: "2 weeks"
                },
                history: {
                    personal: "Smoker, sedentary lifestyle",
                    family: "Both parents hypertensive",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Telma 40mg",
                        composition: "Telmisartan 40mg",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "Amlong 5mg",
                        composition: "Amlodipine 5mg",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "Storvas 10mg",
                        composition: "Atorvastatin 10mg",
                        frequency: "0-0-1-0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[1]._id,
                    hospitalName: "Fortis Malar Hospital",
                    adminId: createdAdmins[1]._id,
                    adminName: "Dr. Priya Sharma"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-01-28')
            },
            // MIOT Hospital Prescriptions
            {
                prescriptionId: "RX-2024007",
                doctorInfo: {
                    name: "Dr. Ramesh Babu",
                    qualification: "MBBS, MS - Orthopedics",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12349",
                    clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 2 PM - 8 PM"
                },
                patientInfo: {
                    name: "Karthik Raj",
                    age: 40,
                    gender: "M",
                    patientId: "PID-3001"
                },
                vitals: {
                    height: 172,
                    weight: 78,
                    temp: 98.4,
                    hr: 76,
                    bp: "122/78"
                },
                diagnosis: {
                    current: "Lumbar Spondylosis",
                    known: "None"
                },
                allergy: "No known allergies",
                notes: "Patient advised physiotherapy and ergonomic adjustments",
                examination: {
                    nutritionalAssessment: "Normal",
                    otherFindings: "Reduced lumbar spine mobility"
                },
                complaints: {
                    symptoms: "Lower back pain, Stiffness",
                    duration: "3 months"
                },
                history: {
                    personal: "Desk job, poor posture",
                    family: "No significant family history",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Voveran SR 100mg",
                        composition: "Diclofenac Sodium 100mg",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "10 days",
                        quantity: "20 Tablets"
                    },
                    {
                        name: "Myoril 4mg",
                        composition: "Thiocolchicoside 4mg",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "10 days",
                        quantity: "20 Tablets"
                    },
                    {
                        name: "Shelcal 500",
                        composition: "Calcium + Vitamin D3",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "60 days",
                        quantity: "60 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[2]._id,
                    hospitalName: "MIOT International",
                    adminId: createdAdmins[2]._id,
                    adminName: "Dr. Arvind Patel"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-02-01')
            },
            {
                prescriptionId: "RX-2024008",
                doctorInfo: {
                    name: "Dr. Lakshmi Venkat",
                    qualification: "MBBS, MD - Dermatology",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12350",
                    clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 10 AM - 5 PM"
                },
                patientInfo: {
                    name: "Anjali Mehta",
                    age: 25,
                    gender: "F",
                    patientId: "PID-3002"
                },
                vitals: {
                    height: 160,
                    weight: 55,
                    temp: 98.2,
                    hr: 72,
                    bp: "112/74"
                },
                diagnosis: {
                    current: "Acne Vulgaris",
                    known: "None"
                },
                allergy: "No known allergies",
                notes: "Patient advised proper skincare routine and sun protection",
                examination: {
                    nutritionalAssessment: "Normal",
                    otherFindings: "Multiple comedones and inflammatory papules"
                },
                complaints: {
                    symptoms: "Facial pimples, Oiliness",
                    duration: "6 months"
                },
                history: {
                    personal: "Oily skin type",
                    family: "Mother had acne in youth",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Benzac AC 2.5%",
                        composition: "Benzoyl Peroxide 2.5%",
                        frequency: "0-0-1-0",
                        timing: "Before bed",
                        duration: "30 days",
                        quantity: "30g Gel"
                    },
                    {
                        name: "Clindac A 1%",
                        composition: "Clindamycin 1%",
                        frequency: "1-0-0-0",
                        timing: "Morning",
                        duration: "30 days",
                        quantity: "30g Gel"
                    },
                    {
                        name: "Novaclear Soap",
                        composition: "Salicylic Acid 2%",
                        frequency: "1-0-1-0",
                        timing: "Face wash",
                        duration: "30 days",
                        quantity: "75g Soap"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[2]._id,
                    hospitalName: "MIOT International",
                    adminId: createdAdmins[2]._id,
                    adminName: "Dr. Arvind Patel"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-02-05')
            },
            {
                prescriptionId: "RX-2024009",
                doctorInfo: {
                    name: "Dr. Ramesh Babu",
                    qualification: "MBBS, MS - Orthopedics",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12349",
                    clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 2 PM - 8 PM"
                },
                patientInfo: {
                    name: "Mohammed Ali",
                    age: 65,
                    gender: "M",
                    patientId: "PID-3003"
                },
                vitals: {
                    height: 170,
                    weight: 85,
                    temp: 98.6,
                    hr: 78,
                    bp: "135/85"
                },
                diagnosis: {
                    current: "Osteoarthritis Knee",
                    known: "Hypertension"
                },
                allergy: "Ibuprofen",
                notes: "Patient advised weight reduction and knee strengthening exercises",
                examination: {
                    nutritionalAssessment: "Overweight",
                    otherFindings: "Crepitus and reduced range of motion in both knees"
                },
                complaints: {
                    symptoms: "Knee pain, Swelling, Difficulty walking",
                    duration: "2 years"
                },
                history: {
                    personal: "Former construction worker",
                    family: "No significant family history",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "Combiflam",
                        composition: "Paracetamol + Ibuprofen",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "15 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "Glucosamine Sulphate",
                        composition: "Glucosamine 750mg",
                        frequency: "1-0-1-0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "180 Tablets"
                    },
                    {
                        name: "Shelcal 500",
                        composition: "Calcium + Vitamin D3",
                        frequency: "1-0-0-0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "90 Tablets"
                    }
                ],
                hospitalInfo: {
                    hospitalId: createdHospitals[2]._id,
                    hospitalName: "MIOT International",
                    adminId: createdAdmins[2]._id,
                    adminName: "Dr. Arvind Patel"
                },
                versionInfo: {
                    versionNumber: 1,
                    isLatest: true,
                    parentReportId: null
                },
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                createdAt: new Date('2024-02-10')
            }
        ];

        const createdPrescriptions = await Report.insertMany(prescriptions);
        console.log(`✅ Created ${createdPrescriptions.length} sample prescriptions`);

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('Email: admin@apollohospitals.com | Password: admin123');
        console.log('Email: admin@fortismalar.com | Password: admin123');
        console.log('Email: admin@miotinternational.com | Password: admin123');
        console.log('\n📊 Data Summary:');
        console.log(`🏥 Hospitals: ${createdHospitals.length}`);
        console.log(`👨‍💼 Admins: ${createdAdmins.length}`);
        console.log(`👨‍⚕️ Doctors: ${createdDoctors.length}`);
        console.log(`📝 Prescriptions: ${createdPrescriptions.length}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('📊 Database connection closed.');
    }
};

// Run the seed function
seedData();