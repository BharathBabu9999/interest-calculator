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
- **Add Transaction overlay** — when adding a transaction, an overlay appears with a spinner and message until the operation completes
- **Form loading state** — the Add Transaction form and button are disabled while the transaction is being added
- **Net Outstanding Balance color** — shown in green if positive/zero, red if negative
- **Improved sort arrows** — sortable columns use consistent up/down SVG arrows (blue = active, gray = inactive)
- **Compact violet calculation breakdown** — click any transaction row to expand a clean side-by-side breakdown: duration badge, Annual Compounding steps (each year's formula and result), Months interest, Days interest, and Current Value with interest highlighted in violet
- **Show Detail Calculations toggle** — a violet toggle button in the As-of-Date bar opens the breakdown panel for all active transactions at once without needing to click individual rows
- **Daily Value toggle** — a blue toggle button shows an Approximate Daily Interest card above the summary, displaying lent/borrowed/net daily accrual computed as `(balance at +30 days − current balance) ÷ 30` with 2-decimal precision

### Portfolio Summary
- **Cross-client overview** — see total lent, total borrowed, and net balance across all clients in one view
- **As-of-date filter** — recalculate all balances as of any date
- **Filters** — filter by client type (Individual / Financial Institution) and net balance (greater/less than an amount)
- **Sortable columns** — sort by client name, type, transaction count, total lent, total borrowed, net balance, or highest rate
- **Highest Rate column** — shows the maximum interest rate across all transactions for each client
- **Per-currency grouping** — grand totals grouped by currency; broken down by client type when both types are present
- **Daily Value toggle** — when enabled, shows an **Approx. Daily Interest** line below the Net Balance in each summary card (Financial Institution, Individual, and Grand Total); computed per type using the +30-day method
- **Comma-formatted numbers** — all currency values use locale-aware formatting with commas (Indian grouping for INR, e.g. `₹2,56,87,637.25`; standard for others, e.g. `$1,234,567.89`)
- **Click-through** — click any client row to jump straight to their transaction page
- **Add Client shortcut** — "+ Add Client" button navigates to the Dashboard and automatically opens the Add Client modal
- **Show Transactions toggle** — expand each client row to reveal a per-transaction mini-table (Date, Type, Amount, Rate, Balance, Reminder Date, Notes)
- **Show Detail Calculations** — appears when Show Transactions is on; per-transaction compact violet breakdown
- **Reminder Date column** — shown in expanded transaction rows and in the full client transaction table

### Guest Mode
- **Try without registering** — visit `/guest` for the full calculator with localStorage-only persistence
- **Mirrors the Client page** — same layout as an authenticated client page: As-of-Date bar, Show Detail Calculations toggle, Daily Value toggle, Summary cards, Transaction form, controls bar, and transaction table
- **Guest-only extras** — amber "Guest mode" banner with Sign in / Create account links; editable Client Info card (name, ID, currency); **Load Example** and **Clear All** buttons; How to Use / FAQ / Privacy Policy sections at the bottom
- **No data loss on navigation** — client info and transactions are saved to `localStorage` automatically

### Navigation
- **Shared navbar** — consistent top navigation bar on every authenticated page; shows active tab with a blue underline indicator
- **Tabs** — **Clients** (Dashboard), **Portfolio Summary**, and **About** in the navbar; breadcrumb slot on the Client page shows client name, currency, and type badges

### About Page
- **Dedicated documentation hub** at `/about` — How to Use, Introduction, FAQ, and Privacy Policy sections, all expanded by default

### UI & Theme
- **Dark / light mode** — toggle at the top of every page; preference saved to localStorage
- **Rich toast notifications** — card notification with coloured top strip, icon, and detail grid showing Type, Amount, Date, Rate, and Notes
- **Skeleton loading** — animated placeholder cards while data loads
- **Improved empty state** — centred icon, heading, and direct "+ Add Client" call-to-action when no clients exist

### Interest Calculation Engine
- **Anniversary-based annual compounding** — interest compounds on each 12-month anniversary of the transaction
- **Three-part calculation per transaction**:
  - *Years interest* — compounded on each anniversary
  - *Months interest* — simple interest for full months after the last anniversary
  - *Days interest* — daily interest for remaining days based on exact days in the month
- **`calculateDailyInterest` utility** — shared function in `calculator.ts`; takes transactions + a date, computes lent/borrowed/net daily accrual using the +30 day method; used by both the Summary component and the Portfolio Summary page

### Data Management
- **PostgreSQL database** — persistent storage via SQLAlchemy async
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
2. Or visit `/guest` to try it without registering — full calculator with localStorage persistence
3. On the dashboard, click **"+ Add Client"** — enter a name, **client type**, currency, and optional contact details
4. Click the client card → you're in the transaction view
5. Add **Lend** or **Borrow** transactions; set an optional **Reminder Date**; interest is calculated live
6. Click **"Show Detail Calculations"** (violet button, As-of-Date bar) to expand the compact breakdown for all active rows at once — or click an individual row to see its breakdown
7. Click **"Daily Value"** (blue button) to see approximate lent/borrowed/net interest accrual per day, computed as `(balance at +30 days − current balance) ÷ 30`
8. Use the **Status** column to mark a transaction as completed — it will be excluded from the net balance
9. Click **"Portfolio Summary"** in the nav to see totals across all clients, grouped by currency and client type; toggle **Daily Value** there too for an aggregate daily picture
10. On the Summary page, use **"Highest Rate"** column to spot the maximum rate per client
11. Click **"About"** in the nav to open the documentation hub (How to Use, FAQ, Privacy Policy)
12. On the client page, add notes or upload files using the Files card
13. Use the **sun/moon icon** to toggle dark / light mode
14. To test the forgot-password flow: click **"Forgot password?"** on the login page → enter your email → the reset link is sent by email (or printed to the uvicorn terminal if Gmail SMTP is not configured)

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
    │   ├── transactions.ts         # Transaction CRUD + apiTransactionToLocal() shared helper
    │   └── files.ts                # File upload/download/delete/description
    ├── contexts/
    │   ├── AuthContext.tsx         # useAuth() hook, loginWithGoogle(), PrivateRoute
    │   └── ThemeContext.tsx        # useTheme() hook, ThemeProvider, localStorage persistence
    ├── pages/
    │   ├── LoginPage.tsx           # Email/password + Google Sign-In + forgot password link
    │   ├── RegisterPage.tsx        # Email/password + Google Sign-In
    │   ├── ForgotPasswordPage.tsx  # Email form → triggers reset email
    │   ├── ResetPasswordPage.tsx   # New-password form (reads ?token= from URL)
    │   ├── DashboardPage.tsx       # Client list, skeleton loading, empty-state CTA, delete modal
    │   ├── ClientPage.tsx          # Transactions view for a single client + docs sections
    │   ├── GuestPage.tsx           # Guest mode — mirrors ClientPage with localStorage persistence
    │   ├── SummaryPage.tsx         # Portfolio summary across all clients + Add Client button
    │   └── AboutPage.tsx           # Documentation hub (How to Use, FAQ, Privacy Policy)
    ├── components/
    │   ├── Navbar.tsx              # Shared top nav (Clients / Portfolio Summary / About tabs)
    │   ├── Toast.tsx               # Rich card notification with coloured strip + detail grid
    │   ├── ToggleButton.tsx        # Reusable active/inactive toggle button (blue or violet)
    │   ├── DailyInterestCard.tsx   # Shared daily interest breakdown card (lent/borrowed/net per day)
    │   ├── Summary.tsx             # Per-client summary cards + optional DailyInterestCard
    │   ├── TransactionForm.tsx
    │   ├── TransactionTable.tsx    # Transaction rows with compact violet breakdown panel
    │   ├── ClientFiles.tsx         # File cards with thumbnails, drag-and-drop upload
    │   ├── ThemeToggle.tsx         # Sun/moon icon button
    │   ├── Accordion.tsx           # Collapsible section (supports defaultOpen prop)
    │   ├── ContentSections.tsx     # HowToUseSection, IntroSection, FAQSection, Footer
    │   └── PrivacyPolicy.tsx
    ├── utils/
    │   ├── calculator.ts           # Interest engine: calculateCurrentValue, calculateTotalBalance,
    │   │                           #   calculateDailyInterest (shared +30d daily accrual utility)
    │   ├── currency.ts             # formatCurrency (always 2 decimal places)
    │   ├── dateUtils.ts
    │   └── export.ts               # PDF + CSV (client + summary variants)
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
| `/clients/:id` | Transactions for a single client | Yes |
| `/summary` | Portfolio summary across all clients | Yes |
| `/about` | Documentation hub (How to Use, FAQ, Privacy Policy) | Yes |

---

## 🗄️ Data Model

```
User (email, hashed_password, google_id)
 └── Client (name, client_type, currency, phone, email, address, company, notes)
       ├── Transaction (date, amount, interest_rate, type, notes, completed, reminder_date)
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
Date,Amount,Interest Rate,Type,Notes,Reminder Date
19/03/2019,450000,1.5,lend,Initial funding,
10/04/2021,100000,2,lend,,31/12/2026
15/06/2024,50000,1.8,borrow,Partial payment,
```

- **Date**: DD/MM/YYYY (also accepts YYYY-MM-DD)
- **Interest Rate**: monthly percentage (e.g. `2` = 2% per month)
- **Type**: `lend` or `borrow`
- **Reminder Date**: optional, DD/MM/YYYY (leave blank to omit)

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
