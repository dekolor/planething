// components/FlightDetails.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Clock,
  MapPin,
  Plane,
  ArrowLeft,
  Calendar,
  Building,
  ExternalLink,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

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

function fr24Url(flightIcao?: string) {
  if (!flightIcao) return "https://www.flightradar24.com/";
  // FR24 usually uses ICAO/flight code directly; spaces removed.
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

  if (!id) {
    return (
      <CenteredState
        title="Flight Not Found"
        subtitle="We couldn't locate that flight."
      />
    );
  }

  if (flight === undefined) {
    return <CenteredSpinner label="Loading flight details..." />;
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

  return (
    <div className="relative min-h-screen">
      <HeaderBar
        left={
          <button
            onClick={() => { void navigate("/"); }}
            className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
        right={
          <div className="inline-flex items-center gap-2">
            <Badge className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-xs text-cyan-200">
              {flight.flightIcao}
            </Badge>
            <span className="text-white/55">•</span>
            <span className="text-sm text-white/70">{flight.airlineName}</span>
          </div>
        }
      />

      <Decor />

      <main className="relative mx-auto max-w-7xl px-3 py-8 sm:px-4">
        {/* Delay banner - compact */}
        {hasDelay && (
          <div className="mb-6 overflow-hidden rounded-lg border border-amber-300/30 bg-amber-400/10">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              <h2 className="text-sm font-medium text-amber-200">
                This flight is delayed
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 px-4 py-3 text-xs text-amber-100/90">
              {flight.departureDelay && (
                <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1">
                  Departure +{flight.departureDelay}
                </span>
              )}
              {flight.arrivalDelay && (
                <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1">
                  Arrival +{flight.arrivalDelay}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Overview - tighter layout */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Departure */}
          <InfoPanel
            tone="cyan"
            title="Departure"
            code={flight.departureIcao}
            terminal={flight.departureTerminal}
            time={fmt(departureTime)}
            date={fmt(departureTime, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            scheduled={
              flight.departureEstimated &&
              flight.departureEstimated !== flight.departureScheduled
                ? fmt(flight.departureScheduled)
                : undefined
            }
          />

          {/* Path */}
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(56,189,248,0.1),transparent),radial-gradient(50%_60%_at_50%_60%,rgba(217,70,239,0.1),transparent)]" />
            <div className="relative flex h-full flex-col items-center justify-center p-6">
              <div className="mb-2 flex items-center">
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-300 to-cyan-300" />
                <div className="mx-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 via-sky-400/20 to-fuchsia-400/20 ring-1 ring-white/10">
                  <Plane className="h-4 w-4 text-white" />
                </div>
                <div className="h-px w-20 bg-gradient-to-l from-transparent via-fuchsia-300 to-fuchsia-300" />
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                Flight Path
              </div>
              <div
                className={`mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ring-1 ${
                  hasDelay
                    ? "bg-amber-400/10 text-amber-200 ring-amber-300/30"
                    : "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                    hasDelay ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                {hasDelay ? "Delayed" : "On Time"}
              </div>
            </div>
          </div>

          {/* Arrival */}
          <InfoPanel
            tone="fuchsia"
            title="Arrival"
            code={flight.arrivalIcao}
            terminal={flight.arrivalTerminal}
            time={fmt(arrivalTime)}
            date={fmt(arrivalTime, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            scheduled={
              flight.arrivalEstimated &&
              flight.arrivalEstimated !== flight.arrivalScheduled
                ? fmt(flight.arrivalScheduled)
                : undefined
            }
          />
        </div>

        {/* Actions row (includes FR24 button) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
          <a
            href={fr24Url(flight.flightIcao)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/85 ring-1 ring-white/10 transition hover:bg-white/10"
            title="Open in FlightRadar24"
          >
            View on FlightRadar24
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Details - compact */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Airline */}
          <Card className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <CardContent className="p-5">
              <h3 className="mb-3 text-base font-semibold text-white">
                Airline Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/65">Airline</p>
                  <p className="text-sm font-medium text-white">
                    {flight.airlineName}
                  </p>
                  <p className="text-xs text-white/50">
                    ({flight.airlineIcao})
                  </p>
                </div>
                {flight.codesharedAirlineName && (
                  <div>
                    <p className="text-xs text-white/65">Codeshare Partner</p>
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

          {/* Schedule */}
          <Card className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <CardContent className="p-5">
              <h3 className="mb-3 text-base font-semibold text-white">
                Schedule Details
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
                {(flight.departureEstimated || flight.arrivalEstimated) && (
                  <div className="border-t border-white/10 pt-2.5">
                    <p className="mb-1.5 text-xs text-white/65">
                      Updated Times
                    </p>
                    {flight.departureEstimated && (
                      <p className="text-sm text-white/85">
                        Departure:{" "}
                        {fmt(flight.departureEstimated, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {flight.arrivalEstimated && (
                      <p className="text-sm text-white/85">
                        Arrival:{" "}
                        {fmt(flight.arrivalEstimated, {
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

function HeaderBar({
  left,
  right,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-4">
        {left}
        {right}
      </div>
    </header>
  );
}

function Decor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[#080d18]" />
      <div className="absolute inset-0 bg-[radial-gradient(1100px_520px_at_50%_-80px,rgba(56,189,248,0.08),transparent),radial-gradient(800px_460px_at_100%_20%,rgba(217,70,239,0.08),transparent),radial-gradient(720px_520px_at_0%_30%,rgba(14,165,233,0.06),transparent)]" />
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

function InfoPanel(props: {
  tone: "cyan" | "fuchsia";
  title: string;
  code: string;
  terminal?: string | null;
  time: string;
  date: string;
  scheduled?: string;
}) {
  const tone =
    props.tone === "cyan"
      ? {
          chipBg: "bg-cyan-400/10",
          chipRing: "ring-cyan-300/20",
          chipIcon: "text-cyan-300",
          glow: "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)]",
        }
      : {
          chipBg: "bg-fuchsia-400/10",
          chipRing: "ring-fuchsia-300/20",
          chipIcon: "text-fuchsia-300",
          glow: "bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.12),transparent_60%)]",
        };

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-5">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${tone.glow}`}
      />
      <div className="relative text-center">
        <div
          className={`mx-auto mb-2 w-fit rounded-md ${tone.chipBg} p-2 ring-1 ${tone.chipRing}`}
        >
          <MapPin className={`h-5 w-5 ${tone.chipIcon}`} />
        </div>
        <div className="text-[11px] uppercase tracking-wide text-white/60">
          {props.title}
        </div>
        <div className="mt-0.5 text-3xl font-semibold tracking-wide text-white">
          {props.code}
        </div>
        {props.terminal && (
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75">
            <Building className="h-3.5 w-3.5" />
            Terminal {props.terminal}
          </div>
        )}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-white/85">
          <Clock className="h-4 w-4" />
          <span className="text-base">{props.time}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-white/60">
          <Calendar className="h-3 w-3" />
          <span>{props.date}</span>
        </div>
        {props.scheduled && (
          <div className="mt-1 text-[11px] text-white/55">
            Scheduled: {props.scheduled}
          </div>
        )}
      </div>
    </div>
  );
}
