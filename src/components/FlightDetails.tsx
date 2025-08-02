import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, MapPin, Plane, ArrowLeft, Calendar, Timer, Building } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export function FlightDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const flight = useQuery(api.myFunctions.getFlightById, 
    id ? { id: id as Id<"flights"> } : "skip"
  );

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Flight Not Found</h1>
          <Link 
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (flight === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (flight === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-slate-800/30 rounded-full w-fit mx-auto mb-6">
            <Plane className="h-16 w-16 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Flight Not Found</h1>
          <p className="text-slate-400 mb-6">The flight you're looking for doesn't exist.</p>
          <Link 
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasDelay = flight.departureDelay || flight.arrivalDelay;
  const departureTime = flight.departureEstimated || flight.departureScheduled;
  const arrivalTime = flight.arrivalEstimated || flight.arrivalScheduled;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Plane className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Flight {flight.flightIcao}
              </h1>
              <p className="text-sm text-slate-400">{flight.airlineName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Flight Status Banner */}
        {hasDelay && (
          <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-400/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold text-orange-300">Flight Delayed</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {flight.departureDelay && (
                  <div className="flex items-center gap-2 text-orange-200">
                    <Timer className="h-4 w-4" />
                    <span>Departure delayed by {flight.departureDelay}</span>
                  </div>
                )}
                {flight.arrivalDelay && (
                  <div className="flex items-center gap-2 text-orange-200">
                    <Timer className="h-4 w-4" />
                    <span>Arrival delayed by {flight.arrivalDelay}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flight Overview */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Departure */}
              <div className="text-center">
                <div className={`p-6 rounded-2xl mb-4 w-fit mx-auto ${
                  flight.departureDelay 
                    ? "bg-orange-500/20" 
                    : "bg-blue-500/20"
                }`}>
                  <MapPin className={`h-12 w-12 ${
                    flight.departureDelay ? "text-orange-400" : "text-blue-400"
                  }`} />
                </div>
                <p className="text-sm text-slate-400 mb-2">DEPARTURE</p>
                <p className="text-4xl font-bold text-white tracking-wider mb-2">
                  {flight.departureIcao}
                </p>
                {flight.departureTerminal && (
                  <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
                    <Building className="h-4 w-4" />
                    <span>Terminal {flight.departureTerminal}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-lg">
                      {new Date(departureTime).toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(departureTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {flight.departureEstimated && 
                    flight.departureEstimated !== flight.departureScheduled && (
                    <p className="text-xs text-slate-500 mt-1">
                      Scheduled: {new Date(flight.departureScheduled).toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Flight Path */}
              <div className="flex flex-col items-center">
                <div className="flex items-center w-full max-w-xs">
                  <div className={`h-px flex-1 ${
                    hasDelay 
                      ? "bg-gradient-to-r from-transparent via-orange-400 to-orange-400"
                      : "bg-gradient-to-r from-transparent via-blue-400 to-blue-400"
                  }`}></div>
                  <div className={`p-4 rounded-full mx-4 ${
                    hasDelay
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}>
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div className={`h-px flex-1 ${
                    hasDelay
                      ? "bg-gradient-to-r from-red-400 to-transparent"
                      : "bg-gradient-to-r from-purple-400 to-transparent"
                  }`}></div>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-4">FLIGHT PATH</p>
                <Badge 
                  className={`mt-2 ${
                    hasDelay 
                      ? "bg-orange-500/20 text-orange-300 border-orange-400/30" 
                      : "bg-green-500/20 text-green-300 border-green-400/30"
                  }`}
                >
                  {hasDelay ? "DELAYED" : "ON TIME"}
                </Badge>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className={`p-6 rounded-2xl mb-4 w-fit mx-auto ${
                  flight.arrivalDelay 
                    ? "bg-orange-500/20" 
                    : "bg-purple-500/20"
                }`}>
                  <MapPin className={`h-12 w-12 ${
                    flight.arrivalDelay ? "text-orange-400" : "text-purple-400"
                  }`} />
                </div>
                <p className="text-sm text-slate-400 mb-2">ARRIVAL</p>
                <p className="text-4xl font-bold text-white tracking-wider mb-2">
                  {flight.arrivalIcao}
                </p>
                {flight.arrivalTerminal && (
                  <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
                    <Building className="h-4 w-4" />
                    <span>Terminal {flight.arrivalTerminal}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-lg">
                      {new Date(arrivalTime).toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(arrivalTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {flight.arrivalEstimated && 
                    flight.arrivalEstimated !== flight.arrivalScheduled && (
                    <p className="text-xs text-slate-500 mt-1">
                      Scheduled: {new Date(flight.arrivalScheduled).toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Airline Information */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Airline Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Airline</p>
                  <p className="text-lg font-semibold text-white">{flight.airlineName}</p>
                  <p className="text-sm text-slate-500">({flight.airlineIcao})</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Flight Number</p>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 font-mono">
                    {flight.flightIcao}
                  </Badge>
                  {flight.flightNumber && (
                    <p className="text-sm text-slate-500 mt-1">
                      Also known as: {flight.flightNumber}
                    </p>
                  )}
                </div>
                {flight.codesharedAirlineName && (
                  <div>
                    <p className="text-sm text-slate-400">Codeshare Partner</p>
                    <p className="text-lg font-semibold text-white">{flight.codesharedAirlineName}</p>
                    <p className="text-sm text-slate-500">
                      {flight.codesharedFlightIcao} ({flight.codesharedAirlineIcao})
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Details */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Schedule Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Scheduled Departure</p>
                  <p className="text-lg text-white">
                    {new Date(flight.departureScheduled).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Scheduled Arrival</p>
                  <p className="text-lg text-white">
                    {new Date(flight.arrivalScheduled).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {(flight.departureEstimated || flight.arrivalEstimated) && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Updated Times</p>
                    {flight.departureEstimated && (
                      <p className="text-sm text-slate-300">
                        Departure: {new Date(flight.departureEstimated).toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {flight.arrivalEstimated && (
                      <p className="text-sm text-slate-300">
                        Arrival: {new Date(flight.arrivalEstimated).toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}