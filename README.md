# Private Financing Interest Calculator

A full-stack React + FastAPI application for managing private financing — track lending, borrowing, and compound interest across multiple clients, with per-user accounts, a PostgreSQL database, and a dark/light theme.

## 🌟 Features

### Authentication
- **User accounts** — register and log in with email + password
- **Google Sign-In** — one-click OAuth login/registration on both the sign-in and sign-up pages
- **Forgot password** — request a reset link by email; link expires in 1 hour; works on both localhost (link printed to server terminal) and production (sent via Gmail SMTP)
- **JWT-based sessions** — stay logged in for 7 days (token stored in localStorage)
- **Private data** — each user's clients and transactions are completely isolated

### Client Management
- **Multiple clients per user** — add as many borrowers/lenders as needed
- **Client type** — classify each client as **Individual** or **Financial Institution**; filterable on the dashboard and portfolio summary
- **Per-client currency** — each client can have a different currency (INR, USD, EUR, GBP, JPY, AUD, CAD)
- **Contact details** — store phone, email, address, and company per client
- **Editable notes** — attach and edit free-text notes on each client page
- **File attachments** — upload documents (images, PDF, Word, Excel, PowerPoint, CSV) per client with thumbnail previews, upload date/time, and per-file descriptions; images larger than 3 MB are automatically compressed client-side before upload
- **Full CRUD** — create, edit, and delete clients from the dashboard (delete requires confirmation in a warning modal)

### Transaction Tracking (per client)
- **Dual transaction types** — **Lend** (money given out) and **Borrow** (money received)
- **Variable interest rates** — each transaction has its own monthly rate
- **Expected repayment date** — optionally record when a transaction is expected to be settled; displayed in the table and editable inline
- **Completed flag** — mark a transaction as completed to exclude it from net balance calculations (shown dimmed with strikethrough)
- **CSV import/export** — bulk import transactions from spreadsheets; export to CSV or PDF
- **Inline editing** — edit any transaction directly in the table
- **Bulk rate update** — change the interest rate for all transactions at once

### Portfolio Summary
- **Cross-client overview** — see total lent, total borrowed, and net balance across all clients in one view
- **As-of-date filter** — recalculate all balances as of any date
- **Filters** — filter by client type (Individual / Financial Institution) and net balance (greater/less than an amount)
- **Sortable columns** — sort by client name, type, transaction count, total lent, total borrowed, or net balance
- **Per-currency grouping** — grand totals grouped by currency (respects active filters)
- **Click-through** — click any client row to jump straight to their transaction page

### Guest Mode
- **Try without registering** — visit `/guest` to use the full calculator with localStorage-only persistence (no account needed)
- **Amber banner** — persistent reminder with links to sign in or create an account
- **No data loss on navigation** — guest client and transactions are saved to `localStorage` automatically

### UI & Theme
- **Dark / light mode** — toggle at the top of every page; preference saved to localStorage

### Interest Calculation Engine
- **Anniversary-based annual compounding** — interest compounds on each 12-month anniversary of the transaction, not at calendar year-end
- **Three-part calculation per transaction**:
  - *Years interest* — compounded on each anniversary
  - *Months interest* — simple interest for full months after the last anniversary
  - *Days interest* — daily interest for remaining days based on exact days in the month
- **Expandable breakdown** — click any row to see step-by-step compounding details

### Data Management
- **PostgreSQL database** — persistent storage, survives page refreshes and server restarts
- **FastAPI backend** — REST API with automatic OpenAPI docs at `/docs`
- **PDF export** — professional report with transaction details and breakdowns
- **CSV export/import** — supports DD/MM/YYYY and ISO date formats

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Forms | react-hook-form + Zod |
| Date math | date-fns |
| PDF / CSV | jsPDF, PapaParse |
| Backend | Python 3.14, FastAPI |
| Database | PostgreSQL 16 (via SQLAlchemy async) |
| Auth | JWT (python-jose) + bcrypt + Google OAuth 2.0 |
| Email | aiosmtplib + Gmail SMTP (App Password) |
| Google OAuth | google-auth (BE), @react-oauth/google (FE) |
| Hosting | Koyeb (backend, always-on free tier), Vercel (frontend), Neon (PostgreSQL) |

## 🚀 Local Development Setup

### Prerequisites

