"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Card, CardContent } from "./components/ui/card";
import { Plane } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { FlightDetails } from "./components/FlightDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/flight/:id" element={
          <Authenticated>
            <FlightDetails />
          </Authenticated>
        } />
      </Routes>
    </Router>
  );
}

function MainApp() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Plane className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              planething
            </h1>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Flight Dashboard
            </h1>
            <p className="text-slate-400 text-lg">
              Real-time flight information and tracking
            </p>
          </div>
          <Authenticated>
            <Dashboard />
          </Authenticated>
          <Unauthenticated>
            <SignInForm />
          </Unauthenticated>
        </div>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white rounded-lg px-4 py-2 transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      )}
    </>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-4">
              <Plane className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">
              Sign in to access flight information
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                setError(error.message);
              });
            }}
          >
            <input
              className="w-full bg-slate-700/50 text-white rounded-lg p-3 border border-slate-600/50 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              type="email"
              name="email"
              placeholder="Email"
            />
            <input
              className="w-full bg-slate-700/50 text-white rounded-lg p-3 border border-slate-600/50 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              type="password"
              name="password"
              placeholder="Password"
            />
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg p-3 font-medium transition-all duration-200 transform hover:scale-[1.02]"
              type="submit"
            >
              {flow === "signIn" ? "Sign in" : "Sign up"}
            </button>
            <div className="text-center">
              <span className="text-slate-400">
                {flow === "signIn"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 underline hover:no-underline ml-2 transition-colors"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
              </button>
            </div>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">
                  Error signing in: {error}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

