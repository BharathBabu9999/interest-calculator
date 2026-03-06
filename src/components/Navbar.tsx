import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  /** Which top-level nav tab is currently active */
  active?: "clients" | "summary" | "about";
  /** Extra breadcrumb content shown after the nav tabs (for sub-pages like ClientPage) */
  breadcrumb?: ReactNode;
}

/**
 * Shared top navigation bar used across Dashboard, ClientPage and SummaryPage.
 *
 * Left:  Brand → Clients tab → Portfolio Summary tab → optional breadcrumb
 * Right: email · ThemeToggle · Sign out
 */
export default function Navbar({ active, breadcrumb }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tabBase =
    "text-sm font-medium transition-colors px-1 pb-0.5";
  const tabActive =
    "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400";
  const tabInactive =
    "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent";

  return (
    <header className="bg-white dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* ── Left: brand + nav tabs + optional breadcrumb ── */}
        <div className="flex items-center gap-5 min-w-0">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/")}
              className="text-base font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Interest Calculator
            </button>
          </div>

          {/* Divider */}
          <span className="text-gray-200 dark:text-slate-700 select-none hidden sm:block">|</span>

          {/* Nav tabs */}
          <nav className="hidden sm:flex items-center gap-5 h-14">
            <Link
              to="/"
              className={`${tabBase} ${active === "clients" ? tabActive : tabInactive} flex items-center h-full`}
            >
              Clients
            </Link>
            <Link
              to="/summary"
              className={`${tabBase} ${active === "summary" ? tabActive : tabInactive} flex items-center h-full`}
            >
              Portfolio Summary
            </Link>
            <Link
              to="/about"
              className={`${tabBase} ${active === "about" ? tabActive : tabInactive} flex items-center h-full`}
            >
              About
            </Link>
          </nav>

          {/* Breadcrumb (sub-pages) */}
          {breadcrumb && (
            <>
              <span className="text-gray-300 dark:text-slate-600 hidden sm:block">/</span>
              <div className="flex items-center gap-2 min-w-0">{breadcrumb}</div>
            </>
          )}
        </div>

        {/* ── Right: email · theme · sign out ── */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 dark:text-slate-500 text-sm hidden md:block truncate max-w-40">
            {user?.email}
          </span>
          <ThemeToggle />
          <button
            onClick={logout}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