- Node.js v18+
- Python 3.11+
- PostgreSQL 16

### 1 — Install PostgreSQL (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16

# Add psql to PATH (run once)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
psql postgres -c "SELECT version();"
```

### 2 — Create the database

```bash
psql postgres -c "CREATE DATABASE interest_calc;"
```

### 3 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Replace 'your_mac_username' with the output of: whoami
DATABASE_URL=postgresql+asyncpg://your_mac_username@localhost:5432/interest_calc

# Generate a secret key with: openssl rand -hex 32
SECRET_KEY=paste-your-generated-key-here

# Frontend origin (used in password-reset email links)
FRONTEND_URL=http://localhost:5173

# Google OAuth — create a project at https://console.cloud.google.com/
# and add http://localhost:5173 as an authorised JavaScript origin
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Gmail SMTP — use a 16-char App Password from myaccount.google.com/apppasswords
# Leave blank to fall back to printing the reset link in the server terminal
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

> On macOS with a Homebrew Postgres install there is usually no password — omit `:password` from the URL.

Create `.env.local` in the **project root** for frontend secrets:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4 — Set up the Python environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 5 — Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

The API runs at **http://localhost:8000**.  
Interactive API docs: **http://localhost:8000/docs**

> Database tables are created automatically on first startup.

### 6 — Start the frontend

Open a **second terminal tab**:

```bash
# From the project root
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

### 7 — Try it out

1. Open `http://localhost:5173` → click **"Create one"** to register (or use **Continue with Google**)
2. On the dashboard, click **"+ Add Client"** — enter a name, **client type** (Individual or Financial Institution), currency, and optional contact details
3. Click the client card → you're in the transaction view
4. Add **Lend** or **Borrow** transactions; set an optional **Expected Repayment Date** in DD/MM/YYYY format; interest is calculated live
5. Click any row to expand the step-by-step compounding breakdown
6. Use the **Status** column to mark a transaction as completed — it will be excluded from the net balance
7. Click **"Portfolio Summary"** in the nav to see totals across all clients
8. On the client page, add notes or upload files (images, PDFs, documents) using the Files card
9. Use the **sun/moon icon** in the top-right to toggle dark / light mode
10. To test the forgot-password flow: click **"Forgot password?"** on the login page → enter your email → the reset link is sent by email (or printed to the uvicorn terminal if Gmail SMTP is not configured)

---

## 📁 Project Structure

```
interest-calc/
├── backend/                        # FastAPI backend
│   ├── main.py                     # App entry point, CORS, startup
│   ├── database.py                 # AsyncSQLAlchemy engine + session
│   ├── models.py                   # User / Client / Transaction / ClientFile ORM models
│   ├── schemas.py                  # Pydantic request/response schemas
│   ├── auth.py                     # JWT creation, bcrypt, get_current_user
│   ├── routers/
│   │   ├── auth.py                 # register, login, me, forgot-password, reset-password, google
│   │   ├── clients.py              # GET/POST /clients, PUT/DELETE /clients/:id
│   │   ├── transactions.py         # GET/POST /clients/:id/transactions, PUT/DELETE /transactions/:id
│   │   └── files.py                # GET/POST /clients/:id/files, GET/PATCH/DELETE /files/:id
│   ├── email_utils.py              # Gmail SMTP sender (aiosmtplib); falls back to console in dev
│   ├── uploads/                    # Uploaded files stored here (git-ignored)
│   ├── requirements.txt
│   ├── .env                        # Secret config (git-ignored)
│   └── .env.example
│
└── src/                            # React frontend
    ├── api/
    │   ├── client.ts               # Base fetch wrapper (injects Bearer token)
    │   ├── auth.ts                 # login(), register(), forgotPassword(), resetPassword(), loginWithGoogle()
    │   ├── clients.ts              # Client CRUD
    │   ├── transactions.ts         # Transaction CRUD
    │   └── files.ts                # File upload/download/delete/description
    ├── contexts/
    │   ├── AuthContext.tsx         # useAuth() hook, loginWithGoogle(), PrivateRoute
    │   └── ThemeContext.tsx        # useTheme() hook, ThemeProvider, localStorage persistence
    ├── pages/
    │   ├── LoginPage.tsx           # Email/password + Google Sign-In + forgot password link
    │   ├── RegisterPage.tsx        # Email/password + Google Sign-In
    │   ├── ForgotPasswordPage.tsx  # Email form → triggers reset email
    │   ├── ResetPasswordPage.tsx   # New-password form (reads ?token= from URL)
    │   ├── DashboardPage.tsx       # Client list with delete-confirmation modal
    │   ├── ClientPage.tsx          # Transactions view for a single client
    │   └── SummaryPage.tsx         # Portfolio summary across all clients
    ├── components/
    │   ├── TransactionForm.tsx
    │   ├── TransactionTable.tsx
    │   ├── Summary.tsx
    │   ├── ClientFiles.tsx         # File cards with thumbnails, drag-and-drop upload
    │   ├── ThemeToggle.tsx         # Sun/moon icon button
    │   ├── Accordion.tsx
    │   ├── ContentSections.tsx
    │   └── PrivacyPolicy.tsx
    ├── utils/
    │   ├── calculator.ts           # Interest calculation engine
    │   ├── currency.ts
    │   ├── dateUtils.ts
    │   └── export.ts               # PDF + CSV
    ├── types/index.ts
    └── main.tsx                    # Router + AuthProvider setup
```

