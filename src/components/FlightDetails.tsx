// components/FlightDetails.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "./ui/card";
import { Footer as GlobalFooter } from "./Footer";
import { Badge } from "./ui/badge";
import {
  Clock,
  Plane,
  ArrowLeft,
  Calendar,
  Building,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

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

function fr24Url(flightIcao?: string) {
  if (!flightIcao) return "https://www.flightradar24.com/";
  const code = String(flightIcao).replace(/\s+/g, "");
  return `https://www.flightradar24.com/data/flights/${encodeURIComponent(
    code.toLowerCase(),
  )}`;
}

export function FlightDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const flight = useQuery(
    api.myFunctions.getFlightById,
    id ? ({ id: id as Id<"flights"> } as const) : "skip",
  );

  const [copied, setCopied] = useState(false);

  if (!id) {
    return (
      <CenteredState
        title="Flight Not Found"
        subtitle="We couldn't locate that flight."
      />
    );
  }

  if (flight === undefined) {
    return <CenteredSpinner label="Loading flight..." />;
  }

  if (flight === null) {
    return (
      <CenteredState
        icon={<Plane className="h-14 w-14 text-cyan-300" />}
        title="Flight Not Found"
        subtitle="The flight you're looking for doesn't exist."
        cta={
          <Link
            to="/"
            className="rounded-md bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-2.5 text-sm font-medium text-[#0b1220] shadow-[0_10px_24px_-10px_rgba(56,189,248,0.55)] transition hover:shadow-[0_14px_32px_-10px_rgba(56,189,248,0.7)]"
          >
            Back to Dashboard
          </Link>
        }
      />
    );
  }

  const hasDelay = flight.departureDelay || flight.arrivalDelay;
  const departureTime = flight.departureEstimated || flight.departureScheduled;
  const arrivalTime = flight.arrivalEstimated || flight.arrivalScheduled;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        flight.flightIcao || flight.flightNumber || "",
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative min-h-screen fade-in-up">
      <Decor />

      {/* Header (sticky to avoid overlay/push issues) */}
      <div className="pointer-events-none sticky inset-x-0 top-0 z-40 flex justify-center p-3">
        <div className="pointer-events-auto flex w-full max-w-7xl items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_-20px_rgba(56,189,248,0.35)] backdrop-blur-md sm:px-4">
          <button
            onClick={() => {
              void navigate("/");
            }}
            className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="inline-flex items-center gap-2">
            <Badge className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-xs text-cyan-200">
              {flight.flightIcao}
            </Badge>
            <span className="text-white/55">•</span>
            <span className="text-sm text-white/70">{flight.airlineName}</span>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto mt-6 max-w-7xl px-3 pb-12 sm:mt-8 sm:px-4">
        {/* Ticket hero */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_60%)] blur-2xl" />
            <div className="absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.14),transparent_60%)] blur-2xl" />
            <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.6px)] [background-size:22px_22px]" />
          </div>

          <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-[42%_1fr]">
            {/* Left: route summary */}
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                    hasDelay ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    hasDelay ? "text-amber-200" : "text-emerald-200"
                  }`}
                >
                  {hasDelay ? "Delayed" : "On Time"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-white/60">
                    Departure
                  </div>
                  <div className="mt-0.5 text-3xl font-semibold text-white">
                    {flight.departureIcao}
                  </div>
                  {flight.departureTerminal && (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75">
                      <Building className="h-3.5 w-3.5" />
                      Terminal {flight.departureTerminal}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1.5 text-white/85">
                    <Clock className="h-4 w-4" />
                    <span className="text-base">{fmt(departureTime)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/60">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {fmt(departureTime, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mx-3 hidden flex-col items-center sm:flex">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-300 to-cyan-300" />
                  <div className="my-1 rounded-full bg-white/10 p-3 ring-1 ring-white/10">
                    <Plane className="h-4 w-4 text-white" />
                  </div>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent via-fuchsia-300 to-fuchsia-300" />
                </div>

                <div className="min-w-0 text-right">
                  <div className="text-[11px] uppercase tracking-wide text-white/60">
                    Arrival
                  </div>
                  <div className="mt-0.5 text-3xl font-semibold text-white">
                    {flight.arrivalIcao}
                  </div>
                  {flight.arrivalTerminal && (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75">
                      <Building className="h-3.5 w-3.5" />
                      Terminal {flight.arrivalTerminal}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-end gap-1.5 text-white/85">
                    <Clock className="h-4 w-4" />
                    <span className="text-base">{fmt(arrivalTime)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-end gap-1.5 text-xs text-white/60">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {fmt(arrivalTime, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions + timeline */}
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <Badge className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-xs text-cyan-200">
                    {flight.flightIcao}
                  </Badge>
                  {flight.flightNumber && (
                    <span className="text-xs text-white/60">
                      Also: {flight.flightNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                    aria-live="polite"
                    aria-label="Copy flight code"
                    title="Copy flight code"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-300" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy code
                      </>
                    )}
                  </button>
                  <a
                    href={fr24Url(flight.flightIcao)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                    title="Open in FlightRadar24"
                  >
                    View on FR24
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Vertical timeline */}
              <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3">
                <div className="flex flex-col items-center">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  <span className="my-1 h-10 w-px bg-white/15" />
                  <ArrowRight className="h-3.5 w-3.5 text-white/50" />
                  <span className="my-1 h-10 w-px bg-white/15" />
                  <span
                    className={`h-2 w-2 rounded-full ${
                      hasDelay ? "bg-amber-300" : "bg-emerald-300"
                    }`}
                  />
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Scheduled</div>
                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                      <div className="text-sm text-white">
                        Depart:{" "}
                        {fmt(flight.departureScheduled, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-white">
                        Arrive:{" "}
                        {fmt(flight.arrivalScheduled, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {(flight.departureEstimated || flight.arrivalEstimated) && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 text-xs text-white/60">Updated</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {flight.departureEstimated && (
                          <div className="text-sm text-white/85">
                            Departure:{" "}
                            {fmt(flight.departureEstimated, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                        {flight.arrivalEstimated && (
                          <div className="text-sm text-white/85">
                            Arrival:{" "}
                            {fmt(flight.arrivalEstimated, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <h3 className="mb-3 text-base font-semibold text-white">
                Airline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/65">Name</p>
                  <p className="text-sm font-medium text-white">
                    {flight.airlineName}
                  </p>
                  <p className="text-xs text-white/50">
                    ({flight.airlineIcao})
                  </p>
                </div>
                {flight.codesharedAirlineName && (
                  <div>
                    <p className="text-xs text-white/65">Codeshare</p>
                    <p className="text-sm font-medium text-white">
                      {flight.codesharedAirlineName}
                    </p>
                    <p className="text-xs text-white/50">
                      {flight.codesharedFlightIcao} (
                      {flight.codesharedAirlineIcao})
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <h3 className="mb-3 text-base font-semibold text-white">
                Schedule
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/65">Scheduled Departure</p>
                  <p className="text-sm text-white">
                    {fmt(flight.departureScheduled, {
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
                  <p className="text-xs text-white/65">Scheduled Arrival</p>
                  <p className="text-sm text-white">
                    {fmt(flight.arrivalScheduled, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

function Decor() {
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

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="relative min-h-screen">
      <Decor />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-cyan-300/70 border-t-transparent" />
          <p className="text-white/70">{label}</p>
        </div>
      </div>
    </div>
  );
}

function CenteredState({
  icon,
  title,
  subtitle,
  cta,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <Decor />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 w-fit rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            {icon ?? <Plane className="h-12 w-12 text-cyan-300" />}
          </div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-white/65">{subtitle}</p>
          )}
          {cta && <div className="mt-5">{cta}</div>}
        </div>
      </div>
    </div>
  );
}
