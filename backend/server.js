const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const puppeteer = require("puppeteer");
const path = require("path");
const https = require("https");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key-change-in-production";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected."))
    .catch((err) => console.error(err));
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const downloadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                const chunks = [];
                response.on("data", (chunk) => chunks.push(chunk));
                response.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    const base64 = buffer.toString("base64");
                    const contentType =
                        response.headers["content-type"] || "image/jpeg";
                    resolve(`data:${contentType};base64,${base64}`);
                });
                response.on("error", reject);
            })
            .on("error", reject);
    });
};

const getBrowser = async () => {
    return await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
            "--font-render-hinting=none",
        ],
        executablePath:
            process.env.PUPPETEER_EXECUTABLE_PATH ||
            "/usr/bin/chromium-browser",
    });
};

const doctorSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    regdNo: { type: String, required: true },
    clinicAddress: { type: String, required: true },
    contactNumber: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

const adminSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "super_admin"], default: "admin" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

const medicationSchema = new mongoose.Schema({
    name: String,
    composition: String,
    morning: String,
    afternoon: String,
    evening: String,
    night: String,
    timing: String,
    duration: String,
    quantity: String,
});

const reportSchema = new mongoose.Schema(
    {
        prescriptionId: { type: String, required: true },
        doctorInfo: {
            name: String,
            qualification: String,
            regdNo: String,
            clinicAddress: String,
        },
        patientInfo: {
            name: String,
            age: Number,
            gender: String,
            patientId: String,
        },
        vitals: {
            height: Number,
            weight: Number,
            temp: Number,
            hr: Number,
            bp: String,
        },
        diagnosis: {
            current: String,
            currentICD: String,
            known: String,
        },
        allergy: String,
        notes: String,
        instructions: String,
        footerText: String,
        validTillDate: Date,
        examination: {
            nutritionalAssessment: String,
            otherFindings: String,
        },
        complaints: {
            symptoms: String,
            duration: String,
        },
        history: {
            personal: String,
            family: String,
            lastUpdated: Date,
        },
        medications: [medicationSchema],
        hospitalInfo: {
            hospitalId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hospital",
                required: true,
            },
            hospitalName: { type: String, required: true },
            adminId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Admin",
                required: true,
            },
            adminName: { type: String, required: true },
        },
        versionInfo: {
            versionNumber: { type: Number, default: 1 },
            isLatest: { type: Boolean, default: true },
            parentReportId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Report",
                default: null,
            },
        },
        pdfUrl: String,
    },
    { timestamps: true },
);

const Report = mongoose.model("Report", reportSchema);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, admin) => {
        if (err) {
            return res
                .status(403)
                .json({ message: "Invalid or expired token" });
        }
        req.admin = admin;
        next();
    });
};

const calculateTotalPages = (medications, notesPresent) => {
    const MEDS_PER_PAGE_FIRST = 7;
    const MEDS_PER_PAGE_OTHER = 10;

    if (medications.length === 0) return 1;

    if (medications.length <= MEDS_PER_PAGE_FIRST) {
        return 1;
    }

    const remainingMeds = medications.length - MEDS_PER_PAGE_FIRST;
    return 1 + Math.ceil(remainingMeds / MEDS_PER_PAGE_OTHER);
};

