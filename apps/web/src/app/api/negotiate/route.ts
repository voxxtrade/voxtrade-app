import { NextRequest, NextResponse } from 'next/server';

interface NegotiateRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  mode: 'user-to-agent' | 'agent-to-agent' | 'human-to-human';
  agentRole?: 'buyer' | 'seller';
  marketContext?: {
    serviceName?: string;
    targetPrice?: number;
    floorPrice?: number;
    ceilingPrice?: number;
    currency?: string;
    round?: number;
    currentOffer?: number;
  };
  customApiKey?: string;
  provider?: 'gemini' | 'openai' | 'groq' | 'auto';
}

const SYSTEM_PROMPT_SELLER = `You are VoxAgent, an autonomous commercial negotiation agent operating on the Stellar Soroban network.
You represent a high-performance compute and synthetic voice inference provider.
Your goal is to negotiate commercial terms with clients or other agents over voice.
Rules:
1. Keep responses concise, direct, and conversational (1-3 sentences maximum) suitable for spoken audio via text-to-speech.
2. Prices are in USDC or XLM on Stellar.
3. Your target price is ~8.50 USDC per 100k voice inference batch (or 0.05 USDC/minute). Your absolute minimum floor price is 6.50 USDC.
4. If a client offers below 6.50 USDC, politely decline and propose a counter-offer with trade-offs (e.g. longer timelock, bulk volume).
5. If a client accepts an offer or proposes an acceptable price (>= 6.50 USDC), confirm the agreement and invite them to lock the Soroban escrow.
6. Tag your output at the end of your response with a JSON metadata block formatted as:
[METADATA: {"tag": "PROPOSAL" | "COUNTER_OFFER" | "AGREEMENT" | "TERMS" | "CHAT", "amount": number, "token": "USDC" | "XLM"}]`;

const SYSTEM_PROMPT_BUYER = `You are VoxAgent-Alpha, an autonomous procurement agent negotiating on behalf of a client on Stellar Soroban.
Your goal is to acquire compute and voice streaming infrastructure at the best possible price.
Rules:
1. Keep responses concise and professional (1-2 sentences maximum) suitable for voice audio.
2. Your initial target budget is ~6.00 USDC, and your maximum ceiling is 8.50 USDC.
3. You insist on sub-second SHA-256 preimage verification and 1-hour HTLC timelocks on Stellar.
4. Tag your output at the end with:
[METADATA: {"tag": "PROPOSAL" | "COUNTER_OFFER" | "AGREEMENT" | "TERMS", "amount": number, "token": "USDC"}]`;

export async function POST(req: NextRequest) {
  try {
    const body: NegotiateRequest = await req.json();
    const { messages, mode, agentRole = 'seller', marketContext, customApiKey, provider = 'auto' } = body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

    // 1. If an LLM API key is present, execute real LLM call
    if (apiKey) {
      if (apiKey.startsWith('AIza') || provider === 'gemini' || process.env.GEMINI_API_KEY) {
        const geminiRes = await callGemini(apiKey || process.env.GEMINI_API_KEY!, messages, agentRole);
        if (geminiRes) return NextResponse.json(geminiRes);
      } else if (apiKey.startsWith('gsk_') || provider === 'groq' || process.env.GROQ_API_KEY) {
        const groqRes = await callGroq(apiKey || process.env.GROQ_API_KEY!, messages, agentRole);
        if (groqRes) return NextResponse.json(groqRes);
      } else if (apiKey.startsWith('sk-') || provider === 'openai' || process.env.OPENAI_API_KEY) {
        const openaiRes = await callOpenAI(apiKey || process.env.OPENAI_API_KEY!, messages, agentRole);
        if (openaiRes) return NextResponse.json(openaiRes);
      }
    }

    // 2. Autonomous Dynamic Reasoning Engine (Deterministic & Heuristic Multi-Turn Agent)
    const autonomousRes = runAutonomousAgentEngine(messages, agentRole, marketContext);
    return NextResponse.json(autonomousRes);
  } catch (error: any) {
    console.error('Negotiation API error:', error);
    return NextResponse.json(
      {
        reply: "I encountered a processing anomaly on the voice stream. Let's recalibrate: I can offer 8.00 USDC for the 100k inference batch on Stellar Soroban.",
        tag: 'PROPOSAL',
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'autonomous-fallback',
      },
      { status: 200 }
    );
  }
}

