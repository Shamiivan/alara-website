// calls_node.ts - Refactored webhook handler
"use node";

import { action } from "./../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "./../../_generated/api";
import { createToolCallExtractor } from "./../../utils/extractor";
import { Ok } from "../../shared/result";

/**
 * Process ElevenLabs webhook data after call completion
  * Aligned with actual schema structure
    */
export const processWebhook = action({
  args: {
    callSid: v.string(),
    conversationId: v.string(),
    agentId: v.string(),
    transcript: v.array(v.object({
      role: v.union(v.literal("agent"), v.literal("user")),
      message: v.union(v.string(), v.null()),
      tool_calls: v.array(v.any()),
      tool_results: v.array(v.any()),
      time_in_call_secs: v.number(),
      interrupted: v.boolean(),
      original_message: v.union(v.string(), v.null()),
      source_medium: v.union(v.string(), v.null()),
    })),
    callStatus: v.union(v.literal("completed"), v.literal("failed"), v.literal("in_progress")),
    duration: v.number(),
    cost: v.optional(v.number()),
    startTimeUnix: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    tasksCreated: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    try {
      // Find the call by ElevenLabs call ID
      const call = await ctx.runQuery(api.core.calls.queries.getCallByElevenLabsId, {
        elevenLabsCallId: args.callSid
      });

      if (!call) {
        throw new Error(`Call not found for ElevenLabs call ID: ${args.callSid}`);
      }

      // Process transcript to match schema format
      const processedTranscript = args.transcript
        .filter((item) => {
          return item.message ||
            (item.tool_calls && item.tool_calls.length > 0) ||
            (item.tool_results && item.tool_results.length > 0);
        })
        .map((item) => {
          const role: "user" | "assistant" = item.role === "agent" ? "assistant" : "user";

          return {
            role,
            timeInCallSecs: item.time_in_call_secs,
            message: item.message || "",
          };
        });

      const conversationId = await ctx.runMutation(api.core.conversations.mutations.create, {
        callId: call._id,
        elevenLabsCallId: args.callSid,
        userId: call.userId,
        conversationId: args.conversationId,
        transcript: processedTranscript,
      });

      await ctx.runMutation(api.core.calls.mutations.updateCallStatus, {
        callId: call._id,
        status: args.callStatus === "completed" ? "completed" : "failed",
      });

      let tasksCreated = 0;

      // Process task creation only for completed calls with a user
      if (args.callStatus === "completed" && call.userId) {
        const defaultTz = "America/Toronto";

        // Convert webhook transcript to format expected by existing extractor
        const fullTranscript = args.transcript.map(item => ({
          role: item.role, // Keep original "agent"/"user" format for extractor
          message: item.message,
          tool_calls: item.tool_calls,
          tool_results: item.tool_results,
          feedback: null,
          llm_override: null,
          time_in_call_secs: item.time_in_call_secs,
          conversation_turn_metrics: null,
          rag_retrieval_info: null,
          llm_usage: null,
          interrupted: item.interrupted,
          original_message: item.original_message,
          source_medium: item.source_medium,
        }));

        // Extract tool calls using existing extractor
        const getCreateTaskResults = createToolCallExtractor('create_task');
        const toolCalls = getCreateTaskResults(fullTranscript);

        // Create tasks from tool calls
        for (const toolCall of toolCalls) {
          try {
            await ctx.runMutation(api.tasks.create_task, {
              title: toolCall.parsedParams.title,
              due: toolCall.parsedParams.due,
              timezone: defaultTz,
              source: "call",
              userId: call.userId,
              reminderMinutesBefore: 5, // Use default since schema has this as optional
              callId: call._id,
            });
            tasksCreated++;
          } catch (error) {
            console.error("Failed to create task:", error);
          }
        }

        console.log(`Created ${tasksCreated} tasks from call ${call._id}`);
      }

      return {
        success: true,
        message: `Webhook processed successfully. Created ${tasksCreated} tasks.`,
        tasksCreated,
      };

    } catch (error) {

      console.error("Error processing webhook:", error);

      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  },
});