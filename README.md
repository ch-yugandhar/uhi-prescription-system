# UHI Multi-Hospital Prescription Management System

A comprehensive, full-stack prescription management system designed for multiple hospitals with advanced features including PDF generation, version control, and multi-user authentication.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Local Development](#local-development)
  - [Replit Deployment](#replit-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Overview

The UHI Multi-Hospital Prescription Management System is a modern healthcare solution that enables hospitals to:
- Manage multiple doctors and their profiles
- Create digital prescriptions with detailed patient information
- Generate professional PDF prescriptions with custom medical logos
- Track prescription versions and history
- Secure authentication for hospital administrators
- Store prescription PDFs in cloud storage (AWS S3)

## ✨ Features

### Core Features
- **Multi-Hospital Support**: Manage multiple hospitals within a single system
- **Doctor Management**: Add, edit, and manage doctor profiles with qualifications and specializations
- **Digital Prescriptions**: Create comprehensive prescriptions with:
  - Patient demographics (name, age, gender, patient ID)
  - Vital signs (height, weight, temperature, heart rate, blood pressure)
  - Diagnosis with ICD codes
  - Medication details with dosage timing
  - Clinical examination findings
  - Patient complaints and history
  - Allergies and special instructions
- **PDF Generation**: Automatically generate professional prescription PDFs with custom branding
- **Version Control**: Track all prescription modifications with version history
- **Authentication & Authorization**: Secure login system for hospital administrators
- **Cloud Storage**: Store generated PDFs on AWS S3 for reliable access
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Features
- RESTful API architecture
- JWT-based authentication
- MongoDB for data persistence
- Puppeteer for high-quality PDF generation
- React.js for dynamic frontend
- CORS-enabled API for frontend-backend communication

## 🛠️ Tech Stack

### Frontend
- **React.js 18.2** - Modern UI library
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling

### Backend
- **Node.js 18.x** - JavaScript runtime
- **Express.js 4.x** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 7.x** - MongoDB object modeling
- **Puppeteer 21.x** - Headless browser for PDF generation
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **AWS SDK** - S3 integration for file storage

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **MongoDB** - Local installation or MongoDB Atlas account
- **AWS Account** - For S3 bucket (PDF storage)
- **Git** - For version control

## 🚀 Installation & Setup

### Local Development

#### Step 1: Clone the Repository

```bash
git clone https://github.com/ch-yugandhar/uhi-prescription-system.git
cd uhi-prescription-system
```

#### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

#### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### Step 4: Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd ../backend
touch .env
```

Add the following variables (see [Environment Variables](#environment-variables) section for details):

```env
MONGO_URI=your_mongodb_connection_string
PORT=3001
JWT_SECRET=your_secure_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

#### Step 5: Seed the Database (Optional)

Populate the database with sample hospitals, doctors, and prescriptions:

```bash
cd backend
npm run seed
```

#### Step 6: Start the Development Servers

**Option A: Using the start script (Recommended)**

```bash
# From the project root
bash start.sh
```

**Option B: Manual start**

Terminal 1 - Backend:
```bash
cd backend
npm start
# Backend runs on http://localhost:3001
```

Terminal 2 - Frontend:
```bash
cd frontend
PORT=5000 npm start
# Frontend runs on http://localhost:5000
```

#### Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001/api

### Replit Deployment

#### Step 1: Fork or Import the Repository

1. Log in to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Paste the repository URL: `https://github.com/ch-yugandhar/uhi-prescription-system.git`
5. Click "Import from GitHub"

#### Step 2: Configure Environment Variables

1. Click the **Secrets (🔒)** icon in the left sidebar
2. Add all required environment variables (see [Environment Variables](#environment-variables))

#### Step 3: Install Dependencies

Dependencies will be installed automatically when you run the project. If needed, manually install:

```bash
cd backend && npm install
cd ../frontend && npm install
```

#### Step 4: Run the Application

Click the **"Run"** button at the top of the Replit workspace. The application will start automatically using the `start.sh` script.

#### Step 5: Access Your Application

Replit will provide a preview URL. Click the URL or open the web view to access your application.

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/prescriptions` |
| `PORT` | Backend server port | `3001` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_key_here_min_32_chars` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region for S3 bucket | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name for PDFs | `prescription-pdfs-bucket` |
| `PUPPETEER_EXECUTABLE_PATH` | Path to Chromium browser | `/usr/bin/chromium-browser` (Linux) |

### Generating a Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 💾 Database Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Grant "Read and write to any database" permission

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, add specific IP addresses

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `prescriptions`

6. **Update `.env` file**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/prescriptions?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. **Install MongoDB**
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB Service**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **Update `.env` file**
   ```env
   MONGO_URI=mongodb://localhost:27017/prescriptions
   ```

### Seed Data

After setting up the database, populate it with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 2 sample hospitals (Apollo Hospitals, Fortis Malar Hospital)
- 4 sample doctors with different specializations
- 2 sample prescriptions
- Admin accounts for each hospital

**Default Login Credentials** (after seeding):
- Email: `admin@apollohospitals.com`
- Password: `admin123`

## ▶️ Running the Application

### Development Mode

```bash
bash start.sh
```

This starts both frontend and backend servers concurrently.

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve Frontend with Backend**
   Update `backend/server.js` to serve static files:
   ```javascript
   app.use(express.static(path.join(__dirname, '../frontend/build')));
   ```

3. **Start Backend**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## 📖 Usage Guide

### 1. Hospital Registration

1. Open the application in your browser
2. Click "Register New Hospital"
3. Fill in hospital details:
   - Hospital name
   - Email address
   - Physical address
   - Phone number
   - Registration number
   - Admin name, email, and password
4. Click "Register"
5. After successful registration, you'll be redirected to login

### 2. Admin Login

1. Enter your admin email and password
2. Click "Login"
3. You'll be redirected to the main dashboard

### 3. Managing Doctors

1. Navigate to "Doctor Management" tab
2. Click "Add New Doctor"
3. Fill in doctor details:
   - Name
   - Qualification
   - Specialization
   - Registration number
   - Clinic address
   - Contact number
   - Email
4. Click "Save Doctor"

To edit or delete doctors, use the action buttons in the doctor list.

### 4. Creating Prescriptions

1. Go to the "Prescription Form" tab
2. **Select Doctor**: Choose from the dropdown or enter manually
3. **Patient Information**:
   - Name, Age, Gender, Patient ID
4. **Vitals**:
   - Height, Weight, Temperature, Heart Rate, Blood Pressure
5. **Diagnosis**:
   - Current diagnosis and ICD code
   - Known conditions
6. **Medications**:
   - Click "Add Medication" for each drug
   - Enter name, composition, dosage timing (morning/afternoon/evening/night)
   - Specify duration and quantity
7. **Additional Information**:
   - Allergies
   - Clinical examination findings
   - Patient complaints
   - Medical history
   - Special instructions
8. Click "Generate PDF" to create the prescription

### 5. Viewing Prescriptions

1. Go to "Prescriptions List" tab
2. View all generated prescriptions
3. Use the search bar to filter by patient name or prescription ID
4. Click on a prescription to view details
5. Download PDF or view version history

### 6. Version History

1. Open a prescription from the list
2. Click "View Version History"
3. See all previous versions with timestamps
4. Click on any version to view its PDF

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/login` | Admin login | No |

### Hospitals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/hospitals/register` | Register new hospital | No |
| GET | `/api/hospitals` | Get all hospitals | Yes |

### Doctors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/doctors` | Get all doctors for hospital | Yes |
| POST | `/api/doctors` | Add new doctor | Yes |
| PUT | `/api/doctors/:id` | Update doctor | Yes |
| DELETE | `/api/doctors/:id` | Delete doctor | Yes |

### Prescriptions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports` | Get all prescriptions | Yes |
| POST | `/api/reports` | Create new prescription | Yes |
| PUT | `/api/reports/:id` | Update prescription | Yes |
| GET | `/api/reports/:id/versions` | Get version history | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server health status | No |

### Authentication Header

For protected endpoints, include JWT token in request headers:

```javascript
Authorization: Bearer <your_jwt_token>
```

## 📁 Project Structure

```
uhi-prescription-system/
├── backend/
│   ├── assets/
│   │   └── medical-logo.jpg          # Custom medical logo
│   ├── scripts/
│   │   └── install-puppeteer.js      # Puppeteer setup script
│   ├── server.js                      # Main backend server
│   ├── seedData.js                    # Database seeding script
│   ├── template.html                  # Prescription PDF template
│   └── package.json                   # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   ├── index.html                 # HTML template
│   │   ├── favicon.ico                # Favicon
│   │   └── manifest.json              # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js               # Login component
│   │   │   ├── Login.css              # Login styles
│   │   │   ├── DoctorManagement.js    # Doctor CRUD component
│   │   │   └── VersionHistory.js      # Version history component
│   │   ├── App.js                     # Main app component
│   │   ├── App.css                    # App styles
│   │   ├── index.js                   # React entry point
│   │   └── index.css                  # Global styles
│   └── package.json                   # Frontend dependencies
│
├── .gitignore                         # Git ignore rules
├── LICENSE                            # MIT License
├── README.md                          # This file
├── replit.md                          # Replit-specific documentation
├── start.sh                           # Startup script
└── package.json                       # Root package file
```

## 🚢 Deployment

### Deploy to Replit (Recommended)

1. **Configure Deployment**
   - Deployment is already configured to use Reserved VM
   - The app runs using `bash start.sh`

2. **Add Environment Variables**
   - Add all required secrets in Replit Secrets (🔒)

3. **Deploy**
   - Click the "Deploy" button in your Replit workspace
   - Choose "Reserved VM" deployment
   - Click "Publish"
   - Share the deployment URL with your team

### Deploy to Other Platforms

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create uhi-prescription-system

# Add buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... add all other env vars

# Deploy
git push heroku main
```

#### AWS / DigitalOcean / VPS

1. Set up a Linux server (Ubuntu 20.04 or higher)
2. Install Node.js, MongoDB, and dependencies
3. Clone the repository
4. Set up environment variables
5. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "prescription-backend"
   ```
6. Configure Nginx as reverse proxy
7. Set up SSL certificate with Let's Encrypt

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
- Check if MongoDB is running: `sudo systemctl status mongod`
- Verify `MONGO_URI` in `.env` file
- For MongoDB Atlas, check network access settings
- Ensure IP address is whitelisted

#### 2. PDF Generation Fails

**Error**: `Error: Failed to launch the browser process`

**Solution**:
- Install Chromium dependencies:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install -y chromium-browser chromium-codecs-ffmpeg
  
  # Replit (already configured)
  ```
- Verify `PUPPETEER_EXECUTABLE_PATH` in `.env`

#### 3. AWS S3 Upload Error

**Error**: `AccessDenied: Access Denied`

**Solution**:
- Verify AWS credentials in `.env`
- Check S3 bucket permissions
- Ensure IAM user has `s3:PutObject` permission

#### 4. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Find process using the port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### 5. Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`

**Solution**:
- Verify backend is running on port 3001
- Check `proxy` setting in `frontend/package.json`
- Ensure CORS is enabled in backend (already configured)
- Update `REACT_APP_API_URL` environment variable if needed

#### 6. JWT Authentication Fails

**Error**: `Invalid token` or `Token expired`

**Solution**:
- Clear browser localStorage: `localStorage.clear()`
- Re-login to get new token
- Verify `JWT_SECRET` is set in backend `.env`

### Getting Help

If you encounter issues not covered here:

1. Check the [Issues](https://github.com/ch-yugandhar/uhi-prescription-system/issues) page
2. Search for similar problems
3. Create a new issue with:
   - Detailed description
   - Error messages
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 👨‍💻 Author

**UHI Team**

- GitHub: [@ch-yugandhar](https://github.com/ch-yugandhar)

---

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Puppeteer team for PDF generation capabilities
- MongoDB team for the robust database
- AWS for reliable cloud storage
- All contributors and users of this system

---

**Made with ❤️ for Healthcare**
