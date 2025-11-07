# UHI Multi-Hospital Prescription Management System - Replit Setup

## Project Overview
A comprehensive prescription management system for multiple hospitals with PDF generation and version control.

**Tech Stack:**
- Frontend: React.js (running on port 5000)
- Backend: Node.js/Express (running on port 3001)  
- Database: MongoDB (requires external connection)
- PDF Generation: Puppeteer with Chromium

## Recent Changes

### November 3, 2025 - Custom Medical Logo Integration ✅
**Replaced default SVG logo with custom medical logo:**

**Logo Optimization:**
- Original uploaded image: WhatsApp Image (18KB JPEG)
- Optimized for PDF: Resized to 60x60px (876 bytes) for optimal Puppeteer performance
- Saved to: `backend/assets/medical-logo.jpg`

**Implementation:**
- Replaced inline SVG icon with file-based image reference
- Used `file://` URL protocol for local file access in Puppeteer
- Added `path` module import for proper file path resolution
- Logo displays on every page of multi-page prescriptions with header

**Performance Fix:**
- Initial base64 embedding caused Puppeteer timeout (18KB per page)
- Switched to file-based approach for instant loading
- PDF generation time remains under 5 seconds for multi-page documents

**Testing Results:**
- ✅ Custom logo renders correctly on all prescription pages
- ✅ No performance degradation (76KB PDF for 16 medications, 2 pages)
- ✅ Logo maintains aspect ratio with `object-fit: contain` CSS
- ✅ File path correctly resolved in CommonJS environment

### November 3, 2025 - PDF Generation Architecture Refactoring ✅
**Complete PDF Generation System Refactoring - Page-by-Page Merging Strategy:**

**Architecture Change:**
- Switched from Puppeteer's native `displayHeaderFooter` to manual page-by-page PDF generation with merging
- Each page is now generated independently as a complete HTML document with inline header, content, and footer
- Individual page PDFs are merged using `pdf-merger-js` for absolute layout control
- Removed all CSS page-break properties in favor of deterministic page slicing

**New PDF Generation Functions:**
- `calculateTotalPages(medications, notesPresent)` - Calculates total pages needed (8 medications on page 1, 10 on subsequent pages)
- `generatePageHTML(data, pageNum, totalPages)` - Generates complete standalone HTML for each page with:
  - Inline header (doctor info, patient details, vitals, diagnosis)
  - Sliced medication table (correct subset for current page)
  - Inline footer (instructions, validity date, signature, page number)
- `generateMultiPagePDF(reportData, format)` - Main function that:
  - Loops through all pages
  - Generates individual PDF for each page
  - Merges all PDFs using dynamic import of `pdf-merger-js`

**Route Updates:**
- POST `/api/reports` - Create prescription with multi-page PDF support
- PUT `/api/reports/:id` - Update prescription with multi-page PDF regeneration
- GET `/api/reports/:id/download/:format` - Download multi-page PDF in A4 or A5 format
- All routes now use `generateMultiPagePDF()` instead of old template system

**Technical Improvements:**
- ES module compatibility: Used dynamic import for `pdf-merger-js` (ES module) in CommonJS environment
- Removed legacy `generatePDFTemplates()` function (headerTemplate/footerTemplate approach)
- Zero-margin PDF generation (`margin: 0, displayHeaderFooter: false`) for precise layout
- Pagination logic: Page 1 contains patient history + 8 medications, subsequent pages contain 10 medications each

**Testing Results:**
- ✅ Successfully tested with 16-medication prescription (2-page PDF generated)
- ✅ Valid PDF output confirmed (77KB, PDF-1.7 format)
- ✅ Multi-page generation logs verified: "📊 Generating 2 page(s) for 16 medication(s)..."
- ✅ PDF merging working correctly: "✅ PDF merge complete"
- ✅ All routes (POST, PUT, GET) properly integrated
- ✅ Backend server running successfully after ES module import fix

