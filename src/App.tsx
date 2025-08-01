"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Clock, MapPin, Plane } from "lucide-react";
import { Badge } from "./components/ui/badge";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 justify-between flex">
        planething
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">plane stuff</h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
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
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-2 py-1"
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
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Log in to see the numbers</p>
      <form
        className="flex flex-col gap-2"
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
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="flex flex-row gap-2">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

function Content() {
  const { flights } = useQuery(api.myFunctions.listFlights) ?? {};

  if (flights === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-400">No flights found</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 mx-auto space-y-4 bg-black min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
          Available Flights
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          {flights.length} flight{flights.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="grid gap-3">
        {flights.map((flight) => (
          <Card
            key={flight._id}
            className="overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-l-4 border-l-blue-400 bg-gray-900 border-gray-800"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="sm:hidden space-y-4">
                <div className="flex justify-between items-center">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-800 text-gray-200 border-gray-700"
                  >
                    {flight.flightIcao ?? flight.flightNumber}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(Date.now()).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">From</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {flight.departureIcao}
                    </p>
                  </div>

                  <div className="flex items-center px-4">
                    <div className="h-px bg-gradient-to-r from-blue-400 to-purple-400 w-8"></div>
                    <Plane className="h-4 w-4 text-blue-400 mx-2 transform rotate-90" />
                    <div className="h-px bg-gradient-to-r from-purple-400 to-blue-400 w-8"></div>
                  </div>

                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">To</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {flight.arrivalIcao}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">From</span>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-white">
                      {flight.departureIcao}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gradient-to-r from-blue-400 to-purple-400 w-12 lg:w-16"></div>
                    <Plane className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400 transform rotate-90" />
                    <div className="h-px bg-gradient-to-r from-purple-400 to-blue-400 w-12 lg:w-16"></div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">To</span>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-white">
                      {flight.arrivalIcao}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <Badge
                    variant="secondary"
                    className="text-sm bg-gray-800 text-gray-200 border-gray-700"
                  >
                    {flight.flightIcao ?? flight.flightNumber}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(Date.now()).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
