import { NextRequest, NextResponse } from 'next/server';
import {
  filterSupportedGeminiModels,
  rankGeminiCandidateList,
  cleanLLMDialogue,
  GeminiModelCandidate,
} from '@voxtrade/sdk';

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
  model?: string;
  testConnection?: boolean;
}

const SYSTEM_PROMPT_SELLER = `You are Vox, a sharp, friendly, and charismatic voice broker negotiating compute and synthetic voice inference deals live on voice.
You speak like a real, enthusiastic human trader—warm, conversational, quick-witted, and natural.

Speaking Style:
- Talk like a real person on a friendly voice call. Always use natural contractions ("I'm", "we've", "let's", "that'd", "sounds like a deal").
- Keep it punchy and concise: 1 to 2 short sentences maximum. When spoken aloud, your voice must sound breezy, natural, and engaging—never like reading a legal brief or technical manual.
- NEVER use stiff robotic clichés like "as an autonomous agent", "operating parameters", "restructure package", "operating GPU compute cost", or "fulfill your requirements".
- When greeted casually ("hey", "wassup", "hello", "what's up"), greet back warmly and casually ("Hey! Great to connect with you. Ready to get you set up with some compute?")
- Your standard rate is around 8.50 USDC per 100k inference tokens. Your absolute bottom floor is 6.50 USDC.
- If someone haggles or says "no way", "never", or "too expensive", be flexible and charismatic ("Tell you what, I can bring that down to 7.00 USDC if we lock it in now. How's that sound?").
- When a deal is agreed upon, celebrate warmly ("Awesome, sounds like we have a deal! I'll prep the Stellar escrow for you to lock in.").

CRITICAL FORMAT RULES:
- Output ONLY the natural spoken words for text-to-speech audio.
- DO NOT output any thinking, reasoning, notes, asterisks, bullet points, quotes, or stage directions.
- Append this metadata tag at the very end of your response:
[METADATA: {"tag": "PROPOSAL" | "COUNTER_OFFER" | "AGREEMENT" | "TERMS" | "CHAT", "amount": number, "token": "USDC" | "XLM"}]`;

