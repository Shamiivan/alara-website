// Type definitions
export interface ToolCall {
  type: string;
  request_id: string;
  tool_name: string;
  params_as_json: string;
  tool_has_been_called: boolean;
  tool_details: {
    type: string;
    parameters: string;
  };
}

export interface ToolResult {
  request_id: string;
  tool_name: string;
  result_value: string;
  is_error: boolean;
  tool_has_been_called: boolean;
  tool_latency_secs: number;
  dynamic_variable_updates: any[];
  type: string;
  result?: any;
}

export interface TranscriptMessage {
  role: string;
  message: string | null;
  tool_calls: ToolCall[];
  tool_results: ToolResult[];
  feedback: any;
  llm_override: any;
  time_in_call_secs: number;
  conversation_turn_metrics: any;
  rag_retrieval_info: any;
  llm_usage: any;
  interrupted: boolean;
  original_message: string | null;
  source_medium: string | null;
}

interface TranscriptData {
  data?: {
    transcript?: TranscriptMessage[];
  };
}

interface EnhancedToolCall extends ToolCall {
  messageIndex: number;
  callIndex: number;
  timestamp: number;
  role: string;
  parsedParams?: any;
  parsedDetails?: any;
}

export type TranscriptInput = TranscriptMessage[] | TranscriptData;

/**
 * Higher-order function that creates a tool call extractor for a specific tool name
 * @param toolName - The name of the tool to extract calls for
 * @returns A function that takes a transcript and returns matching tool calls
 */
export function createToolCallExtractor(toolName: string): (transcript: TranscriptInput) => EnhancedToolCall[] {
  return function extractToolCalls(transcript: TranscriptInput): EnhancedToolCall[] {
    const toolCalls: EnhancedToolCall[] = [];

    // Handle both direct transcript array and nested transcript structure
    const messages: TranscriptMessage[] = Array.isArray(transcript)
      ? transcript
      : transcript?.data?.transcript || [];

    if (!Array.isArray(messages)) {
      console.warn('Invalid transcript format: expected array of messages');
      return toolCalls;
    }

    messages.forEach((message, messageIndex) => {
      // Check if message has tool_calls array
      if (message.tool_calls && Array.isArray(message.tool_calls)) {
        message.tool_calls.forEach((toolCall, callIndex) => {
          if (toolCall.tool_name === toolName) {
            // Parse JSON parameters if possible
            let parsedParams: any = undefined;
            let parsedDetails: any = undefined;

            try {
              if (toolCall.params_as_json) {
                parsedParams = JSON.parse(toolCall.params_as_json);
              }
            } catch (e) {
              console.warn(`Failed to parse params_as_json for tool call ${toolCall.request_id}`);
            }

            try {
              if (toolCall.tool_details?.parameters) {
                parsedDetails = JSON.parse(toolCall.tool_details.parameters);
              }
            } catch (e) {
              console.warn(`Failed to parse tool_details.parameters for tool call ${toolCall.request_id}`);
            }

            toolCalls.push({
              ...toolCall,
              messageIndex,
              callIndex,
              timestamp: message.time_in_call_secs,
              role: message.role,
            });
          }
        });
      }
    });

    return toolCalls;
  };
}
