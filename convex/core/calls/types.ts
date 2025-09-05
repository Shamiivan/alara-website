import { Id } from "../../_generated/dataModel";
// Types for return values
export interface FetchConversationResult {
  success: boolean;
  message?: string;
}

// Return data for successful call initiation
export interface CallInitiationData {
  success: boolean;
  callId: Id<"calls">;
  elevenLabsCallId: string;
  conversationId: string;
}