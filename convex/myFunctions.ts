import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

export const listFlights = query({
  handler: async (ctx) => {
    const flights = await ctx.db.query("flights").collect();
    return {
      flights,
    };
  },
});

export const addFlights = mutation({
  args: {
    flights: v.array(
      v.object({
        flightNumber: v.string(),
        departure: v.string(),
        arrival: v.string(),
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
    const flights = await ctx.runQuery(api.myFunctions.listFlights);
    for (const flight of flights.flights) {
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

    const flights = response.data.map(
      (flight: {
        flight: { icaoNumber: any };
        departure: { icaoCode: any };
        arrival: { icaoCode: any };
      }) => {
        return {
          flightNumber: flight.flight.icaoNumber,
          departure: flight.departure.icaoCode,
          arrival: flight.arrival.icaoCode,
        };
      },
    );

    await ctx.runMutation(api.myFunctions.truncateFlights);

    await ctx.runMutation(api.myFunctions.addFlights, {
      flights,
    });
  },
});
