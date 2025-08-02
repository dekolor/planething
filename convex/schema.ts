import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  flights: defineTable({
    airlineName: v.string(),
    airlineIcao: v.string(),
    codesharedAirlineName: v.optional(v.string()),
    codesharedAirlineIcao: v.optional(v.string()),
    codesharedFlightNumber: v.optional(v.string()),
    codesharedFlightIcao: v.optional(v.string()),
    departureIcao: v.string(),
    departureDelay: v.optional(v.string()),
    departureScheduled: v.string(),
    departureEstimated: v.optional(v.string()),
    departureTerminal: v.optional(v.string()),
    arrivalIcao: v.string(),
    arrivalDelay: v.optional(v.string()),
    arrivalScheduled: v.string(),
    arrivalEstimated: v.optional(v.string()),
    arrivalTerminal: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    flightIcao: v.string(),
  })
    .index("by_flight_and_departure", ["flightIcao", "departureScheduled"])
    .index("by_departure_icao", ["departureIcao"]),
});
