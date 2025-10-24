# Nabi Backend

Express + MongoDB service for user onboarding (age/KYC), product catalogue, cart checkout with PromptPay, and admin operations.

---

## Quick start

```bash
cd backend
npm install
npm run dev           # or: npm start
```

Seed the default admin account (optional):

```bash
npm run seed:admin
```

### Environment variables (`backend/.env`)

| Key | Description |
| --- | ----------- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET`, `JWT_EXPIRES` | Auth token config |
| `AGE_MIN` | Minimum age to auto-verify by DOB |
| `UPLOAD_DIR`, `UPLOAD_BASE_URL` | Local upload storage for KYC & product images |
| `MAX_UPLOAD_MB`, `ALLOWED_IMAGE_MIME` | Upload validation |
| `SEED_ADMIN_*` | Credentials for `npm run seed:admin` |
| `PROMPTPAY_ID` | PromptPay proxy (phone / national ID / bank account) |
| `PROMPTPAY_PROXY_TYPE` | `auto`, `phone`, `citizen`, `tax`, or `bank` |
| `PROMPTPAY_BANK_CODE` | 3-digit bank code (only when `*_TYPE=bank`, e.g. `006` for KTB) |
| `PROMPTPAY_MERCHANT_NAME`, `PROMPTPAY_MERCHANT_CITY` | Data embedded in QR payload |
| `PROMPTPAY_QR_EXPIRE_MINUTES` | Pending-payment expiry window |
| `CART_ITEM_MAX_QTY` | Quantity guard per cart line |

Example configuration (PromptPay phone number):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nabi_company
JWT_SECRET=CHANGE_ME
JWT_EXPIRES=7d
AGE_MIN=20

UPLOAD_DIR=uploads
UPLOAD_BASE_URL=http://localhost:5000/uploads
MAX_UPLOAD_MB=8
ALLOWED_IMAGE_MIME=image/jpeg,image/png

SEED_ADMIN_EMAIL=admin@nabi.com
SEED_ADMIN_PASSWORD=admin123
SEED_ADMIN_NAME=System Admin

PROMPTPAY_ID=your_promtpay_number
PROMPTPAY_PROXY_TYPE=phone
# PROMPTPAY_BANK_CODE=006
PROMPTPAY_MERCHANT_NAME=your_name
PROMPTPAY_MERCHANT_CITY=BANGKOK
PROMPTPAY_QR_EXPIRE_MINUTES=30

CART_ITEM_MAX_QTY=50
```

> ⚠️ `/api/orders/line` has been removed. Use the cart + checkout endpoints described below.

---

## Public routes (no token)

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/products` | Public product list (`status=active`, `visibility=public`) |
| GET | `/products/:id` | Product detail |
| GET | `/uploads/*` | Static file handler for images |

---

## Authentication & profile

Base path: `/api/auth`

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/register` | Multipart form (see payload below). Address is mandatory and stored under `profile.address`. |
| POST | `/login` | Email/password login |
| GET | `/me` | Returns profile, KYC snapshot, and verification flags |

**Register payload (multipart/form-data)**

```
email, password, name, dob, phone?, lineId?, facebookProfileUrl?, address
idCardImage (file), selfieWithId (file)
```

All strings are trimmed; password requires ≥ 6 chars. Missing files or address now return HTTP 400 instead of generic 500s.

---

## User cart & orders (requires `role=user`, age verified, KYC approved)

Base path: `/api/orders`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/me` | Order history |
| GET | `/cart` | Retrieve current cart (auto prunes inactive products) |
| POST | `/cart/items` | `{ productId, quantity? }` add or merge |
| PATCH | `/cart/items/:productId` | Adjust quantity |
| DELETE | `/cart/items/:productId` | Remove a line |
| DELETE | `/cart` | Clear all |
| POST | `/cart/checkout` | Creates order, empties cart, returns PromptPay payload |

Checkout response embeds:
- `order.payment.payload` – EMV QR payload string
- `order.payment.target` – raw proxy from env
- `order.payment.targetFormatted` – normalized proxy id (e.g. `0060006624768894`)
- `order.payment.reference` – short reference used for reconciliation

If PromptPay configuration is invalid, the API now returns HTTP 400 with a descriptive error.

---

## Admin endpoints (requires `role=admin`)

Base paths:
- `/api/admin/kyc` – approve / reject KYC submissions
- `/api/admin/orders` – list & update orders (status + payment status + admin note)
- `/api/admin/products` – full product CRUD (with image uploads)
- `/api/admin/stats/orders` – aggregate counts & revenue
- `/api/admin/stats/users` – users by role

When updating orders, admins can now toggle `paymentStatus` (`pending|paid|failed|expired`). Setting `paid` stamps `payment.paidAt`.

---

## Key models / flows

### `User`
- `profile.address` added (required at registration)
- `ageVerified` derived from DOB ≥ `AGE_MIN`
- `kyc.status` drives `isVerified` / cart access

### `Cart`
- New collection scoped by user with embedded items `{ product, quantity, addedAt }`
- Cart is auto-created on demand and cleaned up when products disappear

### `Order`
- `channel` now defaults to `web`
- Items store price snapshot
- `shippingAddress` captured at checkout (prefills from profile address if omitted)
- `payment` block persists PromptPay meta (`payload`, `target`, `targetFormatted`, `reference`, `expiresAt`, etc.)

---

## Testing checklist (manual)

1. Register with mandatory address + images → expect `201` and `kycStatus=pending`
2. Login → fetch `/api/auth/me` → confirm address stored & `canOrderViaLine` renamed behaviour (now cart gating)
3. Admin approves KYC → user can access `/api/orders/cart`
4. Add/remove/update cart items → totals update and invalid products are pruned automatically
5. Checkout → verify JSON returns PromptPay payload, formatted proxy, reference; cart empties
6. Admin updates order payment status to `paid` → check `payment.paidAt` populated
7. Product CRUD → ensure new/edited products are visible via `/products` and `/products/:id`
8. Negative paths: missing files/address during register, using cart without KYC, invalid PromptPay config, etc.

---

## Removed / breaking changes

- Legacy LINE order endpoint (`POST /api/orders/line`) deleted.
- Root-level auth endpoints (`/register`, `/login`, `/profile`) no longer exposed; always use `/api/auth/*`.
- Order listing response now includes `shippingAddress` & `payment` details; client code should rely on these fields.

---

Need more automation? The project still uses plain scripts, so adding Jest/Supertest is straightforward if you need CI coverage.
