# Nabi Backend – คู่มือทดสอบระบบ

> เอกสารนี้สรุปทุกเส้นทาง (path) และตัวอย่างคำขอที่ใช้ทดสอบผ่าน Postman/curl ให้ครอบคลุมทั้ง Guest/User/Admin

## 0. เตรียมระบบ

```bash
npm install
```

ตั้งค่า `.env` (ตัวอย่าง)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nabi_app
JWT_SECRET=EXPRESSADVANCE_!2025_SECRET
JWT_EXPIRES=7d
AGE_MIN=20

UPLOAD_DIR=uploads
MAX_UPLOAD_MB=8
ALLOWED_IMAGE_MIME=image/jpeg,image/png,image/webp
UPLOAD_BASE_URL=http://localhost:5000/uploads

SEED_ADMIN_EMAIL=admin@nabi.local
SEED_ADMIN_PASSWORD=Admin#123
SEED_ADMIN_NAME=System Admin
```

รันเซิร์ฟเวอร์

```bash
npm run dev
# หรือ npm start
```

### บูทแอดมินเริ่มต้น (ถ้าต้องการ)
```bash
npm run seed:admin
```

---

## 1. Public / Guest Routes
ไม่ต้องใช้ JWT

| Method | Path | รายละเอียด |
| ------ | ---- | ----------- |
| GET | `/` | หน้า welcome พร้อมแนะนำ path อื่น |
| GET | `/homepage` | สำเนา welcome |
| GET | `/products` | รายการสินค้า public |
| GET | `/products/:productId` | ข้อมูลสินค้า public |
| GET | `/uploads/<filename>` | ไฟล์ที่อัปโหลด (รูป KYC / รูปสินค้า) |

ตัวอย่าง curl
```bash
curl http://localhost:5000/products
```

---

## 2. สมัคร / ล็อกอิน / โปรไฟล์ (Auth)

### 2.1 สมัครสมาชิก (พร้อม KYC)
`POST http://localhost:5000/register`  
Body → `form-data`

| Key | Type | Value |
| --- | ---- | ----- |
| email | Text | `user01@example.com` |
| password | Text | `User#12345` |
| name | Text | `Somchai Jaidee` |
| dob | Text | `2000-05-20` |
| phone | Text | `0812345678` |
| lineId | Text | `somchai123` |
| facebookProfileUrl | Text | `https://facebook.com/somchai.j` |
| idCardImage | File | (เลือกไฟล์รูป) |
| selfieWithId | File | (เลือกไฟล์รูป) |

**ผลลัพธ์**: ได้ `token`, `user` พร้อม `kycStatus = "pending"`

### 2.2 ล็อกอิน
`POST http://localhost:5000/login`  
Headers: `Content-Type: application/json`
```json
{
  "email": "user01@example.com",
  "password": "User#12345"
}
```
รับ `token` → ใช้ใน authorized requests (แทน `<USER_JWT>`)

### 2.3 ดูโปรไฟล์ตนเอง (public base)
`GET http://localhost:5000/profile`  
Headers: `Authorization: Bearer <USER_JWT>`

### 2.4 ดูโปรไฟล์เชิงลึก (ผ่าน `/api`)  
`GET http://localhost:5000/api/users/<userId>`  
Headers: `Authorization: Bearer <USER_JWT>` (เจ้าของ) หรือ `<ADMIN_JWT>`

---

## 3. เส้นทางสำหรับ Users (หลัง KYC ผ่าน)

### 3.1 สร้างออเดอร์ (LINE Channel)
`POST http://localhost:5000/api/orders/line`  
Headers: `Authorization: Bearer <USER_JWT>`, `Content-Type: application/json`
```json
{
  "items": [
    { "productId": "6730f8cb1f4f96e3b511cabc", "quantity": 2 },
    { "productId": "6730f8d41f4f96e3b511cad0", "quantity": 1 }
  ],
  "note": "Please confirm via LINE tonight",
  "lineUserId": "Ua1234567890",
  "lineMessageId": "1234567890123"
}
```
ℹ️ ต้องเป็น user ที่ `ageVerified=true` และ `kycStatus=approved`

### 3.2 ดูประวัติออเดอร์
`GET http://localhost:5000/api/orders/me`  
Headers: `Authorization: Bearer <USER_JWT>`

### 3.3 สร้าง Lead (ตัวอย่างเดิม)
`POST http://localhost:5000/api/leads`  
Headers: `Authorization: Bearer <USER_JWT>`  
(ต้องผ่าน age + KYC)  
```json
{
  "message": "สนใจสินค้าตัวล่าสุด",
  "preferredChannel": "line"
}
```

---

## 4. เส้นทางสำหรับ Admin
ต้องล็อกอินด้วยบัญชี admin → `POST /login` (ใช้ admin seed) → ได้ `<ADMIN_JWT>`

### 4.1 KYC Workflow
- รายชื่อที่รออนุมัติ  
  `GET http://localhost:5000/api/admin/kyc/pending`
