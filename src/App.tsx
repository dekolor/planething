// App.tsx
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Plane,
  LogOut,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { FlightDetails } from "./components/FlightDetails";
import { Footer as GlobalFooter } from "./components/Footer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route
          path="/flight/:id"
          element={
            // <Authenticated>
            <FlightDetails />
            // </Authenticated>
          }
        />
      </Routes>
    </Router>
  );
}

function MainApp() {
  return (
    <>
      <SkyBackdrop />
      <TopBar />
      <main className="relative z-10">
        {/* <Authenticated> */}
        <Showcase />
        {/* </Authenticated> */}
        <section id="content" className="mx-auto max-w-7xl px-3 pb-14 sm:px-4">
          {/* <Authenticated> */}
          <Dashboard />
          {/* </Authenticated>
          <Unauthenticated>
            <AuthPanel />
          </Unauthenticated> */}
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}

function TopBar() {
  return (
    <div className="pointer-events-none sticky inset-x-0 top-0 z-40 flex justify-center p-3 fade-in-up">
      <div className="pointer-events-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_10px_40px_-20px_rgba(56,189,248,0.35)] backdrop-blur-md sm:px-4">
        <Link
          to="/"
          className="group relative flex items-center gap-2 rounded-md px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          aria-label="Home"
        >
          <span className="relative">
            <span className="absolute inset-0 -z-10 rounded-md bg-gradient-to-br from-sky-500/30 via-cyan-400/20 to-fuchsia-500/30 blur-md transition-all group-hover:scale-110" />
            <span className="relative rounded-md p-1.5 ring-1 ring-white/10">
              <Plane className="h-4 w-4 text-cyan-300" />
            </span>
          </span>
          <span className="leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-sm font-semibold tracking-wide text-transparent">
              planething
            </span>
            <span className="block text-[11px] text-white/50">
              live flight tracker
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* <Unauthenticated>
            <a
              href="#auth"
              className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Sign in
            </a>
          </Unauthenticated>
          <Authenticated>
            <SignOutButton />
          </Authenticated> */}
        </div>
      </div>
    </div>
  );
}

function Showcase() {
  return (
    <section
      aria-labelledby="showcase-title"
      className="relative z-10 mx-auto mt-6 mb-8 hidden max-w-7xl px-3 sm:mt-8 sm:block sm:px-4 fade-in-up"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_60%)] blur-2xl" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.14),transparent_60%)] blur-2xl" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.6px)] [background-size:22px_22px]" />
        </div>

        <div className="relative flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/80 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
              <span className="text-white/40">•</span>
              Global coverage
            </span>
            <h1
              id="showcase-title"
              className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-[30px] font-extrabold text-transparent sm:text-5xl leading-[1.15] sm:leading-[1.1] pb-0.5"
            >
              Your flight command center
            </h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Search, filter, and explore departures in a glassy cockpit UI. Tap
              any ticket for a crisp, focused flight view.
            </p>
          </div>

          <a
            href="#content"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-2.5 text-sm font-semibold text-[#0b1220] shadow-[0_10px_24px_-10px_rgba(56,189,248,0.55)] transition hover:shadow-[0_16px_36px_-12px_rgba(56,189,248,0.7)]"
          >
            Explore flights
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Footer is now in components/Footer.tsx and used globally

function SkyBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[#060a12]" />
      <div className="absolute inset-0 bg-[radial-gradient(1100px_520px_at_50%_-80px,rgba(56,189,248,0.09),transparent),radial-gradient(800px_460px_at_100%_20%,rgba(217,70,239,0.08),transparent),radial-gradient(720px_520px_at_0%_30%,rgba(14,165,233,0.06),transparent)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.6px)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute -left-24 top-[22%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)] blur-2xl animate-[spin_50s_linear_infinite]" />
      <div className="pointer-events-none absolute -right-24 bottom-[12%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.12),transparent_60%)] blur-2xl animate-[spin_60s_linear_infinite]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
      onClick={() => void signOut()}
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

function AuthPanel() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      id="auth"
      className="mx-auto max-w-4xl px-3 sm:px-4 my-8 sm:my-12 scroll-mt-28"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-10px_rgba(56,189,248,0.3)] min-h-[38vh] md:min-h-[42vh]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_60%)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.14),transparent_60%)] blur-2xl" />

        <div className="relative grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
          <div className="border-b border-white/10 p-6 md:p-10 sm:border-b-0 sm:border-r">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/75 ring-1 ring-white/10">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Welcome
            </div>
            <h3 className="text-xl font-semibold text-white">
              {flow === "signIn"
                ? "Sign in to continue"
                : "Create your account"}
            </h3>
            <p className="mt-1 text-sm text-white/65">
              {flow === "signIn"
                ? "Access your flight command center."
                : "Start tracking flights instantly."}
            </p>

            <ul className="mt-4 space-y-1.5 text-sm text-white/60">
              <li>• Minimal, glassy UI</li>
              <li>• Live flight status</li>
              <li>• Clean, focused details</li>
            </ul>
          </div>

          <form
            className="space-y-5 p-6 md:p-10"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((err) => {
                setError(err.message);
              });
            }}
          >
            <div className="space-y-1">
              <label className="text-xs text-white/70" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/40 focus:bg-white/7"
                type="email"
                id="email"
                name="email"
                placeholder="you@domain.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/40 focus:bg-white/7"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete={
                    flow === "signUp" ? "new-password" : "current-password"
                  }
                  required
                  aria-describedby={error ? "auth-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="w-full rounded-md bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-2.5 text-sm font-semibold text-[#0b1220] shadow-[0_10px_24px_-10px_rgba(56,189,248,0.55)] transition hover:shadow-[0_16px_36px_-12px_rgba(56,189,248,0.7)]"
              type="submit"
            >
              {flow === "signIn" ? "Sign in" : "Create account"}
            </button>

            <div className="text-center">
              <span className="text-sm text-white/65">
                {flow === "signIn"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                className="ml-2 text-sm text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                aria-label={
                  flow === "signIn" ? "Switch to sign up" : "Switch to sign in"
                }
              >
                {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
              </button>
            </div>

            {error && (
              <div
                id="auth-error"
                className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-300"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm">Error: {error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="mr-1 inline-flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-300" />
      ) : (
        <Moon className="h-4 w-4 text-cyan-300" />
      )}
    </button>
  );
}