const generateMultiPagePDF = async (reportData, format = "A4") => {
    const medications = reportData.medications || [];
    const totalPages = calculateTotalPages(medications, !!reportData.notes);

    console.log(
        `📊 Generating ${totalPages} page(s) for ${medications.length} medication(s)...`,
    );

    const fs = require("fs");
    const logoPath = path.join(__dirname, "assets", "medical-logo.jpg");
    const logoFileUrl = `https://images8765654658598768.s3.ap-south-1.amazonaws.com/Untitled+design+(2).svg`;
    console.log("✅ Using logo from:", logoFileUrl);

    const PDFMerger = (await import("pdf-merger-js")).default;
    const merger = new PDFMerger();
    let browser;

    try {
        browser = await getBrowser();

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            console.log(`📄 Generating page ${pageNum}/${totalPages}...`);

            const page = await browser.newPage();
            const htmlContent = generatePageHTML(
                reportData,
                pageNum,
                totalPages,
                logoFileUrl,
            );

            await page.setContent(htmlContent, {
                waitUntil: "networkidle0",
                timeout: 30000,
            });

            await page.evaluateHandle("document.fonts.ready");
            await page.evaluate(
                () => new Promise((resolve) => setTimeout(resolve, 500)),
            );

            const pdfBuffer = await page.pdf({
                format: format,
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
                displayHeaderFooter: false,
                timeout: 30000,
            });

            await page.close();
            await merger.add(pdfBuffer);
        }

        await browser.close();
        console.log("✅ All pages generated, merging PDFs...");

        const mergedPdfBuffer = await merger.saveAsBuffer();
        console.log("✅ PDF merge complete");

        return mergedPdfBuffer;
    } catch (error) {
        if (browser) {
            await browser.close().catch(console.error);
        }
        throw error;
    }
};

