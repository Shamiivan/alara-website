// "use node";

// import { action } from "../../_generated/server";
// import { v } from "convex/values";
// import { Id } from "../../_generated/dataModel";
// import { api } from "../../_generated/api";
// import { initiateElevenLabsCall } from "../../integrations/elevenlabs/calls";
// import { CallInitiationData } from "./types"
// import { Ok } from "../../shared/result";
// /**
//  * Initiate a reminder call for a specific task
//  */
// export const initiateReminderCall = action({
//   args: {
//     userId: v.id("users"),
//     toNumber: v.string(),
//     taskId: v.id("tasks"),
//   },
//   returns: v.object({
//     success: v.boolean(),
//     callId: v.id("calls"),
//     elevenLabsCallId: v.string(),
//     conversationId: v.string(),
//     message: v.string(),
//   }),
//   handler: async (ctx, args): Promise<CallInitiationData> => {
//     try {
//       const agentId = process.env.ELEVEN_LABS_AGENT_ID!;
//       if (!agentId) throw new Error("Missing ELEVEN_LABS_AGENT_ID environment variable");
//       return Ok({
//         success: true,
//         callId: dbCallId,
//         elevenLabsCallId: callResult.callId,
//         conversationId: callResult.conversationId || "",
//       });
//     } catch (error) {

//     }
//   },
// });

// /**
//  * Initiate a call with calendar availability data
//  */
// export const initiateCall = action({
//   args: {
//     userId: v.id("users"),
//     toNumber: v.string(),
//     calendarId: v.string(),
//   },
//   returns: v.object({
//     success: v.boolean(),
//     callId: v.id("calls"),
//     elevenLabsCallId: v.string(),
//     conversationId: v.string(),
//     message: v.string(),
//   }),
//   handler: async (ctx, args): Promise<InitiateCallResult> => {
//     // Implementation goes here
//     throw new Error("Not implemented");
//   },
// });
