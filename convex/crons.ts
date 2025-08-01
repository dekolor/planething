import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch flights",
  { minutes: 30 }, // every minute
  api.myFunctions.fetchDepartures,
);

export default crons;