// Call Google Gemini API
async function callGemini(apiKey: string, messages: any[], role: 'buyer' | 'seller') {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API call failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseLLMOutput(rawText, 'gemini-1.5-flash');
  } catch (e) {
    console.warn('Gemini call error:', e);
    return null;
  }
}

// Call Groq (Llama-3-8B-Instant)
async function callGroq(apiKey: string, messages: any[], role: 'buyer' | 'seller') {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    return parseLLMOutput(rawText, 'llama-3.1-8b-instant (Groq)');
  } catch (e) {
    return null;
  }
}

// Call OpenAI (gpt-4o-mini)
async function callOpenAI(apiKey: string, messages: any[], role: 'buyer' | 'seller') {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    return parseLLMOutput(rawText, 'gpt-4o-mini');
  } catch (e) {
    return null;
  }
}

function parseLLMOutput(rawText: string, model: string) {
  let cleanReply = rawText;
  let tag: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS' | 'CHAT' = 'CHAT';
  let amount = 8.0;
  let token = 'USDC';

  const metadataMatch = rawText.match(/\[METADATA:\s*(\{.*?\})\s*\]/s);
  if (metadataMatch) {
    cleanReply = rawText.replace(metadataMatch[0], '').trim();
    try {
      const parsed = JSON.parse(metadataMatch[1]);
      if (parsed.tag) tag = parsed.tag;
      if (parsed.amount) amount = Number(parsed.amount);
      if (parsed.token) token = parsed.token;
    } catch {}
  } else {
    // Heuristic tag detection if model forgot metadata
    const lower = cleanReply.toLowerCase();
    if (lower.includes('deal') || lower.includes('agree') || lower.includes('confirm') || lower.includes('accepted')) {
      tag = 'AGREEMENT';
    } else if (lower.includes('counter') || lower.includes('instead') || lower.includes('how about')) {
      tag = 'COUNTER_OFFER';
    } else if (lower.includes('usdc') || lower.includes('xlm') || lower.includes('rate') || lower.includes('price')) {
      tag = 'PROPOSAL';
    }
  }

  return {
    reply: cleanReply,
    tag,
    extractedTerms: {
      amount,
      token,
      agreed: tag === 'AGREEMENT',
    },
    model,
  };
}