const generatePageHTML = (data, pageNum, totalPages, logoUrl = null) => {
    const MEDS_PER_PAGE_FIRST = 7;
    const MEDS_PER_PAGE_OTHER = 10;

    const currentDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const validTillDate = data.validTillDate
        ? new Date(data.validTillDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-GB",
              {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              },
          );

    const getPatientTitle = (gender, name) => {
        if (gender === "F") return `Ms. ${name}`;
        if (gender === "M") return `Mr. ${name}`;
        return name;
    };

    const patientTitle = getPatientTitle(
        data.patientInfo?.gender,
        data.patientInfo?.name || "Patient Name",
    );

    const lastUpdated = data.history?.lastUpdated
        ? new Date(data.history.lastUpdated).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : currentDate;

    const medications = data.medications || [];

    let medicationsForPage = [];
    if (pageNum === 1) {
        medicationsForPage = medications.slice(0, MEDS_PER_PAGE_FIRST);
    } else {
        const startIndex =
            MEDS_PER_PAGE_FIRST + (pageNum - 2) * MEDS_PER_PAGE_OTHER;
        medicationsForPage = medications.slice(
            startIndex,
            startIndex + MEDS_PER_PAGE_OTHER,
        );
    }

    const startMedNum =
        pageNum === 1
            ? 1
            : MEDS_PER_PAGE_FIRST + (pageNum - 2) * MEDS_PER_PAGE_OTHER + 1;

    const signatureUrl =
        data.signatureUrl ||
        data.doctorInfo?.signatureUrl ||
        "https://images8765654658598768.s3.ap-south-1.amazonaws.com/ssign.svg";

    const generateMedicationRows = (meds, startNum) => {
        return meds
            .map(
                (med, index) => `
            <tr>
                <td style="border-bottom: 1px solid #000;text-align: center; vertical-align: top; padding: 8px; border-right: 1px solid #000;">${startNum + index}</td>
                <td style="border-bottom: 1px solid #000;vertical-align: top; padding: 8px; border-right: 1px solid #000;">
                    <strong>${med.name || ""}</strong><br>
                    <span style="font-size: 9pt; color: #666;">${med.composition || ""}</span>
                </td>
                <td style="border-bottom: 1px solid #000;text-align: center; vertical-align: top; padding: 8px; border-right: 1px solid #000;">
                    ${med.morning || "0"} - ${med.afternoon || "0"} - ${med.evening || "0"} - ${med.night || "0"}<br><hr>
                    <span style="font-size: 9pt; color: #666;">${med.timing || "After food"}</span>
                </td>
                <td style="border-bottom: 1px solid #000;text-align: center; vertical-align: top; padding: 8px; border-right: 1px solid #000;">${med.duration || ""}</td>
                <td style="border-bottom: 1px solid #000;text-align: center; vertical-align: top; padding: 8px;">${med.quantity || ""}</td>
            </tr>
        `,
            )
            .join("");
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Prescription - ${data.prescriptionId} - Page ${pageNum}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body { 
            font-family: 'Noto Sans', 'Noto Sans Tamil', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 20px;
        }
        table { width: 100%; border-collapse: collapse; }
        .multilang-text {
            font-family: 'Noto Sans Tamil', 'Noto Sans', Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div style="width: 100%; padding: 10px 20px; font-family: Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 80px; vertical-align: top;">
                    <img src="${logoUrl || 'data:image/svg+xml,<svg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"30\" cy=\"30\" r=\"25\" fill=\"%23c9302c\"/></svg>'}" width="60" height="60" style="object-fit: contain;" alt="Medical Logo" />
                </td>
                <td style="vertical-align: top; padding-left: 10px;">
                    <h2 style="margin: 0; font-size: 14pt;">${data.doctorInfo?.name || "Doctor Name"}</h2>
                    <p style="margin: 2px 0; font-size: 9pt;">${data.doctorInfo?.qualification || "Education Qualification"}${data.doctorInfo?.specialization ? `, ${data.doctorInfo.specialization}` : ""}</p>
                    <p style="margin: 2px 0; font-size: 9pt;">Tamil Nadu Medical Council REGD. No. ${data.doctorInfo?.regdNo || "00000"}</p>
                    <p style="margin: 2px 0; font-size: 9pt;">${data.doctorInfo?.clinicAddress || "Clinic Address and Pincode with clinic Time Slots"}</p>
                </td>
            </tr>
        </table>
        <div style="border-top: 2px solid #000; margin: 10px 0;"></div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 3px;">
            <tr>
                <td style="width: 70%; font-size: 15pt;"><strong>${patientTitle}, ${data.patientInfo?.age || ""}yr / ${data.patientInfo?.gender || ""}</strong></td>
                <td style="width: 30%; text-align: right; font-size: 15pt;"><strong>${currentDate}</strong></td>
            </tr>
            <tr>
                <td style="font-size: 9pt;">Patient ID: ${data.patientInfo?.patientId || "N/A"}</td>
                <td style="text-align: right; font-size: 9pt;">Prescription ID: ${data.prescriptionId}</td>
            </tr>
        </table>
        <table style="width: 60%; border-collapse: collapse; margin: 8px 0 5px 0;">
            <tr>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; width: 20%; font-size: 9pt;">
                    <strong>Ht:</strong> ${data.vitals?.height || ""}<br>
                    <span style="font-size: 8pt;">(cm)</span>
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; width: 20%; font-size: 9pt;">
                    <strong>Wt:</strong> ${data.vitals?.weight || ""}<br>
                    <span style="font-size: 8pt;">(kg)</span>
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; width: 20%; font-size: 9pt;">
                    <strong>Temp:</strong> ${data.vitals?.temp || ""}<br>
                    <span style="font-size: 8pt;">(F)</span>
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; width: 20%; font-size: 9pt;">
                    <strong>HR:</strong> ${data.vitals?.hr || ""}<br>
                    <span style="font-size: 8pt;">(BPM)</span>
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; width: 20%; font-size: 9pt;">
                    <strong>BP:</strong> ${data.vitals?.bp || ""}<br>
                    <span style="font-size: 8pt;">(mm.Hg)</span>
                </td>
            </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <tr>
                <td style="border: 1px solid #000; padding: 6px; background-color: #d3d3d3; font-size: 9pt;">
                    <strong>Current Diagnosis</strong>
                </td>
                <td style="border: 1px solid #000; padding: 6px; background-color: #f9f9f9; font-size: 9pt;"> ${data.diagnosis?.current || ""}${data.diagnosis?.currentICD ? `, ${data.diagnosis.currentICD}` : ""}
                </td>
                
            </tr>
            <tr>
                <td style="border: 1px solid #000; border-top: none; padding: 6px; background-color: #d3d3d3; font-size: 9pt; width:"30%"">
                    <strong>Known Diagnosis</strong>
                </td>
                <td style="border: 1px solid #000; border-top: none; padding: 6px; background-color: #f9f9f9; font-size: 9pt;">${data.diagnosis?.known || ""}
                </td>
            </tr>
        </table>
    </div>

    ${
        pageNum === 1
            ? `
    <div style="padding: 0 20px; margin-top: 0px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 3px; border:1px solid #000;">
            <tr>
                <td style="border-top: 1px solid #000; padding: 4px; font-size: 9pt;">
                    <strong>Allergy:</strong> ${data.allergy || "No allergy reported yet"}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-size: 9pt;">
                    <strong>O/E:</strong> ${data.examination?.nutritionalAssessment || ""}${data.examination?.otherFindings ? `. ${data.examination.otherFindings}` : ""}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-size: 9pt;">
                    <strong>C/O:</strong> ${data.complaints?.symptoms || ""}${data.complaints?.duration ? `. ${data.complaints.duration}` : ""}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-size: 9pt;">
                    <strong>Known:</strong> ${data.diagnosis?.known || ""}${data.history?.lastUpdated ? `. [Updated at ${lastUpdated}]` : ""}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-size: 9pt;">
                    <strong>Personal History:</strong> ${data.history?.personal || ""} ● <strong>Family History:</strong> ${data.history?.family || ""}
                </td>
            </tr>
        </table>

        ${
            data.notes
                ? `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 3px;">
            <tr>
                <td style="border: 1px solid #000; padding: 6px; font-size: 9pt;">
                    <strong>Notes:</strong><br>
                    ${data.notes}
                </td>
            </tr>
        </table>
        `
                : ""
        }
    </div>
    `
            : ""
    }

    <div style="padding: 0 20px; margin-top: 10px;">
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #000;">
            <thead>
                <tr style="background-color: #f0f0f0;">
                    <th style="border-bottom: 1px solid #000; padding: 6px; text-align: center; width: 5%;">℞</th>
                    <th style="border-bottom: 1px solid #000;border-right: 1px solid #000; padding: 6px; text-align: left; width: 45%;"></th>
                    <th style="border-bottom: 1px solid #000;border-right: 1px solid #000; padding: 6px; text-align: center; width: 20%;">Frequency<br><span style="font-size: 8pt; font-weight: normal;">(MN - AF - EN - NT)</span></th>
                    <th style="border-bottom: 1px solid #000;border-right: 1px solid #000; padding: 6px; text-align: center; width: 15%;">Duration</th>
                    <th style="border-bottom: 1px solid #000;padding: 6px; text-align: center; width: 15%;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${generateMedicationRows(medicationsForPage, startMedNum)}
            </tbody>
        </table>
    </div>

    <!-- Footer Section -->
<div style="width: 100%; position: fixed; bottom: 0; left: 0; right: 0; padding: 0 6px 10px 6px; box-sizing: border-box; overflow: hidden; background-color: #fff;">
  <div style="width: 100%; margin-top: 20px; page-break-inside: avoid; border: 1px solid #000; box-sizing: border-box; overflow-wrap: break-word; word-break: break-word;">
    <!-- Page Number -->
    <p style="width: 100%; text-align: center; font-size: 10px; color: #666; margin: 5px 0; padding: 5px; border-bottom: 1px solid #000; box-sizing: border-box; overflow-wrap: break-word;">
      <strong>Page ${pageNum} of ${totalPages}</strong>
    </p>
    <!-- Gray Bar with main message -->
    <div style="background-color: #d3d3d3; padding: 8px; text-align: center; width: 100%; border-bottom: 1px solid #000; box-sizing: border-box; overflow-wrap: break-word;">
      <p style="margin: 0; font-size: 11px; font-weight: normal; overflow-wrap: break-word; word-break: break-word; white-space: normal;">
        Doctor generated this prescription and issued digitally.
      </p>
    </div>
    <!-- Instructions Section -->
    <div style="background-color: #d3d3d3; padding: 3px; text-align: center; width: 100%; border-bottom: 1px solid #000; box-sizing: border-box;">
      <p style="margin: 0; font-size: 11px; font-weight: normal;"><strong>Instructions</strong></p>
    </div>
    <div style="background-color: #f5f5f5; padding: 8px; margin: 0; width: 100%; border-bottom: 1px solid #000; box-sizing: border-box; overflow-wrap: break-word;">
      <p style="margin: 5px 0 0 0; font-size: 10px; overflow-wrap: break-word; word-break: break-word; white-space: normal;">
        ${data.instructions || ""}
      </p>
    </div>
    <!-- Additional text (Tamil/Instructions) -->
    <div style="padding: 8px; margin: 0; width: 100%; border-bottom: 1px solid #000; box-sizing: border-box; overflow-wrap: break-word;">
      <p class="multilang-text" style="margin: 0; font-size: 10px; font-family: 'Noto Sans Tamil', 'Noto Sans', Arial, sans-serif; overflow-wrap: break-word; word-break: break-word; white-space: normal;">
        Tamil translation or additional notes go here.
      </p>
    </div>
    <!-- Bottom section with Valid Till and Signature -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0; border-top: 1px solid #000; width: 100%; box-sizing: border-box; overflow: hidden;">
      <!-- Left: Valid Till Date -->
      <div style="background-color: #999999; padding: 8px 15px; color: white; flex: 1 1 0; border-right: 1px solid #000; width: 100%; box-sizing: border-box;">
        <p style="margin: 0; font-size: 11px; font-weight: bold;text-align: center;">
          Valid till: ${validTillDate}
        </p>
      </div>
      <!-- Right: Signature -->
      <div style="padding: 5px; flex: 1 1 0; text-align: right; width: 100%; box-sizing: border-box; overflow: hidden;">
        <img src="${signatureUrl || ""}" alt="Signature" style="height: 40px; max-width: 200px; object-fit: contain;" />
      </div>
    </div>
  </div>
</div>



</body>
</html>
    `;
};

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});

app.post("/api/hospitals/register", async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            phone,
            registrationNumber,
            adminName,
            adminEmail,
            adminPassword,
        } = req.body;

        const existingHospital = await Hospital.findOne({
            $or: [{ email }, { registrationNumber }],
        });
        if (existingHospital) {
            return res
                .status(400)
                .json({ message: "Hospital already registered" });
        }

        const hospital = new Hospital({
            name,
            email,
            address,
            phone,
            registrationNumber,
        });
        await hospital.save();

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = new Admin({
            hospitalId: hospital._id,
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
        });
        await admin.save();

        res.status(201).json({
            message: "Hospital registered successfully",
            hospital: { id: hospital._id, name: hospital.name },
        });
    } catch (error) {
        console.error("Hospital registration error:", error);
        res.status(500).json({
            message: "Error registering hospital",
            error: error.message,
        });
    }
});

app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email }).populate("hospitalId");
        if (!admin || !admin.isActive) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            {
                id: admin._id,
                hospitalId: admin.hospitalId._id,
                hospitalName: admin.hospitalId.name,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
            JWT_SECRET,
            { expiresIn: "24h" },
        );

        res.json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                hospital: {
                    id: admin.hospitalId._id,
                    name: admin.hospitalId.name,
                },
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Error during login",
            error: error.message,
        });
    }
});

app.get("/api/admin/profile", authenticateToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).populate("hospitalId");
        res.json({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            hospital: {
                id: admin.hospitalId._id,
                name: admin.hospitalId.name,
                address: admin.hospitalId.address,
            },
            role: admin.role,
            lastLogin: admin.lastLogin,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching profile",
            error: error.message,
        });
    }
});

app.get("/api/doctors", authenticateToken, async (req, res) => {
    try {
        const doctors = await Doctor.find({
            hospitalId: req.admin.hospitalId,
            isActive: true,
        }).sort({ name: 1 });

        res.json(doctors);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching doctors",
            error: error.message,
        });
    }
});

app.post("/api/doctors", authenticateToken, async (req, res) => {
    try {
        const {
            name,
            qualification,
            specialization,
            regdNo,
            clinicAddress,
            contactNumber,
            email,
        } = req.body;

        const existingDoctor = await Doctor.findOne({
            hospitalId: req.admin.hospitalId,
            regdNo: regdNo,
        });

        if (existingDoctor) {
            return res.status(400).json({
                message:
                    "Doctor with this registration number already exists in your hospital",
            });
        }

        const doctor = new Doctor({
            hospitalId: req.admin.hospitalId,
            name,
            qualification,
            specialization,
            regdNo,
            clinicAddress,
            contactNumber,
            email,
        });

        await doctor.save();
        res.status(201).json({ message: "Doctor added successfully", doctor });
    } catch (error) {
        res.status(500).json({
            message: "Error adding doctor",
            error: error.message,
        });
    }
});

app.put("/api/doctors/:id", authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            _id: req.params.id,
            hospitalId: req.admin.hospitalId,
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const {
            name,
            qualification,
            specialization,
            regdNo,
            clinicAddress,
            contactNumber,
            email,
            isActive,
        } = req.body;

        doctor.name = name || doctor.name;
        doctor.qualification = qualification || doctor.qualification;
        doctor.specialization = specialization || doctor.specialization;
        doctor.regdNo = regdNo || doctor.regdNo;
        doctor.clinicAddress = clinicAddress || doctor.clinicAddress;
        doctor.contactNumber = contactNumber || doctor.contactNumber;
        doctor.email = email || doctor.email;
        doctor.isActive = isActive !== undefined ? isActive : doctor.isActive;

        await doctor.save();
        res.json({ message: "Doctor updated successfully", doctor });
    } catch (error) {
        res.status(500).json({
            message: "Error updating doctor",
            error: error.message,
        });
    }
});

app.delete("/api/doctors/:id", authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            _id: req.params.id,
            hospitalId: req.admin.hospitalId,
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.isActive = false;
        await doctor.save();

        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting doctor",
            error: error.message,
        });
    }
});

app.post("/api/reports", authenticateToken, async (req, res) => {
    let pdfBuffer;

    try {
        console.log("📝 Starting prescription creation...");
        const reportData = req.body;

        const hospital = await Hospital.findById(req.admin.hospitalId);

        reportData.hospitalInfo = {
            hospitalId: req.admin.hospitalId,
            hospitalName: req.admin.hospitalName,
            hospitalAddress: hospital?.address || "",
            hospitalPhone: hospital?.phone || "",
            hospitalEmail: hospital?.email || "",
            adminId: req.admin.id,
            adminName: req.admin.name,
        };

        if (!reportData.prescriptionId || !reportData.patientInfo?.name) {
            return res.status(400).json({
                message: "Prescription ID and Patient Name are required",
            });
        }

        console.log("🖨️ Generating multi-page PDF...");
        try {
            pdfBuffer = await generateMultiPagePDF(reportData, "A4");
            console.log("✅ PDF generated successfully");
        } catch (puppeteerError) {
            console.error("❌ Puppeteer failed:", puppeteerError);
            throw new Error("PDF generation failed.");
        }

        let pdfUrl;

        if (
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY &&
            pdfBuffer
        ) {
            try {
                console.log("☁️ Uploading to AWS S3...");
                const pdfKey = `prescriptions/${reportData.prescriptionId}-${Date.now()}.pdf`;
                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: pdfKey,
                    Body: pdfBuffer,
                    ContentType: "application/pdf",
                });

                await s3Client.send(command);
                pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
                console.log("✅ PDF uploaded to S3:", pdfUrl);
            } catch (s3Error) {
                console.error(
                    "❌ S3 upload failed, using local storage:",
                    s3Error.message,
                );
                pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
            }
        } else {
            console.log("⚠️ Using local PDF storage (no S3)");
            pdfUrl = pdfBuffer
                ? `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
                : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        }

        const { _id, ...cleanReportData } = reportData;

        const newReport = new Report({
            ...cleanReportData,
            pdfUrl,
        });

        await newReport.save();
        console.log("💾 Report saved to database");

        res.status(201).json(newReport);
    } catch (error) {
        console.error("❌ Error creating report:", error);

        let errorMessage = "Error creating report";
        if (error.name === "TimeoutError") {
            errorMessage = "PDF generation timeout. Please try again.";
        } else if (error.name === "CredentialsProviderError") {
            errorMessage = "AWS credentials issue. Check your .env file.";
        } else if (error.code === "NetworkingError") {
            errorMessage = "Network error. Check your internet connection.";
        }

        res.status(500).json({
            message: errorMessage,
            error: error.message,
        });
    }
});

