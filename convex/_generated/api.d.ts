/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as calls from "../calls.js";
import type * as calls_node from "../calls_node.js";
import type * as events from "../events.js";
import type * as feature_flags from "../feature/flags.js";
import type * as google from "../google.js";
import type * as http from "../http.js";
import type * as payments from "../payments.js";
import type * as stripe from "../stripe.js";
import type * as tasks from "../tasks.js";
import type * as telemetry from "../telemetry.js";
import type * as types_flags from "../types/flags.js";
import type * as user from "../user.js";
import type * as utils_crypto from "../utils/crypto.js";
import type * as utils_getUser from "../utils/getUser.js";
import type * as utils_verify from "../utils/verify.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  calendar: typeof calendar;
  calls: typeof calls;
  calls_node: typeof calls_node;
  events: typeof events;
  "feature/flags": typeof feature_flags;
  google: typeof google;
  http: typeof http;
  payments: typeof payments;
  stripe: typeof stripe;
  tasks: typeof tasks;
  telemetry: typeof telemetry;
  "types/flags": typeof types_flags;
  user: typeof user;
  "utils/crypto": typeof utils_crypto;
  "utils/getUser": typeof utils_getUser;
  "utils/verify": typeof utils_verify;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