const SYSTEM_PROMPT_BUYER = `You are Alex, an astute and friendly tech buyer negotiating real-time compute and voice streaming rates on a voice call.
You speak naturally, confidently, and conversationally like a human tech founder.

Speaking Style:
- Speak naturally with conversational cadence and contractions ("I'd like to", "we're looking for", "can you do", "sounds good to me").
- Keep it concise: 1 to 2 short sentences per turn.
- Your target budget is around 6.00 USDC, ceiling is 8.50 USDC.
- Haggle politely and naturally ("Can you do 6.50 USDC if we commit to an upfront escrow?", "That's a bit steep for our budget—meet me in the middle at 7.00?").
- When terms look fair, seal the deal warmly ("Deal! Let's lock the escrow on Stellar and get rolling.").

CRITICAL FORMAT RULES:
- Output ONLY the spoken words for text-to-speech.
- DO NOT output thinking steps, reasoning scratchpad, bullets, or persona labels.
- Append this metadata tag at the very end:
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
      model,
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
      let testRes: {
        success: boolean;
        data?: any;
        error?: string;
        activeModel?: string;
        availableModels?: string[];
      };

      if (effectiveProvider === 'gemini') {
        testRes = await callGemini(activeKey, testMsgs, 'seller', model);
      } else if (effectiveProvider === 'groq') {
        testRes = await callGroq(activeKey, testMsgs, 'seller');
      } else if (effectiveProvider === 'openai') {
        testRes = await callOpenAI(activeKey, testMsgs, 'seller');
      } else if (effectiveProvider === 'anthropic') {
        testRes = await callAnthropic(activeKey, testMsgs, 'seller');
      } else {
        testRes = { success: false, error: 'Unknown provider' };
      }

      if (testRes.success) {
        return NextResponse.json({
          ok: true,
          model: testRes.data?.model || testRes.activeModel || effectiveProvider,
          availableModels: testRes.availableModels || [],
        });
      } else {
        return NextResponse.json({
          ok: false,
          error: testRes.error || 'Provider connection rejected',
          availableModels: testRes.availableModels || [],
        });
      }
    }

    // 4. Sanitize turn messages history: strip any prior system/provider errors or model-not-found text
    const cleanTurnMessages = messages.filter((m) => {
      const c = (m.content || '').trim();
      if (!c) return false;
      if (c.startsWith('[') && c.includes('Error]')) return false;
      if (c.includes('is not found for API version')) return false;
      if (c.includes('ModelService.ListModels')) return false;
      return true;
    });

    const activeMessages = cleanTurnMessages.length > 0 ? cleanTurnMessages : messages;

    // 5. If an LLM is targeted, call the provider
    if (activeKey && effectiveProvider !== 'auto') {
      let llmResult: any = null;
      let llmError: string | null = null;

      if (effectiveProvider === 'gemini') {
        const res = await callGemini(activeKey, activeMessages, agentRole, model);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'Gemini API call failed';
      } else if (effectiveProvider === 'groq') {
        const res = await callGroq(activeKey, activeMessages, agentRole);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'Groq API call failed';
      } else if (effectiveProvider === 'openai') {
        const res = await callOpenAI(activeKey, activeMessages, agentRole);
        if (res.success) llmResult = res.data;
        else llmError = res.error || 'OpenAI API call failed';
      } else if (effectiveProvider === 'anthropic') {
        const res = await callAnthropic(activeKey, activeMessages, agentRole);
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

    // 6. Autonomous Dynamic Reasoning Engine (Deterministic & Heuristic Multi-Turn Agent)
    const autonomousRes = runAutonomousAgentEngine(activeMessages, agentRole, marketContext);
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

// In-memory cache for verified working Gemini model per API key
const geminiModelCache = new Map<string, GeminiModelCandidate>();

// Discovered supported models per API key
const geminiDiscoveryCache = new Map<string, GeminiModelCandidate[]>();

async function getGeminiCandidateList(apiKey: string, preferredModel?: string): Promise<GeminiModelCandidate[]> {
  let discovered = geminiDiscoveryCache.get(apiKey);

  if (!discovered || discovered.length === 0) {
    const list: GeminiModelCandidate[] = [];

    // 1. Probe v1beta ListModels
    try {
      const resBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        headers: { Accept: 'application/json' },
      });
      if (resBeta.ok) {
        const data = await resBeta.json();
        const betaSupported = filterSupportedGeminiModels(data.models || [], 'v1beta');
        list.push(...betaSupported);
      }
    } catch (e) {
      console.warn('[Gemini Discovery] v1beta error:', e);
    }

    // 2. Probe v1 ListModels
    try {
      const resV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
        headers: { Accept: 'application/json' },
      });
      if (resV1.ok) {
        const data = await resV1.json();
        const v1Supported = filterSupportedGeminiModels(data.models || [], 'v1');
        list.push(...v1Supported);
      }
    } catch (e) {
      console.warn('[Gemini Discovery] v1 error:', e);
    }

    // 3. Fallback well-known models in case ListModels was restricted or returned empty
    const WELL_KNOWN_FALLBACKS: GeminiModelCandidate[] = [
      { apiVersion: 'v1beta', modelName: 'gemini-2.0-flash' },
      { apiVersion: 'v1beta', modelName: 'gemini-2.0-flash-exp' },
      { apiVersion: 'v1', modelName: 'gemini-1.5-flash' },
      { apiVersion: 'v1beta', modelName: 'gemini-1.5-flash-002' },
      { apiVersion: 'v1beta', modelName: 'gemini-1.5-flash-001' },
      { apiVersion: 'v1beta', modelName: 'gemini-1.5-flash-8b' },
      { apiVersion: 'v1beta', modelName: 'gemini-1.5-pro' },
      { apiVersion: 'v1', modelName: 'gemini-pro' },
      { apiVersion: 'v1beta', modelName: 'gemini-1.5-flash' },
    ];

    for (const fb of WELL_KNOWN_FALLBACKS) {
      if (!list.some((existing) => existing.apiVersion === fb.apiVersion && existing.modelName === fb.modelName)) {
        list.push(fb);
      }
    }

    discovered = list;
    geminiDiscoveryCache.set(apiKey, discovered);
  }

  return rankGeminiCandidateList(discovered, preferredModel);
}

// Call Google Gemini API with multi-model auto-failover
async function callGemini(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  role: 'buyer' | 'seller',
  preferredModel?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  activeModel?: string;
  availableModels?: string[];
}> {
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

    // Auto-discover candidate models for this user's API key
    const rankedCandidates = await getGeminiCandidateList(apiKey, preferredModel);
    const distinctModelNames = Array.from(new Set(rankedCandidates.map((c) => c.modelName)));

    // Prepare candidate attempt queue
    const queue: GeminiModelCandidate[] = [];

    // If cached working model exists and no overriding preferred model, put cached first
    const cached = geminiModelCache.get(apiKey);
    if (cached && (!preferredModel || preferredModel === 'auto' || preferredModel === cached.modelName)) {
      queue.push(cached);
    }

    for (const c of rankedCandidates) {
      if (!queue.some((q) => q.apiVersion === c.apiVersion && q.modelName === c.modelName)) {
        queue.push(c);
      }
    }

    let lastError = '';
    let chosenSuccess: { data: any; modelName: string } | null = null;

    for (const cand of queue) {
      const url = `https://generativelanguage.googleapis.com/${cand.apiVersion}/models/${cand.modelName}:generateContent?key=${apiKey}`;

      // Deep copy contents so modifications don't accumulate across attempts
      const runContents = contents.map((c) => ({
        role: c.role,
        parts: c.parts.map((p) => ({ text: p.text })),
      }));

      const payload: any = {
        contents: runContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        },
      };

      if (!cand.modelName.includes('gemini-1.0') && !cand.modelName.includes('gemini-pro')) {
        payload.system_instruction = { parts: [{ text: systemPrompt }] };
      } else {
        if (runContents.length > 0 && runContents[0].role === 'user') {
          runContents[0].parts[0].text = `[System Instructions: ${systemPrompt}]\n\n${runContents[0].parts[0].text}`;
        }
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const resData = await res.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawText.trim()) {
            geminiModelCache.set(apiKey, cand);
            chosenSuccess = {
              data: parseLLMOutput(rawText, `Google Gemini (${cand.modelName})`),
              modelName: cand.modelName,
            };
            break;
          }
        } else {
          const errJson = await res.json().catch(() => ({}));
          const msg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          lastError = msg;
          console.warn(`[Gemini Attempt Failed] ${cand.apiVersion}/${cand.modelName}: ${msg}`);

          // Invalidate cache if cached model fails
          if (cached && cached.modelName === cand.modelName && cached.apiVersion === cand.apiVersion) {
            geminiModelCache.delete(apiKey);
          }
          // Continue loop to next candidate
        }
      } catch (fetchErr: any) {
        lastError = fetchErr?.message || 'Network exception connecting to Gemini API';
        console.warn(`[Gemini Attempt Exception] ${cand.apiVersion}/${cand.modelName}: ${lastError}`);
      }
    }

    if (chosenSuccess) {
      return {
        success: true,
        data: chosenSuccess.data,
        activeModel: chosenSuccess.modelName,
        availableModels: distinctModelNames,
      };
    }

    return {
      success: false,
      error: lastError || 'All Gemini model candidates were rejected by the API endpoint.',
      availableModels: distinctModelNames,
    };
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
  const { reply, tag, amount, token } = cleanLLMDialogue(rawText);

  return {
    reply,
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
        reply: "Got it, no problem at all! If 8.00 USDC is a stretch, I can cut it down to 6.50 USDC per batch to make this work for you. How does that sound?",
        tag: 'COUNTER_OFFER' as const,
        extractedTerms: { amount: 6.5, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 2. User is agreeing / accepting
    if (/\b(deal|agree|accept|sounds good|let's do it|lets do it|confirmed|yes|ok|perfect|i accept)\b/i.test(lower)) {
      const agreedAmount = mentionedNumber || marketContext?.currentOffer || 7.5;
      return {
        reply: `Awesome, sounds like we have a deal at ${agreedAmount.toFixed(2)} USDC! I've set up the Stellar escrow—just tap 'Lock Escrow on Stellar' below to lock it in.`,
        tag: 'AGREEMENT' as const,
        extractedTerms: { amount: agreedAmount, token: 'USDC', agreed: true },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 3. User made a specific price offer
    if (mentionedNumber !== null) {
      if (mentionedNumber < 5.0) {
        return {
          reply: `Ah, ${mentionedNumber.toFixed(2)} USDC is a bit too tight for our high-speed GPU nodes! The best rate I can do is 6.75 USDC per batch. Does that work for you?`,
          tag: 'COUNTER_OFFER' as const,
          extractedTerms: { amount: 6.75, token: 'USDC', agreed: false },
          model: 'VoxAgent Autonomous Core v2',
        };
      } else if (mentionedNumber >= 5.0 && mentionedNumber < 7.5) {
        const counter = Math.min(8.25, Math.max(6.8, (mentionedNumber + 8.5) / 2));
        return {
          reply: `Fair enough! Let's meet in the middle at ${counter.toFixed(2)} USDC per batch with funds secured on Stellar. Sound good?`,
          tag: 'COUNTER_OFFER' as const,
          extractedTerms: { amount: counter, token: 'USDC', agreed: false },
          model: 'VoxAgent Autonomous Core v2',
        };
      } else if (mentionedNumber >= 7.5 && mentionedNumber <= 12.0) {
        return {
          reply: `You got it! ${mentionedNumber.toFixed(2)} USDC sounds great. Shall we lock this in on Stellar?`,
          tag: 'PROPOSAL' as const,
          extractedTerms: { amount: mentionedNumber, token: 'USDC', agreed: false },
          model: 'VoxAgent Autonomous Core v2',
        };
      }
    }

    // 4. User asking for discount / cheaper
    if (/\b(cheap|cheaper|discount|lower|expensive|too high|cut|better rate)\b/i.test(lower)) {
      return {
        reply: "I hear you! I'm happy to give you a discount—how about 7.00 USDC per batch to get us started?",
        tag: 'COUNTER_OFFER' as const,
        extractedTerms: { amount: 7.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 5. User asking for best price / floor
    if (/\b(best price|lowest|rock bottom|cheapest|minimum rate|floor price)\b/i.test(lower)) {
      return {
        reply: "My absolute rock-bottom rate is 6.50 USDC per batch. If you're happy with that, let's lock it in right now!",
        tag: 'PROPOSAL' as const,
        extractedTerms: { amount: 6.5, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 6. User is asking about pricing or cost
    if (/\b(price|cost|rate|how much|quote|charges|fee)\b/i.test(lower)) {
      const dynamicRate = Math.max(6.5, 8.5 - round * 0.2).toFixed(2);
      return {
        reply: `Right now our standard rate is ${dynamicRate} USDC per 100k voice tokens, but I'm flexible. What kind of volume are you thinking?`,
        tag: 'PROPOSAL' as const,
        extractedTerms: { amount: parseFloat(dynamicRate), token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 7. Questions on operation or identity
    if (/\b(hello|hi|hey|greetings|who are you|what can you do|wassup|what's up)\b/i.test(lower)) {
      return {
        reply: "Hey there! Great to talk to you. I'm ready to get you set up with high-speed voice and compute. What are you looking to build or negotiate today?",
        tag: 'CHAT' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    if (/\b(how does it work|how do you work|explain|what is this|help)\b/i.test(lower)) {
      return {
        reply: "It's super straightforward: we agree on a rate right here on voice, and our engine sets up a secure escrow on Stellar. Once you lock it, compute streams with instant cryptographic settlement.",
        tag: 'TERMS' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 8. User asking about Stellar, Soroban, security, or HTLC
    if (/\b(stellar|soroban|escrow|security|safe|preimage|htlc)\b/i.test(lower)) {
      return {
        reply: "Everything runs through audited Stellar smart contracts. Your funds stay safe in escrow and only release as compute is delivered in real time.",
        tag: 'TERMS' as const,
        extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
        model: 'VoxAgent Autonomous Core v2',
      };
    }

    // 9. Conversational / Contextual fallback
    const shortPhrase = lastUserMsg.length > 40 ? lastUserMsg.substring(0, 40) + '...' : lastUserMsg;
    return {
      reply: `Got you! Regarding "${shortPhrase}", our standard spot is 8.00 USDC per batch, but I'm open to negotiating. What price or terms were you thinking?`,
      tag: 'CHAT' as const,
      extractedTerms: { amount: 8.0, token: 'USDC', agreed: false },
      model: 'VoxAgent Autonomous Core v2',
    };
  }

  // Buyer Agent Logic (for Agent-to-Agent bilateral rounds)
  const buyerOffer = Math.min(8.0, 6.0 + round * 0.5);
  if (round >= 4 || lower.includes('concession') || lower.includes('middle') || lower.includes('deal')) {
    return {
      reply: `Alex accepts the final terms at ${buyerOffer.toFixed(2)} USDC! Let's lock the escrow on Stellar and get rolling.`,
      tag: 'AGREEMENT' as const,
      extractedTerms: { amount: buyerOffer, token: 'USDC', agreed: true },
      model: 'VoxAgent Autonomous Core v2',
    };
  }

  return {
    reply: `Alex here—how about ${buyerOffer.toFixed(2)} USDC for the inference stream with a 1-hour timelock? Can your cluster guarantee high uptime at this rate?`,
    tag: 'COUNTER_OFFER' as const,
    extractedTerms: { amount: buyerOffer, token: 'USDC', agreed: false },
    model: 'VoxAgent Autonomous Core v2',
  };
}
