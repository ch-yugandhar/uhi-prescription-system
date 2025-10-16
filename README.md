

<h1 align="center">🏥 UHI Prescription System</h1>

<p align="center">
  <b>A secure, scalable, and version-controlled prescription management platform for multi-hospital environments.</b><br/>
  Developed with ❤️ by <a href="https://github.com/ch-yugandhar">CH Yugandhar</a>
</p>

---

<p align="center">
  <!-- Shields.io badges -->
  <img src="https://img.shields.io/github/license/ch-yugandhar/uhi-prescription-system?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/languages/top/ch-yugandhar/uhi-prescription-system?style=for-the-badge" alt="Top Language">
  <img src="https://img.shields.io/github/last-commit/ch-yugandhar/uhi-prescription-system?style=for-the-badge" alt="Last Commit">
  <img src="https://img.shields.io/github/repo-size/ch-yugandhar/uhi-prescription-system?style=for-the-badge" alt="Repo Size">
  <img src="https://img.shields.io/github/issues/ch-yugandhar/uhi-prescription-system?style=for-the-badge" alt="Issues">
</p>

---

## 🌐 Overview

The **UHI Prescription System** is a full-stack healthcare application that simplifies and secures **digital prescription management** across multiple hospitals.  
It provides **role-based access**, **data versioning**, and **cloud storage** for PDF prescriptions, ensuring reliability and compliance in medical record handling.

---

## ✨ Features

- 🏥 **Multi-Hospital Support** — Manage multiple hospitals and users seamlessly  
- 👨‍⚕️ **Role-Based Access** — Admin, doctor, and staff permissions  
- 🧾 **Prescription Versioning** — Track and audit every edit  
- ☁️ **AWS S3 Integration** — Secure file storage and retrieval  
- 🧱 **MongoDB Atlas** — Cloud-hosted NoSQL database  
- 📄 **PDF Generation** — Export formatted prescriptions  
- 🔐 **JWT Authentication** — Secure login and authorization  
- 📱 **Responsive UI** — Works across devices  

---

## 🧠 Architecture

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js (Vite / CRA) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Storage** | AWS S3 |
| **Auth** | JWT |
| **PDF Engine** | Puppeteer |
| **Deployment** | AWS EC2 / Docker |

---

## ⚙️ Environment Variables

### 🧩 Backend `.env`
```env
# --- App Config ---
PORT=4000
NODE_ENV=development

# --- Database ---
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/uhi-prescription

# --- Authentication ---
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

# --- AWS S3 Storage ---
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=uhi-prescriptions-bucket

# --- File Handling ---
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# --- Email (optional) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="UHI Prescription <noreply@uhi.com>"

# --- Logging / Monitoring ---
LOG_LEVEL=info
````

### 💻 Frontend `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_AWS_S3_REGION=ap-south-1
REACT_APP_ENV=development
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ch-yugandhar/uhi-prescription-system.git
cd uhi-prescription-system
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on [http://localhost:4000](http://localhost:4000)

### 3️⃣ Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

Access app at [http://localhost:3000](http://localhost:3000)

---

## 📁 Folder Structure

```
uhi-prescription-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
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
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| `POST` | `/api/auth/login`            | Authenticate user            |
| `POST` | `/api/hospital`              | Register new hospital        |
| `GET`  | `/api/prescriptions`         | Fetch all prescriptions      |
| `POST` | `/api/prescriptions`         | Create new prescription      |
| `PUT`  | `/api/prescriptions/:id`     | Update existing prescription |
| `GET`  | `/api/prescriptions/:id/pdf` | Generate PDF                 |

---

## 🧪 Development Notes

* Admin-only actions (create/update/delete) are handled from the **Admin Panel**
* All uploads (PDFs, attachments) go to **AWS S3**
* MongoDB Atlas used for cloud database hosting
* JWT tokens secure all API requests

---

## 🐳 Docker Support (Optional)

```bash
docker build -t uhi-prescription-system .
docker run -p 4000:4000 uhi-prescription-system
```

Or, if you have `docker-compose.yml`:

```bash
docker-compose up
```

---

## 🚧 Roadmap / Future Enhancements

* ✅ Patient portal
* ✅ Audit log with version comparison
* 🔄 Real-time notifications
* 📦 Prescription analytics dashboard
* 🧠 AI-based prescription suggestions
* 🧾 Billing & pharmacy integration

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request 🎉

---

## 📜 License

Licensed under the **MIT License**.
See the [`LICENSE`](LICENSE) file for full details.

---

## 📫 Contact

**👤 Maintainer:** [CH Yugandhar](https://github.com/ch-yugandhar)
📧 **Email:** [yugandharch2004@gmail.com](mailto:yugandharch2004@gmail.com)
🌐 **Repo:** [UHI Prescription System](https://github.com/ch-yugandhar/uhi-prescription-system)

---

<p align="center">
  <b>“Empowering healthcare through digital precision and version control.”</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-success?style=flat-square">
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=flat-square">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square">
  <img src="https://img.shields.io/badge/AWS-S3-orange?style=flat-square">
</p>
```


```bash
git add README.md
git commit -m "Updated professional README with badges"
git push origin main
```

