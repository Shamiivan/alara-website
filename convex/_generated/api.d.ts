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
import type * as calls from "../calls.js";
import type * as calls_node from "../calls_node.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as payments from "../payments.js";
import type * as stripe from "../stripe.js";
import type * as tasks from "../tasks.js";
import type * as user from "../user.js";

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
  calls: typeof calls;
  calls_node: typeof calls_node;
  events: typeof events;
  http: typeof http;
  payments: typeof payments;
  stripe: typeof stripe;
  tasks: typeof tasks;
  user: typeof user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
