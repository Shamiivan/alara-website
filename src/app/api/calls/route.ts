import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    // Hardcoded values - no database interaction
    const toNumber = "+15146909416";
    const userName = "Ivan";

    console.log('Initiating call to:', toNumber);

    // Make the Eleven Labs call
    const result = await elevenLabs.conversationalAi.twilio.outboundCall({
      agentId: process.env.ELEVEN_LABS_AGENT_ID!,
      agentPhoneNumberId: process.env.ELEVEN_LABS_PHONE_NUMBER_ID!,
      toNumber: toNumber
    });

    console.log('Call initiated successfully:', result);

    return NextResponse.json({
      success: true,
      callId: result.callSid,
      message: `Call initiated successfully to ${userName} at ${toNumber}`
    });

  } catch (error: any) {
    console.error('Call initiation failed:', error);

    return NextResponse.json({
      error: error.message || 'Failed to initiate call',
      details: error.response?.data || 'No additional details'
    }, { status: 500 });
  }
}