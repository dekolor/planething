import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch OTP departures",
  { minutes: 30 },
  api.myFunctions.fetchFlights,
  {
    airportIcao: "OTP",
    type: "departure",
  },
);

crons.cron("fetch OTP arrivals", "1,31 * * * *", api.myFunctions.fetchFlights, {
  airportIcao: "OTP",
  type: "arrival",
});

export default crons;
