// App.tsx
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Plane, LogOut } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { FlightDetails } from "./components/FlightDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route
          path="/flight/:id"
          element={
            <Authenticated>
              <FlightDetails />
            </Authenticated>
          }
        />
      </Routes>
    </Router>
  );
}

function MainApp() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen">
        <Hero />
        <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-4">
          <Authenticated>
            <Dashboard />
          </Authenticated>
          <Unauthenticated>
            <SignInForm />
          </Unauthenticated>
        </div>
      </main>
      <Footer />
      <BgDecor />
    </>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-4">
        <Link to="/" className="group flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-sky-500/30 via-cyan-400/20 to-fuchsia-500/30 p-1.5 ring-1 ring-white/10 transition-all group-hover:scale-105">
            <Plane className="h-4 w-4 text-cyan-300 drop-shadow" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-cyan-200/90">
              planething
            </div>
            <div className="text-[11px] text-white/40">live flight tracker</div>
          </div>
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_60%)] blur-2xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="flex flex-col items-center text-center">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/70 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live updates
          </span>
          <h1 className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-[28px] font-bold tracking-tight text-transparent sm:text-4xl">
            Real-time flight dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            Track departures, arrivals, and delays in a refined dark theme.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0b1220]/70 px-3 py-6 text-center text-white/50 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs">
          Built with Convex + React. Design by dekolor x T3 Chat.
        </p>
      </div>
    </footer>
  );
}

function BgDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#080d18]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(56,189,248,0.08),transparent),radial-gradient(900px_500px_at_100%_20%,rgba(217,70,239,0.08),transparent),radial-gradient(800px_600px_at_0%_30%,rgba(14,165,233,0.06),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
      onClick={() => void signOut()}
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.25)] sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.16),transparent_60%)]" />
        <div className="relative">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 w-fit rounded-lg bg-gradient-to-br from-sky-500/30 via-cyan-400/20 to-fuchsia-500/30 p-2.5 ring-1 ring-white/10">
              <Plane className="h-6 w-6 text-cyan-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {flow === "signIn" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {flow === "signIn"
                ? "Sign in to access flight information"
                : "Start tracking flights instantly"}
            </p>
          </div>

          <form
            className="space-y-3.5"
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
              <label className="text-xs text-white/70">Email</label>
              <input
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none ring-0 transition focus:border-cyan-400/40 focus:bg-white/7"
                type="email"
                name="email"
                placeholder="you@domain.com"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/70">Password</label>
              <input
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none ring-0 transition focus:border-cyan-400/40 focus:bg-white/7"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              className="group w-full rounded-md bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-2.5 text-sm font-medium text-[#0b1220] shadow-[0_10px_24px_-10px_rgba(56,189,248,0.55)] transition hover:shadow-[0_14px_32px_-10px_rgba(56,189,248,0.7)]"
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
              >
                {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
              </button>
            </div>

            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-300">
                <p className="text-sm">Error: {error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