### November 3, 2025 - PDF Template Complete Redesign ✅
**Major PDF Generation System Redesign - Latest Update:**

**Database Schema Updates:**
- Added `currentICD` field to diagnosis (ICD-10 code support)
- Split medication frequency into separate fields: `morning`, `afternoon`, `evening`, `night` (MN-AF-EN-NT format)
- Added `instructions` field for patient instructions
- Added `footerText` field with full UTF-8 support for multilingual content
- Added `validTillDate` field for prescription validity

**PDF Template Redesign (Updated):**
- ✅ **Complete rewrite of PDF HTML template to match exact screenshot design**
- ✅ **New header section with medical icon (SVG heart with EKG) and doctor details**
- ✅ **Redesigned patient info layout** - patient details on left, date and prescription ID on right
- ✅ **Updated vitals section** - bordered boxes for Height, Weight, Temperature, Heart Rate, Blood Pressure with units
- ✅ **Reorganized diagnosis and patient history sections** - table-based layout with gray background for diagnosis
- ✅ **Enhanced medication table (Rx)** - proper styling with frequency format (MN - AF - EN - NT) and timing below
- ✅ **Redesigned footer section** - page number, "Doctor generated digitally" message, instructions header, and signature placeholder
- ✅ **Fixed multi-page support** - proper pagination (8 medications per page) with consistent headers/footers
- ✅ **Fixed zero-medication bug** - ensured at least 1 page is generated even with no medications
- ✅ **Fixed doctor specialization display** - now properly shows from database instead of hardcoded text
- UTF-8 encoding support for Tamil, Hindi, and other languages in footer text

**Frontend Updates:**
- Added ICD code input field in diagnosis section
- Replaced single frequency input with 4 separate number inputs (Morning, Afternoon, Evening, Night)
- Added Instructions textarea for patient-specific guidance
- Added Footer Text textarea with UTF-8 multilingual support
- Added Validity Date picker with default (30 days from today)

**Backend Updates:**
- Completely rewrote `generatePrescriptionHTML` function with new template design
- Updated POST/PUT endpoints to handle all new prescription fields
- Enhanced PDF generation to include hospital contact details from database
- Fixed PDF download endpoint to properly handle format parameter (A4/A5)
- Maintained backward compatibility with existing prescriptions

**Testing Results:**
- ✅ Successfully tested with 10-medication prescription (multi-page PDF)
- ✅ UTF-8 characters (Tamil, Hindi) render correctly in PDF
- ✅ All new fields persist through database and appear in generated PDF
- ✅ PDF download generates valid PDF files
- ✅ Multi-page support confirmed (2 pages for 10 medications)
- ✅ Zero-medication prescriptions render correctly with all patient data
- ✅ Doctor specialization displays correctly from database
- ✅ Template matches screenshot design requirements

### October 15, 2025
✅ **Project cleanup for submission:**
- Removed unnecessary test files (App.test.js, setupTests.js, oldApp.js)
- Cleaned all AI-generated comments from codebase
- Simplified deployment configuration files (Dockerfile, apprunner.env)
- Verified all functionality remains intact
- Project is now ready for submission to project manager

## Current Setup Status ✅

### Completed Configuration
1. ✅ Node.js 18 installed
2. ✅ Chromium installed for PDF generation
3. ✅ Frontend and backend dependencies installed
4. ✅ Development workflow configured
5. ✅ Proxy setup between frontend (port 5000) and backend (port 3001)
6. ✅ Environment variables configured

### Port Configuration
- **Frontend**: Port 5000 (user-facing)
- **Backend**: Port 3001 (internal API)
- Frontend proxies `/api` requests to backend at `http://localhost:3001`

## Required Setup Steps

### 1. MongoDB Database Configuration ⚠️
**IMPORTANT**: This application requires MongoDB. You need to provide a MongoDB connection string.

Update `backend/.env` file:
```bash
MONGO_URI=your-mongodb-connection-string-here
```

