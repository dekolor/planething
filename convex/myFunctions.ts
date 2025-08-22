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
    filter: v.optional(v.union(v.literal("all"), v.literal("ontime"), v.literal("delayed"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("flights").order("desc");
    
    // Apply filter if specified
    if (args.filter === "ontime") {
      query = query.filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("departureDelay"), undefined),
            q.eq(q.field("departureDelay"), null)
          ),
          q.or(
            q.eq(q.field("arrivalDelay"), undefined),
            q.eq(q.field("arrivalDelay"), null)
          )
        )
      );
    } else if (args.filter === "delayed") {
      query = query.filter((q) => 
        q.or(
          q.and(
            q.neq(q.field("departureDelay"), undefined),
            q.neq(q.field("departureDelay"), null)
          ),
          q.and(
            q.neq(q.field("arrivalDelay"), undefined),
            q.neq(q.field("arrivalDelay"), null)
          )
        )
      );
    }
    
    const result = await query.paginate(args.paginationOpts);

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
      (f) => f.departureDelay || f.arrivalDelay,
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

export const getFlightById = query({
  args: { id: v.id("flights") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const upsertFlights = mutation({
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
      // Try to find existing flight with same flightIcao and departureScheduled
      const existingFlight = await ctx.db
        .query("flights")
        .withIndex("by_flight_and_departure", (q) =>
          q.eq("flightIcao", flight.flightIcao).eq("departureScheduled", flight.departureScheduled)
        )
        .unique();

      if (existingFlight) {
        // Update existing flight
        await ctx.db.patch(existingFlight._id, {
          ...flight,
        });
      } else {
        // Insert new flight
        await ctx.db.insert("flights", {
          ...flight,
        });
      }
    }
  },
});

// Keep the old addFlights for backward compatibility if needed
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

export const cleanupOldFlights = mutation({
  args: {
    olderThanHours: v.optional(v.number()), // Default to 24 hours
  },
  handler: async (ctx, args) => {
    const hoursAgo = args.olderThanHours ?? 24;
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    const flights = await ctx.db.query("flights").collect();
    
    for (const flight of flights) {
      const departureTime = new Date(flight.departureScheduled);
      if (departureTime < cutoffTime) {
        await ctx.db.delete(flight._id);
      }
    }
  },
});

export const fetchFlights = action({
  args: {
    airportIcao: v.string(),
    type: v.optional(v.string()), // Optional for backward compatibility
  },

  handler: async (ctx, args) => {
    const provider = process.env.FLIGHT_DATA_PROVIDER || "aerodatabox";
    
    if (provider === "aerodatabox") {
      await fetchFlightsFromAeroDataBox(ctx, args.airportIcao);
    } else if (provider === "aviationstack") {
      await fetchFlightsFromAviationStack(ctx, args.airportIcao, args.type || "departure");
    } else {
      throw new Error(`Unknown flight data provider: ${provider}`);
    }
  },
});

async function fetchFlightsFromAeroDataBox(ctx: any, airportIcao: string) {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) {
    throw new Error("AERODATABOX_API_KEY environment variable is required");
  }

  try {
    console.log(`Fetching flights for ${airportIcao}`);
    
    // Fetch departures and arrivals separately using the correct AeroDataBox endpoints
    const departures = await fetchAeroDataBoxFlights(apiKey, airportIcao, "departures");
    const arrivals = await fetchAeroDataBoxFlights(apiKey, airportIcao, "arrivals");
    
    console.log(`Found ${departures.length} departures, ${arrivals.length} arrivals`);
    
    const allFlights = [...departures, ...arrivals];

    if (allFlights.length > 0) {
      console.log(`Upserting ${allFlights.length} flights to database`);
      await ctx.runMutation(api.myFunctions.upsertFlights, {
        flights: allFlights,
      });
      console.log(`Successfully processed ${allFlights.length} flights`);
    } else {
      console.log("No flights to process");
    }
  } catch (error) {
    console.error("Error fetching from AeroDataBox:", error);
    throw error;
  }
}

