import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

interface Flight {
  airline: { name: any; icaoCode: any };
  codeshared: {
    airline: { name: any; icaoCode: any };
    flight: { number: any; icaoNumber: any };
  };
  departure: {
    icaoCode: any;
    delay: any;
    scheduledTime: any;
    estimatedTime: any;
    terminal: any;
  };
  arrival: {
    icaoCode: any;
    delay: any;
    scheduledTime: any;
    estimatedTime: any;
    terminal: any;
  };
  flight: { number: any; icaoNumber: any };
}

export const listFlights = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("flights")
      .order("desc")
      .paginate(args.paginationOpts);
    
    return {
      page: result.page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const getFlightStats = query({
  handler: async (ctx) => {
    const flights = await ctx.db.query("flights").collect();
    
    const totalFlights = flights.length;
    const delayedFlights = flights.filter(
      (f) => f.departureDelay || f.arrivalDelay
    ).length;
    const onTimeFlights = totalFlights - delayedFlights;
    const uniqueAirports = new Set(flights.map((f) => f.departureIcao)).size;
    
    return {
      totalFlights,
      delayedFlights,
      onTimeFlights,
      uniqueAirports,
    };
  },
});

export const addFlights = mutation({
  args: {
    flights: v.array(
      v.object({
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { flights } = args;

    for (const flight of flights) {
      await ctx.db.insert("flights", {
        ...flight,
      });
    }
  },
});

export const truncateFlights = mutation({
  handler: async (ctx) => {
    const flights = await ctx.db.query("flights").collect();
    for (const flight of flights) {
      await ctx.db.delete(flight._id);
    }
  },
});

export const fetchDepartures = action({
  handler: async (ctx) => {
    const data = await fetch(
      `https://api.aviationstack.com/v1/timetable?iataCode=OTP&type=departure&access_key=${process.env.AVIATIONSTACK_API_KEY}`,
    );

    const response = await data.json();

    const flights = response.data.map((flight: Flight) => {
      return {
        airlineName: flight.airline.name,
        airlineIcao: flight.airline.icaoCode,
        codesharedAirlineName: flight.codeshared?.airline?.name ?? undefined,
        codesharedAirlineIcao:
          flight.codeshared?.airline?.icaoCode ?? undefined,
        codesharedFlightNumber: flight.codeshared?.flight?.number ?? undefined,
        codesharedFlightIcao:
          flight.codeshared?.flight?.icaoNumber ?? undefined,
        departureIcao: flight.departure.icaoCode,
        departureDelay: flight.departure.delay ?? undefined,
        departureScheduled: flight.departure.scheduledTime,
        departureEstimated: flight.departure.estimatedTime ?? undefined,
        departureTerminal: flight.departure.terminal ?? undefined,
        arrivalIcao: flight.arrival.icaoCode,
        arrivalDelay: flight.arrival.delay ?? undefined,
        arrivalScheduled: flight.arrival.scheduledTime,
        arrivalEstimated: flight.arrival.estimatedTime ?? undefined,
        arrivalTerminal: flight.arrival.terminal ?? undefined,
        flightNumber: flight.flight.number ?? undefined,
        flightIcao: flight.flight.icaoNumber,
      };
    });

    await ctx.runMutation(api.myFunctions.truncateFlights);

    await ctx.runMutation(api.myFunctions.addFlights, {
      flights,
    });
  },
});