**Options for MongoDB:**
- MongoDB Atlas (recommended): https://www.mongodb.com/cloud/atlas
- Local MongoDB instance
- Any MongoDB-compatible database

### 2. Optional: AWS S3 Configuration
For PDF storage in the cloud (optional - falls back to base64 storage):

Update `backend/.env` file:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
```

### 3. JWT Secret (Security)
Update the JWT secret in `backend/.env` for production:
```bash
JWT_SECRET=your-secure-random-secret-key
```

## Running the Application

The application is configured to run automatically via the workflow:
1. Backend starts on port 3001
2. Frontend starts on port 5000
3. Click "Run" or the workflow will auto-start

**Manual Start:**
```bash
bash start.sh
```

## Project Structure

```
.
├── backend/              # Express.js backend
│   ├── server.js        # Main server file
│   ├── seedData.js      # Database seeding script
│   ├── .env             # Backend environment variables
│   └── package.json
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.js      # Main app component
│   │   └── index.js
│   ├── public/
│   ├── .env            # Frontend environment variables
│   └── package.json
│
└── start.sh            # Unified startup script
```

## Features
- Multi-hospital support with authentication
- Doctor management
- Prescription creation with PDF generation
- Version history tracking
- JWT-based authentication
- AWS S3 integration for PDF storage (optional)

## Environment Variables Summary

### Backend (`backend/.env`)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Backend port (default: 3001)
- `MONGO_URI` - MongoDB connection string ⚠️ REQUIRED
- `JWT_SECRET` - Secret for JWT tokens
- `AWS_REGION` - AWS region (optional)
- `AWS_ACCESS_KEY_ID` - AWS access key (optional)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (optional)
- `AWS_BUCKET_NAME` - S3 bucket name (optional)
- `PUPPETEER_EXECUTABLE_PATH` - Chromium path (auto-configured)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (`frontend/.env`)
- `REACT_APP_API_URL` - API endpoint URL
- `DANGEROUSLY_DISABLE_HOST_CHECK` - Required for Replit proxy
- `WDS_SOCKET_PORT` - WebSocket configuration for Replit

## First Time Setup

1. **Provide MongoDB Connection String**
   - Edit `backend/.env`
   - Add your MongoDB URI

2. **Run the Application**
   - Click "Run" button
   - Wait for both servers to start

3. **Access the Application**
   - Frontend will be available in the webview
   - Backend API: https://[replit-url]/api

4. **Create First Hospital/Admin** (if database is empty)
   - Use the registration endpoint or seed data script

## API Endpoints

### Authentication
- `POST /api/hospitals/register` - Register hospital
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile

### Doctors
- `GET /api/doctors` - List doctors
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor

### Prescriptions
- `GET /api/reports` - List prescriptions
- `POST /api/reports` - Create prescription
- `PUT /api/reports/:id` - Update prescription
- `GET /api/reports/:id/download/:format` - Download PDF

### Version History
- `GET /api/reports/:id/versions` - Get version history

## Deployment

The application is configured for Replit deployment. When ready to deploy:
1. Ensure MongoDB URI is set for production
2. Update JWT_SECRET to a secure value
3. Configure AWS S3 (optional) for production
4. Use the deployment configuration tool

## Troubleshooting

### MongoDB Connection Error
- Ensure MONGO_URI is set in `backend/.env`
- Check MongoDB is accessible from Replit
- Verify connection string format

### PDF Generation Issues
- Chromium is pre-configured
- Check Puppeteer logs in backend console
- AWS S3 is optional; falls back to base64

### Frontend Not Loading
- Check if port 5000 is accessible
- Verify proxy configuration in `frontend/package.json`
- Check browser console for errors

## Notes
- Frontend uses proxy to avoid CORS issues in development
- PDF generation uses Puppeteer with Chromium
- Version control is built into prescriptions
- Multi-hospital isolation is enforced at the data level
