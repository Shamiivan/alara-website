// integrations/elevenlabs/webhooks.ts

export interface ParsedWebhookData {
  eventType: string;
  callSid: string;
  conversationId: string;
  agentId: string;
  transcript: TranscriptMessage[];
  callStatus: "completed" | "failed" | "in_progress";
  duration: number;
  cost?: number;
  startTimeUnix?: number;
  metadata?: Record<string, any>;
}

export interface TranscriptMessage {
  role: "agent" | "user";
  message: string | null;
  tool_calls: ToolCall[];
  tool_results: ToolResult[];
  time_in_call_secs: number;
  interrupted: boolean;
  original_message: string | null;
  source_medium: string | null;
}

interface ToolCall {
  type: string;
  request_id: string;
  tool_name: string;
  params_as_json: string;
  tool_has_been_called: boolean;
  tool_details: {
    type: string;
    parameters: string
  } | null;
}

interface ToolResult {
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

/**
 * Parse and validate ElevenLabs webhook payload
 * Throws descriptive errors for invalid webhooks
 */
export function parseWebhook(rawPayload: any): ParsedWebhookData {
  // Validate basic structure
  if (!rawPayload || typeof rawPayload !== 'object') {
    throw new Error('Invalid webhook payload: expected object');
  }

  // Check for nested data structure
  const data = rawPayload.data;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid webhook payload: missing data object');
  }

  // Extract event type from top level
  const eventType = rawPayload.type;
  if (!eventType || typeof eventType !== 'string') {
    throw new Error('Invalid webhook payload: missing or invalid type');
  }

  // Extract required fields from data
  const conversationId = data.conversation_id;
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('Invalid webhook payload: missing conversation_id');
  }

  const agentId = data.agent_id;
  if (!agentId || typeof agentId !== 'string') {
    throw new Error('Invalid webhook payload: missing agent_id');
  }

  // Get call_sid from phone_call metadata
  const callSid = data.metadata?.phone_call?.call_sid;
  if (!callSid || typeof callSid !== 'string') {
    throw new Error('Invalid webhook payload: missing call_sid in metadata');
  }

  // Parse transcript (required)
  if (!data.transcript || !Array.isArray(data.transcript)) {
    throw new Error('Invalid webhook payload: missing or invalid transcript');
  }

  const transcript = data.transcript.map((msg: any) => ({
    role: msg.role === 'agent' ? 'agent' : 'user',
    message: msg.message,
    tool_calls: msg.tool_calls || [],
    tool_results: msg.tool_results || [],
    time_in_call_secs: msg.time_in_call_secs || 0,
    interrupted: msg.interrupted || false,
    original_message: msg.original_message,
    source_medium: msg.source_medium,
  }));

  // Determine call status
  let callStatus: "completed" | "failed" | "in_progress";
  switch (eventType) {
    case 'post_call_transcription':
      callStatus = 'completed';
      break;
    case 'call_failed':
    case 'call_error':
      callStatus = 'failed';
      break;
    case 'call_started':
    case 'call_in_progress':
      callStatus = 'in_progress';
      break;
    default:
      throw new Error(`Unknown webhook event type: ${eventType}`);
  }

  // Extract metadata
  const duration = data.metadata?.call_duration_secs || 0;
  const cost = data.metadata?.cost;
  const startTimeUnix = data.metadata?.start_time_unix_secs;

  return {
    eventType,
    callSid,
    conversationId,
    agentId,
    transcript,
    callStatus,
    duration,
    cost,
    startTimeUnix,
  };
}

/**
 * Parse transcript array from webhook payload
 */
function parseTranscript(rawTranscript: any[]): TranscriptMessage[] {
  return rawTranscript
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      role: mapRole(item.role),
      message: item.message || item.text || null,
      tool_calls: item.tool_calls || item.toolCalls || [],
      tool_results: item.tool_results || item.toolResults || [],
      time_in_call_secs: item.time_in_call_secs || item.timeInCallSecs || 0,
      interrupted: item.interrupted || false,
      original_message: item.original_message || item.originalMessage || null,
      source_medium: item.source_medium || item.sourceMedium || null,
    }))
    .filter(msg => msg.role && (msg.message || msg.tool_calls.length > 0)); // Keep only messages with content
}

/**
 * Map ElevenLabs role names to our internal format
 */
function mapRole(role: string): "agent" | "user" {
  switch (role?.toLowerCase()) {
    case 'agent':
    case 'assistant':
    case 'ai':
    case 'bot':
      return 'agent';
    case 'user':
    case 'human':
    case 'caller':
      return 'user';
    default:
      return 'user'; // Default to user for unknown roles
  }
}