app.get("/api/reports", authenticateToken, async (req, res) => {
    try {
        const reports = await Report.find({ "versionInfo.isLatest": true })
            .populate("hospitalInfo.hospitalId", "name address")
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching reports",
            error: error.message,
        });
    }
});

app.get("/api/reports/:id", authenticateToken, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate(
            "hospitalInfo.hospitalId",
            "name address",
        );

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching report",
            error: error.message,
        });
    }
});

app.put("/api/reports/:id", authenticateToken, async (req, res) => {
    let pdfBuffer;

    try {
        const reportToUpdate = await Report.findById(req.params.id);
        if (!reportToUpdate) {
            return res.status(404).json({ message: "Report not found" });
        }

        const isCreatingHospital =
            reportToUpdate.hospitalInfo.hospitalId.toString() ===
            req.admin.hospitalId;

        const today = new Date().toISOString().slice(0, 10);
        const reportDate = reportToUpdate.createdAt.toISOString().slice(0, 10);

        if (!isCreatingHospital) {
            return res.status(403).json({
                message:
                    "You can only edit prescriptions created by your hospital",
            });
        }

        if (today !== reportDate) {
            return res.status(403).json({
                message: "Editing is only allowed on the same day.",
            });
        }

        await Report.findByIdAndUpdate(reportToUpdate._id, {
            $set: { "versionInfo.isLatest": false },
        });

        const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

        const hospital = await Hospital.findById(req.admin.hospitalId);
        updateData.hospitalInfo = {
            ...updateData.hospitalInfo,
            hospitalAddress: hospital?.address || "",
            hospitalPhone: hospital?.phone || "",
            hospitalEmail: hospital?.email || "",
        };

        console.log("🖨️ Generating multi-page PDF...");
        pdfBuffer = await generateMultiPagePDF(updateData, "A4");
        console.log("✅ PDF generated successfully");

        let pdfUrl;

        if (
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY &&
            pdfBuffer
        ) {
            try {
                const pdfKey = `prescriptions/${updateData.prescriptionId}-${Date.now()}-v${reportToUpdate.versionInfo.versionNumber + 1}.pdf`;
                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: pdfKey,
                    Body: pdfBuffer,
                    ContentType: "application/pdf",
                });
                await s3Client.send(command);
                pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
            } catch (s3Error) {
                console.error(
                    "S3 upload failed, using local storage:",
                    s3Error.message,
                );
                pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
            }
        } else {
            pdfUrl = pdfBuffer
                ? `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
                : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        }

        const parentReportId =
            reportToUpdate.versionInfo.parentReportId || reportToUpdate._id;

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

        console.log(
            `✅ Version ${newVersion.versionInfo.versionNumber} created for prescription ${updateData.prescriptionId}`,
        );

        res.status(200).json(newVersion);
    } catch (error) {
        console.error("❌ Error updating report:", error);
        res.status(500).json({
            message: "Error updating report",
            error: error.message,
        });
    }
});

app.get(
    "/api/reports/:id/download/:format",
    authenticateToken,
    async (req, res) => {
        try {
            const report = await Report.findById(req.params.id);
            if (!report) {
                return res.status(404).json({ message: "Report not found" });
            }

            const formatParam = req.params.format || "A4";
            const format =
                formatParam === "A4" || formatParam === "A5"
                    ? formatParam
                    : "A4";

            console.log(`📥 Generating PDF download in ${format} format...`);

            const pdfBuffer = await generateMultiPagePDF(
                report.toObject(),
                format,
            );

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="prescription-${report.prescriptionId}-${format}.pdf"`,
            );
            res.setHeader("Content-Length", pdfBuffer.length);

            res.send(pdfBuffer);

            console.log(`✅ PDF download generated in ${format} format`);
        } catch (error) {
            console.error("❌ Error generating PDF download:", error);
            res.status(500).json({
                message: "Error generating PDF download",
                error: error.message,
            });
        }
    },
);

