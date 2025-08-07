import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { apiLogger, callLogger } from '@/lib/serverLogger';

const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY!
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Hardcoded values - no database interaction
    const toNumber = "+15146909416";
    const userName = "Ivan";

    callLogger.info('Initiating voice call', { toNumber, userName });

    // Make the Eleven Labs call
    const result = await elevenLabs.conversationalAi.twilio.outboundCall({
      agentId: process.env.ELEVEN_LABS_AGENT_ID!,
      agentPhoneNumberId: process.env.ELEVEN_LABS_PHONE_NUMBER_ID!,
      toNumber: toNumber
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

  } catch (error: any) {
    const duration = Date.now() - startTime;

    callLogger.error('Call initiation failed', {
      error: error.message,
      errorDetails: error.response?.data,
      stack: error.stack,
      duration: `${duration}ms`
    });

    apiLogger.error('POST /api/calls - Error', {
      status: 500,
      error: error.message,
      duration: `${duration}ms`
    }, request);

    return NextResponse.json({
      error: error.message || 'Failed to initiate call',
      details: error.response?.data || 'No additional details'
    }, { status: 500 });
  }
}