---

## 🗺️ Routes

| URL | Page | Auth required |
|---|---|---|
| `/login` | Sign in (email/password or Google) | No |
| `/register` | Create account (email/password or Google) | No |
| `/forgot-password` | Request a password reset email | No |
| `/reset-password?token=…` | Set a new password via emailed link | No |
| `/guest` | Guest mode — full calculator with localStorage persistence | No |
| `/` | Dashboard — client list | Yes |
| `/clients/:id` | Transactions for a client | Yes |
| `/summary` | Portfolio summary across all clients | Yes |

---

## 🗄️ Data Model

```
User (email, hashed_password, google_id)
 └── Client (name, client_type, currency, phone, email, address, company, notes)
       ├── Transaction (date, amount, interest_rate, type, notes, completed, expected_repayment_date)
       └── ClientFile (original_filename, mimetype, size, description, stored on disk)

PasswordResetToken (user_id, token, expires_at, used)
```

All data is user-scoped — a user can only see and modify their own clients and transactions.

---

## 📊 Interest Calculation

Each transaction calculates independently using a three-part model:

| Component | Method |
|---|---|
| Years | Compound annually on each 12-month anniversary |
| Months | Simple interest on remaining complete months |
| Days | Daily rate × exact days remaining (based on days in that month) |

**Formula per anniversary:**
$$\text{New Principal} = \text{Old Principal} \times (1 + \text{rate} \times 12)$$

---

## 📝 CSV Import Format

```
Date,Amount,Interest Rate,Type,Notes,Expected Repayment Date
19/03/2019,450000,1.5,lend,Initial funding,
10/04/2021,100000,2,lend,,31/12/2026
15/06/2024,50000,1.8,borrow,Partial payment,
```

- **Date**: DD/MM/YYYY (also accepts YYYY-MM-DD)
- **Interest Rate**: monthly percentage (e.g. `2` = 2% per month)
- **Type**: `lend` or `borrow`
- **Expected Repayment Date**: optional, DD/MM/YYYY (leave blank to omit)

---

## 🐛 Troubleshooting

| Error | Fix |
|---|---|
| `connection refused` on backend start | Run `brew services start postgresql@16` |
| `password authentication failed` | Remove `:password` from DATABASE_URL in `.env` |
| `database does not exist` | Run `psql postgres -c "CREATE DATABASE interest_calc;"` |
| Frontend shows "Failed to fetch" | Make sure the backend terminal is still running |
| Port 8000 already in use | `kill $(lsof -ti:8000)` then restart |
| Google Sign-In — "Missing client_id" | Ensure `VITE_GOOGLE_CLIENT_ID` is set in `.env.local` (dev) or Vercel env vars (prod) |
| Google Sign-In — "not configured" (500) | Ensure `GOOGLE_CLIENT_ID` is set in `backend/.env` |
| Password reset email not received | If `GMAIL_USER`/`GMAIL_APP_PASSWORD` are absent, the reset link is printed to the uvicorn terminal |
| Login/register slow on first visit | The login and register pages ping `/health` on mount; an amber banner appears if the server takes >1.5 s. With Koyeb free tier there is no spin-down so this should be instant. |

---

## 📄 License

Private use. Modify and adapt freely.
