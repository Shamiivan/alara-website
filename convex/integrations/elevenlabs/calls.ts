"use node"
// any functions responsible for making outbout calls
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { CallResult, CallRequest } from "./types";
import { error } from "console";
import { Ok, Result } from "../../shared/result";

function createClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVEN_LABS_API_KEY!;
  if (!apiKey) throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");
  return new ElevenLabsClient({ apiKey: apiKey });
}

export async function initiateCall(request: CallRequest): Promise<Result<CallResult>> {
  try {
    const client = createClient();

    const result = await client.conversationalAi.twilio.outboundCall({
      agentId: request.agentId,
      agentPhoneNumberId: request.agentPhoneNumberId,
      toNumber: request.toNumber,
      conversationInitiationClientData: {
        dynamicVariables: request.dynamicVariables
      }
    });

    if (!result.callSid) {
      throw new Error("ElevenLabs returned no callSid");
    }

    return Ok(

      {
        callSid: result.callSid,
        conversationId: result.conversationId,
      }
    )

  } catch (error) {
    throw new Error(`ElevenLabs call failed for ${request.toNumber}: ${error}`);
  }
}