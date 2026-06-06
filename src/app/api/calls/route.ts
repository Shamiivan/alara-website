import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { apiLogger, callLogger } from '@/lib/serverLogger';

type CallRequestBody = {
  toNumber?: unknown;
  userName?: unknown;
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
};

const getString = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const apiKey = getRequiredEnv("ELEVEN_LABS_API_KEY");
    const agentId = getRequiredEnv("ELEVEN_LABS_AGENT_ID");
    const agentPhoneNumberId = getRequiredEnv("ELEVEN_LABS_PHONE_NUMBER_ID");

    if (!apiKey || !agentId || !agentPhoneNumberId) {
      return NextResponse.json({
        error: "Voice calling is not configured for this environment."
      }, { status: 503 });
    }

    const body = await request.json().catch((): CallRequestBody => ({}));
    const toNumber = getString(body.toNumber);
    const userName = getString(body.userName) || "User";

    if (!toNumber) {
      return NextResponse.json({
        error: "Missing required field: toNumber"
      }, { status: 400 });
    }

    const elevenLabs = new ElevenLabsClient({ apiKey });

    callLogger.info('Initiating voice call', { toNumber, userName });

    const result = await elevenLabs.conversationalAi.twilio.outboundCall({
      agentId,
      agentPhoneNumberId,
      toNumber
    });

    const duration = Date.now() - startTime;
    callLogger.info('Call initiated successfully', {
      callSid: result.callSid,
      toNumber,
      userName,
      duration: `${duration}ms`
    });

    apiLogger.info('POST /api/calls - Success', {
      status: 200,
      duration: `${duration}ms`,
      callSid: result.callSid
    }, request);

    return NextResponse.json({
      success: true,
      callId: result.callSid,
      message: `Call initiated successfully to ${userName} at ${toNumber}`
    });

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error && typeof error === 'object' && 'response' in error ? (error as { response?: { data?: unknown } }).response?.data : undefined;
    const errorStack = error instanceof Error ? error.stack : undefined;

    callLogger.error('Call initiation failed', {
      error: errorMessage,
      errorDetails,
      stack: errorStack,
      duration: `${duration}ms`
    });

    apiLogger.error('POST /api/calls - Error', {
      status: 500,
      error: errorMessage,
      duration: `${duration}ms`
    }, request);

    return NextResponse.json({
      error: errorMessage,
      details: errorDetails || 'No additional details'
    }, { status: 500 });
  }
}
