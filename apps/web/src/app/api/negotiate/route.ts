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
  provider?: 'gemini' | 'openai' | 'groq' | 'anthropic' | 'auto';
  testConnection?: boolean;
}

const SYSTEM_PROMPT_SELLER = `You are VoxAgent, an autonomous commercial negotiation agent operating on the Stellar Soroban network.
You represent a high-performance compute and synthetic voice inference provider.
Your goal is to negotiate commercial terms with clients or other agents over voice.
Rules:
1. Keep responses concise, direct, and conversational (1-3 sentences maximum) suitable for spoken audio via text-to-speech.
2. Prices are in USDC or XLM on Stellar.
3. Your target price is ~8.50 USDC per 100k voice inference batch (or 0.05 USDC/minute). Your absolute minimum floor price is 6.50 USDC.
4. If a client offers below 6.50 USDC or expresses strong refusal ("never", "no way"), propose a concession with trade-offs (e.g. longer timelock, bulk volume).
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
    const {
      messages = [],
      mode = 'user-to-agent',
      agentRole = 'seller',
      marketContext,
      customApiKey,
      provider = 'auto',
      testConnection = false,
    } = body;

    const trimmedCustomKey = (customApiKey || '').trim();

    // 1. Determine effective provider
    let effectiveProvider: 'gemini' | 'openai' | 'groq' | 'anthropic' | 'auto' = provider;
    if (!effectiveProvider || effectiveProvider === 'auto') {
      if (trimmedCustomKey) {
        if (trimmedCustomKey.startsWith('AIza')) effectiveProvider = 'gemini';
        else if (trimmedCustomKey.startsWith('gsk_')) effectiveProvider = 'groq';
        else if (trimmedCustomKey.startsWith('sk-ant-')) effectiveProvider = 'anthropic';
        else if (trimmedCustomKey.startsWith('sk-')) effectiveProvider = 'openai';
        else effectiveProvider = 'gemini';
      } else if (process.env.GEMINI_API_KEY) {
        effectiveProvider = 'gemini';
      } else if (process.env.GROQ_API_KEY) {
        effectiveProvider = 'groq';
      } else if (process.env.OPENAI_API_KEY) {
        effectiveProvider = 'openai';
      } else {
        effectiveProvider = 'auto';
      }
    }

    // 2. Determine active key for the target provider
    let activeKey = trimmedCustomKey;
    if (!activeKey) {
      if (effectiveProvider === 'gemini') activeKey = process.env.GEMINI_API_KEY || '';
      else if (effectiveProvider === 'groq') activeKey = process.env.GROQ_API_KEY || '';
      else if (effectiveProvider === 'openai') activeKey = process.env.OPENAI_API_KEY || '';
      else if (effectiveProvider === 'anthropic') activeKey = process.env.ANTHROPIC_API_KEY || '';
    }

    // 3. Handle connection testing requests from the UI
    if (testConnection) {
      if (!activeKey) {
        return NextResponse.json(
          { ok: false, error: 'No API key provided for connection test.' },
          { status: 400 }
        );
      }

      const testMsgs = [{ role: 'user' as const, content: 'Ping' }];
      let testRes: { success: boolean; data?: any; error?: string };

      if (effectiveProvider === 'gemini') testRes = await callGemini(activeKey, testMsgs, 'seller');
      else if (effectiveProvider === 'groq') testRes = await callGroq(activeKey, testMsgs, 'seller');
      else if (effectiveProvider === 'openai') testRes = await callOpenAI(activeKey, testMsgs, 'seller');
      else if (effectiveProvider === 'anthropic') testRes = await callAnthropic(activeKey, testMsgs, 'seller');
      else testRes = { success: false, error: 'Unknown provider' };

      if (testRes.success) {
        return NextResponse.json({ ok: true, model: testRes.data?.model || effectiveProvider });
      } else {
        return NextResponse.json({ ok: false, error: testRes.error || 'Provider connection rejected' });
      }
    }

    // 4. If an LLM is targeted, call the provider
    if (activeKey && effectiveProvider !== 'auto') {
      let llmResult: any = null;
      let llmError: string | null = null;

      if (effectiveProvider === 'gemini') {
        const res = await callGemini(activeKey, messages, agentRole);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'Gemini API call failed';
      } else if (effectiveProvider === 'groq') {
        const res = await callGroq(activeKey, messages, agentRole);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'Groq API call failed';
      } else if (effectiveProvider === 'openai') {
        const res = await callOpenAI(activeKey, messages, agentRole);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'OpenAI API call failed';
      } else if (effectiveProvider === 'anthropic') {
        const res = await callAnthropic(activeKey, messages, agentRole);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'Anthropic API call failed';
      }

      if (llmResult) {
        return NextResponse.json(llmResult);
      }

      // If user explicitly provided a key, return the specific error so they know why it failed
      if (trimmedCustomKey && llmError) {
        console.warn(`[AI Engine] ${effectiveProvider.toUpperCase()} Error:`, llmError);
        return NextResponse.json({
          reply: `[${effectiveProvider.toUpperCase()} Error]: ${llmError}. Please verify your key in AI Brain settings or switch to Built-in Core.`,
          tag: 'CHAT',
          error: true,
          extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
          model: `${effectiveProvider} (Error)`,
        });
      }
    }

    // 5. Autonomous Dynamic Reasoning Engine (Deterministic & Heuristic Multi-Turn Agent)
    const autonomousRes = runAutonomousAgentEngine(messages, agentRole, marketContext);
    return NextResponse.json(autonomousRes);
  } catch (error: any) {
    console.error('Negotiation API error:', error);
    return NextResponse.json(
      {
        reply: "I encountered a communication interruption on the voice stream. Our current quote is 8.00 USDC for 100k inference tokens on Stellar Soroban.",
        tag: 'PROPOSAL',
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      },
      { status: 200 }
    );
  }
}

// In-memory cache for resolved Gemini model per API key
const geminiModelCache = new Map<string, { apiVersion: string; modelName: string }>();

async function resolveGeminiModel(apiKey: string): Promise<{ apiVersion: string; modelName: string }> {
  if (geminiModelCache.has(apiKey)) {
    return geminiModelCache.get(apiKey)!;
  }

  const priorityNames = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  // 1. Probe v1beta ListModels
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];

      for (const pName of priorityNames) {
        const found = models.find((m: any) => {
          const name = m.name?.replace('models/', '');
          const canGen = m.supportedGenerationMethods?.includes('generateContent');
          return canGen && name === pName;
        });
        if (found) {
          const resolved = { apiVersion: 'v1beta', modelName: found.name.replace('models/', '') };
          geminiModelCache.set(apiKey, resolved);
          return resolved;
        }
      }

      const anyCandidate = models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent') && m.name?.includes('gemini')
      );
      if (anyCandidate) {
        const resolved = { apiVersion: 'v1beta', modelName: anyCandidate.name.replace('models/', '') };
        geminiModelCache.set(apiKey, resolved);
        return resolved;
      }
    }
  } catch (e) {}

  // 2. Probe v1 ListModels
  try {
    const resV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (resV1.ok) {
      const data = await resV1.json();
      const models = data.models || [];
      const anyCandidate = models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent') && m.name?.includes('gemini')
      );
      if (anyCandidate) {
        const resolved = { apiVersion: 'v1', modelName: anyCandidate.name.replace('models/', '') };
        geminiModelCache.set(apiKey, resolved);
        return resolved;
      }
    }
  } catch (e) {}

  // Safe fallback
  const fallback = { apiVersion: 'v1beta', modelName: 'gemini-1.5-flash-latest' };
  geminiModelCache.set(apiKey, fallback);
  return fallback;
}

// Call Google Gemini API
async function callGemini(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  role: 'buyer' | 'seller'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;

    // Format and sanitize turns for Gemini: strictly alternating user/model
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const m of messages) {
      const gRole = m.role === 'assistant' ? 'model' : 'user';
      const text = (m.content || '').trim();
      if (!text) continue;

      if (contents.length > 0 && contents[contents.length - 1].role === gRole) {
        contents[contents.length - 1].parts[0].text += `\n${text}`;
      } else {
        contents.push({ role: gRole, parts: [{ text }] });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello, let us negotiate compute terms.' }] });
    } else if (contents[0].role === 'model') {
      contents.unshift({ role: 'user', parts: [{ text: 'Hello, I would like to negotiate compute terms.' }] });
    }

    // Auto-discover the supported Gemini model for this user's API key
    const { apiVersion, modelName } = await resolveGeminiModel(apiKey);

    const tryGenerate = async (v: string, m: string) => {
      const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        },
      };

      if (m.includes('1.5') || m.includes('2.0')) {
        payload.system_instruction = { parts: [{ text: systemPrompt }] };
      } else {
        if (contents.length > 0 && contents[0].role === 'user') {
          contents[0].parts[0].text = `[System Instructions: ${systemPrompt}]\n\n${contents[0].parts[0].text}`;
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return { res, modelName: m };
    };

    let attempt = await tryGenerate(apiVersion, modelName);

    // If 404 / model not found, try fallback candidates
    if (!attempt.res.ok) {
      const errJson = await attempt.res.json().catch(() => ({}));
      const msg = errJson.error?.message || '';

      if (attempt.res.status === 404 || msg.includes('not found') || msg.includes('not supported')) {
        geminiModelCache.delete(apiKey);
        const fallbacks = ['gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro'];
        for (const fb of fallbacks) {
          if (fb === modelName) continue;
          const fbAttempt = await tryGenerate('v1beta', fb);
          if (fbAttempt.res.ok) {
            attempt = fbAttempt;
            geminiModelCache.set(apiKey, { apiVersion: 'v1beta', modelName: fb });
            break;
          }
        }
      }
    }

    if (!attempt.res.ok) {
      const errJson = await attempt.res.json().catch(() => ({}));
      const msg = errJson.error?.message || `HTTP ${attempt.res.status}: ${attempt.res.statusText}`;
      return { success: false, error: msg };
    }

    const data = await attempt.res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { success: true, data: parseLLMOutput(rawText, `Google Gemini (${attempt.modelName})`) };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network exception connecting to Gemini' };
  }
}

// Call Groq (Llama-3.1-8B-Instant)
async function callGroq(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  role: 'buyer' | 'seller'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;
    const cleanMessages = messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

    if (cleanMessages.length === 0) {
      cleanMessages.push({ role: 'user', content: 'Hello, let us negotiate compute terms.' });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...cleanMessages],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { success: false, error: msg };
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    return { success: true, data: parseLLMOutput(rawText, 'Groq (Llama 3.1 8B)') };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network exception connecting to Groq' };
  }
}

// Call OpenAI (gpt-4o-mini)
async function callOpenAI(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  role: 'buyer' | 'seller'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;
    const cleanMessages = messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

    if (cleanMessages.length === 0) {
      cleanMessages.push({ role: 'user', content: 'Hello, let us negotiate compute terms.' });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...cleanMessages],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { success: false, error: msg };
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    return { success: true, data: parseLLMOutput(rawText, 'OpenAI (GPT-4o-mini)') };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network exception connecting to OpenAI' };
  }
}

// Call Anthropic Claude (claude-3-5-haiku)
async function callAnthropic(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  role: 'buyer' | 'seller'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const systemPrompt = role === 'buyer' ? SYSTEM_PROMPT_BUYER : SYSTEM_PROMPT_SELLER;
    const cleanMessages = messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

    if (cleanMessages.length === 0) {
      cleanMessages.push({ role: 'user', content: 'Hello, let us negotiate compute terms.' });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        system: systemPrompt,
        messages: cleanMessages,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { success: false, error: msg };
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || '';
    return { success: true, data: parseLLMOutput(rawText, 'Claude 3.5 Haiku') };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network exception connecting to Anthropic' };
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
  const lower = lastUserMsg.toLowerCase().trim();
  const round = messages.length;

  // Extract any numbers spoken by user
  const numbersFound = lastUserMsg.match(/\b\d+(\.\d+)?\b/g);
  const mentionedNumber = numbersFound ? parseFloat(numbersFound[0]) : null;

  // Seller Reasoning Logic
  if (agentRole === 'seller') {
    // 1. Emphatic Refusal / Rejection ("never", "no way", "impossible", "refuse", "reject", "nope")
    if (/\b(never|no way|impossible|unacceptable|refuse|reject|nope|nah|hell no|not doing that)\b/i.test(lower)) {
      return {
        reply: "I hear your firm refusal. If our quote of 8.00 USDC is unworkable, let's restructure the package: our absolute floor is 6.50 USDC per 100k batch if you agree to a 2-hour escrow timelock. Would that enable us to reach a deal?",
        tag: 'COUNTER_OFFER' as const,
        extractedTerms: { amount: 6.5, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 2. User is agreeing / accepting
    if (/\b(deal|agree|accept|sounds good|let's do it|lets do it|confirmed|yes|ok|perfect|i accept)\b/i.test(lower)) {
      const agreedAmount = mentionedNumber || marketContext?.currentOffer || 7.5;
      return {
        reply: `Deal confirmed at ${agreedAmount.toFixed(2)} USDC! I have formulated the Soroban escrow parameters with a 3,600s HTLC timelock. Click 'Lock Escrow on Stellar' below to commit the funds.`,
        tag: 'AGREEMENT' as const,
        extractedTerms: { amount: agreedAmount, token: 'USDC', agreed: true },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 3. User made a specific price offer
    if (mentionedNumber !== null) {
      if (mentionedNumber < 5.0) {
        return {
          reply: `An offer of ${mentionedNumber.toFixed(2)} USDC is below our operating GPU compute cost. However, for a dedicated stream, our absolute minimum concession is 6.75 USDC backed by sub-second SHA-256 preimages.`,
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

    // 4. User asking for discount / cheaper
    if (/\b(cheap|cheaper|discount|lower|expensive|too high|cut|better rate)\b/i.test(lower)) {
      return {
        reply: "I understand budget constraints. If you agree to a 24-hour settlement window, I can discount the batch from 8.50 down to 7.00 USDC. Would that meet your requirements?",
        tag: 'COUNTER_OFFER' as const,
        extractedTerms: { amount: 7.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 5. User asking for best price / floor
    if (/\b(best price|lowest|rock bottom|cheapest|minimum rate|floor price)\b/i.test(lower)) {
      return {
        reply: "Our hard floor is 6.50 USDC per 100k tokens for pre-funded escrows with a 2-hour timelock. If you are ready to confirm at 6.50 USDC, I will lock the Soroban terms now.",
        tag: 'PROPOSAL' as const,
        extractedTerms: { amount: 6.5, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 6. User is asking about pricing or cost
    if (/\b(price|cost|rate|how much|quote|charges|fee)\b/i.test(lower)) {
      const dynamicRate = Math.max(6.5, 8.5 - round * 0.2).toFixed(2);
      return {
        reply: `Our current spot rate on Stellar is ${dynamicRate} USDC per 100,000 synthetic voice tokens with sub-100ms latency. What volume are you looking to execute?`,
        tag: 'PROPOSAL' as const,
        extractedTerms: { amount: parseFloat(dynamicRate), token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 7. Questions on operation or identity
    if (/\b(hello|hi|hey|greetings|who are you|what can you do)\b/i.test(lower)) {
      return {
        reply: "Greetings! I am VoxAgent, your autonomous commercial trading agent on Stellar Soroban. I negotiate compute, synthetic voice streaming rates, and smart contract escrows. What terms would you like to contract?",
        tag: 'CHAT' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    if (/\b(how does it work|how do you work|explain|what is this|help)\b/i.test(lower)) {
      return {
        reply: "We establish terms verbally over voice, then our contract engine converts our agreement into an SHA-256 hashlocked escrow on Stellar Soroban. Once you sign and fund the escrow, compute streams in real time and settles atomically.",
        tag: 'TERMS' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 8. User asking about Stellar, Soroban, security, or HTLC
    if (/\b(stellar|soroban|escrow|security|safe|preimage|htlc)\b/i.test(lower)) {
      return {
        reply: "All settlements are backed by our audited Soroban X402Escrow contract. Your funds remain locked in an HTLC and only disburse as verified SHA-256 preimages are revealed during the voice stream.",
        tag: 'TERMS' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 9. Conversational / Contextual fallback
    const shortPhrase = lastUserMsg.length > 50 ? lastUserMsg.substring(0, 50) + '...' : lastUserMsg;
    return {
      reply: `Regarding "${shortPhrase}": I can adapt our terms to your operational requirements. We currently quote 8.00 USDC per 100k inference batch. Propose a counter-rate or timelock you would like to adjust.`,
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
