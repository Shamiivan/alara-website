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
import type * as admin_schedule from "../admin/schedule.js";
import type * as admin_user from "../admin/user.js";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as calls from "../calls.js";
import type * as calls_node from "../calls_node.js";
import type * as conversation from "../conversation.js";
import type * as core_calendars_actions from "../core/calendars/actions.js";
import type * as core_calendars_queries from "../core/calendars/queries.js";
import type * as core_calendars_utils from "../core/calendars/utils.js";
import type * as core_calls_actions from "../core/calls/actions.js";
import type * as core_calls_crons from "../core/calls/crons.js";
import type * as core_calls_mutations from "../core/calls/mutations.js";
import type * as core_calls_queries from "../core/calls/queries.js";
import type * as core_calls_types from "../core/calls/types.js";
import type * as core_conversations_mutations from "../core/conversations/mutations.js";
import type * as core_conversations_queries from "../core/conversations/queries.js";
import type * as core_tokens_actions from "../core/tokens/actions.js";
import type * as core_tokens_mutations from "../core/tokens/mutations.js";
import type * as core_tokens_queries from "../core/tokens/queries.js";
import type * as core_users_mutations from "../core/users/mutations.js";
import type * as core_users_queries from "../core/users/queries.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as feature_flags from "../feature/flags.js";
import type * as google from "../google.js";
import type * as http from "../http.js";
import type * as integrations_elevenlabs_calls from "../integrations/elevenlabs/calls.js";
import type * as integrations_elevenlabs_conversations from "../integrations/elevenlabs/conversations.js";
import type * as integrations_elevenlabs_http from "../integrations/elevenlabs/http.js";
import type * as integrations_elevenlabs_types from "../integrations/elevenlabs/types.js";
import type * as integrations_google_auth from "../integrations/google/auth.js";
import type * as integrations_google_calendar from "../integrations/google/calendar.js";
import type * as integrations_google_https from "../integrations/google/https.js";
import type * as integrations_google_tokens from "../integrations/google/tokens.js";
import type * as integrations_google_types from "../integrations/google/types.js";
import type * as payments from "../payments.js";
import type * as scheduledCall from "../scheduledCall.js";
import type * as shared_result from "../shared/result.js";
import type * as shared_types_calendar from "../shared/types/calendar.js";
import type * as shared_types_flags from "../shared/types/flags.js";
import type * as shared_types_google from "../shared/types/google.js";
import type * as stripe from "../stripe.js";
import type * as system_telemetry_mutations from "../system/telemetry/mutations.js";
import type * as system_telemetry_queries from "../system/telemetry/queries.js";
import type * as tasks from "../tasks.js";
import type * as telemetry from "../telemetry.js";
import type * as types_calendar from "../types/calendar.js";
import type * as types_flags from "../types/flags.js";
import type * as types_google from "../types/google.js";
import type * as user from "../user.js";
import type * as utils_crypto from "../utils/crypto.js";
import type * as utils_extractor from "../utils/extractor.js";
import type * as utils_getUser from "../utils/getUser.js";
import type * as utils_tokens from "../utils/tokens.js";
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
  "admin/schedule": typeof admin_schedule;
  "admin/user": typeof admin_user;
  auth: typeof auth;
  calendar: typeof calendar;
  calls: typeof calls;
  calls_node: typeof calls_node;
  conversation: typeof conversation;
  "core/calendars/actions": typeof core_calendars_actions;
  "core/calendars/queries": typeof core_calendars_queries;
  "core/calendars/utils": typeof core_calendars_utils;
  "core/calls/actions": typeof core_calls_actions;
  "core/calls/crons": typeof core_calls_crons;
  "core/calls/mutations": typeof core_calls_mutations;
  "core/calls/queries": typeof core_calls_queries;
  "core/calls/types": typeof core_calls_types;
  "core/conversations/mutations": typeof core_conversations_mutations;
  "core/conversations/queries": typeof core_conversations_queries;
  "core/tokens/actions": typeof core_tokens_actions;
  "core/tokens/mutations": typeof core_tokens_mutations;
  "core/tokens/queries": typeof core_tokens_queries;
  "core/users/mutations": typeof core_users_mutations;
  "core/users/queries": typeof core_users_queries;
  crons: typeof crons;
  events: typeof events;
  "feature/flags": typeof feature_flags;
  google: typeof google;
  http: typeof http;
  "integrations/elevenlabs/calls": typeof integrations_elevenlabs_calls;
  "integrations/elevenlabs/conversations": typeof integrations_elevenlabs_conversations;
  "integrations/elevenlabs/http": typeof integrations_elevenlabs_http;
  "integrations/elevenlabs/types": typeof integrations_elevenlabs_types;
  "integrations/google/auth": typeof integrations_google_auth;
  "integrations/google/calendar": typeof integrations_google_calendar;
  "integrations/google/https": typeof integrations_google_https;
  "integrations/google/tokens": typeof integrations_google_tokens;
  "integrations/google/types": typeof integrations_google_types;
  payments: typeof payments;
  scheduledCall: typeof scheduledCall;
  "shared/result": typeof shared_result;
  "shared/types/calendar": typeof shared_types_calendar;
  "shared/types/flags": typeof shared_types_flags;
  "shared/types/google": typeof shared_types_google;
  stripe: typeof stripe;
  "system/telemetry/mutations": typeof system_telemetry_mutations;
  "system/telemetry/queries": typeof system_telemetry_queries;
  tasks: typeof tasks;
  telemetry: typeof telemetry;
  "types/calendar": typeof types_calendar;
  "types/flags": typeof types_flags;
  "types/google": typeof types_google;
  user: typeof user;
  "utils/crypto": typeof utils_crypto;
  "utils/extractor": typeof utils_extractor;
  "utils/getUser": typeof utils_getUser;
  "utils/tokens": typeof utils_tokens;
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