- อนุมัติ KYC  
  `PUT http://localhost:5000/api/admin/kyc/<userId>/approve`
- ปฏิเสธ KYC  
  `PUT http://localhost:5000/api/admin/kyc/<userId>/reject`  
  Body (optional)  
  ```json
  { "note": "ภาพไม่ชัด กรุณาส่งใหม่" }
  ```

### 4.2 การจัดการสินค้า
| Method | Path | รายละเอียด |
| ------ | ---- | ----------- |
| GET | `/api/admin/products` | รายการสินค้า (รวม hidden/deleted ได้ผ่าน query) |
| POST | `/api/admin/products` | เพิ่มสินค้า |
| PUT | `/api/admin/products/:id` | แก้สินค้า (append รูปได้) |
| PUT | `/api/admin/products/:id/images` | แทนที่รูปทั้งหมด |
| DELETE | `/api/admin/products/:id` | soft delete |
| PUT | `/api/admin/products/:id/restore` | กู้ soft delete |
| DELETE | `/api/admin/products/:id/hard` | hard delete |

ตัวอย่าง POST (Raw JSON)
```json
{
  "name": "Nabi Premium",
  "description": "Herbal product description",
  "price": 199,
  "tags": ["herb", "wellness"],
  "visibility": "public",
  "status": "active"
}
```

### 4.3 ตรวจออเดอร์จาก LINE
- รายการออเดอร์ทั้งหมด  
  `GET http://localhost:5000/api/admin/orders`
- ปรับสถานะ/บันทึกหมายเหตุ  
  `PATCH http://localhost:5000/api/admin/orders/<orderId>`  
  ```json
  {
    "status": "confirmed",
    "adminNote": "พร้อมจัดส่งภายในวันนี้"
  }
  ```
- สถิติออเดอร์ (นับสถานะ/รายได้รวม)  
  `GET http://localhost:5000/api/admin/stats/orders`

---

## 5. เส้นทาง Product สำหรับผู้ใช้ทั่วไป
| Method | Path | หมายเหตุ |
| ------ | ---- | -------- |
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |

---

## 6. สคริปต์ทดสอบ (อ้างอิงคำสั่ง curl)
สามารถแปลงไปใช้ใน Postman โดยเลือกประเภท Body และ Headers ให้ตรงกับตัวอย่าง

```bash
# สมัครสมาชิก (ต้องใช้ form-data ใน Postman)
curl -X POST http://localhost:5000/register \
  -F "email=user01@example.com" \
  -F "password=User#12345" \
  -F "name=Somchai Jaidee" \
  -F "dob=2000-05-20" \
  -F "phone=0812345678" \
  -F "lineId=somchai123" \
  -F "facebookProfileUrl=https://facebook.com/somchai.j" \
  -F "idCardImage=@/absolute/path/idcard.jpg" \
  -F "selfieWithId=@/absolute/path/selfie.jpg"

# ล็อกอิน (user/admin)
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user01@example.com","password":"User#12345"}'
```

---

## 7. Scenario แนะนำสำหรับ QA Manual

1. **Guest**: เรียก `/homepage`, `/products` → เห็นสินค้าโดยไม่ต้องล็อกอิน
2. **Register**: ส่ง form-data ครบถ้วน → ตรวจว่าได้ token, `kycStatus=pending`
3. **Login**: ล็อกอินซ้ำ → ได้ token เดิม/ใหม่
4. **Profile**: `GET /profile` และ `/api/users/:id` → ตรวจข้อมูลโปรไฟล์/KYC
5. **Admin KYC**: ใช้ `<ADMIN_JWT>` → `GET /api/admin/kyc/pending` → `PUT /approve` → ตรวจว่าผู้ใช้กลายเป็น approved
6. **User Order**: ล็อกอินผู้ใช้เดิม → `POST /api/orders/line` → ตรวจว่า 201 และสรุปยอดถูกต้อง
7. **User Order History**: `GET /api/orders/me` → เห็นออเดอร์
8. **Admin Review Order**: `GET /api/admin/orders` → `PATCH /orders/:id` เปลี่ยนเป็น `confirmed`
9. **Product Admin**: สร้าง/แก้/ลบสินค้า → ตรวจผลผ่าน `/products`
10. **Negative Case**: ลองเรียกเส้นทางที่ต้องใช้ role โดยไม่มี token หรือ role ไม่ถูกต้อง → ต้องได้ 401/403

---

## 8. หมายเหตุเพิ่มเติม
- หากต้องการทดสอบ LINE bot ให้ชี้ webhook มายัง backend แล้วเรียก `POST /api/orders/line` ด้วย payload ตามตัวอย่าง
- สามารถเพิ่ม automated test เพิ่มเติมได้ด้วย Jest + Supertest หากต้องการ CI (`npm i -D jest supertest mongodb-memory-server`)
- อัปโหลดทั้งหมดถูกเก็บในโฟลเดอร์ `uploads/` ตามค่าจาก `.env`
