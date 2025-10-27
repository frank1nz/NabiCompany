# Nabi Frontend

React 19 + Vite client for the Nabi platform. Handles public catalogue browsing, user onboarding, KYC workflow, cart checkout with PromptPay QR, and admin tools.

---

## Quick start

```bash
# in another terminal the backend should already be running
cd frontend
npm install
npm run dev   # http://localhost:5173 by default
```

### Environment (`frontend/.env`)

```env
VITE_API_BASE=http://localhost:5000/api
VITE_UPLOAD_BASE=http://localhost:5000
```

- `VITE_API_BASE` must point to the backend `/api` prefix.
- `VITE_UPLOAD_BASE` is used to resolve product/KYC images served from the backend static `/uploads`.
- Backend must be reachable at the base URL above (default `http://localhost:5000` with `npm run dev` in `backend/`).

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle in `dist/` |
| `npm run preview` | Serve the built assets locally (assumes backend is still reachable) |
| `npm run lint` | ESLint (flat config) |

---

## Routing overview

Routes are declared in `src/routes.jsx` and rendered inside `src/components/Layout.jsx`.

| Path | Guard | Notes |
| ---- | ----- | ----- |
| `/` | public | Home hero + featured products |
| `/products` | public | Catalogue grid |
| `/products/:id` | public | **New** detail page with gallery, price, description, and add-to-cart |
| `/about` | public | “Our Story” page |
| `/login`, `/register` | guest-only (redirect when already authenticated) |
| `/orders` | `RequireAuth` + `RequireVerified` | Cart management, checkout, PromptPay QR, order history |
| `/me/:id` | `RequireAuth` | Profile + KYC documents |
| `/admin/kyc` | `RequireAuth` admin | KYC approval |
| `/admin/orders` | `RequireAuth` admin | Manage order + payment status |
| `/admin/products` | `RequireAuth` admin | CRUD for catalogue |

### Guards & shared components

- `RequireAuth` ensures a valid token + role before showing children.
- `RequireVerified` restricts access to verified users (age + KYC approved).
- `RedirectIfAuthenticated` keeps logged-in users away from auth pages.
- `Layout` now always renders the navbar (even on login/register) so navigation is never hidden.
- `Navbar` reads the cart store to show live item counts and exposes admin menu items when appropriate.

---

## Data stores & API helpers

- `src/store/authStore.js` – Zustand store for auth state. Persists token, loads `/auth/me`, resets cart store on logout.
- `src/store/cartStore.js` – Zustand store backing the web cart (load/add/update/remove/clear).
- `src/lib/auth.js`, `src/lib/orders.js`, `src/lib/products.js` – Axios wrappers for backend endpoints.
- `src/components/PromptPayQr.jsx` – Renders PromptPay QR images from EMV payloads using the `qrcode` package.

---

## Feature highlights

- **Catalog experience**
  - Product cards deep-link to `/products/:id`.
  - Detail page includes thumbnail gallery, quantity selector, add-to-cart CTA, and fallback handling for missing images.
- **Cart & checkout**
  - Orders page shows live cart table with quantity controls, notes, and address capture.
  - Checkout returns PromptPay payload, raw proxy, and formatted proxy; UI displays all values with copy buttons.
- **PromptPay integration**
  - Uses backend-supplied metadata; errors show human-readable toast messages when misconfigured.
- **Admin workflow**
  - Orders dashboard can change both order status and payment status (`pending/paid/failed/expired`).
  - Payment reference + proxy appear in the table for reconciliation.
- **UX polish**
  - Login/Register retain nav access, display friendly validation, and leverage common layout transitions.
  - Snackbar feedback on product listing when adding items to cart.

---

## Testing checklist (manual)

1. Browse `/products` → open a product → confirm details load and cart additions work.
2. Register a new user (address now required) → login → inspect profile.
3. Attempt to add to cart with unverified user → expect guard error.
4. Admin approves KYC → user gains access to `/orders`.
5. Add varied cart items → adjust quantities, delete lines, clear cart.
6. Checkout → verify QR code renders and promptpay values match backend config.
7. Admin updates payment status to `paid` → confirm badge + timestamp change client-side.
8. Logout → token and cart state should clear; login/register routes become accessible again.

---

## Dependency notes

- React 19, Vite 7, MUI v7
- `zustand` for lightweight stores
- `qrcode` for client-side PromptPay QR rendering
- No CSS framework lock-in; components are styled with MUI’s system and emotion.

Happy hacking! Feel free to extend with additional pages, code-splitting, or automated tests as needed.
