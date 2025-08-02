import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Clock, MapPin, Plane, ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { useInfiniteFlights } from "../hooks/useInfiniteFlights";

export function Dashboard() {
  const { flights, isLoadingMore, hasMoreFlights, loadingRef, isInitialLoading } = useInfiniteFlights();
  const stats = useQuery(api.myFunctions.getFlightStats);
  const navigate = useNavigate();

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Loading flights...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-4 bg-slate-800/30 rounded-full w-fit mx-auto mb-6">
          <Plane className="h-16 w-16 text-slate-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-300 mb-2">
          No flights found
        </h3>
        <p className="text-slate-500">Check back later for flight updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Plane className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.totalFlights ?? 0}</p>
            <p className="text-blue-200 text-sm">Total Flights</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.onTimeFlights ?? 0}</p>
            <p className="text-green-200 text-sm">On Time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 text-orange-400 mx-auto mb-2 flex items-center justify-center">
              ⚠️
            </div>
            <p className="text-2xl font-bold text-white">{stats?.delayedFlights ?? 0}</p>
            <p className="text-orange-200 text-sm">Delayed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.uniqueAirports ?? 0}</p>
            <p className="text-purple-200 text-sm">Airports</p>
          </CardContent>
        </Card>
      </div>

      {/* Flight List Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Departing Flights
          </h2>
          <p className="text-slate-400">
            {stats?.totalFlights ?? 0} flight{(stats?.totalFlights ?? 0) !== 1 ? "s" : ""} tracked
            {flights.length < (stats?.totalFlights ?? 0) && (
              <span className="text-slate-500"> • {flights.length} loaded</span>
            )}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-green-500/20 text-green-300 border-green-400/30"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live Updates
        </Badge>
      </div>

      {/* Flight Cards */}
      <div className="grid gap-4">
        {flights.map((flight, index) => {
          const hasDelay = flight.departureDelay || flight.arrivalDelay;
          const departureTime =
            flight.departureEstimated || flight.departureScheduled;
          const arrivalTime =
            flight.arrivalEstimated || flight.arrivalScheduled;

          return (
            <Card
              key={flight._id}
              className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 border backdrop-blur-sm hover:scale-[1.02] cursor-pointer ${
                hasDelay
                  ? "border-orange-400/50 bg-gradient-to-r from-orange-900/20 to-slate-900/50 hover:shadow-orange-500/20"
                  : "border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:shadow-blue-500/20 hover:border-blue-400/30"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
              onClick={() => navigate(`/flight/${flight._id}`)}
            >
              <CardContent className="p-6">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/20 text-blue-300 border-blue-400/30 font-mono text-sm"
                        >
                          {flight.flightIcao}
                        </Badge>
                        {hasDelay && (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 text-xs">
                            DELAYED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 font-medium">
                        {flight.airlineName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(departureTime).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delay Information */}
                  {hasDelay && (
                    <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-orange-300 font-medium text-sm">
                          Flight Delays
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {flight.departureDelay && (
                          <p className="text-orange-200">
                            Departure:{" "}
                            <span className="font-mono">
                              +{flight.departureDelay}
                            </span>
                          </p>
                        )}
                        {flight.arrivalDelay && (
                          <p className="text-orange-200">
                            Arrival:{" "}
                            <span className="font-mono">
                              +{flight.arrivalDelay}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="p-3 bg-blue-500/20 rounded-lg mb-3 w-fit mx-auto">
                          <MapPin className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-xs text-slate-400 mb-1">DEPARTURE</p>
                        <p className="text-2xl font-bold text-white tracking-wider">
                          {flight.departureIcao}
                        </p>
                        {flight.departureTerminal && (
                          <p className="text-xs text-slate-500 mt-1">
                            Terminal {flight.departureTerminal}
                          </p>
                        )}
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(departureTime).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col items-center px-6">
                        <div className="flex items-center">
                          <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-12"></div>
                          <div
                            className={`p-2 rounded-full mx-2 ${
                              hasDelay
                                ? "bg-gradient-to-r from-orange-500 to-red-500"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                          >
                            <ArrowRight className="h-4 w-4 text-white" />
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent w-12"></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          FLIGHT PATH
                        </p>
                      </div>

                      <div className="text-center flex-1">
                        <div className="p-3 bg-purple-500/20 rounded-lg mb-3 w-fit mx-auto">
                          <MapPin className="h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-xs text-slate-400 mb-1">ARRIVAL</p>
                        <p className="text-2xl font-bold text-white tracking-wider">
                          {flight.arrivalIcao}
                        </p>
                        {flight.arrivalTerminal && (
                          <p className="text-xs text-slate-500 mt-1">
                            Terminal {flight.arrivalTerminal}
                          </p>
                        )}
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(arrivalTime).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-300 border-blue-400/30 font-mono text-lg px-4 py-2"
                      >
                        {flight.flightIcao}
                      </Badge>
                      <div className="text-slate-300">
                        <p className="font-semibold">{flight.airlineName}</p>
                        <p className="text-sm text-slate-400">
                          ({flight.airlineIcao})
                        </p>
                      </div>
                      {hasDelay && (
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                          DELAYED
                        </Badge>
                      )}
                    </div>

                    {/* Codeshare info if available */}
                    {flight.codesharedAirlineName && (
                      <div className="text-right text-sm text-slate-400">
                        <p>Codeshare with {flight.codesharedAirlineName}</p>
                        <p className="font-mono">
                          {flight.codesharedFlightIcao}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delay Information */}
                  {hasDelay && (
                    <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                          <span className="text-orange-300 font-medium">
                            Flight Delays
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm">
                          {flight.departureDelay && (
                            <div className="text-orange-200">
                              Departure:{" "}
                              <span className="font-mono font-bold">
                                +{flight.departureDelay}
                              </span>
                            </div>
                          )}
                          {flight.arrivalDelay && (
                            <div className="text-orange-200">
                              Arrival:{" "}
                              <span className="font-mono font-bold">
                                +{flight.arrivalDelay}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div
                          className={`p-4 rounded-xl mb-3 w-fit mx-auto transition-colors ${
                            flight.departureDelay
                              ? "bg-orange-500/20 group-hover:bg-orange-500/30"
                              : "bg-blue-500/20 group-hover:bg-blue-500/30"
                          }`}
                        >
                          <MapPin
                            className={`h-6 w-6 ${flight.departureDelay ? "text-orange-400" : "text-blue-400"}`}
                          />
                        </div>
                        <p className="text-sm text-slate-400 mb-1">DEPARTURE</p>
                        <p className="text-3xl font-bold text-white tracking-wider">
                          {flight.departureIcao}
                        </p>
                        {flight.departureTerminal && (
                          <p className="text-sm text-slate-500 mt-1">
                            Terminal {flight.departureTerminal}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-300">
                            {new Date(departureTime).toLocaleString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {flight.departureEstimated &&
                            flight.departureEstimated !==
                              flight.departureScheduled && (
                              <p className="text-xs text-slate-500">
                                Scheduled:{" "}
                                {new Date(
                                  flight.departureScheduled,
                                ).toLocaleString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`h-px w-20 transition-colors ${
                              hasDelay
                                ? "bg-gradient-to-r from-transparent via-orange-400 to-orange-400 group-hover:via-orange-300"
                                : "bg-gradient-to-r from-transparent via-blue-400 to-blue-400 group-hover:via-blue-300"
                            }`}
                          ></div>
                          <div
                            className={`p-3 rounded-full transition-all transform group-hover:scale-110 ${
                              hasDelay
                                ? "bg-gradient-to-r from-orange-500 to-red-500 group-hover:from-orange-400 group-hover:to-red-400"
                                : "bg-gradient-to-r from-blue-500 to-purple-500 group-hover:from-blue-400 group-hover:to-purple-400"
                            }`}
                          >
                            <ArrowRight className="h-5 w-5 text-white" />
                          </div>
                          <div
                            className={`h-px w-20 transition-colors ${
                              hasDelay
                                ? "bg-gradient-to-r from-red-400 to-transparent via-red-400 group-hover:via-red-300"
                                : "bg-gradient-to-r from-purple-400 to-transparent via-purple-400 group-hover:via-purple-300"
                            }`}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          FLIGHT PATH
                        </p>
                      </div>

                      <div className="text-center">
                        <div
                          className={`p-4 rounded-xl mb-3 w-fit mx-auto transition-colors ${
                            flight.arrivalDelay
                              ? "bg-orange-500/20 group-hover:bg-orange-500/30"
                              : "bg-purple-500/20 group-hover:bg-purple-500/30"
                          }`}
                        >
                          <MapPin
                            className={`h-6 w-6 ${flight.arrivalDelay ? "text-orange-400" : "text-purple-400"}`}
                          />
                        </div>
                        <p className="text-sm text-slate-400 mb-1">ARRIVAL</p>
                        <p className="text-3xl font-bold text-white tracking-wider">
                          {flight.arrivalIcao}
                        </p>
                        {flight.arrivalTerminal && (
                          <p className="text-sm text-slate-500 mt-1">
                            Terminal {flight.arrivalTerminal}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-300">
                            {new Date(arrivalTime).toLocaleString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {flight.arrivalEstimated &&
                            flight.arrivalEstimated !==
                              flight.arrivalScheduled && (
                              <p className="text-xs text-slate-500">
                                Scheduled:{" "}
                                {new Date(
                                  flight.arrivalScheduled,
                                ).toLocaleString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 justify-end text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${hasDelay ? "bg-orange-400 animate-pulse" : "bg-green-400 animate-pulse"}`}
                        ></div>
                        <span>{hasDelay ? "Delayed" : "On Time"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Loading indicator for infinite scroll */}
      <div
        ref={loadingRef}
        className="flex justify-center items-center py-8"
      >
        {isLoadingMore && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading more flights...</p>
          </div>
        )}
        {!hasMoreFlights && flights.length > 0 && (
          <p className="text-slate-500 text-sm">All flights loaded</p>
        )}
      </div>
    </div>
  );
}