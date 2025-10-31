# 🪙 CouponX – Smart Marketplace for Unused Coupons

**CouponX** is an MVP for a secure **peer-to-peer coupon marketplace** that lets users **list, trade, or sell** unused discount codes (e.g., Swiggy, Zomato, Amazon).  
Built with **Node.js + Express + MongoDB + JWT Auth** on the backend and a lightweight **HTML/JS frontend**.

---

## 📂 Directory Structure

    .
    ├── backend/                 # Express + MongoDB + JWT backend
    │   ├── src/
    │   │   ├── app.ts           # Express app setup
    │   │   ├── server.ts        # Server entry point
    │   │   ├── config.ts        # Env + MongoDB config
    │   │   ├── db.ts            # Mongo connection logic
    │   │   ├── middleware/      # Auth middleware (JWT)
    │   │   ├── models/          # Mongoose models
    │   │   ├── routes/          # API routes (auth, coupons, trades, wallet)
    │   │   └── services/        # Business logic (wallet handling)
    │   ├── seed/                # Optional DB seed scripts
    │   └── tests/               # Jest tests for routes
    └── frontend/                # Simple frontend (HTML + JS)
        ├── index.html
        └── src/                 # API + Auth + UI scripts

---

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/<levi178u>/CcouponX.git
cd Coupon/backend
npm install
```

### 2. Create a .env file
```bash
PORT=4000
JWT_SECRET=super_secret_key
MONGODB_URI=mongodb://127.0.0.1:27017/couponx
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

### 3. Run the server
```bash
npm run dev
```
Server will start at http://localhost:4000

### CORE Features
Google/OTP + JWT Authentication
Wallet-based P2P coupon trades
List / Search / Buy / Delete coupons
Secure escrow transactions
Expiry tracking for coupons
(Future) AI-driven coupon suggestions

### API Overview

| Method | Endpoint           | Description             | Auth |
| ------ | ------------------ | ----------------------- | ---- |
| GET    | `/api/coupons`     | List available coupons  | ❌    |
| POST   | `/api/coupons`     | Create a new listing    | ✅    |
| DELETE | `/api/coupons/:id` | Remove own coupon       | ✅    |
| POST   | `/api/trades`      | Initiate trade/transfer | ✅    |
| GET    | `/api/wallet`      | View wallet balance     | ✅    |

### Tech Stacks
- Backend: Node.js, Express, TypeScript
- Database: MongoDB Atlas(Mongoose ODM)
- Auth: JWT + Google OAuth
- Frontend: Vanilla JS (simple REST client)
- Testing: Jest + Supertest

## Author : Priya Singh