app.get("/api/reports/:id/versions", authenticateToken, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const parentReportId = report.versionInfo.parentReportId || report._id;

        console.log(`🔍 Fetching versions for parent ID: ${parentReportId}`);

        const versions = await Report.find({
            $or: [
                { _id: parentReportId },
                { "versionInfo.parentReportId": parentReportId },
            ],
        })
            .populate("hospitalInfo.hospitalId", "name address")
            .sort({ "versionInfo.versionNumber": 1 });

        console.log(`📚 Found ${versions.length} versions`);

        res.json(versions);
    } catch (error) {
        console.error("❌ Error fetching version history:", error);
        res.status(500).json({
            message: "Error fetching version history",
            error: error.message,
        });
    }
});

app.get(
    "/api/reports/:id/version/:versionNumber",
    authenticateToken,
    async (req, res) => {
        try {
            const parentReport = await Report.findById(req.params.id);
            if (!parentReport) {
                return res.status(404).json({ message: "Report not found" });
            }

            const parentReportId =
                parentReport.versionInfo.parentReportId || parentReport._id;
            const versionNumber = parseInt(req.params.versionNumber);

            const version = await Report.findOne({
                $or: [
                    {
                        _id: parentReportId,
                        "versionInfo.versionNumber": versionNumber,
                    },
                    {
                        "versionInfo.parentReportId": parentReportId,
                        "versionInfo.versionNumber": versionNumber,
                    },
                ],
            }).populate("hospitalInfo.hospitalId", "name address");

            if (!version) {
                return res.status(404).json({ message: "Version not found" });
            }

            res.json(version);
        } catch (error) {
            res.status(500).json({
                message: "Error fetching version",
                error: error.message,
            });
        }
    },
);

app.post("/api/reports/dev", async (req, res) => {
    try {
        console.log("🚀 Using development endpoint (no PDF generation)");
        const reportData = req.body;

        if (!reportData.prescriptionId || !reportData.patientInfo?.name) {
            return res.status(400).json({
                message: "Prescription ID and Patient Name are required",
            });
        }

        const { _id, ...cleanReportData } = reportData;

        const dummyPdfUrl =
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

        const newReport = new Report({
            ...cleanReportData,
            pdfUrl: dummyPdfUrl,
            hospitalInfo: {
                hospitalId: new mongoose.Types.ObjectId(),
                hospitalName: "Development Hospital",
                adminId: new mongoose.Types.ObjectId(),
                adminName: "Dev Admin",
            },
        });

        await newReport.save();
        console.log("✅ Development report saved successfully");

        res.status(201).json(newReport);
    } catch (error) {
        console.error("❌ Error in dev route:", error);
        res.status(500).json({
            message: "Error creating report in dev mode",
            error: error.message,
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("SIGINT", async () => {
    console.log("🛑 Shutting down gracefully...");
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
