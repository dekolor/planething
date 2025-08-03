// components/Dashboard.tsx
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Clock, MapPin, Plane } from "lucide-react";
import { Badge } from "./ui/badge";
import { useInfiniteFlights } from "../hooks/useInfiniteFlights";

type FlightFilter = "all" | "ontime" | "delayed";

const fmt = (
  d: string | number | Date,
  opts?: Intl.DateTimeFormatOptions,
  locale: string = "en-US",
) =>
  new Date(d).toLocaleString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });

// Ultra-compact flight row with two-line layout and minimal chrome.
export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<FlightFilter>("all");
  
  const {
    flights,
    isLoadingMore,
    hasMoreFlights,
    loadingRef,
    isInitialLoading,
  } = useInfiniteFlights(activeFilter);

  const stats = useQuery(api.myFunctions.getFlightStats);
  const navigate = useNavigate();

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-2 border-cyan-300/70 border-t-transparent" />
          <p className="text-white/65 text-sm">Loading flights...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 w-fit rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
          <Plane className="h-7 w-7 text-cyan-300" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-white">No flights</h3>
        <p className="text-white/65 text-sm">
          Check back soon for live updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Compact stats header */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {[
          {
            icon: Plane,
            label: "Total",
            value: stats?.totalFlights ?? 0,
            tone: "from-cyan-400/20 via-sky-400/15 to-transparent text-cyan-200",
            filter: "all" as FlightFilter,
            clickable: true,
          },
          {
            icon: Clock,
            label: "On time",
            value: stats?.onTimeFlights ?? 0,
            tone: "from-emerald-400/20 via-teal-400/15 to-transparent text-emerald-200",
            filter: "ontime" as FlightFilter,
            clickable: true,
          },
          {
            icon: function DelayedIcon() { return <span className="text-base">⚠️</span>; },
            label: "Delayed",
            value: stats?.delayedFlights ?? 0,
            tone: "from-amber-400/20 via-orange-400/15 to-transparent text-amber-200",
            filter: "delayed" as FlightFilter,
            clickable: true,
          },
          {
            icon: MapPin,
            label: "Airports",
            value: stats?.uniqueAirports ?? 0,
            tone: "from-fuchsia-400/20 via-violet-400/15 to-transparent text-fuchsia-200",
            filter: "all" as FlightFilter,
            clickable: false,
          },
        ].map((s, i) => {
          const isActive = s.clickable && s.filter === activeFilter;
          
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-md p-2.5 ring-1 transition-all ${
                s.clickable 
                  ? `cursor-pointer hover:bg-white/[0.08] ${
                      isActive 
                        ? "bg-white/10 ring-white/25 scale-[1.02]" 
                        : "bg-white/5 ring-white/10 hover:ring-white/20"
                    }` 
                  : "bg-white/5 ring-white/10"
              }`}
              onClick={s.clickable ? () => setActiveFilter(s.filter) : undefined}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.tone} ${
                  isActive ? "opacity-100" : ""
                }`}
              />
              {isActive && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              )}
              <div className="relative flex items-center justify-between">
                <s.icon className="h-4 w-4 drop-shadow" />
                <div className="text-right">
                  <p className="leading-none text-base font-semibold text-white">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-white/65">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white">
            {activeFilter === "all" ? "Departures" : 
             activeFilter === "ontime" ? "On Time Departures" : 
             "Delayed Departures"}
          </h2>
          <p className="text-xs text-white/65">
            {activeFilter === "all" ? (stats?.totalFlights ?? 0) :
             activeFilter === "ontime" ? (stats?.onTimeFlights ?? 0) :
             (stats?.delayedFlights ?? 0)} {activeFilter === "all" ? "total" : activeFilter === "ontime" ? "on time" : "delayed"}
            {flights.length < (
              activeFilter === "all" ? (stats?.totalFlights ?? 0) :
              activeFilter === "ontime" ? (stats?.onTimeFlights ?? 0) :
              (stats?.delayedFlights ?? 0)
            ) && (
              <span className="text-white/55"> • {flights.length} loaded</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/80 ring-1 ring-white/20">
              Filtered
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200 ring-1 ring-emerald-300/25">
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </div>

      {/* Flight list: dense, one card = two concise rows */}
      <div className="grid gap-1.5">
        {flights.map((f, index) => {
          const hasDelay = f.departureDelay || f.arrivalDelay;
          const dep = f.departureEstimated || f.departureScheduled;
          const arr = f.arrivalEstimated || f.arrivalScheduled;

          return (
            <div
              key={f._id}
              role="button"
              tabIndex={0}
              className="group rounded-md border border-white/10 bg-white/5 transition hover:bg-white/[0.08] focus:outline-none"
              style={{ animationDelay: `${index * 25}ms` }}
              onClick={() => { void navigate(`/flight/${f._id}`); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void navigate(`/flight/${f._id}`);
                }
              }}
            >
              <Card className="border-0 bg-transparent">
                <CardContent className="p-2.5">
                  {/* Row 1: Airline and codes */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[11px] text-cyan-200">
                        {f.flightIcao}
                      </Badge>
                      <p className="truncate text-sm font-medium text-white">
                        {f.airlineName}
                        <span className="ml-1 text-white/55">
                          ({f.airlineIcao})
                        </span>
                      </p>
                      {hasDelay && (
                        <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] tracking-wide text-amber-200">
                          DELAYED
                        </span>
                      )}
                    </div>

                    {/* Status dot */}
                    <div className="flex items-center gap-1 text-[11px] text-white/70">
                      <span
                        className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                          hasDelay ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {hasDelay ? "Delayed" : "On Time"}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Route and times - super tight */}
                  <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                    {/* Departure */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-cyan-400/10 ring-1 ring-cyan-300/20">
                        <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                      </span>
                      <div className="truncate">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-semibold">
                            {f.departureIcao}
                          </span>
                          <span className="text-xs text-white/65">
                            {fmt(dep)}
                          </span>
                        </div>
                        {!!f.departureTerminal && (
                          <span className="text-[10px] text-white/50">
                            T{f.departureTerminal}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Divider/Arrow substitute (tiny) */}
                    <div className="mx-1 hidden h-3 w-px bg-white/15 sm:block" />

                    {/* Arrival */}
                    <div className="flex items-center justify-end gap-2 min-w-0">
                      <div className="truncate text-right">
                        <div className="flex items-baseline justify-end gap-2">
                          <span className="text-white font-semibold">
                            {f.arrivalIcao}
                          </span>
                          <span className="text-xs text-white/65">
                            {fmt(arr)}
                          </span>
                        </div>
                        {!!f.arrivalTerminal && (
                          <span className="text-[10px] text-white/50">
                            T{f.arrivalTerminal}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-fuchsia-400/10 ring-1 ring-fuchsia-300/20">
                        <MapPin className="h-3.5 w-3.5 text-fuchsia-300" />
                      </span>
                    </div>
                  </div>

                  {/* Optional third line for codeshare - only if exists */}
                  {f.codesharedAirlineName && (
                    <div className="mt-1 text-[11px] text-white/55">
                      Codeshare {f.codesharedAirlineName} •{" "}
                      <span className="font-mono">
                        {f.codesharedFlightIcao}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll footer */}
      <div ref={loadingRef} className="flex items-center justify-center py-6">
        {isLoadingMore && (
          <div className="w-full max-w-2xl">
            <div className="mb-1.5 h-12 animate-pulse rounded-md bg-white/5 ring-1 ring-white/10" />
            <div className="h-12 animate-pulse rounded-md bg-white/5 ring-1 ring-white/10" />
          </div>
        )}
        {!hasMoreFlights && flights.length > 0 && (
          <p className="text-xs text-white/65">All flights loaded</p>
        )}
      </div>
    </div>
  );
}