async function fetchAeroDataBoxFlights(apiKey: string, airportIcao: string, direction: "departures" | "arrivals"): Promise<any[]> {
  // Convert ICAO to IATA code for AeroDataBox API
  const icaoToIata: Record<string, string> = {
    "LROP": "OTP", // Bucharest Henri Coandă International Airport
    // Add more mappings as needed
  };
  
  const airportIata = icaoToIata[airportIcao] || airportIcao;
  
  // Get current time and create a 12-hour window
  const now = new Date();
  const fromTime = now.toISOString();
  
  // Add 12 hours to current time (max allowed by API)
  const toTime = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
  
  // Use the AeroDataBox endpoint with IATA code
  const url = `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airportIata}/${fromTime}/${toTime}`;
  const params = new URLSearchParams({
    withLeg: "true",
    withCancelled: "true", 
    withCodeshared: "true"
  });

  const fullUrl = `${url}?${params}`;
  console.log(`Calling AeroDataBox API: ${fullUrl}`);

  const response = await fetch(fullUrl, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AeroDataBox API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`AeroDataBox API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`API returned ${data[direction]?.length || 0} ${direction}`);
  
  
  // Process the flights
  const rawFlights = data[direction] || [];
  const flights = rawFlights
    .map((flight: any) => mapAeroDataBoxFlight(flight, direction.slice(0, -1) as "departure" | "arrival", airportIcao))
    .filter(Boolean); // Remove null/undefined entries

  console.log(`Mapped ${flights.length} valid flights from ${rawFlights.length} raw ${direction}`);
  return flights;
}

async function fetchFlightsFromAviationStack(ctx: any, airportIcao: string, type: string) {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    throw new Error("AVIATIONSTACK_API_KEY environment variable is required");
  }

  try {
    const response = await fetch(
      `https://api.aviationstack.com/v1/timetable?iataCode=${airportIcao}&type=${type}&access_key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`AviationStack API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    const flights = responseData.data.map((flight: Flight) => {
      return {
        airlineName: flight.airline.name,
        airlineIcao: flight.airline.icaoCode,
        codesharedAirlineName: flight.codeshared?.airline?.name ?? undefined,
        codesharedAirlineIcao: flight.codeshared?.airline?.icaoCode ?? undefined,
        codesharedFlightNumber: flight.codeshared?.flight?.number ?? undefined,
        codesharedFlightIcao: flight.codeshared?.flight?.icaoNumber ?? undefined,
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

    await ctx.runMutation(api.myFunctions.upsertFlights, {
      flights,
    });
  } catch (error) {
    console.error("Error fetching from AviationStack:", error);
    throw error;
  }
}

function mapAeroDataBoxFlight(flight: any, flightType: "departure" | "arrival", queryAirportIcao: string): any {
  try {
    // Build flightIcao using airline ICAO + flight number
    const airlineIcao = flight.airline?.icao || flight.codeshareStatus?.operatingAirline?.icao;
    const flightNumber = flight.number;
    let flightIcao = airlineIcao && flightNumber ? `${airlineIcao}${flightNumber}` : flight.callSign;
    
    // If still no flightIcao, try to construct from flight number only
    if (!flightIcao && flightNumber) {
      flightIcao = `UNK${flightNumber}`;
    }

    if (!flightIcao) {
      return null; // Skip flights with no identifier
    }

    // Check if required fields exist - extract UTC time string from AeroDataBox objects
    const depScheduled = flight.departure?.scheduledTimeUtc || 
                        (flight.departure?.scheduledTime?.utc) ||
                        (typeof flight.departure?.scheduledTime === 'string' ? flight.departure.scheduledTime : null);
    const arrScheduled = flight.arrival?.scheduledTimeUtc || 
                        (flight.arrival?.scheduledTime?.utc) ||
                        (typeof flight.arrival?.scheduledTime === 'string' ? flight.arrival.scheduledTime : null);
    
    if (!depScheduled && !arrScheduled) {
      return null;
    }

  // Calculate delays in minutes (AeroDataBox provides time differences)
  const getDepartureDelay = () => {
    const actualTime = flight.departure?.actualTime?.utc || flight.departure?.actualTimeUtc;
    const estimatedTime = flight.departure?.estimatedTime?.utc || flight.departure?.estimatedTimeUtc;
    
    if (actualTime && depScheduled) {
      const scheduled = new Date(depScheduled);
      const actual = new Date(actualTime);
      const delayMinutes = Math.round((actual.getTime() - scheduled.getTime()) / (1000 * 60));
      return delayMinutes > 0 ? `${delayMinutes}` : undefined;
    }
    if (estimatedTime && depScheduled) {
      const scheduled = new Date(depScheduled);
      const estimated = new Date(estimatedTime);
      const delayMinutes = Math.round((estimated.getTime() - scheduled.getTime()) / (1000 * 60));
      return delayMinutes > 0 ? `${delayMinutes}` : undefined;
    }
    return undefined;
  };

  const getArrivalDelay = () => {
    const actualTime = flight.arrival?.actualTime?.utc || flight.arrival?.actualTimeUtc;
    const estimatedTime = flight.arrival?.estimatedTime?.utc || flight.arrival?.estimatedTimeUtc;
    
    if (actualTime && arrScheduled) {
      const scheduled = new Date(arrScheduled);
      const actual = new Date(actualTime);
      const delayMinutes = Math.round((actual.getTime() - scheduled.getTime()) / (1000 * 60));
      return delayMinutes > 0 ? `${delayMinutes}` : undefined;
    }
    if (estimatedTime && arrScheduled) {
      const scheduled = new Date(arrScheduled);
      const estimated = new Date(estimatedTime);
      const delayMinutes = Math.round((estimated.getTime() - scheduled.getTime()) / (1000 * 60));
      return delayMinutes > 0 ? `${delayMinutes}` : undefined;
    }
    return undefined;
  };

  return {
    airlineName: flight.airline?.name || flight.codeshareStatus?.operatingAirline?.name || "Unknown",
    airlineIcao: airlineIcao || "UNK",
    codesharedAirlineName: flight.codeshareStatus?.publishingAirline?.name ?? undefined,
    codesharedAirlineIcao: flight.codeshareStatus?.publishingAirline?.icao ?? undefined,
    codesharedFlightNumber: flight.codeshareStatus?.publishingFlightNumber ?? undefined,
    codesharedFlightIcao: flight.codeshareStatus?.publishingAirline?.icao && flight.codeshareStatus?.publishingFlightNumber 
      ? `${flight.codeshareStatus.publishingAirline.icao}${flight.codeshareStatus.publishingFlightNumber}` 
      : undefined,
    departureIcao: (() => {
      // For departure flights, departure airport info is missing - use the query airport
      // For arrival flights, departure airport info is available
      if (flightType === "departure") {
        return queryAirportIcao; // This is LROP for our case
      } else {
        return flight.departure?.airport?.icao || flight.departure?.airport?.iata || "UNK";
      }
    })(),
    departureDelay: getDepartureDelay(),
    departureScheduled: depScheduled || new Date().toISOString(),
    departureEstimated: (flight.departure?.estimatedTime?.utc || flight.departure?.estimatedTimeUtc) ?? undefined,
    departureTerminal: flight.departure?.terminal ?? undefined,
    arrivalIcao: (() => {
      // For arrival flights, arrival airport info is missing - use the query airport  
      // For departure flights, arrival airport info is available
      if (flightType === "arrival") {
        return queryAirportIcao; // This is LROP for our case
      } else {
        return flight.arrival?.airport?.icao || flight.arrival?.airport?.iata || "UNK";
      }
    })(),
    arrivalDelay: getArrivalDelay(),
    arrivalScheduled: arrScheduled || new Date().toISOString(),
    arrivalEstimated: (flight.arrival?.estimatedTime?.utc || flight.arrival?.estimatedTimeUtc) ?? undefined,
    arrivalTerminal: flight.arrival?.terminal ?? undefined,
    flightNumber: flightNumber,
    flightIcao: flightIcao,
  };
  } catch (error) {
    console.error("Error mapping AeroDataBox flight:", error);
    return null;
  }
}
