import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("daily clarity calls", { minutes: 1 }, internal.core.calls.crons.processDailyCalls, {});

export default crons;