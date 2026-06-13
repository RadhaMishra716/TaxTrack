# TaxTrack — Tax Payment Tracking & Fund Allocation System

Full-stack MERN app with **no database required** — runs entirely in-memory locally.

---

## Quick Start

### 1. Server (Backend)
```bash
cd server
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Client (Frontend)
```bash
cd client
npm install
npm run dev
# Opens on http://localhost:5173
```

---

## Login Credentials

| Portal | Field | Value |
|--------|-------|-------|
| Government | Official ID | `GOV001` |
| Government | Password | `12345678` |
| Taxpayer | Email | any email you register with |
| Taxpayer | Password | `12345678` |

> **All passwords are `12345678`**. No exceptions.

---

## How It Works

1. Taxpayer registers → logs in with `12345678`
2. Selects tax type & enters amount → pays
3. System generates token: `TXN-XXXXXXXX`
4. Payment is routed to the correct Tax Pool automatically
5. Taxpayer can track: Payment → Pool → Allocations

Government officer:
- Logs in with `GOV001` / `12345678`
- Views all payments, manages pools, allocates funds to projects

---

## Tax Type → Pool Mapping

| Tax Type | Pool |
|----------|------|
| Income Tax, Property Tax, Customs Duty | Infrastructure Development Fund |
| GST | Healthcare & Welfare Pool |
| Corporate Tax | Education & Research Fund |

---

## Notes
- Data is **in-memory only** — resets on server restart
- No MongoDB, no `.env`, no URI needed
- No bcrypt — password comparison is plain string match (for demo)

- Documentation

Detailed Software Requirements Specification (SRS) is available in the project documentation folder.

* TaxTrack_SRS.pdf

- Author

Radha Mishra

B.Tech Computer Science Engineering

