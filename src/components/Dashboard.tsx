// components/Dashboard.tsx
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import {
  Clock,
  MapPin,
  Plane,
  Search,
  X,
  Filter,
  Activity,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useInfiniteFlights } from "../hooks/useInfiniteFlights";

type FlightFilter = "all" | "ontime" | "delayed";

const fmt = (
  d: string | number | Date,
  opts?: Intl.DateTimeFormatOptions,
  locale: string = typeof navigator !== "undefined"
    ? navigator.language || "en-US"
    : "en-US",
) =>
  new Date(d).toLocaleString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<FlightFilter>("all");
  const [query, setQuery] = useState("");

  const {
    flights,
    isLoadingMore,
    hasMoreFlights,
    loadingRef,
    isInitialLoading,
  } = useInfiniteFlights(activeFilter);

  const stats = useQuery(api.myFunctions.getFlightStats);
  const navigate = useNavigate();

  const displayedFlights = useMemo(() => {
    if (!query.trim()) return flights;
    const q = query.trim().toLowerCase();
    return flights.filter((f) => {
      return (
        f.flightIcao?.toLowerCase().includes(q) ||
        f.flightNumber?.toLowerCase().includes(q) ||
        f.airlineName?.toLowerCase().includes(q) ||
        f.airlineIcao?.toLowerCase().includes(q) ||
        f.departureIcao?.toLowerCase().includes(q) ||
        f.arrivalIcao?.toLowerCase().includes(q)
      );
    });
  }, [flights, query]);

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center fade-in-up">
        <div className="text-center">
          <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-2 border-cyan-300/70 border-t-transparent" />
          <p className="text-sm text-white/65">Loading flights...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="py-12 text-center fade-in-up">
        <div className="mx-auto mb-3 w-fit rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
          <Plane className="h-7 w-7 text-cyan-300" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-white">No flights</h3>
        <p className="text-sm text-white/65">
          Check back soon for live updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up overflow-hidden">
      {/* Controls strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* Left: title + stats chips */}
        <div>
          <div className="flex items-center gap-2 text-white/70">
            <Activity className="h-4 w-4 text-cyan-300" />
            <span className="text-xs">Live Departures</span>
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Command Center
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-white/70">
            <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
              Total: {stats?.totalFlights ?? 0}
            </span>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-200 ring-1 ring-emerald-300/25">
              On time: {stats?.onTimeFlights ?? 0}
            </span>
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-200 ring-1 ring-amber-300/25">
              Delayed: {stats?.delayedFlights ?? 0}
            </span>
            <span className="rounded-full bg-fuchsia-400/10 px-2 py-0.5 text-fuchsia-200 ring-1 ring-fuchsia-300/25">
              Airports: {stats?.uniqueAirports ?? 0}
            </span>
          </div>
        </div>

        {/* Right: search + pills */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="search"
              placeholder="Search flight, airline, ICAO..."
              className="w-full rounded-md border border-white/10 bg-white/5 pl-8 pr-8 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/40 focus:bg-white/7"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:text-white"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Filter flights"
            className="flex overflow-hidden rounded-md border border-white/10 bg-white/5 p-0.5"
          >
            {(
              [
                ["all", "All"],
                ["ontime", "On Time"],
                ["delayed", "Delayed"],
              ] as const
            ).map(([key, label]) => {
              const active = activeFilter === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  className={`inline-flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 text-xs transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => setActiveFilter(key)}
                >
                  <Filter className="h-3.5 w-3.5 text-cyan-300/80" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tickets board */}
      <div className="grid gap-3">
        {displayedFlights.map((f, i) => {
          const hasDelay = f.departureDelay || f.arrivalDelay;
          const dep = f.departureEstimated || f.departureScheduled;
          const arr = f.arrivalEstimated || f.arrivalScheduled;

          // naive progress
          let pct = 0;
          try {
            const s = new Date(dep).getTime();
            const e = new Date(arr).getTime();
            const now = Date.now();
            if (Number.isFinite(s) && Number.isFinite(e) && e > s) {
              pct = Math.max(0, Math.min(1, (now - s) / (e - s)));
            }
          } catch {
            pct = 0;
          }

          return (
            <TicketCard
              key={f._id}
              index={i}
              airline={`${f.airlineName} (${f.airlineIcao})`}
              flightCode={f.flightIcao}
              depIcao={f.departureIcao}
              arrIcao={f.arrivalIcao}
              depTime={fmt(dep)}
              arrTime={fmt(arr)}
              depTerminal={f.departureTerminal ?? undefined}
              arrTerminal={f.arrivalTerminal ?? undefined}
              delayed={!!hasDelay}
              progressPct={Math.round(pct * 100)}
              codeshare={
                f.codesharedAirlineName
                  ? {
                      airline: f.codesharedAirlineName,
                      code: f.codesharedFlightIcao,
                    }
                  : undefined
              }
              onOpen={() => {
                void navigate(`/flight/${f._id}`);
              }}
            />
          );
        })}
      </div>

      {/* Footer / infinite scroll */}
      <div ref={loadingRef} className="flex items-center justify-center py-6">
        {isLoadingMore && (
          <div className="w-full max-w-2xl">
            <div className="mb-1.5 h-12 animate-pulse rounded-md bg-white/5 ring-1 ring-white/10" />
            <div className="h-12 animate-pulse rounded-md bg-white/5 ring-1 ring-white/10" />
          </div>
        )}
        {!hasMoreFlights && displayedFlights.length > 0 && (
          <p className="text-xs text-white/65">All flights loaded</p>
        )}
        {displayedFlights.length === 0 && query && (
          <p className="text-xs text-white/65">
            No results for “{query}”. Try another term.
          </p>
        )}
      </div>
    </div>
  );
}

function TicketCard(props: {
  index: number;
  airline: string;
  flightCode: string;
  depIcao: string;
  arrIcao: string;
  depTime: string;
  arrTime: string;
  depTerminal?: string;
  arrTerminal?: string;
  delayed: boolean;
  progressPct: number; // 0-100
  codeshare?:
    | {
        airline: string;
        code: string;
      }
    | undefined;
  onOpen: () => void;
}) {
  const {
    index,
    airline,
    flightCode,
    depIcao,
    arrIcao,
    depTime,
    arrTime,
    depTerminal,
    arrTerminal,
    delayed,
    progressPct,
    codeshare,
    onOpen,
  } = props;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative overflow-hidden rounded-2xl outline-none transition hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-cyan-300/60"
      style={{ animationDelay: `${index * 20}ms` }}
      aria-label={`Open ${flightCode} ${depIcao} → ${arrIcao}`}
    >
      {/* Airline band */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-cyan-300 via-sky-300 to-fuchsia-300" />
      {/* Perforation effect */}
      <div className="pointer-events-none absolute inset-y-0 left-[38%] w-px opacity-30 [background:radial-gradient(circle,_rgba(255,255,255,0.6)_1px,transparent_1.2px)] [background-size:6px_10px] [background-position:center]" />

      <Card className="border-0">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-[38%_1fr]">
            {/* Left ticket pane */}
            <div className="relative p-3 sm:p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[11px] text-cyan-200">
                  {flightCode}
                </Badge>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ring-1 ${
                    delayed
                      ? "bg-amber-400/10 text-amber-200 ring-amber-300/30"
                      : "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                      delayed ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  {delayed ? "Delayed" : "On Time"}
                </span>
              </div>

              <p className="truncate text-sm font-medium text-white">
                {airline}
              </p>

              <div className="mt-2 grid grid-cols-2 items-start gap-2 text-sm sm:flex sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">{depIcao}</span>
                    <span className="text-xs text-white/65">{depTime}</span>
                  </div>
                  {depTerminal && (
                    <span className="text-[10px] text-white/50">
                      T{depTerminal}
                    </span>
                  )}
                </div>

                <div className="mx-1 hidden h-4 w-px bg-white/15 sm:block" />

                <div className="min-w-0 text-right">
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="font-semibold text-white">{arrIcao}</span>
                    <span className="text-xs text-white/65">{arrTime}</span>
                  </div>
                  {arrTerminal && (
                    <span className="text-[10px] text-white/50">
                      T{arrTerminal}
                    </span>
                  )}
                </div>
              </div>

              {codeshare && (
                <div className="mt-1 text-[11px] text-white/55">
                  Codeshare {codeshare.airline} •{" "}
                  <span className="font-mono">{codeshare.code}</span>
                </div>
              )}
            </div>

            {/* Right ticket pane */}
            <div className="relative flex flex-col justify-between p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-white/70">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-cyan-400/10 ring-1 ring-cyan-300/20">
                    <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                  </span>
                  Route
                </div>
                <div className="text-[11px] text-white/60">
                  Progress {progressPct}%
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="relative h-1.5 w-full rounded-full bg-white/10 ring-1 ring-white/10">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      delayed
                        ? "bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100"
                        : "bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-200"
                    }`}
                    style={{ width: `${progressPct}%` }}
                    role="progressbar"
                    aria-label="Flight progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPct}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 items-center text-[11px] text-white/60 sm:flex sm:justify-between">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Depart
                </span>
                <span className="inline-flex items-center gap-1">
                  Arrive
                  <Clock className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>
    </div>
  );
}
