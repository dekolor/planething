import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch LROP flights",
  { hours: 1 },
  api.myFunctions.fetchFlights,
  {
    airportIcao: "LROP",
  },
);

export default crons;
