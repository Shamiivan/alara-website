export interface CallResult {
  callId?: string;
  conversationId?: string;
}


export interface ElevenLabsCallRequest {
  agentId: string;
  agentPhoneNumberId: string;
  toNumber: string;
  userName?: string;
  timezone?: string;
}


export interface CallRequest {
  agentId: string;
  agentPhoneNumberId: string;
  toNumber: string;
  dynamicVariables: Record<string, string | number | boolean>;
}
