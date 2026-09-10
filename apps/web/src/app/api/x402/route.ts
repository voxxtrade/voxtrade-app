import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Escrow contract ID and configuration constants
const ESCROW_CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
const PRICE_PER_CHUNK_STROOPS = '100000'; // 0.01 USDC
const SECRET_PREIMAGE_CURRENT = 'voxxtrade_stream_secret_preimage_chunk_42';
const CURRENT_HASHLOCK = crypto.createHash('sha256').update(SECRET_PREIMAGE_CURRENT).digest('hex');

export async function GET(req: NextRequest) {
  return handleX402Request(req);
}

export async function POST(req: NextRequest) {
  return handleX402Request(req);
}

async function handleX402Request(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-402-payment');
  const timelockExpiry = Math.floor(Date.now() / 1000) + 300; // 5 minutes validity

  // Check if authorization header is present and starts with x402 or Bearer
  if (!authHeader) {
    const wwwAuth = `x402 realm="voxtrade", contract="${ESCROW_CONTRACT_ID}", token="USDC", price="${PRICE_PER_CHUNK_STROOPS}", hashlock="${CURRENT_HASHLOCK}", timelock="${timelockExpiry}"`;
    
    return NextResponse.json(
      {
        status: 402,
        error: 'Payment Required',
        message: 'x402 HTLC Micropayment required for real-time voice streaming.',
        challenge: {
          realm: 'voxtrade',
          contract: ESCROW_CONTRACT_ID,
          token: 'USDC',
          price: PRICE_PER_CHUNK_STROOPS,
          unit: 'stroops/chunk',
          hashlock: CURRENT_HASHLOCK,
          timelock: timelockExpiry,
        },
      },
      {
        status: 402,
        headers: {
          'WWW-Authenticate': wwwAuth,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'WWW-Authenticate, X-Preimage, X-402-Settled',
        },
      }
    );
  }

  // Parse authorization header
  let proof = authHeader;
  if (proof.toLowerCase().startsWith('x402 ')) {
    proof = proof.substring(5).trim();
  }

  // Attempt to parse proof as JSON or as plain preimage
  let providedPreimage: string | null = null;
  let escrowId: string | number = 4829;

  try {
    if (proof.startsWith('{')) {
      const parsed = JSON.parse(proof);
      providedPreimage = parsed.preimage || parsed.secret || null;
      if (parsed.escrowId) escrowId = parsed.escrowId;
    } else {
      providedPreimage = proof;
    }
  } catch {
    providedPreimage = proof;
  }

  // Verify preimage hash against current hashlock
  const providedHash = providedPreimage 
    ? crypto.createHash('sha256').update(providedPreimage).digest('hex') 
    : '';

  const isHashValid = providedHash === CURRENT_HASHLOCK || providedPreimage === SECRET_PREIMAGE_CURRENT;

  if (!isHashValid) {
    return NextResponse.json(
      {
        status: 403,
        error: 'Forbidden',
        message: 'Cryptographic preimage verification failed. Hashlock mismatch.',
        expectedHashlock: CURRENT_HASHLOCK,
        computedHashlock: providedHash,
      },
      {
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Payment verified! Return audio chunk telemetry and preimage receipt
  return NextResponse.json(
    {
      status: 200,
      success: true,
      escrowId,
      settlement: {
        settledStroops: PRICE_PER_CHUNK_STROOPS,
        token: 'USDC',
        preimageVerified: true,
        hashlock: CURRENT_HASHLOCK,
      },
      voiceChunk: {
        chunkIndex: 42,
        durationMs: 250,
        sampleRate: 48000,
        channels: 1,
        codec: 'audio/opus',
        // Mock 128 bytes base64 chunk representation
        payloadBase64: Buffer.from('VOXTRADE_OPUS_AUDIO_FRAME_SAMPLE_STREAM_DATA_CHUNKS_PACKET_42').toString('base64'),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Preimage-Verified': 'true',
        'X-402-Settled': PRICE_PER_CHUNK_STROOPS,
        'X-RateLimit-Daily-Remaining': '9900000',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
