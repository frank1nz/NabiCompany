# Nabi Frontend (React + Vite)

แดชบอร์ดฝั่งลูกค้ากับแอดมินที่เชื่อมต่อกับ Nabi Backend เพื่อแสดงสินค้า, ยืนยันตัวตนผู้ใช้ (KYC) และจัดการคำสั่งซื้อผ่าน LINE

## 1. เตรียมระบบ

```bash
cd frontend
npm install
```

### Environment variables
สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend` (มีตัวอย่างใน repo แล้ว)

```env
VITE_API_BASE=http://localhost:5000/api
VITE_UPLOAD_BASE=http://localhost:5000
```

> `VITE_API_BASE` ต้องชี้ไปที่ prefix `/api` ของ backend เสมอ  
> `VITE_UPLOAD_BASE` ใช้แสดงรูปจากโฟลเดอร์ uploads ที่ backend ให้บริการ

## 2. คำสั่งหลัก

```bash
npm run dev      # เปิด Vite dev server (default http://localhost:5173)
npm run build    # สร้างไฟล์ production ในโฟลเดอร์ dist/
npm run preview  # เสิร์ฟผล build เพื่อทดสอบแบบ production
npm run lint     # ตรวจโค้ดด้วย ESLint
```

## 3. Routing & Guards
การควบคุมเส้นทางถูกประกาศใน `src/routes.jsx`

| Path | บทบาท | รายละเอียด |
| ---- | ------ | ----------- |
| `/` | ทุกคน | หน้า Home แสดงสินค้าส่วนหนึ่ง |
| `/products` | ทุกคน | ดูสินค้าสาธารณะทั้งหมด |
| `/register` | guest | สร้างบัญชี + อัปโหลดเอกสาร KYC (ถ้ามี token จะถูก redirect ไป `/status`) |
| `/login` | guest | ล็อกอิน (ถ้ามี token จะถูก redirect ไป `/status`) |
| `/orders` | user | สร้างคำสั่งซื้อ LINE (ต้องผ่าน KYC) และดูประวัติ |
| `/me/:id` | user, admin | ดูโปรไฟล์ (มี document link) |
| `/admin/kyc` | admin | รายชื่อผู้ใช้ที่รออนุมัติ/ปฏิเสธ |
| `/admin/orders` | admin | ตรวจสอบคำสั่งซื้อและปรับสถานะ |
| `/admin/products` | admin | จัดการสินค้า (เพิ่ม/เปลี่ยนสถานะ/soft delete) |

### Middleware ฝั่ง client
- `RequireAuth` ตรวจว่า route นั้นต้องมี token + บทบาทที่ถูกต้อง ไม่งั้น redirect ไป `/`
- `RequireVerified` ใช้ทับซ้อนสำหรับหน้า orders (ต้องผ่าน age/KYC)
- `RedirectIfAuthenticated` ป้องกันผู้ที่ล็อกอินแล้วไม่ให้ย้อนกลับหน้า login/register

## 4. Authentication flow
1. ผู้ใช้สมัครผ่าน `/register` → เมื่อส่งข้อมูลสำเร็จระบบจะพาไปหน้า `/login`
2. ล็อกอินสำเร็จ → ระบบบันทึก token, ดึงข้อมูล `/auth/me` และ redirect ไป `/status` ทันที
3. ใน navbar จะแสดงเมนูตามบทบาท (`/admin/*` แสดงเฉพาะ admin)
4. เมื่อ user ผ่าน KYC (`isVerified` → true) จะเห็นปุ่ม Orders และสามารถสร้างคำสั่งซื้อได้
5. ปุ่ม Logout ใน navbar จะเคลียร์ token และพากลับหน้า `/login`

## 5. โค้ดที่เกี่ยวข้อง
| ไฟล์ | หน้าที่ |
| ---- | ------- |
| `src/store/authStore.js` | จัดการ token, user, การดึงข้อมูล `/auth/me` ด้วย Zustand |
| `src/components/Layout.jsx` | โหลดข้อมูล user ทันทีเมื่อมี token |
| `src/components/Navbar.jsx` | เมนูนำทางพร้อมแสดง token state |
| `src/pages/Orders.jsx` | ฟอร์มสร้างคำสั่งซื้อ + รายการคำสั่งซื้อของฉัน |
| `src/pages/admin/AdminOrders.jsx` | ตารางจัดการคำสั่งซื้อสำหรับ admin |
| `src/pages/admin/AdminProduct.jsx` | CRUD สินค้าแบบเบื้องต้น |
| `src/pages/admin/AdminKyc.jsx` | อนุมัติ / ปฏิเสธ KYC |

## 6. เชื่อมต่อ Backend
ให้ backend ทำงานพร้อมกัน (default port 5000)  
Frontend จะยิงไปที่ `http://localhost:5000/api/*` และเรียกไฟล์รูปที่ `http://localhost:5000/uploads/*`

ตรวจสอบว่ามีบัญชี admin seed หรือสร้างเองด้วยสคริปต์ `npm run seed:admin` ในโปรเจ็กต์ backend

## 7. การทดสอบแนะนำ (Manual)
1. เปิด backend + frontend (`npm run dev`)  
2. สมัครสมาชิกใหม่ → ต้องถูกส่งไป `/login` ทันที → ล็อกอิน → ถูกพาไป `/status` (หน้ารถ guard)
3. ใช้ admin ล็อกอิน → `/status` → เปลี่ยน URL ไป `/admin/kyc` เพื่ออนุมัติผู้ใช้ → ตรวจ `/admin/orders` และ `/admin/products`
4. กลับไป user → ตรวจว่าปุ่ม Orders ปรากฏหลัง KYC และสามารถสร้างคำสั่งซื้อได้
5. ลองเข้าหน้า `/login` ขณะล็อกอินอยู่ → ระบบควรพาออกไป `/status` เพื่อป้องกันการแสดงหน้าซ้ำ

---

หากต้องการปรับแต่งหรือเพิ่มฟีเจอร์อื่นๆ (เช่น code-splitting ลด bundle หรือเพิ่ม unit test) สามารถใช้พื้นฐานนี้ต่อยอดได้ทันที
