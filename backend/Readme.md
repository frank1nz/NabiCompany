*** Nabi Backend — API Test Guide

0) เตรียมระบบ
0.1 ติดตั้ง deps

```
npm install
```

0.2 ตั้งค่า .env (ตัวอย่าง)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nabi_app
JWT_SECRET=EXPRESSADVANCE_!2025_SECRET
JWT_EXPIRES=7d
AGE_MIN=20

UPLOAD_DIR=uploads
MAX_UPLOAD_MB=8
ALLOWED_IMAGE_MIME=image/jpeg,image/png
UPLOAD_BASE_URL=http://localhost:5000/uploads

SEED_ADMIN_EMAIL=admin@nabi.local
SEED_ADMIN_PASSWORD=Admin#123
SEED_ADMIN_NAME=System Admin

```