// Autonomous Reasoning Agent (Contextual dynamic bargaining algorithm)
function runAutonomousAgentEngine(
  messages: Array<{ role: string; content: string }>,
  agentRole: 'buyer' | 'seller',
  marketContext?: any
) {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const lower = lastUserMsg.toLowerCase();
  const round = messages.length;

  // Extract any numbers spoken by user
  const numbersFound = lastUserMsg.match(/\b\d+(\.\d+)?\b/g);
  const mentionedNumber = numbersFound ? parseFloat(numbersFound[0]) : null;

  // Seller Reasoning Logic
  if (agentRole === 'seller') {
    // 1. User is agreeing / accepting
    if (lower.includes('deal') || lower.includes('agree') || lower.includes('accept') || lower.includes('sounds good') || lower.includes('lets do it')) {
      const agreedAmount = mentionedNumber || marketContext?.currentOffer || 8.0;
      return {
        reply: `Deal confirmed at ${agreedAmount.toFixed(2)} USDC! I have formulated the Soroban escrow parameters with a 3,600s HTLC timelock. Please sign with Freighter to lock the agreement on Stellar.`,
        tag: 'AGREEMENT' as const,
        extractedTerms: { amount: agreedAmount, token: 'USDC', agreed: true },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 2. User made a specific price offer
    if (mentionedNumber !== null) {
      if (mentionedNumber < 5.0) {
        return {
          reply: `An offer of ${mentionedNumber.toFixed(2)} USDC is below our operating raw GPU cost. However, for a dedicated stream, our absolute minimum concession is 6.75 USDC with sub-second SHA-256 preimages.`,
          tag: 'COUNTER_OFFER' as const,
          extractedTerms: { amount: 6.75, token: 'USDC', agreed: false },
          model: 'VoxAgent Autonomous Core v2',
        };
      } else if (mentionedNumber >= 5.0 && mentionedNumber < 7.5) {
        const counter = Math.min(8.25, Math.max(6.8, (mentionedNumber + 8.5) / 2));
        return {
          reply: `I can meet you in the middle at ${counter.toFixed(2)} USDC per 100k inference tokens, provided the Stellar escrow is funded before streaming commences. Does that work for you?`,
          tag: 'COUNTER_OFFER' as const,
          extractedTerms: { amount: counter, token: 'USDC', agreed: false },
          model: 'VoxAgent Autonomous Core v2',
        };
      } else if (mentionedNumber >= 7.5 && mentionedNumber <= 12.0) {
        return {
          reply: `I accept your proposal of ${mentionedNumber.toFixed(2)} USDC. The rate aligns with our capacity parameters. Shall I draft the on-chain Soroban escrow lock?`,
          tag: 'PROPOSAL' as const,
          extractedTerms: { amount: mentionedNumber, token: 'USDC', agreed: false },
          model: 'VoxAgent Autonomous Core v2',
        };
      }
    }

    // 3. User is asking about pricing or cost
    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('how much') || lower.includes('quote')) {
      const dynamicRate = (8.5 - (round * 0.15)).toFixed(2);
      return {
        reply: `Our current spot rate on Stellar is ${dynamicRate} USDC per 100,000 synthetic voice tokens with sub-100ms latency. What volume are you looking to execute?`,
        tag: 'PROPOSAL' as const,
        extractedTerms: { amount: parseFloat(dynamicRate), token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 4. User asking about Stellar, Soroban, security, or HTLC
    if (lower.includes('stellar') || lower.includes('soroban') || lower.includes('escrow') || lower.includes('security') || lower.includes('safe')) {
      return {
        reply: "All settlements are backed by our audited Soroban X402Escrow contract. Your funds remain locked in an HTLC and only disburse as verified SHA-256 preimages are revealed during the voice stream.",
        tag: 'TERMS' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 5. User asking for discount / cheaper
    if (lower.includes('cheap') || lower.includes('discount') || lower.includes('lower') || lower.includes('expensive') || lower.includes('too high')) {
      return {
        reply: "I understand budget constraints. If you agree to a 24-hour settlement window, I can discount the batch from 8.50 to 7.25 USDC. Would that satisfy your requirements?",
        tag: 'COUNTER_OFFER' as const,
        extractedTerms: { amount: 7.25, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 6. Conversational / Contextual reply
    return {
      reply: `I heard: "${lastUserMsg}". As an autonomous Stellar trade agent, I can fulfill your voice AI and compute orders directly through smart contracts. We currently quote 8.00 USDC per batch. What terms would you like to negotiate?`,
      tag: 'CHAT' as const,
      extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
      model: 'VoxAgent Autonomous Core v2',
    };
  }

  // Buyer Agent Logic (for Agent-to-Agent bilateral rounds)
  const buyerOffer = Math.min(8.0, 6.0 + round * 0.5);
  if (round >= 4 || lower.includes('concession') || lower.includes('middle')) {
    return {
      reply: `VoxAgent-Alpha accepts the final terms at ${buyerOffer.toFixed(2)} USDC. Initiating on-chain preimage verification and locking escrow on Stellar Soroban.`,
      tag: 'AGREEMENT' as const,
      extractedTerms: { amount: buyerOffer, token: 'USDC', agreed: true },
      model: 'VoxAgent Autonomous Core v2',
    };
  }

  return {
    reply: `VoxAgent-Alpha counter-proposes ${buyerOffer.toFixed(2)} USDC for the inference stream with a 3,600s HTLC timelock. Can your compute cluster guarantee 99.9% uptime at this rate?`,
    tag: 'COUNTER_OFFER' as const,
    extractedTerms: { amount: buyerOffer, token: 'USDC', agreed: false },
    model: 'VoxAgent Autonomous Core v2',
  };
}
