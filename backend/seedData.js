const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected for seeding..."))
    .catch(err => console.error(err));

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
    instructions: String,
    footerText: String,
    validTillDate: Date,
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

        await Hospital.deleteMany({});
        await Admin.deleteMany({});
        await Doctor.deleteMany({});
        await Report.deleteMany({});

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

        const doctors = [
            {
                hospitalId: createdHospitals[0]._id,
                name: "Dr. Senthil Kumar",
                qualification: "MBBS, MD (General Medicine)",
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
                qualification: "MBBS, MS (Obstetrics & Gynecology)",
                specialization: "Gynecologist",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12346",
                clinicAddress: "Apollo Hospitals, 21 Greams Lane, Chennai. Timings: 10 AM - 4 PM",
                contactNumber: "+91 9876543211",
                email: "anitha.ravi@apollohospitals.com",
                isActive: true
            },
            {
                hospitalId: createdHospitals[1]._id,
                name: "Dr. Vikram Singh",
                qualification: "MBBS, DM (Cardiology)",
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
                qualification: "MBBS, DCH, MD (Pediatrics)",
                specialization: "Pediatrician",
                regdNo: "Tamil Nadu Medical Council REGD. No. 12348",
                clinicAddress: "Fortis Malar Hospital, Adyar, Chennai. Timings: 9 AM - 3 PM",
                contactNumber: "+91 9876543213",
                email: "meena.krishnan@fortismalar.com",
                isActive: true
            },
            {
                hospitalId: createdHospitals[2]._id,
                name: "Dr. Ramesh Babu",
                qualification: "MBBS, MS (Orthopedics)",
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
                qualification: "MBBS, MD (Dermatology)",
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

        const getValidTillDate = (days) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        };

        const prescriptions = [
            {
                prescriptionId: "RX-2024001",
                doctorInfo: {
                    name: "Dr. Senthil Kumar",
                    qualification: "MBBS, MD (General Medicine)",
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
                    bp: "120-80"
                },
                diagnosis: {
                    current: "Essential (primary) hypertension",
                    currentICD: "I10",
                    known: "Type 2 Diabetes Mellitus"
                },
                allergy: "No known allergies",
                notes: "Patient advised to reduce salt intake and exercise regularly. Monitor BP daily.",
                instructions: "Take medications as prescribed. Maintain low-salt diet. Exercise for 30 minutes daily. Avoid stress. Regular BP monitoring required.",
                footerText: "This prescription is valid for the duration mentioned. மருத்துவரின் ஆலோசனை அவசியம். For emergency, contact hospital.",
                validTillDate: getValidTillDate(30),
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
                        name: "AMLONG 5mg TABLET",
                        composition: "Amlodipine 5mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "GLYCOMET GP 1 TABLET",
                        composition: "Metformin 500mg + Glimepiride 1mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
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
                pdfUrl: "",
                createdAt: new Date('2024-01-15')
            },
            {
                prescriptionId: "RX-2024002",
                doctorInfo: {
                    name: "Dr. Anitha Ravi",
                    qualification: "MBBS, MS (Obstetrics & Gynecology)",
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
                    bp: "110-70"
                },
                diagnosis: {
                    current: "Iron deficiency anemia, unspecified",
                    currentICD: "D50.9",
                    known: "None"
                },
                allergy: "No known allergies",
                notes: "Patient in first trimester (8 weeks). Advised folic acid supplements. Nutritional counseling provided.",
                instructions: "Take iron tablets with Vitamin C for better absorption. Avoid tea/coffee near medication time. Eat iron-rich foods. Follow-up after 4 weeks for hemoglobin check.",
                footerText: "கர்ப்பிணி பெண்களுக்கான சிறப்பு பராமரிப்பு தேவை. Prenatal care is essential. நல்வாழ்த்துக்கள்!",
                validTillDate: getValidTillDate(90),
                examination: {
                    nutritionalAssessment: "Underweight",
                    otherFindings: "Pale conjunctiva noted"
                },
                complaints: {
                    symptoms: "Fatigue, Weakness, Dizziness",
                    duration: "1 month"
                },
                history: {
                    personal: "Vegetarian diet, First pregnancy",
                    family: "Mother had anemia during pregnancy",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "FEFOL SPANSULE CAPSULE",
                        composition: "Iron + Folic Acid 150mg + 0.5mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "180 Capsules"
                    },
                    {
                        name: "CALCIUM SANDOZ TABLET",
                        composition: "Calcium Carbonate 500mg",
                        morning: "0",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "90 Tablets"
                    },
                    {
                        name: "VITAMIN C 500mg TABLET",
                        composition: "Ascorbic Acid 500mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
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
                pdfUrl: "",
                createdAt: new Date('2024-01-18')
            },
            {
                prescriptionId: "RX-2024003",
                doctorInfo: {
                    name: "Dr. Vikram Singh",
                    qualification: "MBBS, DM (Cardiology)",
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
                    bp: "140-90"
                },
                diagnosis: {
                    current: "Angina pectoris, unspecified",
                    currentICD: "I20.9",
                    known: "Hypertension, Hyperlipidemia"
                },
                allergy: "Penicillin - causes rash",
                notes: "Patient scheduled for angiography next week. ECG shows ST-T wave changes. Stress test positive.",
                instructions: "Take all cardiac medications regularly without missing. Avoid heavy meals. No strenuous activity. Report any chest pain immediately. Keep nitroglycerin handy. Follow-up before angiography.",
                footerText: "இதய நோயாளிகளுக்கான சிகிச்சை தொடர்ந்து எடுத்துக்கொள்ளவும். Cardiac care requires strict compliance. Emergency: 108",
                validTillDate: getValidTillDate(30),
                examination: {
                    nutritionalAssessment: "Overweight (BMI 28.3)",
                    otherFindings: "Mild edema in lower extremities, S3 gallop present"
                },
                complaints: {
                    symptoms: "Chest pain on exertion, Shortness of breath",
                    duration: "1 month"
                },
                history: {
                    personal: "Former smoker (quit 5 years ago), Sedentary lifestyle",
                    family: "Mother had MI at age 60",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "ECOSPRIN 75mg TABLET",
                        composition: "Aspirin 75mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
                        timing: "After food",
                        duration: "Continuous",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "ATORVA 20mg TABLET",
                        composition: "Atorvastatin 20mg",
                        morning: "0",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "CARDIVAS 6.25mg TABLET",
                        composition: "Carvedilol 6.25mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "60 Tablets"
                    },
                    {
                        name: "NICARDIA RETARD 10mg",
                        composition: "Nifedipine 10mg SR",
                        morning: "0",
                        afternoon: "1",
                        evening: "0",
                        night: "0",
                        timing: "After food",
                        duration: "30 days",
                        quantity: "30 Tablets"
                    },
                    {
                        name: "NITROCONTIN 2.5mg",
                        composition: "Nitroglycerin 2.5mg",
                        morning: "0",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
                        timing: "SOS (as needed)",
                        duration: "30 days",
                        quantity: "25 Tablets"
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
                pdfUrl: "",
                createdAt: new Date('2024-01-20')
            },
            {
                prescriptionId: "RX-2024004",
                doctorInfo: {
                    name: "Dr. Meena Krishnan",
                    qualification: "MBBS, DCH, MD (Pediatrics)",
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
                    bp: "100-65"
                },
                diagnosis: {
                    current: "Acute bronchitis, unspecified",
                    currentICD: "J20.9",
                    known: "Bronchial asthma"
                },
                allergy: "Dust mites, Pollen",
                notes: "Parents advised to use humidifier and ensure proper hydration. Avoid cold drinks and ice cream.",
                instructions: "Give medicines on time. Use warm water for drinking. Steam inhalation twice daily. Avoid dusty places. Use prescribed inhaler during breathlessness. Return if fever persists beyond 3 days.",
                footerText: "குழந்தைகளுக்கான மருந்துகளை சரியான நேரத்தில் கொடுக்கவும். Keep child hydrated. Stay warm.",
                validTillDate: getValidTillDate(7),
                examination: {
                    nutritionalAssessment: "Normal for age",
                    otherFindings: "Bilateral wheezing present on auscultation, Nasal congestion noted"
                },
                complaints: {
                    symptoms: "Cough with sputum, Fever, Breathing difficulty",
                    duration: "4 days"
                },
                history: {
                    personal: "History of asthma since age 5, Regular school attendance",
                    family: "Father has asthma",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "ASTHALIN SYRUP",
                        composition: "Salbutamol 2mg/5ml",
                        morning: "1",
                        afternoon: "1",
                        evening: "1",
                        night: "1",
                        timing: "After food",
                        duration: "7 days",
                        quantity: "100ml Syrup"
                    },
                    {
                        name: "AUGMENTIN DUO SYRUP",
                        composition: "Amoxicillin 200mg + Clavulanic Acid 28.5mg/5ml",
                        morning: "1",
                        afternoon: "1",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "5 days",
                        quantity: "60ml Syrup"
                    },
                    {
                        name: "ZEDEX SYRUP",
                        composition: "Levocetirizine 2.5mg/5ml",
                        morning: "0",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "7 days",
                        quantity: "60ml Syrup"
                    },
                    {
                        name: "DOLO 250mg SYRUP",
                        composition: "Paracetamol 250mg/5ml",
                        morning: "0",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
                        timing: "SOS (if fever >100°F)",
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
                pdfUrl: "",
                createdAt: new Date('2024-01-25')
            },
            {
                prescriptionId: "RX-2024005",
                doctorInfo: {
                    name: "Dr. Ramesh Babu",
                    qualification: "MBBS, MS (Orthopedics)",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12349",
                    clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 2 PM - 8 PM"
                },
                patientInfo: {
                    name: "Suresh Narayanan",
                    age: 52,
                    gender: "M",
                    patientId: "PID-3001"
                },
                vitals: {
                    height: 168,
                    weight: 72,
                    temp: 98.6,
                    hr: 76,
                    bp: "128-82"
                },
                diagnosis: {
                    current: "Osteoarthritis of knee",
                    currentICD: "M17.9",
                    known: "None"
                },
                allergy: "NSAID allergy - causes gastritis",
                notes: "X-ray shows Grade 2 osteoarthritis of bilateral knee joints. Physiotherapy recommended. Weight reduction advised.",
                instructions: "Apply hot water compress before exercise. Do prescribed knee exercises daily. Avoid stairs and squatting. Use walking stick if needed. Reduce weight gradually. Follow-up after 4 weeks.",
                footerText: "மூட்டு வலிக்கான பயிற்சிகளை தொடர்ந்து செய்யவும். Regular exercise improves joint mobility. नियमित व्यायाम करें।",
                validTillDate: getValidTillDate(30),
                examination: {
                    nutritionalAssessment: "Normal BMI",
                    otherFindings: "Crepitus present in both knee joints, Mild effusion in right knee"
                },
                complaints: {
                    symptoms: "Bilateral knee pain, Morning stiffness",
                    duration: "6 months"
                },
                history: {
                    personal: "Active lifestyle, Morning walker",
                    family: "Mother had arthritis",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "GLUCOSAMINE 1500mg TABLET",
                        composition: "Glucosamine Sulfate 1500mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "90 Tablets"
                    },
                    {
                        name: "CALCIUM + VITAMIN D3",
                        composition: "Calcium 500mg + Vitamin D3 250 IU",
                        morning: "0",
                        afternoon: "0",
                        evening: "0",
                        night: "1",
                        timing: "After food",
                        duration: "90 days",
                        quantity: "90 Tablets"
                    },
                    {
                        name: "DIACEREIN 50mg CAPSULE",
                        composition: "Diacerein 50mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "60 days",
                        quantity: "120 Capsules"
                    },
                    {
                        name: "OMNIGEL",
                        composition: "Diclofenac 1% Gel",
                        morning: "1",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "External application",
                        duration: "30 days",
                        quantity: "2 Tubes (30g each)"
                    },
                    {
                        name: "RANITIDINE 150mg",
                        composition: "Ranitidine 150mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "0",
                        night: "1",
                        timing: "Before food",
                        duration: "30 days",
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
                pdfUrl: "",
                createdAt: new Date('2024-01-28')
            },
            {
                prescriptionId: "RX-2024006",
                doctorInfo: {
                    name: "Dr. Lakshmi Venkat",
                    qualification: "MBBS, MD (Dermatology)",
                    regdNo: "Tamil Nadu Medical Council REGD. No. 12350",
                    clinicAddress: "MIOT International, Manapakkam, Chennai. Timings: 10 AM - 5 PM"
                },
                patientInfo: {
                    name: "Divya Iyer",
                    age: 24,
                    gender: "F",
                    patientId: "PID-3002"
                },
                vitals: {
                    height: 165,
                    weight: 60,
                    temp: 98.4,
                    hr: 74,
                    bp: "118-75"
                },
                diagnosis: {
                    current: "Acne vulgaris, moderate severity",
                    currentICD: "L70.0",
                    known: "None"
                },
                allergy: "No known allergies",
                notes: "Hormonal acne pattern noted. Blood tests ordered. Advised gentle skin care routine. Avoid oil-based cosmetics.",
                instructions: "Wash face twice daily with prescribed cleanser. Apply tretinoin gel at night only. Use sunscreen daily (SPF 30+). Avoid picking or squeezing pimples. Take antibiotics with food. Results visible after 4-6 weeks.",
                footerText: "தோல் பராமரிப்பு முறைகளை கவனமாக பின்பற்றவும். Skincare consistency is key. त्वचा की देखभाल करें।",
                validTillDate: getValidTillDate(60),
                examination: {
                    nutritionalAssessment: "Normal BMI",
                    otherFindings: "Multiple papules and pustules on face, Mild scarring present"
                },
                complaints: {
                    symptoms: "Facial acne, Oily skin",
                    duration: "8 months"
                },
                history: {
                    personal: "Irregular menstrual cycles, Stress at work",
                    family: "Mother had acne in youth",
                    lastUpdated: new Date()
                },
                medications: [
                    {
                        name: "DOXYCYCLINE 100mg TABLET",
                        composition: "Doxycycline 100mg",
                        morning: "1",
                        afternoon: "0",
                        evening: "1",
                        night: "0",
                        timing: "After food",
                        duration: "60 days",
                        quantity: "120 Tablets"
                    },
                    {
                        name: "TRETINOIN 0.025% GEL",
                        composition: "Tretinoin 0.025%",
                        morning: "0",
                        afternoon: "0",
                        evening: "0",
                        night: "1",
                        timing: "Apply on clean dry face",
                        duration: "60 days",
                        quantity: "2 Tubes (20g each)"
                    },
                    {
                        name: "AZIDERM 20% GEL",
                        composition: "Azelaic Acid 20%",
                        morning: "1",
                        afternoon: "0",
                        evening: "0",
                        night: "0",
                        timing: "Apply on affected areas",
                        duration: "60 days",
                        quantity: "2 Tubes (15g each)"
                    },
                    {
                        name: "ZINC SULFATE 50mg",
                        composition: "Zinc Sulfate 50mg",
                        morning: "0",
                        afternoon: "1",
                        evening: "0",
                        night: "0",
                        timing: "After food",
                        duration: "60 days",
                        quantity: "60 Tablets"
                    },
                    {
                        name: "VITAMIN E 400 IU",
                        composition: "Tocopherol 400 IU",
                        morning: "0",
                        afternoon: "0",
                        evening: "0",
                        night: "1",
                        timing: "After food",
                        duration: "60 days",
                        quantity: "60 Capsules"
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
                pdfUrl: "",
                createdAt: new Date('2024-02-01')
            }
        ];

        const createdPrescriptions = await Report.insertMany(prescriptions);
        console.log(`✅ Created ${createdPrescriptions.length} prescriptions with new fields`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Hospitals: ${createdHospitals.length}`);
        console.log(`   Admins: ${createdAdmins.length}`);
        console.log(`   Doctors: ${createdDoctors.length}`);
        console.log(`   Prescriptions: ${createdPrescriptions.length}`);
        console.log('\n🔐 Login credentials:');
        console.log('   Email: admin@apollohospitals.com');
        console.log('   Email: admin@fortismalar.com');
        console.log('   Email: admin@miotinternational.com');
        console.log('   Password: admin123');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
