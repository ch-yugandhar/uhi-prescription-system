
# 🏥 UHI Prescription System

A **secure, scalable, and version-controlled prescription management platform** designed for multi-hospital networks.  
It enables **administrators, doctors, and hospitals** to manage and generate digital prescriptions, store data securely, and export reports in PDF — all through a unified web interface.

---

## 🚀 Key Features

- **Multi-Hospital Support:** Manage multiple hospitals and users within one system  
- **Role-Based Access Control (RBAC):** Separate permissions for admin, doctors, and staff  
- **Secure Data Management:** All data handled exclusively through the admin panel  
- **Prescription Versioning:** Tracks and stores all revisions of prescriptions  
- **Export as PDF:** Generate and download prescription reports dynamically  
- **AWS S3 Integration:** Store PDFs and assets securely in the cloud  
- **MongoDB Atlas:** Cloud-based database for reliability and scalability  
- **Responsive UI:** Optimized for both desktop and mobile devices  

---

## 🧠 System Architecture

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js (Vite/CRA) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Storage** | AWS S3 |
| **Authentication** | JWT (JSON Web Tokens) |
| **PDF Generator** | Puppeteer |
| **Deployment** | AWS EC2 / Docker |

---

## ⚙️ Environment Variables

Create a `.env` file in both `backend/` and `frontend/` directories as needed.

### Backend `.env`

```env
# --- App Config ---
PORT=4000
NODE_ENV=development

# --- Database ---
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/uhi-prescription

# --- Authentication ---
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d

# --- AWS S3 Storage ---
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=uhi-prescriptions-bucket

# --- File Storage ---
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# --- Email Service (optional) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="UHI Prescription <noreply@uhi.com>"

# --- Logging / Monitoring ---
LOG_LEVEL=info
````

### Frontend `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_AWS_S3_REGION=ap-south-1
REACT_APP_ENV=development
```


---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ch-yugandhar/uhi-prescription-system.git
cd uhi-prescription-system
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs by default on **[http://localhost:4000](http://localhost:4000)**

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

React app runs by default on **[http://localhost:3000](http://localhost:3000)**

---

## 🧱 Folder Structure

```
uhi-prescription-system/
│
├── backend/
│   ├── config/        # DB, AWS, etc.
│   ├── controllers/   # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── utils/         # Helpers (PDF, JWT, etc.)
│   └── server.js      # App entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── Dockerfile
├── docker-compose.yml (optional)
├── .env.example
└── README.md
```

---

## 🧩 API Overview

| Method | Endpoint                     | Description             |
| ------ | ---------------------------- | ----------------------- |
| `POST` | `/api/auth/login`            | Authenticate user       |
| `POST` | `/api/hospital`              | Create hospital         |
| `GET`  | `/api/prescriptions`         | Get all prescriptions   |
| `POST` | `/api/prescriptions`         | Create new prescription |
| `PUT`  | `/api/prescriptions/:id`     | Update prescription     |
| `GET`  | `/api/prescriptions/:id/pdf` | Generate & download PDF |

---

## 🧪 Development Notes

* All admin actions (create/update/delete) must occur from the **Admin Panel**
* All files are uploaded to **AWS S3** (PDFs, attachments)
* MongoDB Atlas manages global data storage
* JWT tokens handle secure session-based authentication

---

## 🐳 Docker Setup (Optional)

```bash
docker build -t uhi-prescription-system .
docker run -p 4000:4000 uhi-prescription-system
```

Or using Docker Compose:

```bash
docker-compose up
```

---

## 📈 Future Enhancements

* ✅ Patient-side portal
* ✅ Audit logs with comparison of prescription versions
* 🔄 Real-time notifications (Socket.io / WebSockets)
* 🧠 AI-based prescription suggestion (NLP model)
* 🧾 Billing and inventory integration

---

## 🧑‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📄 License

Licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

---

## 📬 Contact

**Maintainer:** [CH Yugandhar](https://github.com/ch-yugandhar)
📧 **Email:** [yugandharch2004@gmail.com](mailto:yugandharch2004@gmail.com)
🌐 **Project Repo:** [UHI Prescription System](https://github.com/ch-yugandhar/uhi-prescription-system)

---

> *“Empowering healthcare through digital precision and version control.”*

